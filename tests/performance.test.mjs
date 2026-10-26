import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrameSampler,describeFrame} from '../src/performance.js';
test('frame sampler computes FPS and p95 from stable simulations, bounded memory',()=>{
 const s=createFrameSampler(30);for(let i=0;i<100;i++)s.add(1/72);
 const r=s.snapshot();assert.equal(r.frames,30);assert.equal(r.fps,72);assert.ok(r.p95Ms>=13);
 assert.match(describeFrame(r,{xr:true,calls:20,triangles:31000}),/XR · 72 FPS/);
 s.clear();assert.equal(s.snapshot().frames,0);
});
test('performance sampler drops unrealistically large and nonfinite frames',()=>{
 const s=createFrameSampler();for(const x of [0,NaN,Infinity,-1,.7])s.add(x);
 assert.equal(s.snapshot().frames,0);
 s.add(.016);assert.equal(s.snapshot().frames,1);
});
