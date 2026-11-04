import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {setTimeout as delay} from 'node:timers/promises';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_RECOVERY_PROD_PORT||5188),origin=`http://127.0.0.1:${port}`;
const preview=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
let browser;
try{
 let ready=false;
 for(let n=0;n<80;n++){if(preview.exitCode!==null)throw new Error(`Preview exited (${preview.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Production preview did not start');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(20000);
 const sceneRequests=[];let failures=1;
 await page.route('**/assets/worlds-*.js*',async route=>{sceneRequests.push(route.request().url());if(failures-->0)await route.abort('failed');else await route.continue();});
 await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#guest-play').click();await page.locator('#scene-retry-overlay').waitFor();
 await page.locator('#scene-retry-overlay').click();
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true',null,{timeout:60000});
 assert.equal(sceneRequests.length,2,'the retry fetches the production scene chunk again');
 assert(sceneRequests[0].endsWith('.js')&&!sceneRequests[0].includes('scene-retry='));
 assert(sceneRequests[1].includes('scene-retry=2'),'retry must use a fresh module URL to avoid the browser cached rejection');
 assert.equal(await page.locator('#scene-recovery').isVisible(),false);
 console.log(JSON.stringify({result:'PASS',scenario:'production chunk failure and retry with a cache-busted hashed asset URL',requests:sceneRequests.map(url=>url.split('/').at(-1))}));
 await context.close();
}finally{if(browser)await browser.close();preview.kill('SIGTERM');}
