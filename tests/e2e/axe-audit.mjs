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
 if(failures.length)console.error(JSON.stringify(failures,null,2));
 assert.equal(failures.length,0,'axe detected accessibility violations');
}finally{await browser?.close().catch(()=>{});vite.kill('SIGTERM');}
