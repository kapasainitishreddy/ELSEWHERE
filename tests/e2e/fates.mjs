import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {FUTURE_PORTAL_Z} from '../../src/future-outcomes.js';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_FATE_PORT||5175),origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);await mkdir(artifacts,{recursive:true});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
let browser;
let browserServer;
const chromiumConfig=await mkdtemp(join(tmpdir(),'elsewhere-chromium-config-'));
const chromiumCache=await mkdtemp(join(tmpdir(),'elsewhere-chromium-cache-'));
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not become ready');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  const launchOptions={executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||chromiumConfig,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||chromiumCache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']};
  browserServer=await chromium.launchServer(launchOptions);browser=await chromium.connect(browserServer.wsEndpoint());
 const outcomes={gift:'A city of open workshops',patent:'A licensed skyline',auction:'A city of hidden owners'};
 const recall={gift:/public workshops/i,patent:/towers outside bear our name/i,auction:/monument to the invention we sold/i};
 const authoredFocus={gift:'people',patent:'infrastructure',auction:'memory'};
 const selected=(process.env.ELSEWHERE_FATES||Object.keys(outcomes).join(',')).split(',').filter(id=>Object.hasOwn(outcomes,id));
 for(const fate of selected){const headline=outcomes[fate];
  const context=await browser.newContext({viewport:{width:900,height:650},deviceScaleFactor:0.5});
  const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(25000);
  const pageErrors=[],httpErrors=[],external=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')pageErrors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
  const clickUser=async(locator,{scroll=true}={})=>{
   if(scroll)await locator.scrollIntoViewIfNeeded();
   const point=await locator.evaluate(node=>{
    const rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,hit=document.elementFromPoint(x,y);
    return {x,y,visible:rect.width>0&&rect.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit))};
   });
   assert(point.visible&&point.enabled&&point.hitWithin,`user click target must be visible, enabled and unobstructed: ${JSON.stringify(point)}`);
   await page.mouse.click(point.x,point.y);
  };
  const to=async world=>{
   if(await page.locator('#app-ui').getAttribute('data-world')===world)return;
   await clickUser(page.locator('.brand'),{scroll:false});
   await clickUser(page.locator(`.world-link[data-world="${world}"]`),{scroll:false});
   await page.waitForFunction(id=>document.querySelector('#app-ui')?.dataset.world===id,world);
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
  };
  const approachFuturePortal=async({x,world,label})=>{
   const cue=label.toUpperCase();
   const storyToggle=page.locator('.story-panel [data-cmd="story-toggle"]');
   if(await storyToggle.isVisible())await clickUser(storyToggle);
   const skip=page.locator('.first-crossing [data-cmd="journey-skip"]');if(await skip.isVisible())await clickUser(skip);
   console.log(`${fate}: walking to ${label} portal approach`);
   const lateral=x>0?'KeyD':'KeyA';
   await page.keyboard.down(lateral);
   try{
    await page.waitForFunction(target=>Math.abs(Number(document.querySelector('#world-canvas')?.dataset.playerX)-target)<.45,x,{timeout:60000});
   }finally{await page.keyboard.up(lateral);}
   await page.keyboard.down('KeyW');
   try{
    await page.waitForFunction(({name,targetZ})=>{
     const node=document.querySelector('.world-proximity-cue');
     const z=Number(document.querySelector('#world-canvas')?.dataset.playerZ);
     return z<=targetZ&&node?.classList.contains('visible')&&node.textContent.toUpperCase().includes(name);
    },{name:cue,targetZ:FUTURE_PORTAL_Z+2.6},{timeout:90000});
   }catch(error){
    const diagnostic=await page.evaluate(()=>({world:document.querySelector('#app-ui')?.dataset.world,
     position:{x:document.querySelector('#world-canvas')?.dataset.playerX,z:document.querySelector('#world-canvas')?.dataset.playerZ},
     cue:document.querySelector('.world-proximity-cue')?.textContent,visible:document.querySelector('.world-proximity-cue')?.className}));
    throw new Error(`could not reach ${label} portal: ${JSON.stringify(diagnostic)}`,{cause:error});
   }finally{await page.keyboard.up('KeyW');}
   await page.keyboard.press('KeyE');
   await page.waitForFunction(id=>document.querySelector('#app-ui')?.dataset.world===id,world,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   console.log(`${fate}: entered ${label} through the 3D portal`);
   await to('future');
  };
  try{
   await page.goto(`${origin}/?perf=1`,{waitUntil:'networkidle'});await clickUser(page.locator('#guest-play'));
   await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
   await page.waitForFunction(()=>/\d+ DRAWS/.test(document.querySelector('.world-perf-display')?.textContent||''));
   const baselineDraws=Number((await page.locator('.world-perf-display').innerText()).match(/(\d+) DRAWS/)?.[1]);
   console.log(`${fate}: guest ready`);
   await to('past');await clickUser(page.locator('.hero-enter'));
   console.log(`${fate}: entered 1889`);
   await clickUser(page.locator('.choice-list [data-action="invent-cell"]'));
   await clickUser(page.locator(`.choice-list [data-action="${fate}"]`));
   console.log(`${fate}: invention ownership chosen`);
   await to('future');await clickUser(page.locator('.hero-enter'));
   console.log(`${fate}: returned to 2087`);
   const causal=page.locator('.story-panel .future-box.small').filter({hasText:'CAUSAL WORLD STATUS'});
   await causal.waitFor({state:'visible'});
   const shown=await causal.innerText();assert.match(shown,new RegExp(headline));assert.match(shown,/Aether Cell/);
   await page.waitForFunction(base=>{
    const calls=Number((document.querySelector('.world-perf-display')?.textContent||'').match(/(\d+) DRAWS/)?.[1]);
    return Number.isFinite(calls)&&calls>base;
   },baselineDraws,{timeout:15000});
   const outcomeDraws=Number((await page.locator('.world-perf-display').innerText()).match(/(\d+) DRAWS/)?.[1]);
   assert(outcomeDraws>baselineDraws,`${fate} should add a rendered 2087 landmark (${baselineDraws} → ${outcomeDraws} draws)`);
   await causal.scrollIntoViewIfNeeded();
   await causal.screenshot({path:new URL(`fate-${fate}.png`,artifacts).pathname});
   await clickUser(page.locator('.story-panel [data-cmd="story-toggle"]'));
   const skip=page.locator('.first-crossing [data-cmd="journey-skip"]');if(await skip.isVisible())await clickUser(skip);
   await page.locator('#world-canvas canvas').screenshot({path:new URL(`fate-${fate}-scene.png`,artifacts).pathname});
   if(fate==='patent')await approachFuturePortal({x:8.55,world:'mech',label:'Titan Foundry'});
   if(fate==='auction')await approachFuturePortal({x:-8.55,world:'self',label:'The Other You'});
   await to('self');await clickUser(page.locator('.hero-enter'));
   await page.locator('#chat-question').fill('Tell me about the invention we chose.');
   await clickUser(page.locator('#chat-form button[type="submit"]'));
   await page.locator('#chat-history .chat-line.elder').waitFor();
   const dialogue=await page.locator('#chat-history .chat-line.elder').last().innerText();assert.match(dialogue,recall[fate]);
   const expectedExhibit=`authored:${authoredFocus[fate]}:${fate}`;
   await page.waitForFunction(value=>document.querySelector('#world-canvas canvas')?.dataset.causalExhibit===value,expectedExhibit);
   const exhibitIdentity=await page.locator('#world-canvas canvas').evaluate(canvas=>({world:canvas.dataset.causalExhibitWorld,branch:canvas.dataset.causalExhibitBranch,draws:Number((document.querySelector('.world-perf-display')?.textContent||'').match(/(\d+) DRAWS/)?.[1])}));
   assert.equal(exhibitIdentity.world,'self');assert.equal(exhibitIdentity.branch,'prime');
   assert(exhibitIdentity.draws>0,'the canvas must report rendered scene draws, not only a metadata marker');
   const storyClose=page.locator('.story-panel .sheet-inline-close');
   if(await storyClose.isVisible())await clickUser(storyClose);
   await page.waitForFunction(()=>document.querySelector('.story-panel')?.hasAttribute('inert'));
   await page.screenshot({path:new URL(`fate-${fate}-authored-exhibit.png`,artifacts).pathname});
   if(fate==='gift'){
    const sameWorldBaseline=exhibitIdentity.draws;
    await to('future');
    await page.waitForFunction(()=>!document.querySelector('#world-canvas canvas')?.dataset.causalExhibit);
    assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-world'),null);
    await to('self');
    assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit'),null,'returning to the same world cannot retain the disposed exhibit marker');
    await clickUser(page.locator('.hero-enter'));
    const eldersBefore=await page.locator('#chat-history .chat-line.elder').count();
    await page.locator('#chat-question').fill('After returning, what did our gift change?');await clickUser(page.locator('#chat-form button[type="submit"]'));
    await page.waitForFunction(count=>document.querySelectorAll('#chat-history .chat-line.elder').length>count,eldersBefore);
    await page.waitForFunction(value=>document.querySelector('#world-canvas canvas')?.dataset.causalExhibit===value,expectedExhibit);
    await page.waitForFunction(base=>Number((document.querySelector('.world-perf-display')?.textContent||'').match(/(\d+) DRAWS/)?.[1])>base,sameWorldBaseline);
    assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-world'),'self');
    assert.equal(await page.locator('#world-canvas canvas').getAttribute('data-causal-exhibit-branch'),'prime');
    await page.screenshot({path:new URL('fate-gift-authored-exhibit-after-transition.png',artifacts).pathname});
   }
   assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'fate demo must remain an unsaved guest run');
   assert.deepEqual(pageErrors,[]);assert.deepEqual(httpErrors,[]);assert.deepEqual(external,[]);
   console.log(JSON.stringify({result:'PASS',fate,visualOutcome:headline,sceneDraws:{before:baselineDraws,after:outcomeDraws},groundedDialogue:dialogue.replace(/\s+/g,' ').slice(0,180),authoredExhibit:expectedExhibit,guestVaultUntouched:true,errors:pageErrors,httpErrors,external}));
  }catch(error){try{await page.screenshot({path:`/tmp/elsewhere-fate-${fate}-failure.png`});}catch{}throw error;}finally{
   try{await Promise.race([page.goto(origin,{waitUntil:'domcontentloaded'}),delay(5000)]);}catch{}
   await Promise.race([context.close(),delay(5000)]);
  }
 }
}finally{
 if(browser)await Promise.race([browser.close(),delay(4000)]);
 if(browserServer){const child=browserServer.process();if(child?.exitCode===null){child.kill('SIGKILL');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(1000)]);}}
 vite.kill('SIGTERM');await Promise.all([rm(chromiumConfig,{recursive:true,force:true}),rm(chromiumCache,{recursive:true,force:true})]);
}
