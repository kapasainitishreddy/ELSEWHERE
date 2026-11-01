import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync,mkdirSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import axe from 'axe-core';

mkdirSync('review-output/e2e',{recursive:true});
const port=5193,origin=`http://127.0.0.1:${port}`;
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{stdio:'ignore'});
let browser;
try{
 let ready=false;
 for(let i=0;i<80;i++){if(vite.exitCode!==null)throw Error('Vite exited');try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite startup timed out');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720}});page.setDefaultTimeout(30000);
 await page.goto(origin,{waitUntil:'networkidle'});
 const failures=[];
 async function audit(stage){
  await page.evaluate(axe.source);
  const results=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
  for(const v of results.violations)failures.push({stage,id:v.id,impact:v.impact,help:v.help,targets:v.nodes.map(n=>n.target)});
  console.log(`${stage}: ${results.violations.length} violations, ${results.incomplete.length} checks require manual review`);
 }
 await audit('entry');await page.screenshot({path:'review-output/e2e/axe-entry.png'});
 await page.locator('#guest-play').click();await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',{timeout:90000});
 await audit('guest');await page.screenshot({path:'review-output/e2e/axe-guest.png'});
 await page.locator('#timeline-open').click();await page.locator('[role="dialog"][aria-labelledby="journal-title"]').waitFor();
 await audit('timeline dialog');
 await page.locator('[data-focus-key="timeline-close"]').click();
 await page.locator('.modal-shade').waitFor({state:'hidden'});
 await page.locator('[data-cmd="first-crossing"]').click();
 await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self',{timeout:90000});
 await page.locator('[data-cmd="first-crossing"]').click();await page.locator('#chat-question').waitFor();
 await audit('future-self dialogue');await page.screenshot({path:'review-output/e2e/axe-future-self.png'});
 await page.locator('#chat-question').fill('What is this possible future like?');
 await page.locator('#chat-form button[type="submit"]').click();await page.locator('#chat-history .chat-line.elder').waitFor();
 await page.locator('.story-panel [data-cmd="story-toggle"]').click();
 await page.locator('[data-cmd="first-crossing"]').click();
 await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='past',{timeout:90000});
 await page.locator('[data-cmd="first-crossing"]').click();await page.locator('[data-action="invent-cell"]').click();
 await audit('1889 ownership choice');await page.screenshot({path:'review-output/e2e/axe-1889-choice.png'});
 await page.setViewportSize({width:390,height:844});await audit('1889 choice mobile');
 await page.screenshot({path:'review-output/e2e/axe-1889-mobile.png'});
 if(failures.length)console.error(JSON.stringify(failures,null,2));
 assert.equal(failures.length,0,'axe detected accessibility violations');
}finally{await browser?.close().catch(()=>{});vite.kill('SIGTERM');}
