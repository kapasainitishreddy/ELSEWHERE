// Chromium mobile emulation uses SwiftShader; it is not a physical-device benchmark.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url);
const port=Number(process.env.ELSEWHERE_MOBILE_PORT||5178);
const origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);
await mkdir(artifacts,{recursive:true});
const checkpoint=(name,detail='')=>console.log(`[mobile-journey] ${name}${detail?` — ${detail}`:''}`);
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
let browser,browserServer;
const chromiumConfig=await mkdtemp(join(tmpdir(),'elsewhere-chromium-config-'));
const chromiumCache=await mkdtemp(join(tmpdir(),'elsewhere-chromium-cache-'));
const PASS='Synthetic mobile vault passphrase 42';
try{
 let ready=false;
 for(let n=0;n<80;n++){
  if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);
  try{if((await fetch(origin)).ok){ready=true;break;}}catch{}
  await delay(250);
 }
 assert(ready,'Vite did not become ready');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 const launchOptions={executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||chromiumConfig,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||chromiumCache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']};
 browserServer=await chromium.launchServer(launchOptions);browser=await chromium.connect(browserServer.wsEndpoint());
 const browserErrors=[],httpErrors=[],external=[],characterRequests=[];
 const makeMobileContext=()=>browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const instrument=page=>{
  page.setDefaultTimeout(30000);page.emulateMedia({reducedMotion:'reduce'});
  page.on('pageerror',error=>browserErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')browserErrors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(new URL(request.url()).pathname==='/api/character')characterRequests.push(request.url());if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
 };
 const tap=async locator=>locator.tap();

 // Unsaved player journey: native mobile emulation and touch events, with the authored character path.
 const guestContext=await makeMobileContext(),guestPage=await guestContext.newPage();instrument(guestPage);
 try{
  await guestPage.goto(`${origin}/?perf=1`,{waitUntil:'networkidle'});
  assert.equal(await guestPage.evaluate(()=>({width:innerWidth,touch:navigator.maxTouchPoints})).then(v=>v.width),390,'test must use a 390 CSS-pixel mobile viewport');
  assert((await guestPage.evaluate(()=>navigator.maxTouchPoints))>0,'browser context must have touch input enabled');
  assert.equal(await guestPage.evaluate(()=>document.documentElement.scrollWidth),390,'mobile entry screen must not overflow horizontally');
  await guestPage.screenshot({path:new URL('mobile-journey-entry.png',artifacts).pathname,fullPage:true});
  await tap(guestPage.locator('#guest-play'));
  await guestPage.locator('#vault-gate').waitFor({state:'hidden'});
  await guestPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  assert.match(await guestPage.locator('.privacy-sigil').innerText(),/GUEST · NOT SAVED/);
  assert.equal(await guestPage.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null);
  await guestPage.waitForFunction(()=>document.querySelector('.first-crossing [data-cmd="journey-skip"]'));
  await tap(guestPage.locator('.first-crossing [data-cmd="journey-skip"]'));
  assert(await guestPage.locator('.journey-restore').isVisible(),'hidden guide should be resumable by touch');
  await tap(guestPage.locator('.journey-restore'));
  assert(await guestPage.locator('.first-crossing').isVisible(),'story guide should resume by touch');
  await tap(guestPage.locator('.first-crossing [data-cmd="journey-skip"]'));
  const dpad=guestPage.locator('.mobile-dpad');await dpad.waitFor({state:'visible'});
  const mobileCDP=await guestContext.newCDPSession(guestPage);
  async function holdMove(code,milliseconds=1600){
   const button=guestPage.locator(`.mobile-dpad [data-move="${code}"]`),box=await button.boundingBox();
   assert(box,`touch movement button ${code} is not visible`);
   await mobileCDP.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1,radiusX:3,radiusY:3,force:1}]});
   try{await delay(milliseconds);}finally{await mobileCDP.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  }
  const player=()=>guestPage.evaluate(()=>({x:Number(document.querySelector('#world-canvas')?.dataset.playerX),z:Number(document.querySelector('#world-canvas')?.dataset.playerZ)}));
  const beforeMove=await player();await holdMove('KeyA',1800);const afterProbe=await player();
  assert(Number.isFinite(afterProbe.x)&&Number.isFinite(afterProbe.z),'diagnostic player position should be available for the touch portal run');
  const lateralCode=afterProbe.x<beforeMove.x?'KeyA':'KeyD';
  if(Math.abs(afterProbe.x-beforeMove.x)<.05)throw new Error(`mobile movement pad did not move the player: ${JSON.stringify({beforeMove,afterProbe})}`);
  checkpoint('touch movement pad responds',`${JSON.stringify(beforeMove)} → ${JSON.stringify(afterProbe)}`);
  for(let n=0;n<40;n++){
   const p=await player(),distance=-8.55-p.x;if(Math.abs(distance)<.55)break;
   const correction=distance*(lateralCode==='KeyA'?-1:1)>0?lateralCode:(lateralCode==='KeyA'?'KeyD':'KeyA');
   await holdMove(correction,Math.abs(distance)>1.5?1500:350);
  }
  let p=await player();
  if(Math.abs(p.x+8.55)>=.75)throw new Error(`mobile touch movement did not reach the 2046 portal x corridor: ${JSON.stringify(p)}`);
  const zProbe=await player();await holdMove('KeyW',1800);const zAfter=await player();
  const forwardCode=zAfter.z<zProbe.z?'KeyW':'KeyS';
  if(Math.abs(zAfter.z-zProbe.z)<.05)throw new Error(`mobile forward control did not move: ${JSON.stringify({zProbe,zAfter})}`);
  for(let n=0;n<70;n++){
   p=await player();
   const cue=await guestPage.locator('.world-proximity-cue').innerText().catch(()=> '');
   if(p.z<=-17.9&&cue.toUpperCase().includes('THE OTHER YOU'))break;
   const distance=-18.1-p.z,correction=distance*(forwardCode==='KeyW'?-1:1)>0?forwardCode:(forwardCode==='KeyW'?'KeyS':'KeyW');
   await holdMove(correction,Math.abs(distance)>1.5?1500:350);
  }
  p=await player();
  await guestPage.waitForFunction(()=>{
   const cue=document.querySelector('.world-proximity-cue');return cue?.classList.contains('visible')&&cue.textContent.toUpperCase().includes('THE OTHER YOU');
  },{timeout:15000}).catch(async error=>{throw new Error(`mobile route reached ${JSON.stringify(await player())} but did not activate the 2046 portal cue: ${await guestPage.locator('.world-proximity-cue').innerText().catch(()=> '')}`,{cause:error});});
  assert(p.z<=-17.4,`player has not reached 2046 portal interaction range: ${JSON.stringify(p)}`);
  await tap(guestPage.locator('.mobile-dpad [data-cmd="interact"]'));
  await guestPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self',{timeout:45000});
  await guestPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  checkpoint('entered The Other You through the 3D portal');

  await tap(guestPage.locator('.hero-enter'));
  await guestPage.locator('#chat-question').fill('What does an ordinary day look like in this imagined future?');
  await tap(guestPage.locator('#chat-form button[type="submit"]'));
  await guestPage.locator('#chat-history .chat-line.elder').waitFor({state:'visible'});
  const authoredReply=await guestPage.locator('#chat-history .chat-line.elder').last().innerText();
  assert(authoredReply.length>20,'authored local future-self fallback should answer on mobile');
  assert.equal(characterRequests.length,0,'offline authored dialogue must issue no Meta API request');
  await guestPage.screenshot({path:new URL('mobile-future-self-authored.png',artifacts).pathname,fullPage:true});
  checkpoint('future-self authored dialogue replied without network');

  // Close the focused story sheet before using the persistent time tracker.
  await tap(guestPage.locator('.story-panel [data-cmd="story-toggle"]'));
  await guestPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.storyOpen==='false');
  await guestPage.locator('.story-panel').waitFor({state:'hidden'});
  const tradeButton=guestPage.locator('.artifact-tracker [data-cmd="time-exchange"]');
  await tap(tradeButton);
  const work=guestPage.locator('.choice-list [data-action="time-work-self"]');
  await work.waitFor({state:'visible'});await tap(work);
  assert.match(await guestPage.locator('.chronal-hud').innerText(),/16 HOURS/,'time work should add four fictional hours');
  const repeatWork=guestPage.locator('.choice-list [data-action="time-work-self"]');
  await repeatWork.waitFor({state:'visible'});
  assert(await repeatWork.isDisabled(),'same-world time work should be disabled after one transaction');
  checkpoint('time exchange applied once; repeat action disabled');

  // Use touch-operated world navigation for the rest of the short causal journey.
  await tap(guestPage.locator('.brand'));
  await tap(guestPage.locator('.world-link[data-world="past"]'));
  await guestPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='past');
  await guestPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  await tap(guestPage.locator('.hero-enter'));
  await tap(guestPage.locator('.choice-list [data-action="invent-cell"]'));
  await tap(guestPage.locator('.choice-list [data-action="gift"]'));
  assert.match((await guestPage.locator('.story-panel').innerText()).toLowerCase(),/share the invention/);
  await tap(guestPage.locator('.brand'));
  await tap(guestPage.locator('.world-link[data-world="self"]'));
  await guestPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self');
  await guestPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  await tap(guestPage.locator('.hero-enter'));
  await guestPage.locator('#chat-question').fill('What changed after we shared the Aether Cell?');
  await tap(guestPage.locator('#chat-form button[type="submit"]'));
  await guestPage.locator('#chat-history .chat-line.elder').last().waitFor({state:'visible'});
  assert.match((await guestPage.locator('#chat-history').innerText()).toLowerCase(),/public workshops/,'future self should ground recall in the gift choice');
  await tap(guestPage.locator('.brand'));
  await tap(guestPage.locator('.world-link[data-world="future"]'));
  await guestPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='future');
  await guestPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  await tap(guestPage.locator('.hero-enter'));
  assert.match((await guestPage.locator('.story-panel').innerText()).toLowerCase(),/city of open workshops/);
  assert.equal(await guestPage.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'guest mutations remain unsaved after touch journey');
  await guestPage.screenshot({path:new URL('mobile-2087-gift-outcome.png',artifacts).pathname,fullPage:true});
  assert.equal(await guestPage.evaluate(()=>document.documentElement.scrollWidth),390,'story panels must not cause horizontal overflow on mobile');

  const reset=guestPage.locator('[data-cmd="reset"]');await tap(guestPage.locator('[data-cmd="journal"]'));await reset.waitFor({state:'visible'});
  guestPage.once('dialog',dialog=>dialog.dismiss());await tap(reset);
  assert.equal(await guestPage.locator('#app-ui').getAttribute('data-world'),'future','canceling reset should preserve the current world');
  assert.match((await guestPage.locator('body').innerText()).toLowerCase(),/open workshops/,'canceling reset should preserve the gift outcome');
  guestPage.once('dialog',dialog=>dialog.accept());await tap(guestPage.locator('[data-cmd="reset"]'));
  await guestPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='future');
  assert.match(await guestPage.locator('.privacy-sigil').innerText(),/GUEST · NOT SAVED/);
  assert.equal(await guestPage.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null);
  checkpoint('guest reset cancel preserved story; confirmed restart returned to unsaved beginning');
  assert.deepEqual(browserErrors,[],'mobile journey browser errors');
 }finally{await guestContext.close();}

 // Encrypted-save lifecycle on the same touch viewport, including mutation, lock, reload and resume.
 const vaultContext=await makeMobileContext(),vaultPage=await vaultContext.newPage();instrument(vaultPage);
 try{
  await vaultPage.goto(`${origin}/?perf=1`,{waitUntil:'networkidle'});
  await vaultPage.locator('#vault-passphrase').fill(PASS);await tap(vaultPage.locator('#vault-submit'));
  await vaultPage.locator('#vault-gate').waitFor({state:'hidden'});
  await vaultPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  const readCipher=()=>vaultPage.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1'));
  const initialCipher=await readCipher();assert(initialCipher,'touch-created vault should persist its encrypted envelope');
  assert.doesNotMatch(initialCipher,new RegExp(PASS));
  await tap(vaultPage.locator('.hero-enter'));
  await tap(vaultPage.locator('.story-panel [data-cmd="story-toggle"]'));
  await vaultPage.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.storyOpen==='false');
  await vaultPage.locator('.story-panel').waitFor({state:'hidden'});
  await tap(vaultPage.locator('.artifact-tracker [data-cmd="time-exchange"]'));
  await tap(vaultPage.locator('.choice-list [data-action="time-work-future"]'));
  await vaultPage.waitForFunction(old=>localStorage.getItem('syrava.elsewhere.private-v1')!==old,initialCipher);
  assert.match(await vaultPage.locator('.chronal-hud').innerText(),/16 HOURS/);
  const savedCipher=await readCipher();assert.doesNotMatch(savedCipher,new RegExp(PASS));
  await tap(vaultPage.locator('[data-cmd="lock"]'));
  await vaultPage.locator('#vault-gate').waitFor({state:'visible'});
  assert.equal(await vaultPage.locator('#app-ui').innerText(),'','lock should remove private story controls');
  const lockedCipher=await readCipher(),lockedEnvelope=JSON.parse(lockedCipher);
  assert.equal(lockedEnvelope.cipher,'AES-256-GCM','lock must leave a valid encrypted save envelope');
  assert.equal(lockedEnvelope.kdf,'PBKDF2-SHA256');
  assert.doesNotMatch(lockedCipher,new RegExp(PASS));
  await vaultPage.reload({waitUntil:'networkidle'});
  await vaultPage.locator('#vault-passphrase').fill(PASS);await tap(vaultPage.locator('#vault-submit'));
  await vaultPage.locator('#vault-gate').waitFor({state:'hidden'});
  await vaultPage.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:60000});
  await tap(vaultPage.locator('.hero-enter'));
  assert.match(await vaultPage.locator('.chronal-hud').innerText(),/16 HOURS/,'reopened mobile vault should resume the exact saved time balance');
  assert.doesNotMatch(await readCipher(),new RegExp(PASS));
  checkpoint('mobile encrypted vault create → mutate → lock → reload → unlock resumed 16 hours');
 }finally{await vaultContext.close();}

 assert.deepEqual(browserErrors,[],'mobile journey and vault browser errors');
 assert.deepEqual(httpErrors,[],'mobile journey HTTP failures');
 assert.deepEqual(external,[],'mobile journey off-origin requests');
 assert.equal(characterRequests.length,0,'mock/live Meta requests are not used in this authored mobile journey');
 console.log(JSON.stringify({result:'PASS',browser:await browser.version(),mobileEmulation:'390x844 CSS px · touch enabled · Chromium',journey:'guest onboarding → touch-pad 3D portal to 2046 → authored future-self dialogue → one-time fictional hour trade → 1889 Aether Cell gift → 2046 grounded recall → 2087 public workshops',vault:'encrypted create → fictional time mutation → lock → reload → unlock resumed 16 hours',guestReset:'cancel preserved outcome; confirm restarted unsaved story',characterRequests:characterRequests.length,errors:browserErrors,httpErrors,external,screenshots:artifacts.pathname,note:'software-rendered mobile emulation; not a physical phone, live Meta call, or Quest measurement'},null,2));
}finally{
 if(browser)await Promise.race([browser.close(),delay(4000)]);
 if(browserServer){const child=browserServer.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
 vite.kill('SIGTERM');await Promise.all([rm(chromiumConfig,{recursive:true,force:true}),rm(chromiumCache,{recursive:true,force:true})]);
}
