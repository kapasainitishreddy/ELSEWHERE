import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,applyAction,travel,loadState,SAVE_KEY,worldOptions} from '../src/game.js';
import {initialSociety,sanitizeSociety} from '../src/society.js';
const go=(s,w)=>travel(s,w).state;
function choose(state,id){const r=applyAction(state,id);assert.equal(r.ok,true,`${id}: ${r.error}`);return r.state;}
test('NPC lives advance only after unique meaningful choices and do not farm from portal travel or dialogue',()=>{
 let state=go(initialState(),'past');
 for(let k=0;k<12;k++)state=go(state,k%2?'past':'future');
 assert.equal(state.society.beats,0);
 state=go(state,'past');state=choose(state,'invent-cell');state=choose(state,'gift');
 assert.equal(state.society.beats,2);assert.equal(state.society.stages.ada,1);assert.equal(state.society.stages.iris,1);
 assert.ok(state.cast.ada.memories.some(t=>t.includes('apprentices')));
 const count=state.society.events.length;
 state=choose(state,'talk-clockmaker');state=choose(state,'talk-clockmaker');
 assert.equal(state.society.beats,3,'Repeated conversations do not generate an extra world agenda tick');
 assert.equal(state.society.events.length,count);
});
test('Quests cost hours, change society and cannot be paid out twice',()=>{
 let s=go(initialState(),'past');s=choose(s,'invent-oracle');s=choose(s,'gift');
 const before=s.chronal.hours,trust=s.trust,stars=s.stars;
 assert.ok(worldOptions(s).some(o=>o.id==='society-apprentices'));
 s=choose(s,'society-apprentices');
 assert.equal(s.chronal.hours,before-4);assert.equal(s.trust,trust+16);assert.equal(s.stars,stars+1);
 assert.equal(applyAction(s,'society-apprentices').ok,false);
 s=go(s,'future');const firstStars=s.stars;s=choose(s,'society-archive');
 assert.equal(s.stars,firstStars+1);assert.ok(s.cast.iris.memories.some(t=>t.includes('reading room')));
 assert.equal(applyAction(s,'society-archive').ok,false);
});
test('Agenda memory survives save migration, but branch-specific missions stay branch-specific',()=>{
 let s=initialState();s=choose(s,'find-shard');s=go(s,'past');s=choose(s,'find-shard');s=choose(s,'invent-cell');s=choose(s,'gift');
 s=go(s,'future');s=choose(s,'fork-parallel');
 const echo = s.parallel.active;
 s=choose(s,'society-archive');
 assert.ok(s.flags['society-archive']);assert.ok(s.society.events.length);
 s=choose(s,'switch-parallel');
 assert.notEqual(s.parallel.active,echo);assert.equal(s.flags['society-archive'],undefined);
 s=choose(s,'switch-parallel');
 assert.equal(s.flags['society-archive'],true);
 const storage={getItem:k=>k===SAVE_KEY?JSON.stringify(s):null};
 const restored=loadState(storage);assert.equal(restored.flags['society-archive'],true);
 assert.equal(restored.society.stages.ada,s.society.stages.ada);
});
test('Untrusted agenda payloads are sanitized to bounded known states',()=>{
 const bad={beats:Infinity,triggers:['find-shard','find-shard','bad<script>'],stages:{ada:50,sol:-7,wrong:2},events:[{actor:'bogus',title:'x',detail:'y'}]};
 const clean=sanitizeSociety(bad);
 assert.equal(clean.beats,0);assert.deepEqual(clean.triggers,['find-shard']);assert.equal(clean.stages.ada,3);assert.equal(clean.stages.sol,0);assert.deepEqual(clean.events,[]);
 assert.deepEqual(initialSociety().events,[]);
});
