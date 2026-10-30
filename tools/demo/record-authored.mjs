import assert from 'node:assert/strict';
import {spawn, execFile as execFileCallback} from 'node:child_process';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {promisify} from 'node:util';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url);
const port=Number(process.env.ELSEWHERE_DEMO_PORT||5189);
const origin=`http://127.0.0.1:${port}`;
const output=resolve(process.env.ELSEWHERE_DEMO_OUTPUT||new URL('../../review-output/demo-local/',import.meta.url).pathname);
const videoPath=join(output,'elsewhere-authored-offline.mp4');
const frameDirectory=join(output,'.capture-frames');
const execFile=promisify(execFileCallback);
await mkdir(output,{recursive:true});
await rm(frameDirectory,{recursive:true,force:true});await mkdir(frameDirectory,{recursive:true});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-demo-config-'));
const cache=await mkdtemp(join(tmpdir(),'elsewhere-demo-cache-'));
let browser,context,page,cdp,frameQueue=Promise.resolve();
const capturedFrames=[];let captureError=null;
const pageErrors=[],consoleErrors=[],httpErrors=[],externalRequests=[],metaRequests=[];

async function clickVisible(locator){
 await locator.scrollIntoViewIfNeeded();
 const point=await locator.evaluate(node=>{
  const rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,hit=document.elementFromPoint(x,y);
  return{x,y,visible:rect.width>0&&rect.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit))};
 });
 assert(point.visible&&point.enabled&&point.hitWithin,`recording click target must be visible, enabled and unobstructed: ${JSON.stringify(point)}`);
 await page.mouse.click(point.x,point.y);
}
async function travelTo(world){
 await clickVisible(page.locator(`.portal-card[data-world="${world}"]`));
 await page.waitForFunction(id=>document.querySelector('#app-ui')?.dataset.world===id,world,{timeout:45000});
}
function addRecordingDisclosure(){
 // This fixed overlay belongs only to the recording; it is not part of ELSEWHERE's UI.
 const badge=document.createElement('div');badge.textContent='LOCAL CAPTURE · AUTHORED OFFLINE · META DISABLED';
 Object.assign(badge.style,{position:'fixed',zIndex:'2147483647',top:'98px',left:'50%',transform:'translateX(-50%)',padding:'7px 11px',border:'1px solid rgba(138,231,237,.55)',borderRadius:'999px',background:'rgba(4,12,18,.9)',color:'#bdeef0',font:'600 10px system-ui,sans-serif',letterSpacing:'.1em',whiteSpace:'nowrap',pointerEvents:'none',boxShadow:'0 5px 22px rgba(0,0,0,.45)'});
 document.body.append(badge);
}

try{
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){
  if(vite.exitCode!==null)throw new Error(`Vite exited before readiness (${vite.exitCode})`);
  try{if((await fetch(origin)).ok){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 assert(ready,'Vite did not become ready on the local recording port');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||config,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||cache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
 page=await context.newPage();page.setDefaultTimeout(45000);
 cdp=await context.newCDPSession(page);
 cdp.on('Page.screencastFrame',event=>{
  const index=capturedFrames.length,path=join(frameDirectory,`frame-${String(index).padStart(6,'0')}.jpg`);
  frameQueue=frameQueue.then(async()=>{
   await writeFile(path,Buffer.from(event.data,'base64'));
   capturedFrames.push({path,timestamp:Number.isFinite(event.metadata?.timestamp)?event.metadata.timestamp:Date.now()/1000});
  }).then(()=>cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId})).catch(error=>{captureError=error;});
 });
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:86,maxWidth:1280,maxHeight:720,everyNthFrame:2});
 page.on('pageerror',error=>pageErrors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
 page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
 page.on('request',request=>{
  if(!request.url().startsWith(`${origin}/`))externalRequests.push(request.url());
  if(new URL(request.url()).pathname==='/api/character')metaRequests.push(request.url());
 });
 await page.goto(origin,{waitUntil:'networkidle'});
 assert(await page.locator('#guest-play').isVisible(),'the recording must begin on the real unsaved entry gate');
 await page.waitForTimeout(2200);
 await clickVisible(page.locator('#guest-play'));
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',undefined,{timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='future',undefined,{timeout:30000});
 await page.evaluate(addRecordingDisclosure);
 assert.match((await page.locator('.privacy-sigil').innerText()).trim(),/GUEST · NOT SAVED/);
 await page.waitForTimeout(4000);

 await travelTo('self');
 await clickVisible(page.locator('.hero-enter'));
 await page.locator('#chat-question').waitFor({state:'visible'});
 await page.locator('#chat-question').fill('What does this possible future feel like?');
 await clickVisible(page.locator('#chat-form button[type="submit"]'));
 await page.locator('#chat-history .chat-line.elder').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('.chat-header')?.innerText.includes('LOCAL · AUTHORED · GUEST · NOT SAVED'));
 assert.match(await page.locator('.chat-note').innerText(),/authored dialogue, no network AI/i);
 await page.waitForTimeout(6000);

 const storyClose=page.locator('.story-panel .sheet-inline-close');
 if(await storyClose.isVisible())await clickVisible(storyClose);
 await travelTo('past');
 await clickVisible(page.locator('.hero-enter'));
 await clickVisible(page.locator('.choice-list [data-action="invent-cell"]'));
 await clickVisible(page.locator('.choice-list [data-action="gift"]'));
 await page.waitForFunction(()=>document.querySelector('.story-panel')?.innerText.toLowerCase().includes('you chose to share the invention'));
 await page.waitForTimeout(4500);

 const pastClose=page.locator('.story-panel .sheet-inline-close');
 if(await pastClose.isVisible())await clickVisible(pastClose);
 await travelTo('future');
 await clickVisible(page.locator('.hero-enter'));
 await page.waitForFunction(()=>document.querySelector('.story-panel')?.innerText.match(/city of open workshops/i));
 assert.match(await page.locator('.story-panel').innerText(),/Aether Cell/);
 await page.waitForTimeout(6500);

 const futureClose=page.locator('.story-panel .sheet-inline-close');
 if(await futureClose.isVisible())await clickVisible(futureClose);
 await travelTo('self');
 await clickVisible(page.locator('.hero-enter'));
 await page.locator('#chat-question').fill('What changed after we shared the Aether Cell?');
 await clickVisible(page.locator('#chat-form button[type="submit"]'));
 await page.locator('#chat-history .chat-line.elder').nth(1).waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#chat-history')?.innerText.toLowerCase().includes('public workshops'));
 await page.waitForFunction(()=>document.querySelector('#world-canvas canvas')?.dataset.causalExhibit==='authored:people:gift');
 assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-world'),'self');
 assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-branch'),'prime');
 await page.waitForTimeout(7000);
 assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'the synthetic guest story must not create a vault');
 assert.deepEqual(metaRequests,[],'the authored offline demonstration must make zero Meta requests');
 assert.deepEqual(externalRequests,[],'the demonstration must make no off-origin requests');
 assert.deepEqual(pageErrors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(httpErrors,[]);
 const runtime=await page.evaluate(()=>({userAgent:navigator.userAgent,renderer:(()=>{try{const gl=document.querySelector('#world-canvas canvas').getContext('webgl2')||document.querySelector('#world-canvas canvas').getContext('webgl');return gl?.getParameter(gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL)||'unknown';}catch{return'unknown';}})()}));
 await cdp.send('Page.stopScreencast');await frameQueue;
 if(captureError)throw captureError;
 assert(capturedFrames.length>=30,`browser screencast should contain at least 30 frames (captured ${capturedFrames.length})`);
 const concatPath=join(frameDirectory,'frames.txt');
 const quotePath=path=>`'${path.replaceAll("'","'\\''")}'`;
 const durations=capturedFrames.slice(1).map((frame,i)=>Math.max(.02,frame.timestamp-capturedFrames[i].timestamp));
 const sorted=[...durations].sort((a,b)=>a-b),lastDuration=sorted.length?Math.min(1,sorted[Math.floor(sorted.length/2)]):.1;
 const lines=[];
 capturedFrames.forEach((frame,index)=>{lines.push(`file ${quotePath(frame.path)}`);if(index<durations.length)lines.push(`duration ${durations[index].toFixed(6)}`);else lines.push(`duration ${lastDuration.toFixed(6)}`);});
 await writeFile(concatPath,`${lines.join('\n')}\n`);
 await execFile(process.env.FFMPEG_PATH||'ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',concatPath,'-fps_mode','vfr','-c:v','libx264','-preset','medium','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',videoPath]);
 const probe=await execFile(process.env.FFPROBE_PATH||'ffprobe',['-v','error','-show_entries','stream=codec_name,width,height,avg_frame_rate','-show_entries','format=duration,size','-of','json',videoPath]);
 const media=JSON.parse(probe.stdout),stream=media.streams?.[0],duration=Number(media.format?.duration);
 assert.equal(stream?.codec_name,'h264');assert.equal(stream?.width,1280);assert.equal(stream?.height,720);assert(duration>=30,`recording should show the complete short journey (duration=${duration})`);
 await page.close();
 await context.close();context=null;
 console.log(JSON.stringify({result:'PASS',videoPath,viewport:'1280x720 CSS pixels',runtime,browser:await browser.version(),video:{...media.format,stream,frames:capturedFrames.length},kind:'real local browser screencast; authored offline dialogue; recording-only disclosure overlay; no Meta endpoint',checks:{guestVaultCreated:false,metaRequests:metaRequests.length,externalRequests:externalRequests.length,pageErrors:pageErrors.length,consoleErrors:consoleErrors.length,httpErrors:httpErrors.length}}));
}finally{
 if(context)await Promise.race([context.close(),new Promise(resolve=>setTimeout(resolve,5000))]);
 if(cdp)try{await cdp.detach();}catch{}
 if(browser)await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,4000))]);
 if(vite.exitCode===null){vite.kill('SIGTERM');}
 await Promise.all([rm(config,{recursive:true,force:true}),rm(cache,{recursive:true,force:true}),rm(frameDirectory,{recursive:true,force:true})]);
}
