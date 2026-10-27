import test from 'node:test';
import assert from 'node:assert/strict';
import {ENVIRONMENT_PALETTES,environmentalBudget,environmentalParticle,environmentalResponse} from '../src/environment-motion.js';
const worlds=Object.keys(ENVIRONMENT_PALETTES);
test('five different physical ambience palettes are available',()=>{
 assert.deepEqual(worlds,['future','self','past','dungeon','mech']);
 assert.equal(new Set(worlds.map(x=>ENVIRONMENT_PALETTES[x].color)).size,5);
});
test('XR and mobile particle limits never exceed desktop',()=>{
 for(const world of worlds){
  const desktop=environmentalBudget(world),xr=environmentalBudget(world,{xr:true}),mobile=environmentalBudget(world,{mobile:true});
  assert.ok(xr<=desktop);assert.ok(mobile<=desktop);assert.ok(xr<=42);assert.ok(mobile<=34);
  assert.equal(environmentalBudget(world,{reducedMotion:true}),0);
 }
 assert.equal(environmentalBudget('unknown'),0);
});
test('all environmental trajectories remain finite and bounded after long sessions',()=>{
 for(const world of worlds){for(const t of [0,.0001,1.7,23,3600,86400,Infinity,NaN]){
  for(let i=0;i<85;i++){
   const pose=environmentalParticle(world,i,t);
   for(const key of ['x','y','z','rotation','size']) assert.ok(Number.isFinite(pose[key]),`${world} ${key}`);
   assert.ok(Math.abs(pose.x)<60 && pose.y>=0 && pose.y<22 && Math.abs(pose.z)<55,`${world} pose bounds`);
   assert.ok(pose.size>=0 && pose.size<=2);
  }
 }}
});
test('future-self rain stays behind the privacy-first apartment window',()=>{
 for(let i=0;i<100;i++){const pose=environmentalParticle('self',i,i*6);assert.ok(pose.z<=-13&&pose.z>=-14.91);}
});
test('animations do not depend on non-deterministic randomness or player data',()=>{
 for(const world of worlds){assert.deepEqual(environmentalParticle(world,12,120),environmentalParticle(world,12,120));}
});
test('reduced motion means stable environment poses',()=>{
 for(const world of worlds){
  assert.deepEqual(environmentalParticle(world,8,0,{reducedMotion:true}),environmentalParticle(world,8,30,{reducedMotion:true}));
  assert.equal(environmentalResponse('plasma',0,{reducedMotion:true}),0);
 }
});
test('reaction pulse decays after one voluntary action',()=>{
 for(const action of ['choice','memory','arrival','plasma','magic','invention','impact','inspect']){
  const start=environmentalResponse(action,0);
  assert.ok(start>0 && start<=.6);
  assert.ok(environmentalResponse(action,.5)<start);
  assert.ok(environmentalResponse(action,10)<.001);
 }
});
test('ambient modules cannot access browsers, APIs, caches, or the player vault',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=(await Promise.all(['environment-motion.js','environment-stage.js'].map(n=>readFile(new URL(`../src/${n}`,import.meta.url),'utf8')))).join('\n');
 for(const banned of [/fetch\s*\(/,/localStorage/,/indexedDB/,/navigator\./,/XMLHttpRequest/,/sendBeacon/,/MODEL_API_KEY/,/document\.cookie/]) assert.doesNotMatch(source,banned);
});
