import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {copyFile, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_BACKUP_PORT||5184),origin=`http://127.0.0.1:${port}`;
const vaultKey='syrava.elsewhere.private-v1',passA='Synthetic backup origin passphrase 41',passB='Synthetic backup target passphrase 52',sentinel='SYNTHETIC_BACKUP_LETTER_SENTINEL';
const temp=await mkdtemp(join(tmpdir(),'elsewhere-backup-e2e-')),validFile=join(temp,'portable.vault.json'),malformedFile=join(temp,'malformed.json');
await writeFile(malformedFile,'{"not":"an encrypted ELSEWHERE vault"}',{mode:0o600});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-backup-config-')),cache=await mkdtemp(join(tmpdir(),'elsewhere-backup-cache-'));
let browser;
const clickUser=async(page,locator)=>{
 await locator.scrollIntoViewIfNeeded();
 const point=await locator.evaluate(node=>{const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:r.width>0&&r.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit))};});
 assert(point.visible&&point.enabled&&point.hitWithin,`click must reach a visible control: ${JSON.stringify(point)}`);
 await page.mouse.click(point.x,point.y);
};
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not start');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||config,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||cache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const contextA=await browser.newContext({viewport:{width:900,height:650}}),pageA=await contextA.newPage();await pageA.emulateMedia({reducedMotion:'reduce'});pageA.setDefaultTimeout(20000);
 const errors=[],httpErrors=[],external=[];
 const observe=page=>{
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
 };
 observe(pageA);
 const createVault=async(page,pass)=>{
  await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#vault-passphrase').fill(pass);await clickUser(page,page.locator('#vault-submit'));
  try{await page.locator('#vault-gate').waitFor({state:'hidden'});}catch(error){const status=await page.locator('#vault-notice').innerText();throw new Error(`vault setup did not finish: ${status}`,{cause:error});}
  await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
 };
 const travelSelf=async page=>{
  if(await page.locator('#app-ui').getAttribute('data-world')!=='self'){
   await clickUser(page,page.locator('.brand'));await clickUser(page,page.locator('.world-link[data-world="self"]'));
   await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self');
  }
  const hero=page.locator('.hero-enter');if(await hero.isVisible())await clickUser(page,hero);
 };
 const openTimeline=async page=>{
  const button=page.locator('[data-cmd="journal"]');if(await button.count())await clickUser(page,button);
  await page.locator('#journal-title').waitFor({state:'visible'});
 };
 const closeTimeline=async page=>{
  const close=page.locator('.modal .icon-btn[data-cmd="close"]');if(await close.isVisible())await clickUser(page,close);
  await page.locator('#journal-title').waitFor({state:'detached'});
 };
 await createVault(pageA,passA);await travelSelf(pageA);
 const beforeLetter=await pageA.evaluate(key=>localStorage.getItem(key),vaultKey);
 await pageA.locator('#letter-text').fill(sentinel);await clickUser(pageA,pageA.locator('#letter-form button[type="submit"]'));
 await pageA.waitForFunction(([key,old])=>localStorage.getItem(key)!==old,[vaultKey,beforeLetter]);
 await openTimeline(pageA);
 const downloadPromise=pageA.waitForEvent('download');await clickUser(pageA,pageA.locator('[data-cmd="export"]'));
 const download=await downloadPromise;assert.match(download.suggestedFilename(),/^elsewhere-private-.*\.vault\.json$/);
 await download.saveAs(validFile);
 const encrypted=await readFile(validFile,'utf8'),envelope=JSON.parse(encrypted);
 assert.equal(envelope.cipher,'AES-256-GCM');assert.equal(envelope.kdf,'PBKDF2-SHA256');
 assert.doesNotMatch(encrypted,new RegExp(`${passA}|${sentinel}`),'download must contain encrypted bytes only');
 console.log(JSON.stringify({result:'PASS',stage:'real encrypted vault download',filename:download.suggestedFilename(),bytes:Buffer.byteLength(encrypted),cipher:envelope.cipher}));
 await contextA.close(); // release its software-WebGL loop before opening the restore browser

 const contextB=await browser.newContext({viewport:{width:900,height:650}}),pageB=await contextB.newPage();await pageB.emulateMedia({reducedMotion:'reduce'});pageB.setDefaultTimeout(20000);observe(pageB);
 await createVault(pageB,passB);await openTimeline(pageB);
 const readCurrent=()=>pageB.evaluate(key=>localStorage.getItem(key),vaultKey);
 const before=await readCurrent();assert(before);
 const importFile=async(path,pass,acceptReplacement)=>{
  const handled=[];
  let resolveDone;const done=new Promise(resolve=>{resolveDone=resolve;});
  const listener=async dialog=>{
   handled.push(dialog.type());
   if(dialog.type()==='prompt')await dialog.accept(pass);
   else if(dialog.type()==='confirm'){if(acceptReplacement)await dialog.accept();else await dialog.dismiss();}
   else await dialog.dismiss();
   if(handled.length===2)resolveDone();
  };
  pageB.on('dialog',listener);
  const chooserPromise=pageB.waitForEvent('filechooser');await clickUser(pageB,pageB.locator('[data-cmd="import"]'));
  const chooser=await chooserPromise;await chooser.setFiles(path);
  await Promise.race([done,delay(8000).then(()=>{throw new Error(`file restore dialogs stalled: ${handled.join(',')}`);})]);
  pageB.off('dialog',listener);return handled;
 };
 const cancelDialogs=await importFile(validFile,passA,false);
 assert.deepEqual(cancelDialogs,['prompt','confirm']);assert.equal(await readCurrent(),before,'canceling replacement must keep the current vault intact');
 assert.equal(await pageB.locator('#app-ui').getAttribute('data-world'),'future');
 console.log('PASS file-picker replacement cancellation preserved current vault and game state');
 const malformedDialogs=await importFile(malformedFile,passB,true);
 assert.deepEqual(malformedDialogs,['prompt','confirm']);
 await pageB.waitForFunction(()=>Boolean(document.querySelector('#toast-region')?.textContent.trim()));
 assert.equal(await readCurrent(),before,'malformed import must not replace the current ciphertext');
 assert.equal(await pageB.locator('#app-ui').getAttribute('data-world'),'future');
 console.log('PASS malformed selected file rejected without replacing current vault');
 const restoreDialogs=await importFile(validFile,passA,true);
 assert.deepEqual(restoreDialogs,['prompt','confirm']);
 await pageB.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self');
 await pageB.waitForFunction(([key,old])=>localStorage.getItem(key)!==old,[vaultKey,before],{timeout:20000});
 await closeTimeline(pageB);
 await travelSelf(pageB);
 assert.equal(await pageB.locator('#letter-text').inputValue(),sentinel,'file-picker restore should recover encrypted private story data');
 await pageB.reload({waitUntil:'networkidle'});await pageB.locator('#vault-gate').waitFor({state:'visible'});
 await pageB.locator('#vault-passphrase').fill(passA);await clickUser(pageB,pageB.locator('#vault-submit'));
 await pageB.locator('#vault-gate').waitFor({state:'hidden'});await pageB.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
 await travelSelf(pageB);assert.equal(await pageB.locator('#letter-text').inputValue(),sentinel,'restored file must remain locked by its original passphrase after reload');
 assert.deepEqual(errors,[],'no browser exceptions or console errors');assert.deepEqual(httpErrors,[],'all same-origin requests succeed');assert.deepEqual(external,[],'no off-origin requests');
 console.log(JSON.stringify({result:'PASS',scenario:'download AES-GCM backup, select file, cancel replacement, reject malformed file without mutation, restore into another vault, reload/unlock with source passphrase',errors,httpErrors,external}));
 await contextB.close();
}finally{
 await browser?.close().catch(()=>{});vite.kill('SIGTERM');await Promise.race([new Promise(resolve=>vite.once('exit',resolve)),delay(3000)]);
 await Promise.all([rm(config,{recursive:true,force:true}),rm(cache,{recursive:true,force:true}),rm(temp,{recursive:true,force:true})]);
}
