/** Local source-and-build readiness report. Intentionally never reads vaults, keys or env files. */
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const cwd=resolve(import.meta.dirname,'..');
const json=JSON.parse(readFileSync(resolve(cwd,'package.json'),'utf8'));
const required=[
 'src/premiere.js','src/xr-comfort.js','src/scene-director.js',
 'src/submission-polish.css','api/character.js','api/health.js',
 'docs/RESEARCH_PATTERNS_AND_RESPONSES.md','docs/SUBMISSION_CHECKLIST.md',
 'docs/DEMO_3MIN.md','docs/RESEARCH_TO_RELEASE_2026-10-27.md','tests/research-polish.test.mjs','tests/submission-journey.test.mjs',
 'tests/xr-release.test.mjs','tests/serverless-meta.test.mjs'
];
const reports=[];
for(const path of required){reports.push({area:path,status:existsSync(resolve(cwd,path))?'PASS':'FAIL'});}
const tested=spawnSync(process.execPath,['--test','tests/submission-journey.test.mjs','tests/xr-release.test.mjs','tests/serverless-meta.test.mjs','tests/scene-director.test.mjs','tests/research-polish.test.mjs'],{cwd,encoding:'utf8',timeout:60000});
const match=tested.stdout.match(/# tests (\d+)[\s\S]*?# pass (\d+)[\s\S]*?# fail (\d+)/);
reports.push({area:`Featured journey/XR/Meta tests ${match?match[2]+'/'+match[1]:'not completed'}`,status:tested.status===0?'PASS':'FAIL'});
const vite=existsSync(resolve(cwd,'node_modules','vite','bin','vite.js'));
if(vite){const built=spawnSync('npm',['run','build'],{cwd,encoding:'utf8',timeout:120000,shell:process.platform==='win32'});reports.push({area:'Production Vite bundle',status:built.status===0?'PASS':'FAIL'});}
else reports.push({area:'Production Vite bundle (install dependencies first)',status:'UNVERIFIED'});
for(const area of ['Real Quest comfort and controller validation','Successful live Meta Model API inference','Three-minute real video recorded and publicly accessible','Opt-in adult usability sessions','Public deployment with HTTPS'])reports.push({area,status:'MANUAL'});
console.log(`ELSEWHERE ${json.version} / SUBMISSION PREVIEW REPORT`);
for(const r of reports)console.log(`${r.status.padEnd(11)} ${r.area}`);
const fail=reports.filter(x=>x.status==='FAIL');
const manual=reports.filter(x=>x.status==='UNVERIFIED'||x.status==='MANUAL');
console.log(`\nLocal reported failures: ${fail.length}; manual/unverified gates: ${manual.length}.`);
console.log('Submission certification: NOT ESTABLISHED until every manual gate is verified.');
if(fail.length)process.exitCode=1;
