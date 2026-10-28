import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_LIFECYCLE_PORT||5177),origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);await mkdir(artifacts,{recursive:true});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
let browser;
let browserServer;
const chromiumConfig=await mkdtemp(join(tmpdir(),'elsewhere-chromium-config-'));
const chromiumCache=await mkdtemp(join(tmpdir(),'elsewhere-chromium-cache-'));
const PASS='Synthetic vault passphrase 42',PRIVATE_SENTINEL='SYNTHETIC_PRIVATE_LETTER_SENTINEL';
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not become ready');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 const launchOptions={executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||chromiumConfig,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||chromiumCache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']};
 browserServer=await chromium.launchServer(launchOptions);browser=await chromium.connect(browserServer.wsEndpoint());
 const selected=(process.env.ELSEWHERE_LIFECYCLE||'physics,vault-cloud,guest-reset').split(',');
 const errors=[],httpErrors=[],external=[];
 const makePage=async()=>{
  const context=await browser.newContext({viewport:{width:900,height:650},deviceScaleFactor:1});
  const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(60000);
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
  return {context,page};
 };
 const startGuest=async page=>{await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#guest-play').click();await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');};
 const travelTo=async(page,world)=>{
  if(await page.locator('#app-ui').getAttribute('data-world')===world)return;
  await page.locator('.brand').click();await page.locator(`.world-link[data-world="${world}"]`).click();
  await page.waitForFunction(id=>document.querySelector('#app-ui')?.dataset.world===id,world);
  await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
 };
 const enterGift=async page=>{
  await travelTo(page,'past');await page.locator('.hero-enter').click();
  await page.locator('.choice-list [data-action="invent-cell"]').click();
  await page.locator('.choice-list [data-action="gift"]').click();
  await travelTo(page,'future');
 };

 if(selected.includes('physics')){
  const {context,page}=await makePage();
  try{
   await page.goto(`${origin}?perf=1`,{waitUntil:'networkidle'});await page.locator('#physics-play').click();
   const control=page.locator('#world-canvas .world-physics-action');
   await page.waitForFunction(()=>document.querySelector('.world-physics-action')?.dataset.ready==='true',{timeout:60000});
   await control.waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'physics guest must not create a vault');
   await delay(6000); // let shader compilation and the diagnostic window warm up
   const perfText=await page.locator('.world-perf-display').innerText();const fps=Number(perfText.match(/(\d+) FPS/)?.[1]||0);
   const simSecondsPerWallSecond=fps?Math.min(1,fps*.05):.1;
   const cooldownWait=Math.min(30000,Math.max(1200,Math.ceil(900/simSecondsPerWallSecond)));
   console.log(`physics: real Chromium ${perfText}; cooldown wait ${cooldownWait}ms per repeated same-body impulse`);
   let count=Number(await control.getAttribute('data-impulses'));
   await control.click();await page.waitForFunction(n=>Number(document.querySelector('.world-physics-action')?.dataset.impulses)>n,count);
   count=Number(await control.getAttribute('data-impulses'));
   await page.keyboard.press('KeyE');await page.waitForFunction(n=>Number(document.querySelector('.world-physics-action')?.dataset.impulses)>n,count,{timeout:5000});
   for(let n=0;n<30;n++){
    const previous=Number(await control.getAttribute('data-impulses'));
    let accepted=false;
    for(let attempt=0;attempt<5&&!accepted;attempt++){
     if(attempt>0||n===0)await delay(cooldownWait);
     await control.click();accepted=Number(await control.getAttribute('data-impulses'))>previous;
    }
    if(!accepted){const diagnostics=await page.evaluate(()=>({world:document.querySelector('#app-ui')?.dataset.world,ready:document.querySelector('.world-physics-action')?.dataset.ready,count:document.querySelector('.world-physics-action')?.dataset.impulses,lastAttempt:document.querySelector('.world-physics-action')?.dataset.lastAttempt,hidden:document.hidden}));throw new Error(`physics push ${n+1} was not accepted after ${previous}: ${JSON.stringify(diagnostics)}`);}
    if((n+1)%10===0)console.log(`physics: ${n+1}/30 accepted pushes`);
   }
   const total=Number(await control.getAttribute('data-impulses'));assert(total>=32,`expected at least 32 physical impulses; saw ${total}`);
   await page.screenshot({path:new URL('physics-30-interactions.png',artifacts).pathname});
   await travelTo(page,'future');await travelTo(page,'dungeon');
   await page.waitForFunction(()=>document.querySelector('.world-physics-action')?.dataset.ready==='true',{timeout:60000});
   assert.equal(await control.getAttribute('data-impulses'),'0','re-entry should have a clean transient physics stage');
   count=0;await page.keyboard.press('KeyE');await page.waitForFunction(n=>Number(document.querySelector('.world-physics-action')?.dataset.impulses)>n,count,{timeout:5000});
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null);
   console.log(JSON.stringify({result:'PASS',scenario:'physics guest: E/click impulses ×32, exit, re-enter, impulse works again',vault:'untouched'}));
  }finally{try{await Promise.race([page.goto(origin,{waitUntil:'domcontentloaded'}),delay(5000)]);}catch{}await Promise.race([context.close(),delay(5000)]);}
 }

 if(selected.includes('vault-cloud')){
  const {context,page}=await makePage();let metaRequests=0,postedBody;
  try{
   await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();
   await page.locator('#vault-gate').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   const readVault=()=>page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1'));
   const initial=await readVault();assert(initial,'vault creation must persist an encrypted envelope');
   const envelope=JSON.parse(initial);assert.equal(envelope.cipher,'AES-256-GCM');assert.equal(envelope.kdf,'PBKDF2-SHA256');
   assert.doesNotMatch(initial,new RegExp(PASS));
   console.log('vault-cloud: encrypted vault created');
   await travelTo(page,'self');await page.locator('.hero-enter').click();
   await page.locator('#letter-text').fill(PRIVATE_SENTINEL);await page.locator('#letter-form button[type="submit"]').click();
   await page.waitForFunction(old=>localStorage.getItem('syrava.elsewhere.private-v1')!==old,initial);
   const letterCipher=await readVault();assert.doesNotMatch(letterCipher,new RegExp(PRIVATE_SENTINEL),'private letter must not appear in plaintext storage');
   console.log('vault-cloud: private letter persisted only as ciphertext');
   await enterGift(page);
   await page.waitForFunction(old=>localStorage.getItem('syrava.elsewhere.private-v1')!==old,initial);
   let encrypted=await readVault();assert.doesNotMatch(encrypted,new RegExp(PASS));
   assert.doesNotMatch(encrypted,new RegExp(PRIVATE_SENTINEL));
   await page.locator('[data-cmd="lock"]').click();await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.equal(await page.locator('#vault-title').innerText(),'UNLOCK YOUR PRIVATE WORLD');
   const lockedCipher=await readVault();const lockedEnvelope=JSON.parse(lockedCipher);
   assert.equal(lockedEnvelope.cipher,'AES-256-GCM');assert.equal(lockedEnvelope.kdf,'PBKDF2-SHA256');assert.doesNotMatch(lockedCipher,new RegExp(PASS));
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.equal(await readVault(),lockedCipher,'reload must preserve the last committed ciphertext');
   await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();await page.locator('#vault-gate').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   await travelTo(page,'self');await page.locator('.hero-enter').click();
   assert.equal(await page.locator('#letter-text').inputValue(),PRIVATE_SENTINEL,'encrypted private letter must survive unlock');
   console.log('vault-cloud: lock/reload/unlock restored encrypted story and letter');
   await travelTo(page,'future');await page.locator('.hero-enter').click();
   let outcome=await page.locator('.story-panel').innerText();assert.match(outcome,/A city of open workshops/);assert.match(outcome,/Aether Cell/);
   assert.equal(await page.locator('.privacy-sigil').innerText(),'PRIVATE LOCAL WORLD','unlock must leave cloud consent disabled');

   // Force only the next vault write to fail. Locking must still clear session/UI state.
   const stableCipher=await readVault();
   await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){if(key==='syrava.elsewhere.private-v1')throw new DOMException('Synthetic quota error','QuotaExceededError');return original.call(this,key,value);};
   });
   await page.locator('[data-cmd="lock"]').click();await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.match(await page.locator('#vault-notice').innerText(),/latest changes could not be saved/i);
   assert.equal(await readVault(),stableCipher,'failed save must preserve the last committed ciphertext');
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();
   await page.locator('#vault-gate').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   await page.locator('.hero-enter').click();outcome=await page.locator('.story-panel').innerText();assert.match(outcome,/A city of open workshops/);
   console.log('vault-cloud: quota failure cleared session, prior ciphertext remained unlockable');

   await travelTo(page,'self');await page.locator('.hero-enter').click();
   const callsBefore=metaRequests;
   await page.locator('#chat-question').fill('What changed in our possible future?');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').waitFor();assert.equal(metaRequests,callsBefore,'Meta disabled must produce zero API requests');
   console.log('vault-cloud: authored offline reply made zero Meta requests');
   await page.route('**/api/character',async route=>{
    metaRequests++;postedBody=route.request().postDataJSON();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'The invention we shared supports a network of public workshops.',cue:'wonder',focus:'memory'})});
   });
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   assert.match(await page.locator('.privacy-sigil').innerText(),/META CLOUD/);
   await page.locator('#chat-question').fill('Tell me what became of the invention we shared.');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').nth(1).waitFor();assert.equal(metaRequests,1);
   console.log('vault-cloud: consented mocked Meta reply and allowlisted request validated');
   assert.deepEqual(Object.keys(postedBody).sort(),['cloudConsent','question','timeline','world']);
   assert.doesNotMatch(JSON.stringify(postedBody),new RegExp(`${PASS}|${PRIVATE_SENTINEL}`));
   await page.unroute('**/api/character');
   await page.route('**/api/character',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({error:'synthetic malformed reply'})}));
   const priorElders=await page.locator('#chat-history .chat-line.elder').count();
   await page.locator('#chat-question').fill('A malformed response must leave play available.');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').nth(priorElders).waitFor();
   assert.match(await page.locator('#toast-region').innerText(),/Meta unavailable\. Continuing with local dialogue/i);
   assert.equal(metaRequests,1,'the malformed mock is distinct from the validated success route');
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-gate').waitFor({state:'visible'});
   await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();await page.locator('#vault-gate').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   assert.equal(await page.locator('.privacy-sigil').innerText(),'PRIVATE LOCAL WORLD','reload/unlock must reset cloud consent');

   // Hold a mocked response in flight and travel away. The transport should abort,
   // and the old reply must not enter either this session or a future reload.
   await travelTo(page,'self');await page.locator('.hero-enter').click();
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   let delayedCalls=0;
   await page.unroute('**/api/character');
   await page.route('**/api/character',async route=>{delayedCalls++;await new Promise(resolve=>setTimeout(resolve,8000));try{await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'STALE MOCK MUST NEVER APPEAR',cue:'wonder',focus:'memory'})});}catch{}});
   const worldChangeRequest=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/character');
   const worldChangeFailure=page.waitForEvent('requestfailed',{predicate:request=>new URL(request.url()).pathname==='/api/character'});
   await page.locator('#chat-question').fill('World transition cancellation sentinel.');await page.locator('#chat-form button[type="submit"]').click();await worldChangeRequest;
   await travelTo(page,'future');const worldFailure=await worldChangeFailure;await delay(250);
   assert(worldFailure.failure()?.errorText,'world transition must abort the in-flight model request');
   assert.equal(delayedCalls,1);assert.equal(await page.locator('#app-ui').getAttribute('data-world'),'future');
   assert.doesNotMatch(await page.locator('#app-ui').innerText(),/STALE MOCK MUST NEVER APPEAR|World transition cancellation sentinel/);
   // Lock while another response is pending; the key and consent clear before
   // storage can finish, and the cancelled question is not persisted.
   await travelTo(page,'self');await page.locator('.hero-enter').click();
   const lockRequest=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/character');
   const lockFailure=page.waitForEvent('requestfailed',{predicate:request=>new URL(request.url()).pathname==='/api/character'});
   await page.locator('#chat-question').fill('Lock transition cancellation sentinel.');await page.locator('#chat-form button[type="submit"]').click();await lockRequest;
   await page.locator('[data-cmd="lock"]').click();await page.locator('#vault-gate').waitFor({state:'visible'});
   assert((await lockFailure).failure()?.errorText,'lock must abort the in-flight model request');
   assert.equal(await page.locator('#vault-passphrase').inputValue(),'');
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();await page.locator('#vault-gate').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   await page.locator('.hero-enter').click();
   assert.doesNotMatch(await page.locator('.story-panel').innerText(),/Lock transition cancellation sentinel|STALE MOCK MUST NEVER APPEAR/);
   console.log(JSON.stringify({result:'PASS',scenario:'AES-GCM create/save/lock/reload/unlock; no plaintext sentinel/passphrase; save-failure lock cleanup; offline zero cloud calls; one clearly mocked Meta request; consent resets after reload',mockApiCalls:metaRequests}));
  }finally{try{await Promise.race([page.goto(origin,{waitUntil:'domcontentloaded'}),delay(5000)]);}catch{}await Promise.race([context.close(),delay(5000)]);}
 }

 if(selected.includes('guest-reset')){
  const {context,page}=await makePage();let calls=0;page.on('request',request=>{if(new URL(request.url()).pathname==='/api/character')calls++;});
  try{
   await startGuest(page);await travelTo(page,'self');await page.locator('.hero-enter').click();
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   assert.match(await page.locator('.privacy-sigil').innerText(),/META CLOUD/);
   await page.locator('[data-cmd="journal"]').click();page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="reset"]').click();
   assert.match(await page.locator('.privacy-sigil').innerText(),/GUEST · NOT SAVED/);
   assert.equal(calls,0);assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null);
   assert.doesNotMatch(await page.locator('body').innerText(),/META CLOUD · TEXT LEAVES DEVICE/);
   console.log(JSON.stringify({result:'PASS',scenario:'guest restart revoked consent, stayed unsaved, zero Meta requests'}));
  }finally{try{await Promise.race([page.goto(origin,{waitUntil:'domcontentloaded'}),delay(5000)]);}catch{}await Promise.race([context.close(),delay(5000)]);}
 }
 assert.deepEqual(errors,[],'browser page or console errors');assert.deepEqual(httpErrors,[],'HTTP errors');assert.deepEqual(external,[],'off-origin requests');
}finally{
 if(browser)await Promise.race([browser.close(),delay(4000)]);
 if(browserServer){const child=browserServer.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
 vite.kill('SIGTERM');await Promise.all([rm(chromiumConfig,{recursive:true,force:true}),rm(chromiumCache,{recursive:true,force:true})]);
}
