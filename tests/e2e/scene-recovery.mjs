import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {setTimeout as delay} from 'node:timers/promises';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_RECOVERY_PORT||5187),origin=`http://127.0.0.1:${port}`;
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
let browser;
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not start');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(20000);
 let worldRequests=0,failures=2;
 await page.route('**/src/worlds.js*',async route=>{worldRequests++;if(failures-->0)await route.abort('failed');else await route.continue();});
 await page.goto(origin,{waitUntil:'networkidle'});
 await page.locator('#guest-play').click();
 await page.locator('#scene-retry-overlay').waitFor();
 assert.equal(await page.locator('#app-ui').evaluate(node=>node.inert),true,'background controls are inert while the recovery dialog is open');
 assert.equal(await page.locator('#world-canvas').evaluate(node=>node.inert),true,'the canvas is inert while the recovery dialog is open');
 assert.equal(await page.evaluate(()=>document.activeElement?.id),'scene-retry-overlay','keyboard focus enters the recovery actions');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'scene-continue-text','the story-mode recovery option is keyboard reachable');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.id),'scene-retry-overlay','recovery dialog focus wraps around');
 await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('#scene-retry-overlay')&&!document.querySelector('#scene-retry-overlay').disabled);
 assert.equal(worldRequests,2,'the explicit retry attempts the failed scene request again');
 await page.locator('#scene-continue-text').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('#scene-recovery')&&!document.querySelector('#scene-recovery').hidden);
 assert.equal(await page.locator('#app-ui').evaluate(node=>node.inert),false,'story mode becomes interactive after recovery is dismissed');
 assert.equal(await page.evaluate(()=>document.activeElement?.matches('.first-crossing-actions button:first-child')),true,'continuing in text mode places focus on the guided story');
 await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#app-ui')?.dataset.world==='self');
 assert.match(await page.locator('.first-crossing-actions button:first-child').innerText(),/^BEGIN A CONVERSATION/,'the story remains playable without the scene runtime');
 await page.locator('#scene-retry-text').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',null,{timeout:60000});
 assert.equal(worldRequests,3,'retry after text-mode progress reloads the scene module');
 assert.equal(await page.locator('#app-ui').getAttribute('data-world'),'self','successful recovery mounts the current story state');
 assert.equal(await page.locator('#scene-recovery').isVisible(),false,'the retry banner clears after recovery');
 assert.deepEqual(await page.evaluate(()=>({errors:document.querySelectorAll('.loading-error').length,recoveryHidden:document.querySelector('#scene-recovery').hidden,world:document.querySelector('#app-ui').dataset.world})),{errors:0,recoveryHidden:true,world:'self'});
 console.log(JSON.stringify({result:'PASS',scenario:'two failed scene loads, keyboard recovery dialog, playable text mode, preserved progress, successful retry',worldRequests}));
 await context.close();
}finally{if(browser)await browser.close();vite.kill('SIGTERM');}
