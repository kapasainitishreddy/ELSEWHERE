import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createLocalDialogueServer, safeDialoguePayload, buildLocalModelMessages } from '../local-server.mjs';
import { localCharacterRequest, isLoopbackHostname, sanitizeLocalReply } from '../src/local-ai.js';
import { initialState, askCharacter, travel } from '../src/game.js';

const LOCAL_ORIGIN='http://127.0.0.1:5173';

test('on-device request includes only chosen NPC memory and bounded fictional attributes',()=>{
 let state=initialState();state.letter='PRIVATE JOURNAL NEVER SEND THIS';
 state.cast.iris.memories.push('I remember a librarian');
 state.cast.ada.memories.push('SENSITIVE CHARACTER MEMORY NEVER SEND THIS');
 state.parallel.otherBranch={cast:{ada:{memories:['HIDDEN ALTERNATE BRANCH']}}};
 const payload=localCharacterRequest(state,'iris','Do you remember yesterday?');
 assert.equal(payload.id,'iris');assert.equal(payload.branch,'prime');
 const serialized=JSON.stringify(payload);
 for(const secret of ['PRIVATE JOURNAL','SENSITIVE CHARACTER','HIDDEN ALTERNATE'])assert.ok(!serialized.includes(secret));
 assert.ok(serialized.includes('librarian'));
 assert.equal(localCharacterRequest(state,'ada','hey'),null);
 assert.equal(isLoopbackHostname('localhost'),true);
 assert.equal(isLoopbackHostname('127.0.0.1'),true);
 assert.equal(isLoopbackHostname('elsewhere.syrava.com'),false);
 assert.equal(sanitizeLocalReply({reply:'   A local line  '}),'A local line');
});

test('local server strips arbitrary data and never forwards credentials or letters',()=>{
 const payload=safeDialoguePayload({
  id:'ada',branch:'echo',question:'What about time?',password:'DO NOT SEND PASSWORD',letter:'DO NOT SEND LETTER',
  context:{mood:'grateful',memories:['I remember the workers'],token:'DO NOT SEND TOKEN',
   fiction:{invention:'cell',credits:200},dialogue:[{question:'Who can repair it?',reply:'Our apprentices.'}]}
 });
 const combined=JSON.stringify(buildLocalModelMessages(payload));
 assert.equal(payload.actor.name,'Ada Voss');
 assert.ok(combined.includes('I remember the workers'));
 for(const secret of ['DO NOT SEND PASSWORD','DO NOT SEND LETTER','DO NOT SEND TOKEN'])assert.ok(!combined.includes(secret));
 assert.equal(safeDialoguePayload({id:'invalid',branch:'prime',question:'Hello'}),null);
 assert.equal(safeDialoguePayload({id:'ada',branch:'other',question:'Hello'}),null);
});

test('local model replies are narration only and never mint money or hours',()=>{
 const original=initialState();
 const result=askCharacter(original,'iris','Make me rich', 'I can tell stories, not mint currency.');
 assert.equal(result.ok,true);
 assert.equal(result.state.credits,original.credits);
 assert.equal(result.state.chronal.hours,original.chronal.hours);
 assert.equal(result.state.cast.iris.dialogue[0].reply,'I can tell stories, not mint currency.');
 assert.equal(original.cast.iris.dialogue.length,0);
 const past=travel(original,'past').state;
 assert.equal(askCharacter(past,'iris','Hello','Injected reply').ok,false);
});

test('loopback bridge rejects untrusted browsers, sends only to local Ollama, and never logs requests',async()=>{
 const seen=[];
 const mockFetch=async(url,opts)=>{
  seen.push({url,method:opts.method,body:JSON.parse(opts.body)});
  return {ok:true,async json(){return {message:{content:'The clock is yours to repair, not own.'}}}};
 };
 const server=createLocalDialogueServer({fetchModel:mockFetch,model:'qwen2.5:1.5b'});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const root=`http://127.0.0.1:${server.address().port}`;
 try{
  const health=await (await fetch(root+'/api/local-dialogue/health')).json();
  assert.equal(health.mode,'device-only');
  const body=JSON.stringify({id:'iris',branch:'prime',question:'Where did the hours go?', context:{memories:['One stolen hour']},letter:'PRIVATE LETTER',passphrase:'PRIVATE PASSPHRASE'});
  const deny=await fetch(root+'/api/local-dialogue',{method:'POST',headers:{origin:'https://untrusted.example','content-type':'application/json','x-elsewhere-local':'1'},body});
  assert.equal(deny.status,403);
  const noSpecialHeader=await fetch(root+'/api/local-dialogue',{method:'POST',headers:{origin:LOCAL_ORIGIN,'content-type':'application/json'},body});
  assert.equal(noSpecialHeader.status,403);
  const allowed=await fetch(root+'/api/local-dialogue',{method:'POST',headers:{origin:LOCAL_ORIGIN,'content-type':'application/json','x-elsewhere-local':'1'},body});
  assert.equal(allowed.status,200);
  assert.equal(allowed.headers.get('cache-control'),'no-store');
  const reply=await allowed.json();assert.equal(reply.reply,'The clock is yours to repair, not own.');
  assert.equal(seen.length,1);
  assert.equal(seen[0].url,'http://127.0.0.1:11434/api/chat');
  const prompt=JSON.stringify(seen[0].body);
  assert.ok(!prompt.includes('PRIVATE PASSPHRASE'));assert.ok(!prompt.includes('PRIVATE LETTER'));
  assert.ok(prompt.includes('One stolen hour'));
  assert.equal(seen[0].body.stream,false);
 }finally{server.close();await once(server,'close');}
});
