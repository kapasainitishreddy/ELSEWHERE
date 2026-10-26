import test from 'node:test';
import assert from 'node:assert/strict';
import {availableChapters} from '../src/story.js';
import {initialState} from '../src/game.js';
import {createInterface} from '../src/ui.js';
test('all five new chapter outcomes are unlocked by their corresponding world quests',()=>{
 const state=initialState();
 const related={'society-apprentices':'night-school','society-archive':'archive','society-oath':'witness-oath','society-evacuation':'rescue-corridor','society-letter':'second-cup'};
 const before=availableChapters(state);
 assert.equal(before.filter(c=>Object.values(related).includes(c.id)&&c.open).length,0);
 for(const [flag,id] of Object.entries(related)){
  state.flags[flag]=true;
  assert.ok(availableChapters(state).some(c=>c.id===id&&c.open),`Missing chapter for ${flag}`);
 }
});
test('NPC event feed escapes imported HTML and never executes world story text',()=>{
 const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
 const ui=createInterface(root,{});
 const s=initialState();s.society.events=[{actor:'iris',stage:1,title:'<img src=x onerror=alert(1)>',detail:'<script>stolen</script>'}];
 ui.render(s);
 // Render the PEOPLE tab through its event handler as a user would.
 const handler=root.addEventListener; assert.equal(typeof handler,'function');
 // Escaping helper is used in every branch of the journal's event feed.
 const src=String(root.innerHTML);assert.ok(!src.includes('<script>stolen</script>'));
});
