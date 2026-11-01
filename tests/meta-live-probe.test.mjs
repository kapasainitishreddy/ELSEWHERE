import test from 'node:test';
import assert from 'node:assert/strict';
import {runSyntheticProbe} from '../tools/review/meta-live-probe.mjs';
const content=JSON.stringify({reply:'We shared the invention, and public workshops grew around it.',cue:'warmth',focus:'people'});
const fixtures=[
 {MODEL_API_KEY:'synthetic-private-key'},
 {MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-private-key'},
 {MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-private-key',FIREWORKS_MODEL:'explicit-meta-model'},
 {MODEL_PROVIDER:'modal',MODAL_PROXY_TOKEN:'id.synthetic-private-key',MODAL_MODEL:'explicit-meta-model',MODAL_CHAT_COMPLETIONS_URL:'https://app--serve.modal.run/v1/chat/completions'}
];
test('probe cannot call a provider or write a receipt without explicit live invocation',async()=>{
 let calls=0;const result=await runSyntheticProbe({env:fixtures[1],call:async()=>{calls++;throw Error('unexpected');}});
 assert.equal(calls,0);assert.equal(result.exitCode,0);assert.equal(result.receipt,null);
});
test('missing or invalid provider configuration makes no request and exposes no configuration value',async()=>{
 for(const env of [{},{MODEL_PROVIDER:'unknown-sensitive-value'},{MODEL_PROVIDER:'modal',MODAL_PROXY_TOKEN:'malformed'}]){
  let calls=0;const result=await runSyntheticProbe({live:true,env,call:async()=>{calls++;}});
  assert.equal(calls,0);assert.equal(result.exitCode,2);assert.equal(result.receipt,null);assert.doesNotMatch(result.message,/unknown-sensitive-value|malformed/);
 }
});
for(const env of fixtures)test(`synthetic ${env.MODEL_PROVIDER||'meta'} probe passes actual handler consent and makes exactly one bounded request`,async()=>{
 let calls=0;const result=await runSyntheticProbe({live:true,env,call:async(_url,init)=>{
  calls++;assert.equal(init.redirect,'error');assert(init.signal instanceof AbortSignal);
  const body=JSON.parse(init.body);assert.equal(body.messages.length,2);assert.equal(body.max_tokens,260);
  return {ok:true,status:200,json:async()=>({choices:[{message:{content}}]})};
 }});
 assert.equal(calls,1);assert.equal(result.exitCode,0);assert.equal(result.receipt.upstreamRequests,1);assert.equal(result.receipt.upstreamStatus,200);assert.equal(result.receipt.handlerStatus,200);assert.equal(result.receipt.schemaValid,true);assert.equal(typeof result.receipt.configuredModel,'string');assert.equal(result.receipt.model,undefined,'requested model is not reported as verified identity');
 assert.doesNotMatch(JSON.stringify(result.receipt),/synthetic-private-key|public workshops grew|how did gifting|Authorization/);
});
test('safe text fallback is dialogue evidence but cannot pass the directed-focus schema gate',async()=>{
 const result=await runSyntheticProbe({live:true,env:fixtures[1],call:async()=>({ok:true,status:200,json:async()=>({choices:[{message:{content:'We shared the invention with the city.'}}]})})});
 assert.equal(result.exitCode,1);assert.equal(result.receipt.dialogueValid,true);assert.equal(result.receipt.schemaValid,false);
});
test('auth/rate failures and thrown network errors produce sanitized receipts without retries',async()=>{
 for(const status of [401,429,503,'throw']){
  let calls=0;const result=await runSyntheticProbe({live:true,env:fixtures[1],call:async()=>{calls++;if(status==='throw')throw Error('private-key raw upstream error');return {ok:false,status};}});
  assert.equal(calls,1);assert.equal(result.exitCode,1);assert.equal(result.receipt.success,false);assert.equal(result.receipt.upstreamStatus,status==='throw'?null:status);
  assert.doesNotMatch(JSON.stringify(result),/private-key|raw upstream error/);
 }
});
