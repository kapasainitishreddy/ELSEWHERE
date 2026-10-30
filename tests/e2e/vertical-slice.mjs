import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url);
const port=Number(process.env.ELSEWHERE_E2E_PORT||5174);
const origin=`http://127.0.0.1:${port}`;
const desktopViewport={width:Number(process.env.ELSEWHERE_E2E_WIDTH||1440),height:Number(process.env.ELSEWHERE_E2E_HEIGHT||900)};
assert(Number.isInteger(desktopViewport.width)&&desktopViewport.width>=800,'ELSEWHERE_E2E_WIDTH must be an integer of at least 800');
assert(Number.isInteger(desktopViewport.height)&&desktopViewport.height>=600,'ELSEWHERE_E2E_HEIGHT must be an integer of at least 600');
const artifactDir=new URL('../../review-output/e2e/',import.meta.url);
await mkdir(artifactDir,{recursive:true});
const checkpoint=(label,detail='')=>console.log(`[vertical-slice] ${label}${detail?` — ${detail}`:''}`);
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{
  cwd:root,stdio:'ignore',env:process.env
});
let browser;
let browserServer;
const chromiumConfig=await mkdtemp(join(tmpdir(),'elsewhere-chromium-config-'));
const chromiumCache=await mkdtemp(join(tmpdir(),'elsewhere-chromium-cache-'));
try {
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
    if(vite.exitCode!==null)throw new Error(`Vite exited before readiness (${vite.exitCode})`);
    try {const response=await fetch(origin);if(response.ok){ready=true;break;}}catch{}
    await delay(250);
  }
  assert(ready,'Vite did not become ready on the E2E port');
  const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||
    (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  const launchOptions={executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||chromiumConfig,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||chromiumCache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']};
  browserServer=await chromium.launchServer(launchOptions);browser=await chromium.connect(browserServer.wsEndpoint());
  const page=await browser.newPage({viewport:desktopViewport,deviceScaleFactor:1});
  await page.emulateMedia({reducedMotion:'reduce'});
  page.setDefaultTimeout(30000);
  const errors=[],badResponses=[],external=[],characterRequests=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)badResponses.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(new URL(request.url()).pathname==='/api/character')characterRequests.push(request.url());if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
  async function clickUser(locator,{scroll=true}={}){
    if(scroll)await locator.scrollIntoViewIfNeeded();
    const point=await locator.evaluate(node=>{const rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:rect.width>0&&rect.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit)),hit:hit?`${hit.tagName}.${typeof hit.className==='string'?hit.className:String(hit.className)}#${hit.id}`:null};});
    assert(point.visible&&point.enabled&&point.hitWithin,`the pointer must land on the visible enabled control: ${JSON.stringify(point)}`);
    await page.mouse.click(point.x,point.y);
  }
  async function waitForWorld(expected,phase){
    try{await page.waitForFunction(world=>document.querySelector('#app-ui')?.dataset.world===world,expected,{timeout:45000});}
    catch(error){
      const diagnostic=await page.evaluate(()=>({world:document.querySelector('#app-ui')?.dataset.world,sceneReady:document.querySelector('#app')?.dataset.sceneReady,journey:document.querySelector('.first-crossing')?.innerText,story:document.querySelector('.story-panel')?.innerText?.slice(0,300)})).catch(()=>({pageUnresponsive:true}));
      throw new Error(`${phase} did not reach ${expected}: ${JSON.stringify(diagnostic)}; pageErrors=${JSON.stringify(errors)}`,{cause:error});
    }
    checkpoint(phase,expected);
  }
  async function waitForExhibit(expected){
    try{await page.waitForFunction(value=>document.querySelector('#world-canvas canvas')?.dataset.causalExhibit===value,expected,{timeout:10000});}
    catch(error){
      const diagnostic=await page.evaluate(()=>({world:document.querySelector('#app-ui')?.dataset.world,sceneReady:document.querySelector('#app')?.dataset.sceneReady,canvases:[...document.querySelectorAll('#world-canvas canvas')].map(canvas=>({dataset:{...canvas.dataset},width:canvas.width,height:canvas.height})),status:document.querySelector('.chat-header')?.innerText,elder:document.querySelector('#chat-history .chat-line.elder')?.innerText,pageErrors:window.__elsewherePageErrors||[]})).catch(()=>({pageUnresponsive:true}));
      await Promise.race([page.screenshot({path:new URL('causal-exhibit-failure.png',artifactDir).pathname}),delay(3000)]);
      throw new Error(`causal exhibit ${expected} was not installed: ${JSON.stringify(diagnostic)}; pageErrors=${JSON.stringify(errors)}`,{cause:error});
    }
  }

  await page.goto(`${origin}/?perf=1`,{waitUntil:'domcontentloaded'});
  assert((await page.title()).includes('ELSEWHERE'));
  assert(await page.locator('#vault-gate').isVisible(),'first run should show the unsaved entry gate');
  assert.match(await page.locator('#vault-title').innerText(),/ENTER YOUR POSSIBLE WORLDS/,'entry title should welcome both demo and save paths');
  await page.setViewportSize({width:390,height:844});
  assert(await page.locator('#guest-play').isVisible(),'the unsaved demo should be immediately available on a phone viewport');
  assert(await page.locator('#vault-passphrase').isVisible(),'the encrypted save path should remain available on a phone viewport');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390,'the first-run gate should not force horizontal scrolling on mobile');
  await page.screenshot({path:new URL('entry-mobile.png',artifactDir).pathname});
  await page.setViewportSize(desktopViewport);
  await page.screenshot({path:new URL('gate.png',artifactDir).pathname});
  await clickUser(page.locator('#guest-play'));
  await page.locator('#vault-gate').waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:45000});
  assert.equal(await page.locator('#world-canvas canvas').count(),1,'guest scene should mount a WebGL canvas');
  assert.match(await page.locator('.privacy-sigil').innerText(),/GUEST · NOT SAVED/,'guest mode must be labeled honestly');
  assert.match(await page.locator('.first-crossing').innerText(),/1889.*2087/s,'the opening guide should explain the invention-to-future goal');
  assert.match(await page.locator('.first-crossing-controls').innerText(),/WASD.*arrows.*E to interact.*touch/i,'the opening guide should explain keyboard and touch controls');
  assert.equal(await page.locator('.first-crossing').evaluate(node=>getComputedStyle(node).backdropFilter),'none','the opaque opening guide should not incur backdrop blur');
  await page.waitForFunction(()=>/\d+ DRAWS/.test(document.querySelector('.world-perf-display')?.textContent||''));
  const firstSceneDraws=Number((await page.locator('.world-perf-display').innerText()).match(/(\d+) DRAWS/)?.[1]);
  assert(Number.isFinite(firstSceneDraws)&&firstSceneDraws<360,`initial 2087 scene should stay below 360 draw calls (saw ${firstSceneDraws})`);
  assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'guest progress must not be written to encrypted vault storage');
  await page.screenshot({path:new URL('guest-2087.png',artifactDir).pathname});
  checkpoint('guest scene ready',`2087 · ${firstSceneDraws} draws`);

  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  await waitForWorld('self','Meet possible future self');
  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  assert((await page.locator('body').innerText()).includes('CONTINUE THE CONVERSATION'));
  await page.locator('#chat-question').fill('What does an ordinary day look like in this possible future?');
  await clickUser(page.locator('#chat-form button[type="submit"]'));
  await page.locator('#chat-history .chat-line.elder').waitFor({state:'visible',timeout:30000});
  await waitForExhibit('authored:people:none');
  assert.match(await page.locator('.privacy-sigil').innerText(),/GUEST · NOT SAVED/,'guest offline dialogue must not claim an encrypted save');
  assert.match(await page.locator('.chat-note').innerText(),/authored dialogue, no network AI/i,'the offline fallback must be described honestly');
  checkpoint('first authored future-self reply displayed');
  await page.screenshot({path:new URL('future-self-dialogue.png',artifactDir).pathname});
  await clickUser(page.locator('.story-panel [data-cmd="story-toggle"]'),{scroll:false});

  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  await waitForWorld('past','Travel to 1889');
  assert((await page.locator('body').innerText()).includes('1889'));
  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  await clickUser(page.locator('[data-action="invent-cell"]'));
  const gift=page.locator('.choice-list [data-action="gift"]');
  await gift.scrollIntoViewIfNeeded();
  const giftBefore=await gift.evaluate(node=>{
    const rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,hit=document.elementFromPoint(x,y);
    const ancestors=[];for(let current=node;current&&ancestors.length<8;current=current.parentElement){const style=getComputedStyle(current);ancestors.push({tag:current.tagName,id:current.id,className:typeof current.className==='string'?current.className:'',overflowY:style.overflowY,pointerEvents:style.pointerEvents,position:style.position,zIndex:style.zIndex,transform:style.transform,scrollTop:current.scrollTop});}
    return {rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},centerHit:hit?{tag:hit.tagName,id:hit.id,className:typeof hit.className==='string'?hit.className:String(hit.className),action:hit.getAttribute('data-action')}:null,hitWithinGift:hit?.closest('[data-action="gift"]')===node,activeElement:{tag:document.activeElement?.tagName,id:document.activeElement?.id},world:document.querySelector('#app-ui')?.dataset.world,storyOpen:!document.querySelector('.story-panel')?.hasAttribute('inert'),scrollTop:document.querySelector('.story-panel')?.scrollTop,scrollHeight:document.querySelector('.story-panel')?.scrollHeight,clientHeight:document.querySelector('.story-panel')?.clientHeight,ancestors};
  });
  assert(giftBefore.hitWithinGift,'the visible center of the gift button must not be covered by another element');
  await page.evaluate(()=>{
    const target=document.querySelector('.choice-list [data-action="gift"]');
    const diagnostics={start:performance.now(),target,targetConnectedBefore:target?.isConnected,events:[],longTasks:[]};
    window.__giftActionDiagnostics=diagnostics;
    document.addEventListener('pointerdown',event=>{if(event.target.closest?.('[data-action="gift"]'))diagnostics.events.push({type:'pointerdown',at:performance.now()});},{capture:true,once:true});
    document.addEventListener('click',event=>{if(event.target.closest?.('[data-action="gift"]'))diagnostics.events.push({type:'click',at:performance.now()});},{capture:true,once:true});
    if('PerformanceObserver' in window)try{new PerformanceObserver(list=>diagnostics.longTasks.push(...list.getEntries().map(entry=>({start:entry.startTime,duration:entry.duration})))).observe({type:'longtask',buffered:true});}catch{}
  });
  const giftClickStartedAt=Date.now();checkpoint('attempting gift click',JSON.stringify(giftBefore));
  try{await page.mouse.click(giftBefore.rect.x+giftBefore.rect.width/2,giftBefore.rect.y+giftBefore.rect.height/2);}
  catch(error){
    const giftAfter=await page.evaluate(()=>({activeElement:{tag:document.activeElement?.tagName,id:document.activeElement?.id},world:document.querySelector('#app-ui')?.dataset.world,storyOpen:!document.querySelector('.story-panel')?.hasAttribute('inert'),storyText:document.querySelector('.story-panel')?.innerText?.slice(-500),choice:document.querySelector('.choice-list [data-action="gift"]')?.outerHTML,clickDiagnostics:window.__giftActionDiagnostics&&{probeStartedAt:window.__giftActionDiagnostics.start,targetConnectedBefore:window.__giftActionDiagnostics.targetConnectedBefore,targetConnectedAfter:window.__giftActionDiagnostics.target?.isConnected,events:window.__giftActionDiagnostics.events,longTasks:window.__giftActionDiagnostics.longTasks},scrollTop:document.querySelector('.story-panel')?.scrollTop,scrollHeight:document.querySelector('.story-panel')?.scrollHeight,clientHeight:document.querySelector('.story-panel')?.clientHeight})).catch(()=>({pageUnresponsive:true}));
    await Promise.race([page.screenshot({path:new URL('gift-click-failure-1440.png',artifactDir).pathname}),delay(3000)]);
    throw new Error(`gift pointer action failed at ${desktopViewport.width}x${desktopViewport.height} after ${Date.now()-giftClickStartedAt}ms; before=${JSON.stringify(giftBefore)}; after=${JSON.stringify(giftAfter)}; pageErrors=${JSON.stringify(errors)}`,{cause:error});
  }
  const giftAfter=await page.evaluate(()=>{const diagnostic=window.__giftActionDiagnostics,longTasks=diagnostic?.longTasks||[];return {targetConnected:diagnostic?.target?.isConnected,diagnostics:diagnostic&&{startedAt:diagnostic.start,events:diagnostic.events,longTaskCount:longTasks.length,maxLongTaskMs:Math.max(0,...longTasks.map(task=>task.duration)),longTasksOver1000ms:longTasks.filter(task=>task.duration>=1000)},storyText:document.querySelector('.story-panel')?.innerText?.slice(-500),choice:document.querySelector('.choice-list [data-action="gift"]')?.outerHTML};});
  assert(giftAfter.diagnostics?.events?.some(event=>event.type==='click'),'the pointer click must reach the gift control');
  assert.equal(giftAfter.targetConnected,false,'applying the fate should rerender the original choice button');
  assert.match((await page.locator('.story-panel').innerText()).toLowerCase(),/you chose to share the invention/i,'the selected gift must be visible in the live story panel');
  checkpoint('gift click completed',`${Date.now()-giftClickStartedAt}ms; ${JSON.stringify({before:giftBefore,after:giftAfter})}`);
  checkpoint('1889 invention and gift choice applied');
  await clickUser(page.locator('.story-panel [data-cmd="story-toggle"]'),{scroll:false});

  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  await waitForWorld('self','Return to the future-self world');
  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  await page.locator('#chat-question').fill('What changed in 2087 after we shared the invention?');
  await clickUser(page.locator('#chat-form button[type="submit"]'));
  await page.locator('#chat-history .chat-line.elder').nth(1).waitFor({state:'visible',timeout:30000});
  assert.match((await page.locator('#chat-history').innerText()).toLowerCase(),/public workshops/,'future-self must refer to the recorded gift fate');
  await waitForExhibit('authored:people:gift');
  await page.locator('#world-canvas canvas').screenshot({path:new URL('future-self-authored-exhibit-gift.png',artifactDir).pathname});
  await page.screenshot({path:new URL('future-self-remembers-gift.png',artifactDir).pathname});
  checkpoint('future self recalls public workshops after gift');
  await clickUser(page.locator('.story-panel [data-cmd="story-toggle"]'),{scroll:false});

  await clickUser(page.locator('[data-cmd="first-crossing"]'));
  await waitForWorld('future','Return to Neo Elysium after invention');
  assert((await page.locator('body').innerText()).includes('Neo Elysium'));
  await clickUser(page.locator('.hero-enter'));
  const outcome=await page.locator('.story-panel').innerText();
  assert.match(outcome,/city of open workshops/i,'2087 story should reflect the gift fate');
  assert.match(outcome,/Aether Cell/i,'2087 story should retain the selected invention');
  await page.screenshot({path:new URL('future-2087-gift.png',artifactDir).pathname});

  await page.keyboard.down('KeyW');await delay(350);await page.keyboard.up('KeyW');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('.world-first-play').isVisible(),false,'desktop movement hint must not cover mobile journey controls');
  await page.keyboard.press('Escape');
  await clickUser(page.locator('.first-crossing [data-cmd="journey-skip"]'));
  const mobileDpad=page.locator('.mobile-dpad [data-move="KeyW"]');
  await mobileDpad.waitFor({state:'visible'});
  await mobileDpad.hover();await page.mouse.down();await delay(350);await page.mouse.up();
  assert.deepEqual(errors,[],'desktop keyboard and mobile pointer controls should not raise browser errors');

  const mobile=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,overflowing:[...document.querySelectorAll('body *')].map(element=>({tag:element.tagName,id:element.id,classes:typeof element.className==='string'?element.className:'',right:Math.round(element.getBoundingClientRect().right)})).filter(element=>element.right>innerWidth+2).sort((a,b)=>b.right-a.right).slice(0,8)}));
  await page.screenshot({path:new URL('future-2087-mobile.png',artifactDir).pathname,fullPage:true});
  assert(mobile.document<=mobile.viewport+1,`mobile horizontal overflow: ${JSON.stringify(mobile)}`);
  for(const viewport of [{width:1280,height:720},{width:360,height:800}]){
    await page.setViewportSize(viewport);
    const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
    assert(width.document<=width.viewport+1,`${viewport.width}×${viewport.height} overflowed horizontally: ${JSON.stringify(width)}`);
    if(viewport.width===360)await page.screenshot({path:new URL('future-2087-360.png',artifactDir).pathname,fullPage:true});
  }
  await page.reload({waitUntil:'domcontentloaded'});
  assert(await page.locator('#vault-gate').isVisible(),'reloading a mutated guest story should return to the entry gate');
  assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'guest story mutations must remain absent from the vault after reload');
  assert.deepEqual(errors,[],'browser console or page errors were logged');
  assert.deepEqual(badResponses,[],'browser received an HTTP error response');
  assert.deepEqual(external,[],'the scene should stay same-origin');
  assert.deepEqual(characterRequests,[],'authored local journey must make zero Meta character requests');
  console.log(JSON.stringify({result:'PASS',browser:await browser.version(),viewport:`${desktopViewport.width}x${desktopViewport.height} desktop plus 390x844 mobile`,guestVaultUntouched:true,story:'guest → 2046 dialogue → 1889 Aether Cell gift → grounded future-self dialogue with authored 3D exhibit → 2087 public workshops',mobile,authoredExhibit:'people focus · gift fate · clearly labeled authored preview',characterRequests:characterRequests.length,consoleErrors:errors,badResponses,external,screenshots:artifactDir.pathname},null,2));
} finally {
  if(browser)await Promise.race([browser.close(),delay(4000)]);
  if(browserServer){const child=browserServer.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
  vite.kill('SIGTERM');
  await Promise.all([rm(chromiumConfig,{recursive:true,force:true}),rm(chromiumCache,{recursive:true,force:true})]);
}
