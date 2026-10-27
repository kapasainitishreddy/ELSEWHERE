import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,addConversation} from '../src/game.js';
import {firstCrossing,crossingReceipt,crossingAction,FIRST_CROSSING} from '../src/premiere.js';

const cross=(state,world)=>{const r=travel(state,world);assert.equal(r.ok,true,r.error);return r.state;};
const act=(state,action)=>{const r=applyAction(state,action);assert.equal(r.ok,true,r.error);return r.state;};

test('first crossing gives a beginner a goal without relying on analytics or a new save field',()=>{
 const fresh=initialState(),p=firstCrossing(fresh);
 assert.equal(p.step,0);assert.deepEqual(crossingAction(p,fresh.world),{world:'self'});
 assert.equal(FIRST_CROSSING.length,7);
 assert.equal(crossingReceipt(fresh),null);
 assert.doesNotMatch(JSON.stringify(p),/passphrase|userId|email|diagnos/i);
});

test('full tour is playable: future -> conversation -> 1889 invention -> ownership -> changed future',()=>{
 let state=initialState();
 state=cross(state,'self');assert.equal(firstCrossing(state).step,1);
 assert.deepEqual(crossingAction(firstCrossing(state),'self'),{command:'talk-to-future'});
 state=addConversation(state,'How did we spend an ordinary Sunday?','We spent it with people and made tea.');
 assert.equal(firstCrossing(state).step,2);
 state=cross(state,'past');assert.equal(firstCrossing(state).step,2);
 state=act(state,'invent-cell');assert.equal(firstCrossing(state).step,3);
 state=act(state,'gift');assert.equal(firstCrossing(state).step,4);
 const receipt=crossingReceipt(state);
 assert.match(receipt.impact,/public trust/i);
 assert.match(receipt.witness,/Ada/);
 assert.equal(receipt.source,'1889 · Aether Cell');
 state=cross(state,'self');assert.equal(firstCrossing(state).step,4);
 state=addConversation(state,'What changed in the city?','The public workshops are lit.');
 assert.equal(firstCrossing(state).step,5);
 state=cross(state,'future');assert.equal(firstCrossing(state).step,6);
 assert.equal(firstCrossing(state).completed,true);
 assert.equal(state.flags['premiere-return-chat'],true);
});

test('all ownership choices produce distinct receipts without exposing private letters',()=>{
 const receipts=[];
 for(const fate of ['gift','patent','auction']){
  let s=cross(initialState(),'past');s=act(s,'invent-oracle');s=act(s,fate);s.letter='SECRET PRIVATE LETTER';
  const r=crossingReceipt(s);receipts.push(r.impact);assert.doesNotMatch(JSON.stringify(r),/SECRET PRIVATE LETTER/);
 }
 assert.equal(new Set(receipts).size,3);
});

test('tour completion is independent per branch, and switching back does not duplicate credits',()=>{
 let s=initialState();s=cross(s,'self');s=addConversation(s,'Tell me your day','Tea.');s=cross(s,'past');s=act(s,'invent-rail');s=act(s,'patent');
 s=cross(s,'self');s=addConversation(s,'What changed?','A skyline.');s=cross(s,'future');
 assert.equal(firstCrossing(s).completed,true);
 const beforeCredits=s.credits;
 // Fresh reality without duplicating existing resources cannot invent twice.
 const r=applyAction(s,'patent');assert.equal(r.ok,false);assert.equal(s.credits,beforeCredits);
});
