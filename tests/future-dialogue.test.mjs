import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,addConversation,dialogueFallback,applyAction} from '../src/game.js';
import {futureConversationReply,FUTURE_STARTERS,isUrgentSafetyMessage,futureConversationAcceptance} from '../src/future-dialogue.js';
import {localCharacterRequest} from '../src/local-ai.js';
import {safeDialoguePayload,buildLocalModelMessages} from '../local-server.mjs';
const self=()=>travel(initialState(),'self').state;

test('future-self starters provide voluntary next steps and not a diagnostic questionnaire',()=>{
 assert.equal(FUTURE_STARTERS.length,4);
 assert.match(futureConversationReply(self(),FUTURE_STARTERS[0]),/step|five minutes|today/i);
 assert.doesNotMatch(FUTURE_STARTERS.join(' '),/score|diagnos|PHQ|streak/i);
});
test('future self remembers a personal goal from encrypted conversation without inventing an outcome',()=>{
 let s=self();s=addConversation(s,'I want to write a story every week.','That is a good goal.');
 const r=futureConversationReply(s,'What is a small step today?');
 assert.match(r,/write a story every week/);
 assert.match(futureConversationReply(s,'Do you remember what I said?'),/write a story every week/);
 assert.equal(futureConversationAcceptance(r).noPrediction,true);
});
test('future replies change with story outcomes but do not mutate currency or stars',()=>{
 const first=self();const before=structuredClone(first);
 const answer=dialogueFallback(first,'Could I be rich?');
 assert.match(answer,/wealthy/);assert.deepEqual(first,before);
 first.fate='gift';const gift=dialogueFallback(first,'I want to be successful');
 assert.match(gift,/public workshops/);
 first.fate='patent';const patent=dialogueFallback(first,'I want to be successful');
 assert.match(patent,/towers outside bear our name/);
});
test('difficult feelings are acknowledged without promise to cure, shame or pretend to diagnose',()=>{
 const response=futureConversationReply(self(),'I feel depressed and exhausted today');
 assert.match(response,/hard|carry|a lot/i);
 assert.match(response,/professional|trust|talk/i);
 assert.doesNotMatch(response,/you have depression|cure you|dopamine boost|just be positive/i);
});
test('high-risk inputs trigger human-help language locally instead of model submission',()=>{
 assert.equal(isUrgentSafetyMessage('I want to kill myself'),true);
 assert.equal(isUrgentSafetyMessage('I want to learn to fly a mech'),false);
 const response=futureConversationReply(self(),'I want to end my life');
 assert.match(response,/real person|emergency|988/i);
 const s=self();assert.equal(localCharacterRequest(s,'elder','I want to end my life'),null);
});
test('future self is always explicit about speculative role and does not claim real memory',()=>{
 assert.match(futureConversationReply(self(),'Are you actually me?'),/invented possibility/);
 assert.match(futureConversationReply(self(),'Can you guarantee the future?'),/not a prediction/);
});
test('on-device opt-in transmits only selected short encrypted-vault conversation context and not the letter',()=>{
 let s=self();s.letter='MY PRIVATE PASSAGE';s.conversation=[{role:'user',text:'I want to write novels.'},{role:'assistant',text:'We can start with one scene.'}];
 const payload=localCharacterRequest(s,'elder','What next?');
 const dump=JSON.stringify(payload);
 assert.match(dump,/write novels/);assert.ok(!dump.includes('MY PRIVATE PASSAGE'));
 const safe=safeDialoguePayload(payload);
 const message=JSON.stringify(buildLocalModelMessages(safe));
 assert.match(message,/write novels/);
 assert.match(message,/NOT an actual prediction/);
 assert.doesNotMatch(message,/MY PRIVATE PASSAGE/);
});
test('future conversation UI offers prompt entry and clear-history control',async()=>{
 const {readFile}=await import('node:fs/promises');
 const ui=await readFile(new URL('../src/ui.js',import.meta.url),'utf8');
 const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
 assert.match(ui,/data-future-prompt/);
 assert.match(ui,/data-cmd="forget-conversation"/);
 assert.match(main,/function forgetConversation/);
});
