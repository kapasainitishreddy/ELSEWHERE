/**
 * Truthful submission preflight: automated evidence is distinct from physical
 * and API checks that cannot be certified from a headless source environment.
 * No analytics, internet requests, credentials or private save files are read.
 */
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const cwd=resolve(import.meta.dirname,'..');
const sources=['src/future-dialogue.js','src/local-voice.js','src/compass.js','src/local-ai.js','src/game.js','src/branches.js','src/ui.js','src/main.js','server.mjs','local-server.mjs','src/motion-language.js','src/kinetic-effects.js','src/performance.js','src/worlds.js'];
const checks=[];
for(const file of sources){
 const r=spawnSync(process.execPath,['--check',file],{cwd,encoding:'utf8'});
 if(r.status!==0)checks.push({status:'FAIL',label:`Syntax: ${file}`,detail:(r.stderr||'Syntax error').trim().slice(0,120)});
}
if(!checks.length)checks.push({status:'PASS',label:`Syntax: ${sources.length} critical files`});
const suite=spawnSync('npm',['run','test'],{cwd,encoding:'utf8',shell:process.platform==='win32',timeout:60000});
const match=suite.stdout?.match(/# tests (\d+)[\s\S]*?# pass (\d+)[\s\S]*?# fail (\d+)/);
checks.push({status:suite.status===0?'PASS':'FAIL',label:`Node simulation/privacy suite: ${match?`${match[2]}/${match[1]}`:'see npm test'}`,detail:suite.status===0?'':(suite.stderr||suite.stdout||'Tests did not complete').slice(-250)});
const viteInstalled=existsSync(resolve(cwd,'node_modules','vite','bin','vite.js'));
if(viteInstalled){
 const build=spawnSync('npm',['run','build'],{cwd,encoding:'utf8',shell:process.platform==='win32',timeout:90000});
 checks.push({status:build.status===0?'PASS':'FAIL',label:'Vite production build',detail:build.status===0?'':(build.stderr||build.stdout).slice(-250)});
}else checks.push({status:'UNVERIFIED',label:'Vite production build (run npm install and npm run build)'});
const models=resolve(cwd,'public','assets','kenney');
const glbCount=existsSync(models)?readdirSync(models).filter(x=>x.endsWith('.glb')).length:0;
checks.push({status:glbCount?'INSTALLED':'OPTIONAL',label:`Kenney model assets: ${glbCount} GLB file(s); assets:fetch installs 24`});
for(const label of [
 'Quest headset: rendering, movement, legibility, frame rate, nausea check',
 'Real browser: visual UX, no errors and network privacy inspection',
 'Meta API: successful call with fictional data and explicit cloud consent',
 'Three-minute video: real capture of newly built work',
 'Adult participant usability sessions and permission to share aggregate findings'
])checks.push({status:'UNVERIFIED',label});
console.log('ELSEWHERE · SUBMISSION PRE-FLIGHT (not a certification)');
for(const item of checks)console.log(`${item.status.padEnd(11)} ${item.label}${item.detail?'\n  '+item.detail:''}`);
console.log('\nSubmission-ready = NO until manual & Meta integration checks are documented.');
if(checks.some(x=>x.status==='FAIL'))process.exitCode=1;
