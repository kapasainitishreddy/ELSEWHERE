import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const root=new URL('../../',import.meta.url),port=Number(process.env.ELSEWHERE_A11Y_PORT||5185),origin=`http://127.0.0.1:${port}`;
const artifacts=new URL('../../review-output/e2e/',import.meta.url);await mkdir(artifacts,{recursive:true});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:'ignore',env:process.env});
const config=await mkdtemp(join(tmpdir(),'elsewhere-a11y-config-')),cache=await mkdtemp(join(tmpdir(),'elsewhere-a11y-cache-'));
let browser;
try{
 let ready=false;
 for(let n=0;n<80;n++){if(vite.exitCode!==null)throw new Error(`Vite exited (${vite.exitCode})`);try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await delay(250);}
 assert(ready,'Vite did not start');
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({executablePath,headless:true,env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||config,XDG_CACHE_HOME:process.env.XDG_CACHE_HOME||cache},args:['--no-sandbox','--disable-dev-shm-usage','--disable-breakpad','--disable-crash-reporter','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 let context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1}),page=await context.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(15000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
 const tabPath=[];
 for(let step=0;step<20;step++){
  const active=await page.evaluate(()=>({id:document.activeElement?.id||'',tag:document.activeElement?.tagName||'',cmd:document.activeElement?.dataset?.cmd||''}));
  tabPath.push(active);
  if(active.id==='guest-play')break;
  await page.keyboard.press('Tab');
 }
 assert.equal(tabPath.at(-1)?.id,'guest-play',`keyboard tab order should reach the unsaved entry action: ${JSON.stringify(tabPath)}`);
 const focusStyle=await page.evaluate(()=>({matches:document.activeElement.matches(':focus-visible'),width:getComputedStyle(document.activeElement).outlineWidth,style:getComputedStyle(document.activeElement).outlineStyle}));
 assert.equal(focusStyle.matches,true);assert.notEqual(focusStyle.style,'none');assert(parseFloat(focusStyle.width)>=2,`entry focus outline should be clearly visible: ${JSON.stringify(focusStyle)}`);
 await page.screenshot({path:new URL('a11y-keyboard-entry.png',artifacts).pathname});
 await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');
 await page.waitForSelector('.first-crossing');
 const scaleBefore=await page.locator('.first-crossing-actions button:first-child').evaluate(node=>getComputedStyle(node).fontSize);
 await context.close();
 // Use half the CSS viewport at 2× device scale: a reproducible 200% zoom geometry/text-size emulation.
 context=await browser.newContext({viewport:{width:720,height:450},deviceScaleFactor:2});page=await context.newPage();
 await page.emulateMedia({reducedMotion:'reduce'});page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#guest-play').click();
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.sceneReady==='true');await page.waitForSelector('.first-crossing');
 await page.locator('.first-crossing-actions button:first-child').scrollIntoViewIfNeeded();
 await page.screenshot({path:new URL('a11y-200-percent-viewport.png',artifacts).pathname});
 const layout=await page.evaluate(()=>{
  const c=document.documentElement.clientWidth,cta=document.querySelector('.first-crossing-actions button:first-child'),r=cta.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  const contrast=(fg,bg)=>{const lum=value=>{const rgb=value.match(/[\d.]+/g)?.slice(0,3).map(Number)||[0,0,0];const channel=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};return .2126*channel(rgb[0])+.7152*channel(rgb[1])+.0722*channel(rgb[2]);};const a=lum(fg),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
  const style=getComputedStyle(cta);return{viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,cta:{text:cta.innerText.trim(),fontSize:style.fontSize,color:style.color,background:style.backgroundColor,ratio:contrast(style.color,style.backgroundColor),rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},withinWidth:r.left>=0&&r.right<=c,unobstructed:hit===cta||cta.contains(hit)},reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,transition:getComputedStyle(cta).transitionDuration,animation:getComputedStyle(cta).animationDuration};
 });
 assert.equal(layout.reduce,true);assert(layout.documentWidth<=layout.viewport.width&&layout.bodyWidth<=layout.viewport.width,`200% zoom reflow must not introduce horizontal page scroll: ${JSON.stringify(layout)}`);
 assert(layout.cta.withinWidth&&layout.cta.unobstructed,`primary action remains visible and clickable in the reduced viewport: ${JSON.stringify(layout.cta)}`);
 const physicalFontScale=parseFloat(layout.cta.fontSize)*layout.viewport.devicePixelRatio/parseFloat(scaleBefore);
 assert(physicalFontScale>=1.8,`200% browser-zoom emulation should preserve at least 1.8× physical type size after reflow: ${physicalFontScale}×`);
 assert(layout.cta.ratio>=4.5,`primary action text contrast should meet WCAG AA for normal text: ${JSON.stringify(layout.cta)}`);
 const token=layout.transition.split(',')[0].trim(),rawDuration=parseFloat(token),duration=token.endsWith('ms')?rawDuration/1000:rawDuration;
 assert(duration<=.00002,`reduced-motion transition must be suppressed to .02 ms or less: ${layout.transition}`);
 console.log(JSON.stringify({result:'PASS',scenario:'keyboard-only guest entry with visible focus; 200% desktop zoom geometry/text-size emulation; primary action contrast; reduced motion',tabPath,scaleBefore,layout,errors}));
 await context.close();
}finally{
 await browser?.close().catch(()=>{});vite.kill('SIGTERM');await Promise.race([new Promise(resolve=>vite.once('exit',resolve)),delay(3000)]);
 await Promise.all([rm(config,{recursive:true,force:true}),rm(cache,{recursive:true,force:true})]);
}
