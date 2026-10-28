import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {KENNEY_SOURCE} from '../../src/asset-catalog.js';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_ASSET_PORT||5181),origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);await mkdir(artifacts,{recursive:true});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-asset-config-')),cacheDir=await mkdtemp(join(tmpdir(),'elsewhere-asset-cache-'));
let browser;
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not become ready');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||config,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||cacheDir},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({serviceWorkers:'allow'}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin,{waitUntil:'networkidle'});
 const installed=await page.evaluate(async()=>{
  const old=await caches.open('elsewhere-static-v7');
  await old.put('/assets/icons/book-open.svg',new Response('STALE-V7-ASSET'));
  const registration=await navigator.serviceWorker.register('/sw.js');
  await registration.update();
  const ready=await navigator.serviceWorker.ready;
  return {active:ready.active?.state,url:ready.active?.scriptURL,keys:await caches.keys()};
 });
 assert.equal(installed.active,'activated');
 assert(installed.url?.endsWith('/sw.js'));
 assert(!installed.keys.includes('elsewhere-static-v7'),'activation must remove a prior installed cache version');
 assert(installed.keys.includes('elsewhere-static-v8'),'current shell cache must be installed');
 await page.reload({waitUntil:'networkidle'});
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 const asset=await page.evaluate(async()=>{
  const response=await fetch('/assets/icons/book-open.svg'),text=await response.text();
  const current=await caches.open('elsewhere-static-v8'),cached=await current.match('/assets/icons/book-open.svg');
  return {status:response.status,stale:text.includes('STALE-V7-ASSET'),served:text.includes('<svg'),cached:!!cached};
 });
 assert.deepEqual(asset,{status:200,stale:false,served:true,cached:true});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({result:'PASS',scenario:'real Chromium service-worker upgrade deletes seeded v7 asset cache, activates v8, serves and caches fresh same-origin icon after reload',browser:await browser.version(),errors}));
 await context.close();

 const fallbackContext=await browser.newContext({viewport:{width:900,height:650},serviceWorkers:'allow'}),fallbackPage=await fallbackContext.newPage(),pageErrors=[],consoleErrors=[];
 fallbackPage.on('pageerror',error=>pageErrors.push(error.message));
 fallbackPage.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
 let failedAssetRequests=0;
 await fallbackPage.route('**/assets/kenney/index.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:1,license:'CC0-1.0',sourceCommit:KENNEY_SOURCE.commit,models:['skyline-a']})}));
 await fallbackPage.route('**/assets/kenney/skyline-a.glb',async route=>{failedAssetRequests++;await route.fulfill({status:503,contentType:'text/plain',body:'synthetic optional-asset outage'});});
 const click=async locator=>{
  await locator.scrollIntoViewIfNeeded();
  const point=await locator.evaluate(node=>{const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:r.width>0&&r.height>0,enabled:!node.disabled,hitWithin:!!hit&&(hit===node||node.contains(hit))};});
  assert(point.visible&&point.enabled&&point.hitWithin,`visible game control must be clickable: ${JSON.stringify(point)}`);
  await fallbackPage.mouse.click(point.x,point.y);
 };
 await fallbackPage.goto(origin,{waitUntil:'networkidle'});const assetFailure=fallbackPage.waitForResponse(response=>response.url().endsWith('/assets/kenney/skyline-a.glb')&&response.status()===503,{timeout:15000});await click(fallbackPage.locator('#guest-play'));await assetFailure;
 await fallbackPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
 await fallbackPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='future');
 assert.equal(failedAssetRequests,1,'the installed manifest should attempt the optional same-origin GLB once');
 assert.equal(await fallbackPage.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'asset failure must not create a guest save');
 await fallbackPage.screenshot({path:new URL('asset-fallback-before.png',artifacts).pathname});
 await click(fallbackPage.locator('.brand'));await click(fallbackPage.locator('.world-link[data-world="past"]'));
 await fallbackPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='past');
 await click(fallbackPage.locator('.hero-enter'));
 await click(fallbackPage.locator('.choice-list [data-action="invent-cell"]'));
 await click(fallbackPage.locator('.choice-list [data-action="gift"]'));
 await click(fallbackPage.locator('.brand'));await click(fallbackPage.locator('.world-link[data-world="future"]'));
 await fallbackPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='future');
 await click(fallbackPage.locator('.hero-enter'));
 await fallbackPage.locator('.story-panel').waitFor({state:'visible'});
 assert.match(await fallbackPage.locator('.story-panel').innerText(),/A city of open workshops/);
 assert.deepEqual(pageErrors,[]);
 const unexpectedConsoleErrors=consoleErrors.filter(message=>!/^Failed to load resource: the server responded with a status of 503/.test(message));
 assert.deepEqual(unexpectedConsoleErrors,[],'only expected browser console reports for the deliberate HTTP 503 are allowed');
 await fallbackPage.screenshot({path:new URL('asset-fallback-gift.png',artifacts).pathname});
 console.log(JSON.stringify({result:'PASS',scenario:'optional same-origin GLB returns synthetic HTTP 503; procedural game remains playable through the 1889 gift and 2087 outcome',failedAssetRequests,pageErrors,expectedAssetConsoleErrors:consoleErrors.length}));
 await fallbackContext.close();
}finally{
 await browser?.close().catch(()=>{});
 vite.kill('SIGTERM');
 await Promise.race([new Promise(resolve=>vite.once('exit',resolve)),delay(3000)]);
 await rm(config,{recursive:true,force:true});await rm(cacheDir,{recursive:true,force:true});
}
