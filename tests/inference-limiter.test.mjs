import test from 'node:test';
import assert from 'node:assert/strict';
import {createInferenceLimiter} from '../api/rate-limit.js';
import {createCharacterHandler} from '../api/character.js';
function mockResponse(){return {statusCode:0,body:null,headers:{},status(n){this.statusCode=n;return this},setHeader(k,v){this.headers[k]=v;return this},json(o){this.body=o;return this}}}
const request={method:'POST',headers:{host:'elsewhere.test',origin:'https://elsewhere.test','x-real-ip':'203.0.113.2'},body:{cloudConsent:true,world:'self',question:'How are we?',timeline:{credits:1,fame:0,trust:0,invention:'cell',fate:'gift',power:null,ending:null}}};
test('anonymous inference has an independent per-client budget and concurrency cap',()=>{
 let time=1000;const limiter=createInferenceLimiter({calls:2,concurrent:1,windowMs:3000,clock:()=>time});
 const one=limiter.begin('alpha');assert.equal(typeof one,'function');assert.equal(limiter.begin('beta'),null);
 one();const two=limiter.begin('alpha');assert.equal(typeof two,'function');two();two();
 assert.equal(limiter.current().active,0);assert.equal(limiter.begin('alpha'),null);
 const other=limiter.begin('beta');assert.equal(typeof other,'function');other();
 time=5000;assert.equal(typeof limiter.begin('alpha'),'function');
});
test('API rejects calls beyond demo capacity before contacting Meta',async()=>{
 let calls=0;
 const limiter=createInferenceLimiter({calls:1,concurrent:1});
 const handler=createCharacterHandler({key:()=> 'example-key',limiter,call:async()=>{calls++;return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reply:'It is peaceful today.',cue:'quiet'})}}]})}}});
 const r1=mockResponse();await handler(request,r1);assert.equal(r1.statusCode,200);assert.equal(r1.body.cue,'quiet');
 const r2=mockResponse();await handler(request,r2);assert.equal(r2.statusCode,429);assert.equal(calls,1);
});
