import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_PROFILE_PORT||5181),origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);await mkdir(artifacts,{recursive:true});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-profile-config-')),cache=await mkdtemp(join(tmpdir(),'elsewhere-profile-cache-'));
let server,browser,context,page;
try{
 let ready=false;for(let i=0;i<80;i++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}assert(ready,'Vite readiness timeout');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 server=await chromium.launchServer({executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||config,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||cache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 browser=await chromium.connect(server.wsEndpoint());context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(60000);
 const errors=[],http=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});page.on('response',r=>{if(r.status()>=400)http.push(`${r.status()} ${r.url()}`);});
 await page.goto(`${origin}/?perf=1`,{waitUntil:'networkidle'});await page.setViewportSize({width:390,height:844});await page.locator('#guest-play').waitFor({state:'visible'});await page.screenshot({path:new URL('profile-gate-mobile.png',artifacts).pathname});await page.setViewportSize({width:1440,height:900});await page.screenshot({path:new URL('profile-gate-desktop.png',artifacts).pathname});await page.locator('#guest-play').click();await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});console.log('[profile] guest scene mounted');
 const renderer=await page.evaluate(()=>{const canvas=document.querySelector('#world-canvas canvas');const gl=canvas?.getContext('webgl2')||canvas?.getContext('webgl');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {userAgent:navigator.userAgent,viewport:`${innerWidth}x${innerHeight}`,dpr:devicePixelRatio,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl?.getParameter(gl.RENDERER)||'unavailable',vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl?.getParameter(gl.VENDOR)||'unavailable'};});
 const readSample=label=>page.evaluate(label=>{const display=document.querySelector('.world-perf-display')?.textContent||'';const parsed=display.match(/(\d+) FPS.*?([\d.]+)ms P95.*?(\d+) DRAWS.*?(\d+) TRIS/);return {phase:label,display,frameTimingValid:Boolean(parsed&&Number(parsed[1])>0&&Number(parsed[2])>0),drawCalls:parsed?Number(parsed[3]):null,triangles:parsed?Number(parsed[4]):null,world:document.querySelector('#app-ui')?.dataset.world,player:{x:document.querySelector('#world-canvas')?.dataset.playerX,z:document.querySelector('#world-canvas')?.dataset.playerZ}};},label);
 const samplePhase=async label=>{const samples=[];for(let n=0;n<5;n++){await delay(1000);samples.push(await readSample(label));}return samples;};
 const assertSamples=samples=>assert(samples.length===5&&samples.every(s=>Number.isFinite(s.drawCalls)&&Number.isFinite(s.triangles)),'each phase must capture renderer draw and triangle counts');
 await delay(7000);const idle=await samplePhase('idle:initial-2087');assertSamples(idle);assert(idle.every(s=>s.world==='future'),'idle samples must be from the initial 2087 scene');console.log('[profile] idle samples',JSON.stringify(idle));await page.screenshot({path:new URL('performance-profile-idle.png',artifacts).pathname});
 await page.locator('.first-crossing [data-cmd="journey-skip"]').click();
 const start=await page.locator('#world-canvas').evaluate(el=>({x:Number(el.dataset.playerX),z:Number(el.dataset.playerZ)}));await page.keyboard.down('KeyW');await delay(3500);await page.keyboard.up('KeyW');const end=await page.locator('#world-canvas').evaluate(el=>({x:Number(el.dataset.playerX),z:Number(el.dataset.playerZ)}));
 const movement={start,end,distance:Math.round(Math.hypot(end.x-start.x,end.z-start.z)*100)/100,samples:await samplePhase('movement:WASD-3.5s')};assert(movement.distance>.1,'WASD hold should move the player');assertSamples(movement.samples);assert(movement.samples.every(s=>s.world==='future'),'movement samples must stay in the initial scene');console.log('[profile] movement',JSON.stringify(movement));await page.screenshot({path:new URL('performance-profile-movement.png',artifacts).pathname});
 await page.locator('.brand').click();const before=Date.now();await page.locator('.world-link[data-world="self"]').click();await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self',{timeout:45000});const stateMs=Date.now()-before;await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:30000});const transition={stateMs,samples:await samplePhase('portal-world-transition:self')};assertSamples(transition.samples);assert(transition.samples.every(s=>s.world==='self'),'transition samples must use the destination world');console.log('[profile] world transition',JSON.stringify(transition));await page.screenshot({path:new URL('performance-profile-transition.png',artifacts).pathname});
 const frameTimingComplete=[idle,movement.samples,transition.samples].every(phase=>phase.some(s=>s.frameTimingValid));
 const result={result:frameTimingComplete?'PASS':'PARTIAL',frameTimingComplete,browser:await browser.version(),renderer,idleFrameTimingAvailable:idle.some(s=>s.frameTimingValid),idle,movement,transition,consoleErrors:errors,httpErrors:http,screenshots:['review-output/e2e/performance-profile-idle.png','review-output/e2e/performance-profile-movement.png','review-output/e2e/performance-profile-transition.png']};
 console.log(JSON.stringify(result,null,2));assert.deepEqual(errors,[],'browser page errors');assert.deepEqual(http,[],'HTTP error responses');
}catch(error){
 if(page)await page.screenshot({path:new URL('performance-profile-failure.png',artifacts).pathname,timeout:5000}).catch(()=>{});
 throw error;
}finally{
 if(context)await Promise.race([context.close(),delay(5000)]);if(browser)await Promise.race([browser.close(),delay(4000)]);if(server){const child=server.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
 vite.kill('SIGTERM');await Promise.all([rm(config,{recursive:true,force:true}),rm(cache,{recursive:true,force:true})]);
}
