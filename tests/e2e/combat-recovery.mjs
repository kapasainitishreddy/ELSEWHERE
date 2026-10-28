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
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-combat-config-')),cache=await mkdtemp(join(tmpdir(),'elsewhere-combat-cache-'));
let browser;
const clickUser=async(page,locator)=>{
 await locator.scrollIntoViewIfNeeded();
 const point=await locator.evaluate(node=>{const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:r.width>0&&r.height>0&&getComputedStyle(node).visibility!=='hidden',enabled:!('disabled'in node&&node.disabled),hitWithin:!!hit&&(hit===node||node.contains(hit))};});
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
 const choose=async id=>clickUser(page,page.locator(`.choice-list [data-action="${id}"]`));
 const combatButton=async id=>clickUser(page,page.locator(`.quick-combat [data-action="${id}"]`));
 const readPanel=()=>page.locator('.story-panel').innerText();

 // The Warden learns repeated moves, defeats the traveler, then remains available after re-entry.
 if(onlyCombat!=='mech'){
 await startGuest();await travelTo('dungeon');await enter();await choose('power-storm');console.log('warden: storm learned');
 for(const rune of ['star','crown','moon'])await choose(`rune-${rune}`);
 await choose('face-warden');console.log('warden: arena unlocked; first attempt begins');
 assert.equal(await page.locator('#app-ui').getAttribute('data-combat'),'active');
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

 // Exercise an actual mech defeat and the documented reboot path before completing the mission.
 if(onlyCombat!=='warden'){
 await startGuest();await travelTo('mech');await enter();await choose('train-pilot');await choose('deploy-mech');await choose('start-defense');console.log('mech: pilot linked and defense started');
 assert.equal(await page.locator('#app-ui').getAttribute('data-combat'),'active');
 await page.screenshot({path:new URL('mech-defense-active.png',artifacts).pathname,scale:'css'});
 for(let n=0;n<15;n++)await choose('vent-reactor');
 const reboot=page.locator('.choice-list [data-action="reboot-defense"]');await reboot.waitFor({state:'visible'});
 console.log('mech: zero hull recovery available');
 assert.equal(await reboot.isDisabled(),false,'a zero-hull mission must offer recovery');
 assert.match(await readPanel(),/0%/);
 await page.screenshot({path:new URL('mech-defeat-reboot.png',artifacts).pathname,scale:'css'});
 await choose('reboot-defense');assert.match(await page.locator('#toast-region').innerText(),/ATLAS-09 rebooted/i);
 console.log('mech: reboot completed');
 await page.keyboard.press('Space');
 await page.waitForFunction(()=>/2 HOSTILES REMAINING/.test(document.querySelector('.combat-console')?.innerText||''));
 await combatButton('fire-pulse');await combatButton('vent-reactor');await page.keyboard.press('Space');
 await page.waitForFunction(()=>/0 HOSTILES REMAINING/.test(document.querySelector('.combat-console')?.innerText||''));
 await choose('defend-city');await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.combat==='inactive');
 console.log('mech: defense completed');
 assert.match(await page.locator('#toast-region').innerText(),/breakwater stands/i);
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
