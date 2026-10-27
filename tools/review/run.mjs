/**
 * ELSEWHERE evidence-first, read-only review agents.
 * Node >=22, standard library only. Never reads .env, browser vaults, or API keys.
 * Run from the repository root. Writes review-output/ only.
 *
 * Inspired by Google Research Harness² / RRSI. NOT a bundled copy of either
 * framework and NOT a model-backed review unless separately configured.
 */
import {existsSync, readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const sourceOnly=process.argv.includes('--source-only');
const noWrite=process.argv.includes('--no-write');
const now=new Date().toISOString();
const results=[];
const rel=path=>resolve(root,path);
const present=path=>existsSync(rel(path));
function read(path) {
  if(!present(path))return '';
  return readFileSync(rel(path),'utf8');
}
function check(agent,subject,condition,detail,level='FAIL') {
  results.push({agent,subject,status:condition?'PASS':level,detail});
}
function blocked(agent,subject,detail) {
  results.push({agent,subject,status:'UNVERIFIED',detail});
}
function run(title,args,timeout=180000) {
  const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',args,{
    cwd:root,timeout,encoding:'utf8',
    env:{...process.env,MODEL_API_KEY:'',META_MODEL:'muse-spark-1.3',NODE_ENV:'test'},
    shell:false,maxBuffer:1024*1024*3
  });
  const output=String(result.stderr||'')+'\n'+String(result.stdout||'');
  const last=output.slice(-850).replace(/\x1b\[[0-9;]*m/g,'');
  results.push({agent:'Execution Agent',subject:title,
    status:result.status===0?'PASS':'FAIL',
    detail:result.error?String(result.error.code||result.error.message):'exit '+String(result.status),
    output:last});
}
const pkg=JSON.parse(read('package.json')||'{}');
const html=read('index.html'),main=read('src/main.js');
const api=read('api/character.js'),bridge=read('server.mjs'),worlds=read('src/worlds.js');
const checklist=read('docs/SUBMISSION_CHECKLIST.md');
check('Eligibility Agent','Public source preparedness',
  present('LICENSE')&&present('README.md')&&present('src/game.js'),
  'Source exists; public visibility confirmed separately through GitHub, not by this local script');
check('Eligibility Agent','New-work disclosure prepared',
  present('docs/HACKATHON_SCORECARD.md')&&present('docs/DEMO_3MIN.md'),
  'Documentation only; demo must show newly built Oct 27-Nov 4 features');
check('UX Agent','Guest launch and physics controls present',
  html.includes('id="guest-play"')&&html.includes('id="physics-play"')&&
  worlds.includes("physicsControl.addEventListener('click'"),
  'Source inspection; a real browser demonstration remains required');
check('XR Agent','WebXR and comfort APIs present',
  worlds.includes('VRButton.createButton(renderer)')&&worlds.includes('comfortTurn('),
  'Source inspection only; not proof of a functioning headset');
check('Runtime Agent','Meta server route and opt-in contract present',
  api.includes('cloudConsent')&&api.includes('api.meta.ai/v1/chat/completions')&&
  bridge.includes('muse-spark-1.3'),
  'Static wiring only. A successful live Meta request is a separate stage-one gate');
check('Privacy Agent','Private mode and optional cloud separation',
  main.includes('cloudEnabled=false')&&api.includes('safeInput(')&&
  html.includes("script-src 'self'"),
  'Static contract only; needs deployed security review');
check('Physics Agent','Physics and Yuka modules wired',
  worlds.includes('createNpcNavigator')&&worlds.includes('installPhysicsStage')&&
  present('src/player-motion.js'),
  'Not visual quality evidence');
check('Reproducibility Agent','Dependency lockfile',
  present('package-lock.json')||present('pnpm-lock.yaml')||present('yarn.lock'),
  'No committed lockfile found; rebuilds may resolve different dependency versions','WARNING');

if(sourceOnly){
  blocked('Execution Agent','Full npm tests','Skipped by --source-only');
  blocked('Execution Agent','Vite production build','Skipped by --source-only');
}else if(!present('node_modules')){
  blocked('Execution Agent','Full npm tests','node_modules unavailable. Run npm install before review');
  blocked('Execution Agent','Vite production build','node_modules unavailable. Run npm install before review');
}else{
  run('npm test',['test']);
  run('npm run build',['run','build']);
  run('npm run submission:check',['run','submission:check']);
}
for(const [agent,subject,detail] of [
  ['Meta Judge','Proven live Meta Model API or eligible open-weight call','HARD STAGE ONE GATE: no live execution is established by the source code. Must show successful synthetic demo with real request and response.'],
  ['Demo Judge','Public working HTTPS product','StackBlitz import preview is not a stable verified deployment.'],
  ['Demo Judge','Three-minute real demo video','Shot-list text is not recorded gameplay.'],
  ['VR Judge','Physical Quest performance and comfort','A WebXR import or Node test is not a headset test.'],
  ['Human Research Agent','Real potential-user feedback','Do not manufacture user interviews or conversion metrics.'],
  ['Provenance Agent','Oct 27-Nov 4 original work identified','Dated commits should be explicitly listed in final submission; distinguish startup baseline.']
])blocked(agent,subject,detail);

const statuses=Object.fromEntries(['PASS','FAIL','WARNING','UNVERIFIED'].map(s=>[s,results.filter(r=>r.status===s).length]));
const hardGate=results.find(x=>x.subject==='Proven live Meta Model API or eligible open-weight call');
const verdict='NO-GO: stage-one Meta evidence, real deployment and three-minute demo not yet independently verified.';
const report={schema:1,generatedAt:now,version:pkg.version||'unknown',
  mode:sourceOnly?'source-only':'runtime-when-installed',
  verdict,counts:statuses,
  externalSource:{harness2:'google-research/harness2@1cfe254e8d25b15f37048c3730134686abe60335',
    rrsi:'google-research/rrsi@be50316e1db05914068a973f322770ef08ed7ba1'},
  notes:['This local reviewer is ELSEWHERE-authored and deterministic, not an official Google review engine.',
    'Never claim that a check proves live API usage, device testing, art quality or judging placement.',
    'Only user-approved model-backed Harness2 or RRSI runs should incur inference cost.'],
  results};
if(!noWrite){
  mkdirSync(rel('review-output'),{recursive:true});
  writeFileSync(rel('review-output/review.json'),JSON.stringify(report,null,2)+'\n');
  const lines=['# ELSEWHERE review | '+now,'','**Verdict:** '+verdict,'',
    'This report never certifies Meta eligibility or game visual quality.','',
    '| Reviewer | Check | Status | Evidence |','|---|---|---|---|'];
  for(const r of results)lines.push('| '+[r.agent,r.subject,r.status,r.detail].map(v=>String(v).replace(/\|/g,'/').replace(/[\r\n]+/g,' ')).join(' | ')+' |');
  lines.push('','## Next gates','1. Verify an actual Meta model response on a synthetic player.',
    '2. Run npm install; npm test; npm run build in a network-enabled checkout.',
    '3. Record live gameplay (not a render), publish a stable HTTPS URL and disclose event-only work.',
    '4. Test one real Quest if claiming VR. Otherwise submit as desktop first.');
  writeFileSync(rel('review-output/review.md'),lines.join('\n')+'\n');
}
console.log('ELSEWHERE '+(pkg.version||'unknown')+' | '+verdict);
console.log(JSON.stringify(statuses));
for(const r of results)console.log(r.status.padEnd(11)+' '+r.agent+': '+r.subject);
console.log(noWrite?'No artifacts written.':'Report: review-output/review.md');
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
