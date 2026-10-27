import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {characterSeed,performanceFrame,portalFrame,combatFrame} from '../src/performance-direction.js';
import {visualBeat} from '../src/cinematic-beats.js';

const source=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('each inhabitant has deterministic non-synchronous micro-acting',()=>{
 const ada=characterSeed('ada'),sol=characterSeed('sol');
 assert.equal(ada,characterSeed('ada'));assert.notEqual(ada,sol);
 const first=performanceFrame(17.45,{mode:'speaking',identity:'ada',mood:'grateful',distance:2});
 const second=performanceFrame(17.45,{mode:'speaking',identity:'ada',mood:'grateful',distance:2});
 assert.deepEqual(first,second);
 assert.notDeepEqual(first,performanceFrame(17.45,{mode:'speaking',identity:'sol',distance:2}));
 assert.ok(first.eyelid>=.1&&first.eyelid<=1);
 assert.ok(first.mouth>.01&&first.mouth<=.65);
 assert.ok(Math.abs(first.headYaw)<=.11);
 assert.ok(Math.abs(first.eyeX)<=.047);
});

test('reduced motion means still faces, no mouth oscillations, and no blinking',()=>{
 const params={identity:'future-self',mode:'speaking',mood:'grateful',distance:2,reducedMotion:true};
 assert.deepEqual(performanceFrame(4,params),performanceFrame(45,params));
 const still=performanceFrame(6,params);
 assert.equal(still.eyelid,1);assert.equal(still.mouth,0);assert.equal(still.chest,0);
 const p1=portalFrame(0,1,{reducedMotion:true}),p2=portalFrame(123,1,{reducedMotion:true});
 assert.deepEqual(p1,p2);
 assert.deepEqual(combatFrame(0,5,{reducedMotion:true}),combatFrame(44,5,{reducedMotion:true}));
});

test('portals react to proximity without extreme intensity or artificial camera movement',async()=>{
 for(let t=0;t<100;t+=.17){
  const near=portalFrame(t,1),far=portalFrame(t,25);
  assert.ok(near.proximity>=far.proximity);
  assert.ok(near.glow>=far.glow);
  assert.ok(near.glow<=1.8);
  assert.ok(near.radius>=.97&&near.radius<=1.08);
  const attack=combatFrame(t,3);
  assert.ok(Math.abs(attack.hover)<=.25&&Math.abs(attack.yaw)<=.22);
 }
 const scene=await source('src/worlds.js');
 assert.match(scene,/portalFrame\(time,distance/);
 assert.match(scene,/buildPortal\(world,all\[i\],x,-20\.5,targets,animated,\(\)=>playerPos,reduceMotion\)/);
 assert.match(scene,/const cruiseY=vehicle\.position\.y/);
 assert.doesNotMatch(scene,/vehicle\.position\.y\s*\+=/);
});

test('plasma attacks show projectile travel before impact and finish fully',()=>{
 const launch=visualBeat('plasma',0),mid=visualBeat('plasma',.52),finish=visualBeat('plasma',1);
 assert.ok(launch.projectileZ>=8.5);
 assert.ok(launch.projectileAlpha>.5);
 assert.equal(launch.waveAlpha,0);
 assert.ok(mid.waveAlpha>.05);
 assert.equal(mid.projectileAlpha,0);
 assert.ok(finish.waveAlpha<1e-12);
 assert.equal(finish.projectileAlpha,0);
 for(const kind of ['arrival','memory','magic','impact','plasma','choice']){
  for(const p of [-1,0,.1,.2,.5,.9,1,2,Infinity,NaN]){
   const v=visualBeat(kind,p);
   assert.ok(Object.values(v).every(Number.isFinite));
   assert.ok(v.waveAlpha>=0&&v.waveAlpha<=1);
  }
 }
});

test('animation direction and kinetic feedback never send personal information',async()=>{
 for(const p of ['src/performance-direction.js','src/cinematic-beats.js','src/actor-studio.js','src/kinetic-effects.js']){
  const sourceCode=await source(p);
  assert.doesNotMatch(sourceCode,/\b(?:fetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|localStorage|sessionStorage|MediaRecorder|speechSynthesis)\b/);
  assert.doesNotMatch(sourceCode,/https?:\/\//);
 }
 const actor=await source('src/actor-studio.js');
 assert.match(actor,/performanceFrame\(time/);
 assert.match(actor,/mouthInterior/);
 assert.match(actor,/contactShadow/);
 const fx=await source('src/kinetic-effects.js');
 assert.match(fx,/visualBeat\(item\.kind,life/);
 assert.match(fx,/projectile\.position\.z=beat\.projectileZ/);
 assert.match(fx,/budget\.maxConcurrent/);
});

test('future-self presentation can show a fictional projected alternate life',async()=>{
 const world=await source('src/worlds.js');
 assert.match(world,/if\(state\.invention && state\.fate\)/);
 assert.match(world,/identity:'possible-life-projection'/);
 assert.match(world,/echoActor\.update\(t,dt,\{reducedMotion:dt===0\}\)/);
 assert.match(world,/setDialogueActivity\('delighted',2\)/);
 assert.doesNotMatch(world,/vehicle\.position\.y\s*\+=/);
});

test('XR transitions reduce particles rather than carrying desktop FX cost into Quest',async()=>{
 const code=await source('src/worlds.js');
 assert.match(code,/function switchFeedbackProfile\(xr\)/);
 assert.match(code,/switchFeedbackProfile\(true\)/);
 assert.match(code,/switchFeedbackProfile\(false\)/);
 assert.match(code,/fx\?\.dispose\(\);\s*fx=createKineticEffects\(world,\{xr,reducedMotion/);
 const {fxBudget}=await import('../src/motion-language.js');
 assert.ok(fxBudget({xr:true}).sparks<fxBudget({xr:false}).sparks);
 assert.ok(fxBudget({xr:true}).maxConcurrent<fxBudget({xr:false}).maxConcurrent);
});
