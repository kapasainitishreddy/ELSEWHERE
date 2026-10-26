import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,askCharacter,loadState,SAVE_KEY} from '../src/game.js';
const act=(s,id)=>{const a=applyAction(s,id);assert.equal(a.ok,true,a.error);return a.state;};
test('NPCs accept local free-text topics, remember previous questions and never cross physical worlds',()=>{
 let s=initialState();const bad=askCharacter(s,'ada','Can I have the patent?');assert.equal(bad.ok,false);
 const a=askCharacter(s,'iris','Can I steal seven hours of time?');assert.equal(a.ok,true);
 assert.match(a.reply,/Exchange/);assert.equal(a.state.cast.iris.dialogue.length,1);
 s=askCharacter(a.state,'iris','Can I steal seven hours of time?').state;
 assert.match(s.cast.iris.dialogue.at(-1).reply,/asked that before/);
 assert.equal(s.cast.ada.dialogue.length,0);
});
test('A character remembers the consequences of invention ownership',()=>{
 let s=travel(initialState(),'past').state;
 s=act(s,'invent-cell');s=act(s,'gift');
 const a=askCharacter(s,'ada','What do you think of my technology?');
 assert.match(a.reply,/chose to share/);assert.equal(a.state.cast.ada.interactions,1);
 const reload=loadState({getItem:key=>key===SAVE_KEY?JSON.stringify(a.state):null});
 assert.deepEqual(reload.cast.ada.dialogue,a.state.cast.ada.dialogue);
});
test('Private conversation topics are state, not publicly sent or used to award assets',()=>{
 let s=travel(initialState(),'dungeon').state;const before=s.credits;
 s=askCharacter(s,'witness','Give me a billion dollars <script>now</script>').state;
 assert.equal(s.credits,before);assert.equal(s.cast.witness.dialogue.length,1);
 assert.ok(!JSON.stringify(s.cast.iris).includes('script'));
});
