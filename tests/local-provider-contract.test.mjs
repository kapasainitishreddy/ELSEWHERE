import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createModelProxyHandler} from '../server.mjs';
import {getProviderConfig} from '../api/provider-config.js';

const payload={cloudConsent:true,world:'self',question:'How did the invention change the city?',timeline:{credits:5,fame:1,trust:2,invention:'cell',fate:'gift',power:'none',ending:'unwritten'}};
const modelBody={choices:[{message:{content:JSON.stringify({reply:'The workshop stayed open.',cue:'warmth',focus:'people'})}}]};
class Req extends EventEmitter{constructor(body){super();this.method='POST';this.url='/api/character';this.socket={remoteAddress:'127.0.0.1'};this.body=body;this.aborted=false;}async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify(this.body));}}
class Res extends EventEmitter{constructor(){super();this.headers={};this.writableEnded=false;this.destroyed=false;}writeHead(status,headers){this.status=status;this.headers=headers;}end(body){this.writableEnded=true;this.body=JSON.parse(body);}}

for(const [providerEnv,endpoint,model,authorization,label] of [
 [{MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'},'https://inference.baseten.co/v1/chat/completions','meta-models/muse-spark-open-1026','Bearer synthetic-key','Baseten'],
 [{MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-key',FIREWORKS_MODEL:'verified/model-id'},'https://api.fireworks.ai/inference/v1/chat/completions','verified/model-id','Bearer synthetic-key','Fireworks'],
 [{MODEL_PROVIDER:'modal',MODAL_PROXY_TOKEN:'synthetic-id.synthetic-secret',MODAL_MODEL:'configured-modal-model',MODAL_CHAT_COMPLETIONS_URL:'https://app--serve.modal.run/v1/chat/completions'},'https://app--serve.modal.run/v1/chat/completions','configured-modal-model','Bearer synthetic-id.synthetic-secret','Modal']
])test(`local bridge uses the same ${label} endpoint, model, auth, and response contract`,async()=>{
 let sent;
 const handler=createModelProxyHandler({provider:getProviderConfig(providerEnv),limiter:()=>false,fetchImpl:async(url,options)=>{sent={url,options};return{ok:true,json:async()=>modelBody};}});
 const res=new Res();await handler(new Req(payload),res);
 assert.equal(res.status,200);assert.equal(res.body.provider,label);assert.equal(res.body.model,undefined,'configured model ID stays server-side');
 assert.equal(sent.url,endpoint);assert.equal(sent.options.headers.Authorization,authorization);
 const body=JSON.parse(sent.options.body);assert.equal(body.model,model);assert.equal(body.stream,false);assert.equal(body.max_tokens,260);assert.equal('response_format'in body,false);assert.equal(body.messages.length,2);
});

test('local bridge deadline covers the upstream body and returns a bounded timeout response',async()=>{
 const config={...getProviderConfig({MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'}),timeoutMs:15};
 const handler=createModelProxyHandler({provider:config,limiter:()=>false,fetchImpl:(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))});
 const res=new Res();await handler(new Req(payload),res);
 assert.equal(res.status,504);assert.match(res.body.error,/timed out/i);
});

test('local bridge cancels an in-flight upstream body after the browser disconnects',async()=>{
 let observed;const config=getProviderConfig({MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'});
 const handler=createModelProxyHandler({provider:config,limiter:()=>false,fetchImpl:(_url,{signal})=>{observed=signal;return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));}});
 const req=new Req(payload),res=new Res();const pending=handler(req,res);
 await new Promise(resolve=>setTimeout(resolve,0));res.emit('close');await pending;
 assert.equal(observed.aborted,true);assert.equal(res.body,undefined);assert.equal(res.writableEnded,false);
});
