import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,loadState,SAVE_KEY} from '../src/game.js';
import {updateFutures,currentStreak} from '../src/possible-futures.js';
const run=(s,a,d={},day='2026-11-01')=>{const r=updateFutures(s,a,d,day);assert.equal(r.ok,true,r.error);return r.state;};
test('custom milestones unlock with consecutive days and a break offers a fresh start',()=>{
 let s=run(initialState(),'create',{title:'A small walk',step:'Walk for ten minutes',nodes:'1, 2, 7'});
 assert.equal(updateFutures(s,'select',{node:2},'2026-11-01').ok,false);
 s=run(s,'checkin');assert.equal(updateFutures(s,'checkin',{},'2026-11-01').ok,false);
 s=run(s,'checkin',{},'2026-11-02');s=run(s,'select',{node:2},'2026-11-02');
 s=run(s,'talk',{question:'What if I struggle?'},'2026-11-02');
 assert.match(s.possibleFutures.plans[0].conversation.at(-1).text,/difficult day does not erase/);
 assert.equal(currentStreak(s.possibleFutures.plans[0],'2026-11-04'),0);
 s=run(s,'checkin',{},'2026-11-04');assert.equal(s.possibleFutures.plans[0].streak,1);
 assert.equal(s.possibleFutures.plans[0].total,3);assert.equal(s.possibleFutures.plans[0].resets,1);
});
test('plans survive save sanitation and urgent messages receive human-support guidance',()=>{
 let s=run(initialState(),'create',{title:'Rest',step:'Take a pause',nodes:'1,7'});
 s=run(s,'talk',{question:'I want to die'});
 assert.match(s.possibleFutures.plans[0].conversation.at(-1).text,/emergency services/);
 const restored=loadState({getItem:key=>key===SAVE_KEY?JSON.stringify(s):null});
 assert.equal(restored.possibleFutures.plans[0].title,'Rest');
 assert.equal(restored.possibleFutures.plans[0].conversation.length,2);
});
