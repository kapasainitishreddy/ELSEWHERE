import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPERIENCES,EXPERIENCES_ORDER,createStillwaterSession,progressStillwater,stillwaterView} from '../src/stillwater.js';
test('four nonclinical optional narratives have valid private decisions',()=>{
 for(const id of EXPERIENCES_ORDER){
  const first=progressStillwater(createStillwaterSession(),id);assert.equal(first.phase,'choose');
  for(const choice of EXPERIENCES[id].options){
   const last=progressStillwater(first,choice.id);assert.equal(last.phase,'reflection');
   assert.ok(stillwaterView(last).body.length>60);
   assert.equal(progressStillwater(last,'restart').phase,'welcome');
  }
 }
});
test('invalid actions never advance the experience',()=>{
 const a=createStillwaterSession();
 assert.deepEqual(progressStillwater(a,'__proto__'),a);
 assert.deepEqual(progressStillwater(a,'invalid'),a);
 assert.equal(stillwaterView({phase:'reflection',mode:'__proto__',choice:'x'}).phase,'welcome');
});
test('stillwater does not read sensors, network or storage',async()=>{
 const {readFile}=await import('node:fs/promises');
 const code=await readFile(new URL('../src/stillwater.js',import.meta.url),'utf8');
 assert.doesNotMatch(code,/\b(fetch|localStorage|sessionStorage|XMLHttpRequest|getUserMedia|indexedDB)\s*\(/);
});
