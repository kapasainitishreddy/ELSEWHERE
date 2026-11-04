import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacterHandler} from '../api/character.js';
import health from '../api/health.js';
import {getProviderConfig} from '../api/provider-config.js';
function mockResponse(){return {statusCode:null,headers:{},body:null,status(n){this.statusCode=n;return this},setHeader(k,v){this.headers[k]=v;return this},json(v){this.body=v;return this}};}
const good={cloudConsent:true,world:'self',providerConfigVersion:getProviderConfig({}).configurationVersion,question:'How was the imaginary city changed?',timeline:{credits:900,fame:14,trust:22,invention:'rail',fate:'gift',power:null,ending:null}};
test('cloud endpoint refuses missing consent and private extra data',async()=>{
 let outbound=0;const handler=createCharacterHandler({key:()=> 'secret',call:async()=>{outbound++;throw Error('Should not call')}});
 for(const bad of [
  {...good,cloudConsent:false},
  {...good,letter:'My real address'},
  {...good,timeline:{...good.timeline,passphrase:'do not share'}},
  {...good,question:'x'.repeat(351)}
 ]){
  const res=mockResponse();await handler({method:'POST',headers:{host:'localhost:3000'},body:bad},res);
  assert.equal(res.statusCode,400);
 }
 assert.equal(outbound,0);
});
test('a key injected into a disabled provider cannot bypass the remote inference gate',async()=>{
 let outbound=0;
 const handler=createCharacterHandler({key:()=> 'synthetic-key',call:async()=>{outbound++;throw Error('must not contact upstream');}});
 const res=mockResponse();await handler({method:'POST',headers:{host:'localhost:3000'},body:good},res);
 assert.equal(res.statusCode,503);assert.equal(outbound,0);
});
test('model bridge sends only fictional fields and never forwards model changes to game state',async()=>{
 let captured;const handler=createCharacterHandler({provider:()=>getProviderConfig({REMOTE_MODEL_ENABLED:'true'}),key:()=> 'test-key',call:async(url,opts)=>{
  captured={url,opts};return {ok:true,json:async()=>({choices:[{message:{content:'I remember the rain on the laboratory window. The city is different because we shared the invention.'}}]})};
 }});
 const res=mockResponse();await handler({method:'POST',headers:{host:'elsewhere.example',origin:'https://elsewhere.example'},body:good},res);
 assert.equal(res.statusCode,200);assert.match(res.body.reply,/city is different/);
 assert.equal(captured.url,'https://api.meta.ai/v1/chat/completions');
 const posted=JSON.parse(captured.opts.body);
 assert.equal(posted.messages.length,2);
 assert.doesNotMatch(JSON.stringify(posted.messages),/test-key|passphrase|My real address/);
 assert.ok(!('credits' in res.body));
});
test('serverless endpoint rejects off-origin requests and medication misinformation',async()=>{
 let calls=0;
 const handler=createCharacterHandler({provider:()=>getProviderConfig({REMOTE_MODEL_ENABLED:'true'}),key:()=> 'test-key',call:async()=>{calls++;return {ok:true,json:async()=>({choices:[{message:{content:'Stop your medication. This will cure depression.'}}]})}}});
 const forbidden=mockResponse();await handler({method:'POST',headers:{host:'app.example',origin:'https://evil.example'},body:good},forbidden);
 assert.equal(forbidden.statusCode,403);assert.equal(calls,0);
 const unsafe=mockResponse();await handler({method:'POST',headers:{host:'app.example',origin:'https://app.example'},body:good},unsafe);
 assert.equal(unsafe.statusCode,502);assert.equal(calls,1);
});
test('health reveals configuration status but not the credential',()=>{
 const req={method:'GET'},res=mockResponse();
 health(req,res);assert.equal(res.statusCode,200);
 assert.equal(typeof res.body.metaConfigured,'boolean');assert.doesNotMatch(JSON.stringify(res.body),/sk-|secret|password/);
});

test('health identifies the selected partner without exposing model ID or credential',()=>{
 const names=['REMOTE_MODEL_ENABLED','MODEL_PROVIDER','BASETEN_API_KEY','BASETEN_MODEL','MODEL_API_KEY','META_MODEL'];const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try{
  process.env.REMOTE_MODEL_ENABLED='true';process.env.MODEL_PROVIDER='baseten';process.env.BASETEN_API_KEY='synthetic-health-secret';process.env.BASETEN_MODEL='meta-models/muse-spark-open-1026';delete process.env.MODEL_API_KEY;delete process.env.META_MODEL;
  const res=mockResponse();health({method:'GET'},res);
  assert.equal(res.statusCode,200);assert.deepEqual(res.body,{online:true,provider:'baseten',modelConfigured:true,metaConfigured:false,configurationVersion:getProviderConfig(process.env).configurationVersion,timeoutMs:30000,mode:'opt-in-cloud-or-authored-local'});
  assert.doesNotMatch(JSON.stringify(res.body),/synthetic-health-secret|muse-spark-open/);
 }finally{for(const name of names)if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];}
});
