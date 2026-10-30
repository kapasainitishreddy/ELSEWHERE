import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_COMBAT_PORT||5183),origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);await mkdir(artifacts,{recursive:true});
const onlyCombat=process.env.ELSEWHERE_COMBAT_ONLY||'';
assert(['','warden','mech'].includes(onlyCombat),'ELSEWHERE_COMBAT_ONLY must be warden or mech');
const layoutOnly=process.env.ELSEWHERE_COMBAT_LAYOUT_ONLY==='1';
assert(!layoutOnly||onlyCombat==='','layout-only mode cannot be combined with ELSEWHERE_COMBAT_ONLY');
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-combat-config-')),cache=await mkdtemp(join(tmpdir(),'elsewhere-combat-cache-'));
let browser;
const clickUser=async(page,locator,{scroll=true}={})=>{
 if(scroll)await locator.scrollIntoViewIfNeeded();
 const point=await locator.evaluate(node=>{const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:r.width>0&&r.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit)),hit:hit?`${hit.tagName}.${typeof hit.className==='string'?hit.className:String(hit.className)}#${hit.id}`:null};});
 assert(point.visible&&point.enabled&&point.hitWithin,`user click must hit a visible control: ${JSON.stringify(point)}`);
 await page.mouse.click(point.x,point.y);
};
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not start');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||config,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||cache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1000,height:720},deviceScaleFactor:.5}),page=await context.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(20000);
 const pageErrors=[],httpErrors=[],external=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')pageErrors.push(message.text());});
 page.on('response',response=>{if(response.status()>=400)httpErrors.push(`${response.status()} ${response.url()}`);});
 page.on('request',request=>{if(!request.url().startsWith(`${origin}/`))external.push(request.url());});
 const startGuest=async()=>{await page.goto(origin,{waitUntil:'networkidle'});await clickUser(page,page.locator('#guest-play'));await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');};
 const travelTo=async world=>{
  if(await page.locator('#app-ui').getAttribute('data-world')===world)return;
  await clickUser(page,page.locator('.brand'));await clickUser(page,page.locator(`.world-link[data-world="${world}"]`));
  await page.waitForFunction(id=>document.querySelector('#app-ui')?.dataset.world===id,world);
 };
 const enter=async()=>{const target=page.locator('.hero-enter');if(await target.isVisible())await clickUser(page,target);};
 const choose=async id=>{const target=page.locator(`.choice-list [data-action="${id}"]`);await target.evaluate(node=>{const panel=node.closest('.story-panel');if(!panel)return;const row=node.getBoundingClientRect(),sheet=panel.getBoundingClientRect(),clearance=Math.max(90,(panel.clientHeight-row.height)/2);panel.scrollTop=Math.max(0,panel.scrollTop+row.top-sheet.top-clearance);});await clickUser(page,target,{scroll:false});};
 const combatButton=async id=>clickUser(page,page.locator(`.quick-combat [data-action="${id}"]`));
 const readPanel=()=>page.locator('.story-panel').innerText();
 const inspectCombatLayout=async label=>{
  assert.equal(await page.locator('#app-ui').getAttribute('data-story-open'),'false','combat should start with its long story sheet collapsed');
  await page.locator('.combat-action-dock').waitFor({state:'visible'});
  const desktop=await page.evaluate(()=>{
   const rect=s=>{const n=document.querySelector(s),r=n?.getBoundingClientRect();return n&&r?{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,visible:getComputedStyle(n).display!=='none'&&r.width>0&&r.height>0}:null;};
   const exit=document.querySelector('.combat-portal-toggle'),exitRect=exit?.getBoundingClientRect(),exitHit=exitRect&&document.elementFromPoint(exitRect.left+exitRect.width/2,exitRect.top+exitRect.height/2);
   return{physics:rect('.world-physics-action'),hint:rect('.bottom-hud'),firstPlay:rect('.world-first-play'),dock:rect('.combat-action-dock'),toggle:rect('.combat-story-toggle'),exit:{visible:!!exitRect&&exitRect.width>0&&exitRect.height>0,hit:!!exitHit&&(exitHit===exit||exit.contains(exitHit))},width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth};
  });
  assert(desktop.dock?.visible,`combat actions must remain visible: ${JSON.stringify(desktop)}`);
  assert(desktop.dock.height<=72,`desktop combat actions should stay in one compact row: ${JSON.stringify(desktop.dock)}`);
  assert(desktop.exit.visible&&desktop.exit.hit,`portal exit remains visible and pointer reachable during combat: ${JSON.stringify(desktop.exit)}`);
  assert(!desktop.physics?.visible,'the physics sandbox action is hidden during combat so it cannot cover movement guidance or compete with battle actions');
  await page.screenshot({path:new URL(`combat-ui-${label}-desktop.png`,artifacts).pathname,scale:'css'});
  await clickUser(page,page.locator('.combat-portal-toggle'));
  assert.equal(await page.locator('#app-ui').getAttribute('data-atlas-open'),'true','combat portal control opens the world selector');
  assert.equal(await page.locator('.world-link[data-world="future"]').isVisible(),true,'the portal atlas presents destinations for leaving combat');
  await clickUser(page,page.locator('.combat-portal-toggle'));
  await clickUser(page,page.locator('.combat-story-toggle'));
  assert.equal(await page.locator('#app-ui').getAttribute('data-story-open'),'true','battle notes must reopen on demand');
  assert.match(await readPanel(),/THE WARDEN REMEMBERS|TITAN NEURAL INTERFACE/,'the story and current character context remain available');
  await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>{const r=s=>{const n=document.querySelector(s),b=n?.getBoundingClientRect();return n&&b?{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height,visible:getComputedStyle(n).display!=='none'&&b.width>0&&b.height>0}:null;};const a=document.querySelector('.combat-action-dock button'),b=a?.getBoundingClientRect(),hit=b&&document.elementFromPoint(b.left+b.width/2,b.top+b.height/2),exit=document.querySelector('.combat-portal-toggle'),er=exit?.getBoundingClientRect(),eh=er&&document.elementFromPoint(er.left+er.width/2,er.top+er.height/2);return{dock:r('.combat-action-dock'),toggle:r('.combat-story-toggle'),panel:r('.story-panel'),physics:r('.world-physics-action'),firstActionHit:!!hit&&(hit===a||a.contains(hit)),exit:{visible:!!er&&er.width>0&&er.height>0,hit:!!eh&&(eh===exit||exit.contains(eh))},width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth};});
  assert(mobile.dock?.visible&&mobile.toggle?.visible&&!mobile.physics?.visible&&mobile.firstActionHit,`mobile combat actions stay reachable and physics sandbox chrome is suppressed: ${JSON.stringify(mobile)}`);
  assert(mobile.dock.height<=60,`mobile combat actions should stay in one compact row: ${JSON.stringify(mobile.dock)}`);
  assert(mobile.exit.visible&&mobile.exit.hit,`mobile portal exit remains visible and pointer reachable with story open: ${JSON.stringify(mobile.exit)}`);
  assert(mobile.docWidth<=mobile.width,`mobile combat must not scroll horizontally: ${JSON.stringify(mobile)}`);
  assert(mobile.panel.height<=mobile.height*.46,`expanded story must remain a compact, scrollable mobile sheet: ${JSON.stringify(mobile)}`);
  assert(mobile.panel.y>=0&&mobile.panel.bottom<=mobile.height,`expanded story remains inside the mobile viewport: ${JSON.stringify(mobile)}`);
  await page.screenshot({path:new URL(`combat-ui-${label}-mobile.png`,artifacts).pathname,scale:'css'});
  await clickUser(page,page.locator('.combat-portal-toggle'));
  assert.equal(await page.locator('#app-ui').getAttribute('data-atlas-open'),'true','mobile portal control opens the world selector with story open');
  assert.equal(await page.locator('.world-link[data-world="future"]').isVisible(),true,'mobile atlas exposes a reachable destination');
  await clickUser(page,page.locator('.combat-portal-toggle'));
  const touch=await page.evaluate(()=>{const node=document.querySelector('.mobile-dpad button[data-move="KeyW"]'),r=node?.getBoundingClientRect(),hit=r&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{visible:!!node&&getComputedStyle(node).display!=='none'&&r.width>0&&r.height>0,hit:!!hit&&(hit===node||node.contains(hit)),label:node?.getAttribute('aria-label')};});
  assert(touch.visible&&touch.hit,`mobile movement pad returns after closing battle notes: ${JSON.stringify(touch)}`);
  await clickUser(page,page.locator('.combat-story-toggle'));
  await page.setViewportSize({width:720,height:450});
  const compact=await page.evaluate(()=>{const n=document.querySelector('.combat-action-dock'),r=n.getBoundingClientRect(),p=document.querySelector('.story-panel').getBoundingClientRect(),button=document.querySelector('.combat-action-dock button'),b=button.getBoundingClientRect(),hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);return{width:innerWidth,height:innerHeight,docWidth:document.documentElement.scrollWidth,dock:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},panel:{x:p.x,y:p.y,right:p.right,bottom:p.bottom,height:p.height},button:{x:b.x,y:b.y,right:b.right,bottom:b.bottom,hit:!!hit&&(hit===button||button.contains(hit))},reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,transition:getComputedStyle(document.querySelector('.combat-action-dock')).transitionDuration};});
  assert(compact.docWidth<=compact.width,`720×450 compact viewport must not overflow horizontally: ${JSON.stringify(compact)}`);
  assert(compact.button.hit&&compact.button.x>=0&&compact.button.right<=compact.width,`combat action stays clickable in the compact viewport: ${JSON.stringify(compact)}`);
  assert(compact.panel.y>=0&&compact.panel.bottom<=compact.height,`expanded story remains inside the compact viewport: ${JSON.stringify(compact)}`);
  assert(compact.dock.bottom<compact.panel.y||compact.dock.y>compact.panel.bottom,`combat HUD and expanded story sheet remain separate: ${JSON.stringify(compact)}`);
  assert(compact.reduce&&compact.transition.split(',').every(part=>parseFloat(part)<=.00002),`combat UI honors reduced motion: ${JSON.stringify(compact)}`);
  await page.screenshot({path:new URL(`combat-ui-${label}-720x450.png`,artifacts).pathname,scale:'css'});
  await page.locator('.combat-story-toggle').focus();await page.keyboard.press('Shift+Tab');
  const focus=await page.evaluate(()=>({label:document.activeElement?.innerText?.trim(),inside:!!document.activeElement?.closest('.combat-action-dock'),outline:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth}));
  assert(focus.inside&&focus.outline!=='none'&&parseFloat(focus.width)>=2,`combat actions must be keyboard reachable with visible focus: ${JSON.stringify(focus)}`);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#app-ui').getAttribute('data-story-open'),'false','Escape closes battle notes');
  await page.setViewportSize({width:1000,height:720});
  console.log(JSON.stringify({result:'PASS',scenario:`${label} combat HUD responsive layout, story access, movement guidance clearance, keyboard focus and reduced motion`,desktop,mobile,compact,focus}));
 };
 const inspectPhysicsControl=async()=>{
  await page.waitForFunction(()=>document.querySelector('.world-physics-action')?.dataset.ready==='true',{timeout:60000});
  await clickUser(page,page.locator('.story-panel .sheet-inline-close'));
  const desktop=await page.evaluate(()=>{const control=document.querySelector('.world-physics-action'),r=control.getBoundingClientRect(),hint=document.querySelector('.bottom-hud'),play=document.querySelector('.world-first-play'),portal=document.querySelector('.portal-dock'),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2),overlap=(a,b)=>{const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return getComputedStyle(a).display!=='none'&&getComputedStyle(b).display!=='none'&&x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top;},pr=portal.getBoundingClientRect();return{rect:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},within:r.x>=innerWidth*.5&&r.right<=innerWidth,hit:hit===control||control.contains(hit),hintOverlap:overlap(control,hint),firstPlayOverlap:overlap(control,play),firstPlayPortalOverlap:overlap(play,portal),hintVisible:getComputedStyle(hint).display!=='none',firstPlayVisible:getComputedStyle(play).display!=='none',width:innerWidth,height:innerHeight};});
  assert(desktop.within&&desktop.hit&&!desktop.hintOverlap&&!desktop.firstPlayOverlap&&!desktop.firstPlayPortalOverlap,`desktop physics action and movement guidance must remain clickable and clear of the portal dock: ${JSON.stringify(desktop)}`);
  await page.screenshot({path:new URL('physics-control-desktop.png',artifacts).pathname,scale:'css'});
  const before=Number(await page.locator('.world-physics-action').getAttribute('data-impulses'));await clickUser(page,page.locator('.world-physics-action'));await page.waitForFunction(n=>Number(document.querySelector('.world-physics-action')?.dataset.impulses)>n,before,{timeout:15000});
  await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>{const control=document.querySelector('.world-physics-action'),r=control.getBoundingClientRect(),pad=document.querySelector('.mobile-dpad'),p=pad.getBoundingClientRect(),hint=document.querySelector('.bottom-hud'),h=hint.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{control:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},pad:{x:p.x,y:p.y,right:p.right,bottom:p.bottom,visible:getComputedStyle(pad).display!=='none'},hit:hit===control||control.contains(hit),overlap:r.left<p.right&&r.right>p.x&&r.top<p.bottom&&r.bottom>p.y,width:innerWidth,docWidth:document.documentElement.scrollWidth,hintVisible:getComputedStyle(hint).display!=='none'};});
  assert(mobile.hit&&mobile.pad.visible&&!mobile.overlap&&mobile.docWidth<=mobile.width&&!mobile.hintVisible,`mobile physics button and movement pad remain separately reachable without horizontal overflow: ${JSON.stringify(mobile)}`);
  await page.screenshot({path:new URL('physics-control-mobile.png',artifacts).pathname,scale:'css'});
  await page.setViewportSize({width:1000,height:720});await clickUser(page,page.locator('.scene-postcard .postcard-enter'));
  console.log(JSON.stringify({result:'PASS',scenario:'physics sandbox action placement and click at desktop/mobile sizes',desktop,mobile}));
 };

 // The Warden learns repeated moves, defeats the traveler, then remains available after re-entry.
 if(onlyCombat!=='mech'){
 await startGuest();await clickUser(page,page.locator('.first-crossing-top [data-cmd="journey-skip"]'));await travelTo('dungeon');await enter();await inspectPhysicsControl();await choose('power-storm');console.log('warden: storm learned');
 for(const rune of ['star','crown','moon'])await choose(`rune-${rune}`);
 await choose('face-warden');console.log('warden: arena unlocked; first attempt begins');
 assert.equal(await page.locator('#app-ui').getAttribute('data-combat'),'active');
 await inspectCombatLayout('warden');
 if(layoutOnly){console.log(JSON.stringify({result:'PASS',scenario:'Warden combat HUD visual/accessibility layout checkpoint'}));}
 else {
 await page.screenshot({path:new URL('warden-battle-active.png',artifacts).pathname,scale:'css'});
 for(let n=0;n<6;n++)await combatButton('warden-strike');
 await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.combat==='inactive');console.log('warden: defeat state reached');
 assert.match(await page.locator('#toast-region').innerText(),/You fall, but time keeps its promise/i);
 assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'guest combat must remain unsaved');
 await page.screenshot({path:new URL('warden-defeat-recovery.png',artifacts).pathname,scale:'css'});
 await travelTo('future');await travelTo('dungeon');await enter();
 assert.match(await page.locator('.choice-list [data-action="face-warden"]').innerText(),/Challenge the Warden again/);
 await choose('face-warden');
 console.log('warden: re-entered after leaving the dungeon');
 for(const key of ['KeyF','Space','KeyQ','KeyF','Space','Space'])await page.keyboard.press(key);
 await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.combat==='inactive');
 await clickUser(page,page.locator('.scene-postcard .postcard-enter'));
 const guardRelic=page.locator('.choice-list [data-action="guard-relic"]');
 await guardRelic.waitFor({state:'visible'});
 assert.equal(await guardRelic.isDisabled(),false,'only Warden victory enables the relic decision');
 console.log('warden: keyboard retry won');
 await clickUser(page,guardRelic);
 assert.equal(await page.locator('.choice-list [data-action="guard-relic"]').isDisabled(),true,'the relic decision is one-time');
 await travelTo('future');await travelTo('dungeon');await enter();
 const resolvedEncounter=page.locator('.choice-list [data-action="face-warden"]');
 assert.equal(await resolvedEncounter.isDisabled(),true,'a resolved encounter must be clearly unavailable for repeat rewards');
 assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null);
 await page.screenshot({path:new URL('warden-recovered-victory.png',artifacts).pathname,scale:'css'});
 console.log(JSON.stringify({result:'PASS',scenario:'Warden rune unlock, learned-pattern defeat, exit/re-entry retry by Space/F/Q, victory, relic decision and no repeat reward',errors:pageErrors}));
 }
 }

 // Exercise an actual mech defeat and the documented reboot path before completing the mission.
 if(onlyCombat!=='warden'&&!layoutOnly){
 await startGuest();await travelTo('mech');await enter();await choose('train-pilot');await choose('deploy-mech');await choose('start-defense');console.log('mech: pilot linked and defense started');
 assert.equal(await page.locator('#app-ui').getAttribute('data-combat'),'active');
 await page.screenshot({path:new URL('mech-defense-active.png',artifacts).pathname,scale:'css'});
 await inspectCombatLayout('mech');await clickUser(page,page.locator('.combat-story-toggle'));
 for(let n=0;n<15;n++)await choose('vent-reactor');
 const reboot=page.locator('.choice-list [data-action="reboot-defense"]');await reboot.waitFor({state:'visible'});
 console.log('mech: zero hull recovery available');
 assert.equal(await reboot.isDisabled(),false,'a zero-hull mission must offer recovery');
 assert.match(await readPanel(),/0%/);
 await page.screenshot({path:new URL('mech-defeat-reboot.png',artifacts).pathname,scale:'css'});
 await choose('reboot-defense');await page.waitForFunction(()=>/100%/.test(document.querySelector('.combat-console')?.innerText||'')&&/3 HOSTILES REMAINING/.test(document.querySelector('.combat-console')?.innerText||''));
 console.log('mech: reboot completed');
 await page.keyboard.press('Space');
 await page.waitForFunction(()=>/2 HOSTILES REMAINING/.test(document.querySelector('.combat-console')?.innerText||''));
 await combatButton('fire-pulse');await combatButton('vent-reactor');await page.keyboard.press('Space');
 await page.waitForFunction(()=>/0 HOSTILES REMAINING/.test(document.querySelector('.combat-console')?.innerText||''));
 await choose('defend-city');await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.combat==='inactive');
 console.log('mech: defense completed');
 await travelTo('future');await travelTo('mech');await enter();
 const secured=page.locator('.choice-list [data-action="defend-city"]');
 assert.equal(await secured.isDisabled(),true,'a completed defense cannot be paid out a second time');
 assert.equal(await page.evaluate(()=>localStorage.getItem('syrava.elsewhere.private-v1')),null,'mech guest journey must not persist a vault');
 await page.screenshot({path:new URL('mech-defense-recovered.png',artifacts).pathname,scale:'css'});
 console.log(JSON.stringify({result:'PASS',scenario:'ATLAS-09 pilot controls, zero-hull recovery, successful defense, exit/re-entry, single-use mission reward',errors:pageErrors,httpErrors,external}));
 }
 assert.deepEqual(pageErrors,[],'no browser exceptions or console errors');assert.deepEqual(httpErrors,[],'all same-origin requests succeed');assert.deepEqual(external,[],'no off-origin requests');
 await context.close();
}finally{
 await browser?.close().catch(()=>{});vite.kill('SIGTERM');await Promise.race([new Promise(resolve=>vite.once('exit',resolve)),delay(3000)]);
 await Promise.all([rm(config,{recursive:true,force:true}),rm(cache,{recursive:true,force:true})]);
}
