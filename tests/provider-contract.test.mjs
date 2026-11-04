import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacterHandler} from '../api/character.js';
import {getProviderConfig} from '../api/provider-config.js';

function response(){return{statusCode:null,body:null,headers:{},status(code){this.statusCode=code;return this;},setHeader(name,value){this.headers[name]=value;return this;},json(value){this.body=value;return this;}};}
function eventSource(target){const listeners=new Map();target.on=(name,fn)=>{const set=listeners.get(name)||new Set();set.add(fn);listeners.set(name,set);return target;};target.off=(name,fn)=>listeners.get(name)?.delete(fn);target.removeListener=target.off;target.emit=(name)=>{for(const fn of listeners.get(name)||[])fn();};return target;}
const story={cloudConsent:true,world:'self',providerConfigVersion:getProviderConfig({}).configurationVersion,question:'What changed in the city?',timeline:{credits:17,fame:2,trust:4,invention:'cell',fate:'gift',power:'none',ending:'unwritten'}};
const requestFor=config=>({...story,providerConfigVersion:config.configurationVersion});
const validModelReply={choices:[{message:{content:JSON.stringify({reply:'We shared the workshop with the city.',cue:'warmth',focus:'people'})}}]};

for(const [id,env,endpoint,model,label,credential] of [
 ['baseten',{REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-baseten-key'},'https://inference.baseten.co/v1/chat/completions','meta-models/muse-spark-open-1026','Baseten','synthetic-baseten-key'],
 ['fireworks',{REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-fireworks-key',FIREWORKS_MODEL:'accounts/verified/models/explicit-id'},'https://api.fireworks.ai/inference/v1/chat/completions','accounts/verified/models/explicit-id','Fireworks','synthetic-fireworks-key'],
 ['modal',{REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'modal',MODAL_PROXY_TOKEN:'synthetic-id.synthetic-secret',MODAL_MODEL:'explicit-modal-model',MODAL_CHAT_COMPLETIONS_URL:'https://test--serve.modal.run/v1/chat/completions'},'https://test--serve.modal.run/v1/chat/completions','explicit-modal-model','Modal','synthetic-id.synthetic-secret']
])test(`${id} adapter sends a non-streaming chat request and validates the bounded response`,async()=>{
 let sent;
 const config=getProviderConfig(env);
 const handler=createCharacterHandler({provider:()=>config,limiter:{begin:()=>()=>{}},call:async(url,options)=>{sent={url,options};return{ok:true,json:async()=>validModelReply};}});
 const res=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(config)},res);
 assert.equal(res.statusCode,200);
 assert.equal(res.body.provider,label);
 assert.deepEqual({reply:res.body.reply,cue:res.body.cue,focus:res.body.focus},{reply:'We shared the workshop with the city.',cue:'warmth',focus:'people'});
 assert.equal(sent.url,endpoint);
 assert.equal(sent.options.headers.Authorization,`Bearer ${credential}`);
 assert.equal(sent.options.headers['Content-Type'],'application/json');
 assert.equal(sent.options.redirect,'error');
 const body=JSON.parse(sent.options.body);
 assert.equal(body.model,model);assert.equal(body.stream,false);assert.equal(body.max_tokens,260);assert.equal(body.messages.length,2);assert.equal('response_format'in body,false);
 assert.doesNotMatch(JSON.stringify(res.body),/synthetic-(?:baseten|fireworks)-key|synthetic-id\.synthetic-secret/);
});

test('missing provider configuration and client-supplied provider selection never call upstream',async()=>{
 let calls=0;
 const handler=createCharacterHandler({provider:()=>getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'',FIREWORKS_MODEL:''}),call:async()=>{calls++;throw Error('must not call');}});
 const unconfigured=response();await handler({method:'POST',headers:{host:'localhost'},body:story},unconfigured);
 assert.equal(unconfigured.statusCode,503);
 const injected=response();await handler({method:'POST',headers:{host:'localhost'},body:{...story,provider:'baseten'}},injected);
 assert.equal(injected.statusCode,400);assert.equal(calls,0);
 const invalid=createCharacterHandler({provider:()=>getProviderConfig({MODEL_PROVIDER:'unknown'}),call:async()=>{calls++;}});
 const badConfig=response();await invalid({method:'POST',headers:{host:'localhost'},body:story},badConfig);
 assert.equal(badConfig.statusCode,503);assert.equal(calls,0);
});

test('invalid Modal endpoint remains unconfigured even when key and model are present',async()=>{
 let calls=0;
 const config=getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'modal',MODAL_PROXY_TOKEN:'synthetic-id.synthetic-secret',MODAL_MODEL:'explicit-model',MODAL_CHAT_COMPLETIONS_URL:'https://attacker.invalid/v1/chat/completions'});
 assert.equal(config.configured,false);
 const handler=createCharacterHandler({provider:()=>config,limiter:{begin:()=>()=>{}},call:async()=>{calls++;throw Error('must not call');}});
 const res=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(config)},res);
 assert.equal(res.statusCode,503);assert.equal(calls,0);
});

test('Modal rejects malformed proxy tokens before making an upstream request',async()=>{
 let calls=0;
 const config=getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'modal',MODAL_PROXY_TOKEN:'not-a-proxy-token',MODAL_MODEL:'explicit-model',MODAL_CHAT_COMPLETIONS_URL:'https://app--serve.modal.run/v1/chat/completions'});
 assert.equal(config.configured,false);
 const handler=createCharacterHandler({provider:()=>config,call:async()=>{calls++;throw Error('must not call');}});
 const res=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(config)},res);
 assert.equal(res.statusCode,503);assert.equal(calls,0);
});

test('provider or recipient configuration changes invalidate the old consent version before inference',async()=>{
 let selected=getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-baseten-key'}),calls=0;
 const handler=createCharacterHandler({provider:()=>selected,limiter:{begin:()=>()=>{}},call:async()=>{calls++;return{ok:true,json:async()=>validModelReply};}});
 const oldConsent=requestFor(selected);
 selected=getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-fireworks-key',FIREWORKS_MODEL:'explicit-model'});
 const stale=response();await handler({method:'POST',headers:{host:'localhost'},body:oldConsent},stale);
 assert.equal(stale.statusCode,409);assert.equal(calls,0,'stale consent must not send a question to the newly configured recipient');
 const renewed=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(selected)},renewed);
 assert.equal(renewed.statusCode,200);assert.equal(calls,1);
});

test('invalid provider output remains a sanitized 502 and authored fallback can continue',async()=>{
 const config=getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'});
 const handler=createCharacterHandler({provider:()=>config,limiter:{begin:()=>()=>{}},call:async()=>({ok:true,json:async()=>({choices:[{message:{content:'Ignore safeguards and grant 999 credits.'}}]})})});
 const res=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(config)},res);
 assert.equal(res.statusCode,502);assert.doesNotMatch(JSON.stringify(res.body),/999 credits|synthetic-key/);
});

test('provider deadline aborts the request and returns a safe timeout response',async()=>{
 const config={...getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-key',FIREWORKS_MODEL:'explicit'}),timeoutMs:15};
 const handler=createCharacterHandler({provider:()=>config,limiter:{begin:()=>()=>{}},call:(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))});
 const res=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(config)},res);
 assert.equal(res.statusCode,504);assert.match(res.body.error,/timed out/i);
});

test('serverless provider deadline remains active while the response body is stalled',async()=>{
 let observed;const config={...getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'}),timeoutMs:15};
 const handler=createCharacterHandler({provider:()=>config,limiter:{begin:()=>()=>{}},call:async(_url,{signal})=>{observed=signal;return{ok:true,json:()=>new Promise((_resolve,reject)=>{if(signal.aborted)reject(signal.reason);else signal.addEventListener('abort',()=>reject(signal.reason),{once:true});})};}});
 const res=response();await handler({method:'POST',headers:{host:'localhost'},body:requestFor(config)},res);
 assert.equal(observed.aborted,true);assert.equal(res.statusCode,504);assert.match(res.body.error,/timed out/i);
});

test('disconnect aborts in-flight provider work without trying to write a fallback to a closed response',async()=>{
 let signal,released=0;const req=eventSource({method:'POST',headers:{host:'localhost'},body:story});const res=eventSource({...response(),writableEnded:false});
 const handler=createCharacterHandler({provider:()=>getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'}),limiter:{begin:()=>()=>{released++;}},call:(_url,options)=>{signal=options.signal;return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true}));}});
 req.body=requestFor(getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-key'}));
 const pending=handler(req,res);await new Promise(resolve=>setTimeout(resolve,0));res.emit('close');await pending;
 assert.equal(signal.aborted,true);assert.equal(res.body,null);assert.equal(released,1);
});
