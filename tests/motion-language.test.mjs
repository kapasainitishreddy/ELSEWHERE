import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp01, easeOutCubic, easeInOutCubic, damp, angleTo, characterPose, classifyMoment, interactionHint, chooseNearby, fxBudget} from '../src/motion-language.js';
test('smooth easing is bounded and monotonic',()=>{
 for(const fn of [easeOutCubic,easeInOutCubic]){
  assert.equal(fn(-3),0);assert.equal(fn(4),1);
  let previous=0;
  for(let i=0;i<=100;i++){let v=fn(i/100);assert.ok(v>=previous && v<=1);previous=v;}
 }
 assert.equal(clamp01(Infinity),0);
});
test('damping remains stable over varied frame rates and rejects NaN',()=>{
 let a=0,b=0;for(let i=0;i<60;i++)a=damp(a,20,6,1/60);
 for(let i=0;i<30;i++)b=damp(b,20,6,1/30);
 assert.ok(Math.abs(a-b)<1e-8);assert.ok(a>19.9);
 assert.equal(damp(NaN,10,5,.1),10);
 const r=angleTo(Math.PI-.1,-Math.PI+.1,5,.05);
 assert.ok(r>Math.PI-.1 && r<Math.PI+.1);
});
test('future-self gestures are finite and expressive across listening and speaking',()=>{
 for(const mode of ['idle','speaking','listening','walking','warm'])for(let t=0;t<30;t+=.1){
  const p=characterPose(t,mode,7);for(const x of Object.values(p))assert.ok(Number.isFinite(x));
  assert.ok(p.eye>=.07 && p.eye<=1);
 }
 assert.ok(characterPose(1,'speaking').mouth>0);
 assert.equal(characterPose(1,'idle').mouth,0);
 assert.ok(Math.abs(characterPose(1,'walking').stride)>0);
});
test('scene feedback uses choices and world context',()=>{
 assert.equal(classifyMoment({title:'Pulse fired'},'mech'),'plasma');
 assert.equal(classifyMoment({title:'The Warden retaliates'},'dungeon'),'impact');
 assert.equal(classifyMoment({title:'You have invented a clock'},'past'),'invention');
 assert.equal(classifyMoment({title:'A memory returns'},'self'),'memory');
 assert.equal(classifyMoment({title:'You cross the portal'},'future'),'arrival');
});
test('nearby interaction selects closest valid target and exposes clear prompt',()=>{
 const p=chooseNearby([{x:0,z:3,action:{type:'world',world:'past'}},{x:0,z:1,action:{type:'inspect',label:'Moon Reliquary'}}],0,0,3.5);
 assert.equal(p.action.type,'inspect');assert.equal(interactionHint(p.action),'EXAMINE MOON RELIQUARY');
 assert.equal(interactionHint({type:'world',world:'past'},{past:'First Spark'}),'ENTER FIRST SPARK');
 assert.equal(chooseNearby([{x:100,z:100,action:{type:'inspect'}}],0,0),null);
});
test('effect budget protects reduced motion and headset performance',()=>{
 assert.equal(fxBudget({reducedMotion:true}).sparks,0);
 assert.ok(fxBudget({xr:true}).sparks<fxBudget({}).sparks);
 assert.ok(fxBudget({xr:true}).maxConcurrent<=4);
});
