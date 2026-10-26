import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,addConversation} from '../src/game.js';
import {futureConversationReply,possibleFutureVignette,isUrgentSafetyMessage,sanitizeGeneratedDialogue} from '../src/future-dialogue.js';

const visit=()=>travel(initialState(),'self').state;

test('the future-self scene remembers different economic choices without predicting reality',()=>{
 const sample=visit();
 const lines=['gift','patent','auction'].map(fate=>futureConversationReply({...sample,fate},'Tell me about your day'));
 assert.equal(new Set(lines).size,3);
 assert.match(lines[0],/public workshop/i);
 assert.match(lines[1],/tower/i);
 assert.match(lines[2],/museum/i);
 for(const line of lines)assert.doesNotMatch(line,/will definitely|predict|guarantee|cure depression/i);
});

test('authored future memories do not fabricate what they know about the real player',()=>{
 const reply=futureConversationReply(visit(),'Do you know my name?');
 assert.match(reply,/only know what you choose/i);
 assert.doesNotMatch(reply,/my name is|your name is/i);
});

test('follow-up can refer to a specific prior goal rather than pretending to know someone',()=>{
 let state=visit();
 state=addConversation(state,'I want to create a hand-drawn book','A single sketch is somewhere to start.');
 const answer=futureConversationReply(state,'Do you remember what I told you?');
 assert.match(answer,/create a hand-drawn book/i);
 const continued=futureConversationReply(state,'Tell me more');
 assert.match(continued,/sketch|sentence/i);
});

test('real distress is not answered with false guarantees or engagement bait',()=>{
 const reply=futureConversationReply(visit(),'I feel depressed and very overwhelmed');
 assert.match(reply,/talk|support|trust|mental health/i);
 assert.doesNotMatch(reply,/just be happy|dopamine|guarantee|keep playing/i);
 assert.equal(isUrgentSafetyMessage('I might hurt myself'),true);
 assert.equal(sanitizeGeneratedDialogue('I can cure depression in just two sessions.'),null);
});

test('the optional short story does not require or record clinical or personal information',()=>{
 assert.match(possibleFutureVignette(visit()),/tea|table|sunlight/i);
 assert.doesNotMatch(possibleFutureVignette(visit()),/diagnos|medical|mental health/i);
});
