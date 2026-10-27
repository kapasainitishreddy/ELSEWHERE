import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gaitAccent} from '../src/gait-accent.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('gait is bounded, finite and respects reduced motion',()=>{
 for(let speed of [0,.1,1,3,4.6,7.8,100,NaN]){
  for(let t of [0,.01,1,5,Infinity,NaN]){
   const g=gaitAccent(speed,t);assert.ok(Object.values(g).every(Number.isFinite));
   assert.ok(g.lift>=0&&g.lift<=.04);assert.ok(Math.abs(g.lean)<=.022);
   assert.ok(Math.abs(g.roll)<=.018);
   assert.deepEqual(gaitAccent(speed,t,{reducedMotion:true}),{lift:0,lean:0,roll:0,weight:0});
  }
 }
});
test('original character finishing is integrated into rigged actors without external model loading',()=>{
 const actor=read('src/actor-studio.js'),art=read('src/character-finish.js');
 assert.match(actor,/createCharacterFinish\(THREE,/);
 assert.match(actor,/finishing\.update\(time/);
 assert.match(actor,/visual\.position\.y=gait\.lift/);
 assert.match(actor,/head\.rotation\.x=THREE\.MathUtils\.clamp/);
 assert.match(art,/softShadowTexture\(THREE/);
 assert.match(art,/createCharacterFinish/);
 assert.doesNotMatch(art,/\bfetch\s*\(|localStorage|sendBeacon|XMLHttpRequest|https?:\/\//);
});
test('walking animation and cinematic light directions are author-controlled',()=>{
 const actor=read('src/actor-choreography.js'),worlds=read('src/worlds.js');
 assert.match(actor,/duration: \.83,spineZ:/);
 assert.match(worlds,/actor\.mixer\.timeScale=moving\?/);
 assert.match(worlds,/const edge=new THREE\.DirectionalLight/);
 assert.match(worlds,/renderer\.toneMappingExposure=1\.13/);
});
