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
  const errors=[],badResponses=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)badResponses.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
  async function waitForWorld(expected,phase){
    try{await page.waitForFunction(world=>document.querySelector('#app-ui')?.dataset.world===world,expected,{timeout:45000});}
    catch(error){
      const diagnostic=await page.evaluate(()=>({world:document.querySelector('#app-ui')?.dataset.world,sceneReady:document.querySelector('#app')?.dataset.sceneReady,journey:document.querySelector('.first-crossing')?.innerText,story:document.querySelector('.story-panel')?.innerText?.slice(0,300)})).catch(()=>({pageUnresponsive:true}));
      throw new Error(`${phase} did not reach ${expected}: ${JSON.stringify(diagnostic)}; pageErrors=${JSON.stringify(errors)}`,{cause:error});
    }
    checkpoint(phase,expected);
  }

  await page.goto(`${origin}/?perf=1`,{waitUntil:'networkidle'});
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
  await page.locator('#guest-play').click();
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

  await page.locator('[data-cmd="first-crossing"]').click();
  await waitForWorld('self','Meet possible future self');
  await page.locator('[data-cmd="first-crossing"]').click();
  assert((await page.locator('body').innerText()).includes('CONTINUE THE CONVERSATION'));
  await page.locator('#chat-question').fill('What does an ordinary day look like in this possible future?');
  await page.locator('#chat-form button[type="submit"]').click();
  await page.locator('#chat-history .chat-line.elder').waitFor({state:'visible',timeout:30000});
  checkpoint('first authored future-self reply displayed');
  await page.screenshot({path:new URL('future-self-dialogue.png',artifactDir).pathname});
  await page.locator('.story-panel [data-cmd="story-toggle"]').click();

  await page.locator('[data-cmd="first-crossing"]').click();
  await waitForWorld('past','Travel to 1889');
  assert((await page.locator('body').innerText()).includes('1889'));
  await page.locator('[data-cmd="first-crossing"]').click();
  await page.locator('[data-action="invent-cell"]').click();
  await page.locator('.choice-list [data-action="gift"]').click();
  assert.match((await page.locator('.story-panel').innerText()).toLowerCase(),/you chose to share the invention/i,'the selected gift must be visible in the live story panel');
  checkpoint('1889 invention and gift choice applied');
  await page.locator('.story-panel [data-cmd="story-toggle"]').click();

  await page.locator('[data-cmd="first-crossing"]').click();
  await waitForWorld('self','Return to the future-self world');
  await page.locator('[data-cmd="first-crossing"]').click();
  await page.locator('#chat-question').fill('What changed in 2087 after we shared the invention?');
  await page.locator('#chat-form button[type="submit"]').click();
  await page.locator('#chat-history .chat-line.elder').nth(1).waitFor({state:'visible',timeout:30000});
  assert.match((await page.locator('#chat-history').innerText()).toLowerCase(),/public workshops/,'future-self must refer to the recorded gift fate');
  await page.screenshot({path:new URL('future-self-remembers-gift.png',artifactDir).pathname});
  checkpoint('future self recalls public workshops after gift');
  await page.locator('.story-panel [data-cmd="story-toggle"]').click();

  await page.locator('[data-cmd="first-crossing"]').click();
  await waitForWorld('future','Return to Neo Elysium after invention');
  assert((await page.locator('body').innerText()).includes('Neo Elysium'));
  await page.locator('.hero-enter').click();
  const outcome=await page.locator('.story-panel').innerText();
  assert.match(outcome,/city of open workshops/i,'2087 story should reflect the gift fate');
  assert.match(outcome,/Aether Cell/i,'2087 story should retain the selected invention');
  await page.screenshot({path:new URL('future-2087-gift.png',artifactDir).pathname});

  await page.keyboard.down('KeyW');await delay(350);await page.keyboard.up('KeyW');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('.world-first-play').isVisible(),false,'desktop movement hint must not cover mobile journey controls');
  await page.keyboard.press('Escape');
  await page.locator('.first-crossing [data-cmd="journey-skip"]').click();
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
  await page.reload({waitUntil:'networkidle'});
  assert(await page.locator('#vault-gate').isVisible(),'reloading a mutated guest story should return to the entry gate');
  assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'guest story mutations must remain absent from the vault after reload');
  assert.deepEqual(errors,[],'browser console or page errors were logged');
  assert.deepEqual(badResponses,[],'browser received an HTTP error response');
  assert.deepEqual(external,[],'the scene should stay same-origin');
  console.log(JSON.stringify({result:'PASS',browser:await browser.version(),viewport:`${desktopViewport.width}x${desktopViewport.height} desktop plus 390x844 mobile`,guestVaultUntouched:true,story:'guest → 2046 dialogue → 1889 Aether Cell gift → grounded future-self dialogue → 2087 public workshops',mobile,consoleErrors:errors,badResponses,screenshots:artifactDir.pathname},null,2));
} finally {
  if(browser)await Promise.race([browser.close(),delay(4000)]);
  if(browserServer){const child=browserServer.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
  vite.kill('SIGTERM');
  await Promise.all([rm(chromiumConfig,{recursive:true,force:true}),rm(chromiumCache,{recursive:true,force:true})]);
}
