import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchMetaJson} from '../api/meta-request.js';

test('local Meta proxy timeout remains active while the upstream body is stalled',async()=>{
 let observedSignal;
 const fetchImpl=async(_url,options)=>{
  observedSignal=options.signal;
  return {ok:true,json:()=>new Promise((_resolve,reject)=>{
   if(options.signal.aborted)reject(options.signal.reason);
   else options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
  })};
 };
 await assert.rejects(fetchMetaJson(fetchImpl,'https://synthetic.invalid/model',{},15),{name:'AbortError'});
 assert.equal(observedSignal.aborted,true);
});

test('Meta proxy returns parsed response without retaining the abort timer',async()=>{
 const result=await fetchMetaJson(async()=>({ok:true,status:200,json:async()=>({choices:[]})}),'https://synthetic.invalid/model',{},50);
 assert.equal(result.response.status,200);
 assert.deepEqual(result.data,{choices:[]});
});
