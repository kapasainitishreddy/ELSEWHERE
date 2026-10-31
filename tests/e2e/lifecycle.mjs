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
const PASS='Synthetic vault passphrase 42',PRIVATE_SENTINEL='SYNTHETIC_PRIVATE_LETTER_SENTINEL',ERASE_SENTINEL='SYNTHETIC_ERASE_RECOVERY_LETTER';
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
 const clickUser=async(page,locator)=>{
  await locator.scrollIntoViewIfNeeded();
  const point=await locator.evaluate(node=>{const rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:rect.width>0&&rect.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit))};});
  assert(point.visible&&point.enabled&&point.hitWithin,`user click target must be visible, enabled and unobstructed: ${JSON.stringify(point)}`);
  await page.mouse.click(point.x,point.y);
 };
 const startGuest=async page=>{await page.goto(origin,{waitUntil:'networkidle'});await clickUser(page,page.locator('#guest-play'));await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');};
 const travelTo=async(page,world)=>{
  if(await page.locator('#app-ui').getAttribute('data-world')===world)return;
  await clickUser(page,page.locator('.brand'));await clickUser(page,page.locator(`.world-link[data-world="${world}"]`));
  await page.waitForFunction(id=>document.querySelector('#app-ui')?.dataset.world===id,world);
  const overlay=page.locator('.world-sheet-scrim');if(await overlay.isVisible())await clickUser(page,overlay);
  // The world attribute is rendered after the synchronous experience.mount(state) call.
  // sceneReady is a startup gate and is not toggled during later world transitions.
 };
 const enterGift=async page=>{
  await travelTo(page,'past');await clickUser(page,page.locator('.hero-enter'));
  await clickUser(page,page.locator('.choice-list [data-action="invent-cell"]'));
  await clickUser(page,page.locator('.choice-list [data-action="gift"]'));
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
  const {context,page}=await makePage();let metaRequests=0,localRequests=0,postedBody;
  try{
   page.on('request',request=>{if(new URL(request.url()).pathname==='/api/character')metaRequests++;});
   await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();
   await page.locator('#vault-gate').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   const readVault=()=>page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1'));
   const initial=await readVault();assert(initial,'vault creation must persist an encrypted envelope');
   const envelope=JSON.parse(initial);assert.equal(envelope.cipher,'AES-256-GCM');assert.equal(envelope.kdf,'PBKDF2-SHA256');
   assert.doesNotMatch(initial,new RegExp(PASS));
   console.log('vault-cloud: encrypted vault created');
   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
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
   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
   assert.equal(await page.locator('#letter-text').inputValue(),PRIVATE_SENTINEL,'encrypted private letter must survive unlock');
   console.log('vault-cloud: lock/reload/unlock restored encrypted story and letter');
   await travelTo(page,'future');await clickUser(page,page.locator('.hero-enter'));
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
   await clickUser(page,page.locator('.hero-enter'));outcome=await page.locator('.story-panel').innerText();assert.match(outcome,/A city of open workshops/);
   console.log('vault-cloud: quota failure cleared session, prior ciphertext remained unlockable');

   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
   const callsBefore=metaRequests;
   await page.locator('#chat-question').fill('What changed in our possible future?');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').waitFor();assert.equal(metaRequests,callsBefore,'Meta disabled must produce zero API requests');
   console.log('vault-cloud: authored offline reply made zero Meta requests');
   await page.route('**/api/local-dialogue/health',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'device-only',ready:true})}));
   await page.route('**/api/local-dialogue',async route=>{localRequests++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify('In another possible future, a small choice changes how the city is shared.')});});
   await clickUser(page,page.locator('[data-cmd="local-ai-toggle"]'));
   await page.waitForFunction(()=>document.querySelector('.privacy-sigil')?.innerText.includes('ON-DEVICE MODEL'));
   assert.equal((await page.locator('.privacy-sigil').innerText()).trim(),'ON-DEVICE MODEL · LOCAL ONLY');
   await page.locator('#chat-question').fill('How might this city change?');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').nth(1).waitFor();assert.equal(localRequests,1);
   assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'ON-DEVICE AI · ENCRYPTED SAVE');
   await clickUser(page,page.locator('[data-cmd="local-ai-toggle"]'));
   console.log('vault-cloud: mocked on-device reply header says encrypted save; no remote request');
   await page.route('**/api/character',async route=>{
    postedBody=route.request().postDataJSON();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'The invention we shared supports a network of public workshops.',cue:'wonder',focus:'memory'})});
   });
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   assert.match(await page.locator('.privacy-sigil').innerText(),/META CLOUD/);
   assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'META CLOUD ENABLED · ENCRYPTED SAVE');
   await page.locator('#chat-question').fill('Tell me what became of the invention we shared.');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').nth(2).waitFor();assert.equal(metaRequests,1);
   assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'META CLOUD RESPONSE · ENCRYPTED SAVE','saved-vault reply header must name both its transport and encrypted persistence');
   assert.equal((await page.locator('.privacy-sigil').innerText()).trim(),'META CLOUD · TEXT LEAVES DEVICE');
   await page.waitForFunction(()=>document.querySelector('#world-canvas canvas')?.dataset.causalExhibit==='meta:memory:gift');
   assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-world'),'self');
   assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-branch'),'prime');
   console.log('vault-cloud: consented mocked Meta reply and allowlisted request validated');
   assert.deepEqual(Object.keys(postedBody).sort(),['cloudConsent','question','timeline','world']);
   assert.doesNotMatch(JSON.stringify(postedBody),new RegExp(`${PASS}|${PRIVATE_SENTINEL}`));
   await page.unroute('**/api/character');
   await page.route('**/api/character',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({error:'synthetic malformed reply'})}));
   const priorElders=await page.locator('#chat-history .chat-line.elder').count();
   await page.locator('#chat-question').fill('A malformed response must leave play available.');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').nth(priorElders).waitFor();
   await page.waitForFunction(()=>document.querySelector('#world-canvas canvas')?.dataset.causalExhibit==='authored:people:gift');
   assert.match(await page.locator('#toast-region').innerText(),/Meta unavailable\. Continuing with local dialogue/i);
   assert.equal(metaRequests,2,'request observer counts the malformed response attempt as well');
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-gate').waitFor({state:'visible'});
   await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();await page.locator('#vault-gate').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   assert.equal(await page.locator('.privacy-sigil').innerText(),'PRIVATE LOCAL WORLD','reload/unlock must reset cloud consent');
   assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit'),null,'reloading rebuilds the scene without a stale exhibit marker');

   // Hold a mocked response in flight and travel away. The transport should abort,
   // and the old reply must not enter either this session or a future reload.
   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   let delayedCalls=0;
   await page.unroute('**/api/character');
   await page.route('**/api/character',async route=>{delayedCalls++;await new Promise(resolve=>setTimeout(resolve,8000));try{await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'STALE MOCK MUST NEVER APPEAR',cue:'wonder',focus:'memory'})});}catch{}});
   const optOutRequest=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/character');
   const optOutFailure=page.waitForEvent('requestfailed',{predicate:request=>new URL(request.url()).pathname==='/api/character'});
   await page.locator('#chat-question').fill('Opt-out cancellation sentinel.');await page.locator('#chat-form button[type="submit"]').click();await optOutRequest;
   await page.locator('[data-cmd="cloud-toggle"]').click();const optOutError=await optOutFailure;
   assert(optOutError.failure()?.errorText,'opt-out must abort the in-flight model request');
   assert.equal(await page.locator('.privacy-sigil').innerText(),'PRIVATE LOCAL WORLD');
   assert.doesNotMatch(await page.locator('#chat-history').innerText(),/Opt-out cancellation sentinel|STALE MOCK MUST NEVER APPEAR/);
   assert.equal(delayedCalls,1);
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   const worldChangeRequest=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/character');
   const worldChangeFailure=page.waitForEvent('requestfailed',{predicate:request=>new URL(request.url()).pathname==='/api/character'});
   await page.locator('#chat-question').fill('World transition cancellation sentinel.');await page.locator('#chat-form button[type="submit"]').click();await worldChangeRequest;
   await travelTo(page,'future');const worldFailure=await worldChangeFailure;await delay(250);
   assert(worldFailure.failure()?.errorText,'world transition must abort the in-flight model request');
   assert.equal(delayedCalls,2);assert.equal(await page.locator('#app-ui').getAttribute('data-world'),'future');
   assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit'),null,'world travel disposes the old physical exhibit and its canvas metadata');
   assert.doesNotMatch(await page.locator('#app-ui').innerText(),/STALE MOCK MUST NEVER APPEAR|World transition cancellation sentinel/);
   // Restart while another response is pending; consent and stale work clear.
   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
   const resetRequest=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/character');
   const resetFailure=page.waitForEvent('requestfailed',{predicate:request=>new URL(request.url()).pathname==='/api/character'});
   await page.locator('#chat-question').fill('Reset cancellation sentinel.');await page.locator('#chat-form button[type="submit"]').click();await resetRequest;
   await page.locator('[data-cmd="journal"]').click();page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="reset"]').click();
   assert((await resetFailure).failure()?.errorText,'reset must abort the in-flight model request');
   assert.equal(await page.locator('.privacy-sigil').innerText(),'PRIVATE LOCAL WORLD');
   assert.doesNotMatch(await page.locator('#app-ui').innerText(),/STALE MOCK MUST NEVER APPEAR|Reset cancellation sentinel/);
   assert.equal(delayedCalls,3);
   // Lock while another response and the final encrypted save are pending.
   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   const lockRequest=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/character');
   const lockFailure=page.waitForEvent('requestfailed',{predicate:request=>new URL(request.url()).pathname==='/api/character'});
   await page.locator('#chat-question').fill('Lock transition cancellation sentinel.');await page.locator('#chat-form button[type="submit"]').click();await lockRequest;
   const beforeSlowLock=await readVault();
   await page.evaluate(()=>{
    const subtle=crypto.subtle,native=subtle.encrypt.bind(subtle);let start;
    window.__vaultEncryptStarted=new Promise(resolve=>{start=resolve;});
    Object.defineProperty(subtle,'encrypt',{configurable:true,value:(...args)=>{
     if(!window.__holdVaultEncrypt)return native(...args);
     window.__holdVaultEncrypt=false;start();
     return new Promise(resolve=>{window.__releaseVaultEncrypt=()=>native(...args).then(resolve);});
    }});
    window.__holdVaultEncrypt=true;
   });
   await page.locator('[data-cmd="lock"]').click();await page.evaluate(()=>window.__vaultEncryptStarted);
   await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.equal(await page.locator('#vault-gate').getAttribute('aria-busy'),'true');
   assert.equal(await page.locator('#app').evaluate(element=>element.inert),true,'private world must become inert before save settles');
   assert.equal(await page.locator('#app-ui').evaluate(element=>element.inert),true,'private controls must be inert before save settles');
   assert.equal(await page.locator('#vault-submit').isDisabled(),true,'gate actions stay disabled while the bounded save is pending');
   await page.waitForFunction(()=>document.querySelector('#vault-gate')?.getAttribute('aria-busy')==='false',{timeout:9000});
   assert.equal(await page.locator('#app-ui').innerText(),'','private UI must be removed when lock cleanup finishes');
   assert.match(await page.locator('#vault-notice').innerText(),/latest changes could not be confirmed as saved/i,'slow save must hit bounded-lock messaging');
   assert.equal(await readVault(),beforeSlowLock,'timed-out save must preserve last confirmed ciphertext');
   assert((await lockFailure).failure()?.errorText,'lock must abort the in-flight model request');
   assert.equal(delayedCalls,4);
   assert.equal(await page.locator('#vault-passphrase').inputValue(),'');
   await page.evaluate(()=>window.__releaseVaultEncrypt());
   await delay(100);
   assert.equal(await readVault(),beforeSlowLock,'late encryption after key revocation must not replace ciphertext');
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();await page.locator('#vault-gate').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   await clickUser(page,page.locator('.hero-enter'));
   assert.doesNotMatch(await page.locator('.story-panel').innerText(),/Opt-out cancellation sentinel|World transition cancellation sentinel|Reset cancellation sentinel|Lock transition cancellation sentinel|STALE MOCK MUST NEVER APPEAR/);
   await travelTo(page,'self');
   const returnOverlay=page.locator('.world-sheet-scrim');if(await returnOverlay.isVisible()){await page.keyboard.press('Escape');await returnOverlay.waitFor({state:'detached'});}
   await clickUser(page,page.locator('.hero-enter'));
   const beforeEraseLetter=await readVault();await page.locator('#letter-text').fill(ERASE_SENTINEL);await page.locator('#letter-form button[type="submit"]').click();
   await page.waitForFunction(old=>localStorage.getItem('syrava.elsewhere.private-v1')!==old,beforeEraseLetter);
   await page.locator('[data-cmd="journal"]').click();const erase=page.locator('[data-cmd="erase-vault"]');await erase.waitFor({state:'visible'});
   const beforeErase=await readVault();assert(beforeErase);
   page.once('dialog',dialog=>dialog.dismiss());await clickUser(page,erase);
   assert.equal(await readVault(),beforeErase,'cancelling vault erasure must preserve ciphertext');assert.equal(await page.locator('#vault-gate').isVisible(),false);
   await page.evaluate(()=>{
    const remove=Storage.prototype.removeItem;
    Storage.prototype.removeItem=function(key){if(key==='syrava.elsewhere.v1')throw new Error('synthetic legacy-storage denial');return remove.call(this,key);};
   });
   page.once('dialog',dialog=>dialog.accept());await clickUser(page,erase);
   await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.equal(await readVault(),beforeErase,'storage denial must leave the prior encrypted vault detectable');
   assert.match(await page.locator('#vault-notice').innerText(),/could not confirm all ELSEWHERE data was erased.*Some local data may remain/i);
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(PASS);await page.locator('#vault-submit').click();await page.locator('#vault-gate').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));assert.equal(await page.locator('#letter-text').inputValue(),ERASE_SENTINEL,'save after erase denial must still be unlockable');
   await page.locator('[data-cmd="journal"]').click();await page.locator('[data-cmd="erase-vault"]').waitFor({state:'visible'});
   const retryErase=page.locator('[data-cmd="erase-vault"]');
   page.once('dialog',dialog=>dialog.dismiss());await clickUser(page,retryErase);
   assert.equal(await readVault(),beforeErase,'cancel after storage recovery must preserve ciphertext');
   page.once('dialog',dialog=>dialog.accept());await clickUser(page,retryErase);
   await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.equal(await readVault(),null,'confirmed erasure removes this browser vault');
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.v1')),null,'confirmed erasure removes legacy plaintext too');
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.letter-consent')),null,'confirmed erasure removes legacy consent state');
   assert.equal(await page.locator('#vault-title').innerText(),'ENTER YOUR POSSIBLE WORLDS');
   assert.match(await page.locator('#vault-notice').innerText(),/timeline was erased.*Exported backup files are not deleted/i);
   await page.reload({waitUntil:'networkidle'});await page.locator('#vault-gate').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'reload must not restore the erased local vault');
   console.log(JSON.stringify({result:'PASS',scenario:'AES-GCM create/save/lock/reload/unlock; no plaintext sentinel/passphrase; quota failure preservation; zero offline calls; mocked valid/malformed replies; request cancellation on opt-out/reset/world/lock; consent resets; erase confirmation preserves on cancel and removes only this browser save on confirm',mockApiCalls:metaRequests}));
  }finally{try{await Promise.race([page.goto(origin,{waitUntil:'domcontentloaded'}),delay(5000)]);}catch{}await Promise.race([context.close(),delay(5000)]);}
 }

 if(selected.includes('guest-reset')){
  const {context,page}=await makePage();const cdp=await context.newCDPSession(page);let calls=0,localCalls=0,releaseLocalReply;const localReplyGate=new Promise(resolve=>releaseLocalReply=resolve);page.on('request',request=>{if(new URL(request.url()).pathname==='/api/character')calls++;});
  const axFor=async selector=>{const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});assert(nodeId,`accessibility tree target exists: ${selector}`);const result=await cdp.send('Accessibility.getPartialAXTree',{nodeId,fetchRelatives:false});return result.nodes[0];};
  try{
   await startGuest(page);await travelTo(page,'self');await clickUser(page,page.locator('.hero-enter'));
   await page.route('**/api/local-dialogue/health',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'device-only',ready:true})}));
   await page.route('**/api/local-dialogue',async route=>{localCalls++;await localReplyGate;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify('The city remains an imagined possibility; no invention choice has been made yet.')});});
   await page.locator('[data-cmd="local-ai-toggle"]').click();
   await page.waitForFunction(()=>document.querySelector('.privacy-sigil')?.innerText.includes('ON-DEVICE MODEL'));
   assert.equal((await page.locator('.server-status').innerText()).trim(),'ON-DEVICE AI · GUEST · NOT SAVED','world header reflects the selected on-device dialogue mode');
   assert.equal((await page.locator('.privacy-sigil').innerText()).trim(),'GUEST · NOT SAVED · ON-DEVICE MODEL');
   assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'ON-DEVICE AI · GUEST · NOT SAVED');
   await page.locator('#chat-question').fill('What might this city become?');await page.locator('#chat-question').press('Enter');
   await page.waitForFunction(()=>document.querySelector('#chat-form')?.getAttribute('aria-busy')==='true');
   assert.equal(await page.locator('#chat-form button[type="submit"]').isDisabled(),true,'submitting dialogue disables duplicate sends while the form is busy');
   const formAX=await axFor('#chat-form'),busyAX=formAX.properties.find(property=>property.name==='busy');
   assert([true,1].includes(busyAX?.value?.value),`Chromium accessibility tree exposes busy form state: ${JSON.stringify(busyAX)}`);
   await page.locator('#chat-question').fill('Keep this follow-up draft while the reply is pending.');releaseLocalReply();
   await page.locator('#chat-history .chat-line.elder').waitFor();
   await page.waitForFunction(()=>document.activeElement?.id==='chat-question');
   assert.equal(await page.locator('#chat-question').evaluate(input=>input.matches(':focus-visible')),true,'keyboard submission returns focus with a visible keyboard focus indicator');
   assert.equal(await page.locator('[data-chat-status]').getAttribute('aria-live'),'polite');
   const statusAX=await axFor('[data-chat-status]'),liveAX=statusAX.properties.find(property=>property.name==='live');
   assert.equal(statusAX.role.value,'status');assert.equal(liveAX?.value?.value,'polite','Chromium accessibility tree exposes polite live status');
   assert.equal(await page.locator('#chat-form').getAttribute('aria-busy'),null,'the busy state clears when the reply completes');
   assert.equal(await page.locator('#chat-question').inputValue(),'Keep this follow-up draft while the reply is pending.','typing a follow-up while the model responds survives the dialogue rerender');
   assert.equal(localCalls,1);assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'ON-DEVICE AI · GUEST · NOT SAVED');
   let guestErasePrompt='';page.once('dialog',async dialog=>{guestErasePrompt=dialog.message();await dialog.accept();});
   await clickUser(page,page.locator('[data-cmd="forget-conversation"]'));
   assert.match(guestErasePrompt,/unsaved guest session/i);
   assert.match(await page.locator('.toast').filter({hasText:/erased from this unsaved guest session/i}).innerText(),/erased from this unsaved guest session/i);
   await page.locator('[data-cmd="local-ai-toggle"]').click();
   await page.route('**/api/character',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'This world has no chosen outcome so far; you can still decide what the discovery means.',cue:'quiet',focus:'people'})}));
   page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="cloud-toggle"]').click();
   assert.equal((await page.locator('.privacy-sigil').innerText()).trim(),'GUEST · NOT SAVED · META TEXT LEAVES DEVICE');
   assert.equal((await page.locator('.server-status').innerText()).trim(),'META CLOUD ENABLED · GUEST · NOT SAVED','world header updates when cloud consent changes');
   assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'META CLOUD ENABLED · GUEST · NOT SAVED');
   await page.locator('#chat-question').fill('What might happen in this possible city?');await page.locator('#chat-form button[type="submit"]').click();
   await page.locator('#chat-history .chat-line.elder').waitFor();
   assert.equal((await page.locator('.chat-header').innerText()).split('\n').at(-1),'META CLOUD RESPONSE · GUEST · NOT SAVED');
   assert.equal((await page.locator('.server-status').innerText()).trim(),'META CLOUD RESPONSE · GUEST · NOT SAVED','world header stays synchronized with the completed model response');
   assert.equal(calls,1,'the mock route, not a live provider, receives the consented synthetic guest question');
   await page.locator('[data-cmd="journal"]').click();page.once('dialog',dialog=>dialog.accept());await page.locator('[data-cmd="reset"]').click();
   assert.match(await page.locator('.privacy-sigil').innerText(),/GUEST · NOT SAVED/);
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null);
   assert.doesNotMatch(await page.locator('body').innerText(),/META CLOUD · TEXT LEAVES DEVICE/);
   console.log(JSON.stringify({result:'PASS',scenario:'guest offline, mocked on-device, delayed-reply draft preservation, synchronized world/chat mode labels, mocked Meta and reset privacy behavior',localModelMocks:localCalls,metaMocks:calls}));
  }finally{releaseLocalReply();try{await Promise.race([page.goto(origin,{waitUntil:'domcontentloaded'}),delay(5000)]);}catch{}await Promise.race([context.close(),delay(5000)]);}
 }
 assert.deepEqual(errors,[],'browser page or console errors');assert.deepEqual(httpErrors,[],'HTTP errors');assert.deepEqual(external,[],'off-origin requests');
}finally{
 if(browser)await Promise.race([browser.close(),delay(4000)]);
 if(browserServer){const child=browserServer.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
 vite.kill('SIGTERM');await Promise.all([rm(chromiumConfig,{recursive:true,force:true}),rm(chromiumCache,{recursive:true,force:true})]);
}
