import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createServer} from 'node:http';
import {createServer as createViteServer} from 'vite';
import {createModelProxyHandler} from '../server.mjs';
import {getProviderConfig} from '../api/provider-config.js';

const provider=getProviderConfig({REMOTE_MODEL_ENABLED:'true',MODEL_API_KEY:'synthetic-security-test-key'});
const payload={cloudConsent:true,world:'self',question:'What changed in this fictional city?',timeline:{invention:'cell',fate:'gift'},providerConfigVersion:provider.configurationVersion};
const headers={origin:'http://127.0.0.1:5173',host:'127.0.0.1:5173','content-type':'application/json'};
const modelBody={choices:[{message:{content:JSON.stringify({reply:'The workshop stayed open.',cue:'quiet',focus:'people'})}}]};
class Req extends EventEmitter{
 constructor(requestHeaders=headers){super();this.method='POST';this.url='/api/character';this.headers=requestHeaders;this.socket={remoteAddress:'127.0.0.1'};this.bodyReads=0;}
 async *[Symbol.asyncIterator](){this.bodyReads++;yield Buffer.from(JSON.stringify(payload));}
}
class Res extends EventEmitter{
 constructor(){super();this.writableEnded=false;this.destroyed=false;}
 writeHead(status,responseHeaders){this.status=status;this.headers=responseHeaders;}
 end(body){this.writableEnded=true;this.body=JSON.parse(body);}
}
function fixture(selected=provider){
 const calls={limit:0,upstream:0};
 const handler=createModelProxyHandler({provider:selected,limiter:()=>{calls.limit++;return false;},fetchImpl:async()=>{calls.upstream++;return{ok:true,json:async()=>modelBody};}});
 return{handler,calls};
}

for(const [name,requestHeaders,status] of [
 ['foreign simple POST',{...headers,origin:'https://unrelated.example','content-type':'text/plain'},403],
 ['missing Origin',{host:headers.host,'content-type':'application/json'},403],
 ['opaque Origin',{...headers,origin:'null'},403],
 ['Origin array',{...headers,origin:[headers.origin]},403],
 ['duplicate Origins',{...headers,origin:`${headers.origin}, https://unrelated.example`},403],
 ['loopback lookalike',{...headers,origin:'http://localhost.attacker.example:5173'},403],
 ['matching attacker Host and Origin',{...headers,origin:'http://attacker.example:5173',host:'attacker.example:5173'},403],
 ['userinfo Origin',{...headers,origin:'http://attacker@localhost:5173'},403],
 ['Origin path',{...headers,origin:`${headers.origin}/`},403],
 ['Origin query',{...headers,origin:`${headers.origin}?x=1`},403],
 ['Origin fragment',{...headers,origin:`${headers.origin}#x`},403],
 ['unapproved port',{...headers,origin:'http://127.0.0.1:5190',host:'127.0.0.1:5190'},403],
 ['HTTPS Origin',{...headers,origin:'https://127.0.0.1:5173'},403],
 ['plain text from local Origin',{...headers,'content-type':'text/plain'},415],
 ['form encoding',{...headers,'content-type':'application/x-www-form-urlencoded'},415],
 ['JSON prefix lookalike',{...headers,'content-type':'application/jsonp'},415],
 ['duplicate media types',{...headers,'content-type':'application/json, text/plain'},415],
 ['media-type array',{...headers,'content-type':['application/json']},415],
 ['missing media type',{origin:headers.origin,host:headers.host},415]
])test(`local bridge rejects ${name} before reading or spending`,async()=>{
 const {handler,calls}=fixture(),req=new Req(requestHeaders),res=new Res();
 await handler(req,res);
 assert.equal(res.status,status);assert.equal(req.bodyReads,0);
 assert.deepEqual(calls,{limit:0,upstream:0});
 assert.equal(res.headers['Cache-Control'],'no-store');
 assert.equal(res.headers['Access-Control-Allow-Origin'],undefined);
});

for(const origin of ['http://localhost:5173','http://127.0.0.1:5173','http://localhost:5189','http://127.0.0.1:5189'])test(`local bridge preserves JSON requests through ${origin}`,async()=>{
 const {handler,calls}=fixture(),req=new Req({origin,host:new URL(origin).host,'content-type':'Application/JSON; charset=utf-8'}),res=new Res();
 await handler(req,res);
 assert.equal(res.status,200);assert.equal(req.bodyReads,1);assert.equal(calls.upstream,1);assert.equal(calls.limit,1);
 assert.equal(res.body.reply,'The workshop stayed open.');
});

test('local bridge stays disabled with a credential when operator opt-in is off',async()=>{
 const {handler,calls}=fixture(getProviderConfig({REMOTE_MODEL_ENABLED:'false',MODEL_API_KEY:'synthetic-security-test-key'})),req=new Req(),res=new Res();
 await handler(req,res);
 assert.equal(res.status,503);assert.equal(req.bodyReads,0);assert.equal(calls.upstream,0);
});

test('local bridge accepts an allowed browser Origin when the proxy rewrites Host',async()=>{
 const {handler,calls}=fixture(),req=new Req({...headers,host:'127.0.0.1:8787'}),res=new Res();
 await handler(req,res);
 assert.equal(res.status,200);assert.equal(calls.upstream,1);
});

test('local health checks and rejected preflights never read a body or invoke inference',async()=>{
 const {handler,calls}=fixture();
 const health=new Req({});health.method='GET';health.url='/api/health';const healthRes=new Res();
 await handler(health,healthRes);
 assert.equal(healthRes.status,200);assert.equal(health.bodyReads,0);
 assert.doesNotMatch(JSON.stringify(healthRes.body),/synthetic-security-test-key/);
 const preflight=new Req({origin:'https://unrelated.example'});preflight.method='OPTIONS';const preflightRes=new Res();
 await handler(preflight,preflightRes);
 assert.equal(preflightRes.status,405);assert.equal(preflightRes.headers['Access-Control-Allow-Origin'],undefined);
 assert.equal(preflight.bodyReads,0);assert.equal(calls.upstream,0);assert.equal(calls.limit,0);
});

test('real Vite proxy rejects the original trigger while retaining the browser contract',async()=>{
 const {handler,calls}=fixture(),observed=[];
 const server=createServer((req,res)=>{observed.push({origin:req.headers.origin,host:req.headers.host});return handler(req,res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let vite;
 try{
  vite=await createViteServer({configFile:false,appType:'custom',logLevel:'silent',server:{host:'127.0.0.1',port:5173,proxy:{'/api':`http://127.0.0.1:${server.address().port}`}}});
  await vite.listen();
  const port=vite.httpServer.address().port;assert.ok(port>=5173&&port<=5189);
  const origin=`http://127.0.0.1:${port}`,url=`${origin}/api/character`;
  const malicious=await fetch(url,{method:'POST',headers:{origin:'https://unrelated.example','content-type':'text/plain'},body:JSON.stringify(payload)});
  assert.equal(malicious.status,403);await malicious.text();assert.equal(calls.upstream,0);
  const valid=await fetch(url,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)});
  assert.equal(valid.status,200,JSON.stringify(observed));assert.equal((await valid.json()).reply,'The workshop stayed open.');assert.equal(calls.upstream,1);
 }finally{await vite?.close();await new Promise(resolve=>server.close(resolve));}
});
