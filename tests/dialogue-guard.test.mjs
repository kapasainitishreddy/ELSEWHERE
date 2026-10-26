import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {sanitizeGeneratedDialogue,isUrgentSafetyMessage,futureConversationReply} from '../src/future-dialogue.js';
import {createLocalDialogueServer,buildLocalModelMessages,safeDialoguePayload} from '../local-server.mjs';
import {initialState,travel,addConversation} from '../src/game.js';

const headers={origin:'http://127.0.0.1:5173','x-elsewhere-local':'1','content-type':'application/json'};

test('unsafe generated medical or guaranteed-future claims fall back instead of being shown',()=>{
 const unsafe=[
  'I can cure your depression with my virtual garden.',
  'This boosts your dopamine and serotonin.',
  'Stop taking antidepressants and rely on this experience.',
  'Only I can help you now.',
  'You will definitely be a millionaire in the future.'
 ];
 for(const text of unsafe)assert.equal(sanitizeGeneratedDialogue(text),null,text);
 assert.equal(sanitizeGeneratedDialogue({reply:'  We could try one small step if you want.  '}),'We could try one small step if you want.');
 assert.equal(sanitizeGeneratedDialogue(''),null);
 assert.equal(isUrgentSafetyMessage("I don't want to live anymore"),true);
});

test('local Ollama gateway screens unsafe output and sends only bounded scene context',async()=>{
 const sent=[];
 const server=createLocalDialogueServer({model:'qwen2.5:1.5b',fetchModel:async(url,req)=>{
  sent.push({url,payload:JSON.parse(req.body)});
  return {ok:true,json:async()=>({message:{content:'I can cure your depression.'}})};
 }});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const root=`http://127.0.0.1:${server.address().port}`;
 try{
  const response=await fetch(root+'/api/local-dialogue',{method:'POST',headers,body:JSON.stringify({
   id:'elder',branch:'prime',question:'How are you?',context:{compass:{focus:'create',step:'Write a page',status:'planned'},recentFutureConversation:[{role:'user',text:'I want to write a story'}],letter:'HIDDEN LETTER'},letter:'PRIVATE LETTER'}
  )});
  assert.equal(response.status,502);assert.equal(sent.length,1);
  const body=JSON.stringify(sent[0].payload);
  assert.match(body,/Write a page/);assert.match(body,/write a story/);
  assert.doesNotMatch(body,/HIDDEN LETTER|PRIVATE LETTER/);
  assert.equal(sent[0].url,'http://127.0.0.1:11434/api/chat');
 }finally{server.close();await once(server,'close');}
});

test('contextual follow-up can refer to earlier creative plans while recognizing uncertainty',()=>{
 let state=travel(initialState(),'self').state;
 state=addConversation(state,'I want to draw a graphic novel','We can start with a sketch.');
 const response=futureConversationReply(state,'Tell me more');
 assert.match(response,/sketch|sentence/i);
 assert.doesNotMatch(response,/guarantee|cure|always be happy/i);
 const context=safeDialoguePayload({id:'elder',branch:'prime',question:'What about my comics?',context:{compass:{focus:'create',step:'Sketch one hero',status:'planned'}}});
 assert.match(JSON.stringify(buildLocalModelMessages(context)),/Sketch one hero/);
});
