import test from 'node:test';
import assert from 'node:assert/strict';
import {createInterface} from '../src/ui.js';
import {initialState,applyAction,travel,writeLetter,RUNE_SEQUENCES} from '../src/game.js';
function makeUI(shareLetter=false){
  const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
  const handlers={travel(){},action(){},reset(){},ask(){},listen(){},letter(){},sound(){},move(){},interact(){},shareLetter(){},shareLetterStatus:()=>shareLetter};
  const ui=createInterface(root,handlers);return {ui,root};
}
function go(s,w){return travel(s,w).state}
function act(s,id){const r=applyAction(s,id);assert.equal(r.ok,true);return r.state}
test('story interface can render all five worlds and accessible controls without 3D',()=>{
 const {root,ui}=makeUI();let state=initialState();
 for(const w of ['future','past','self','dungeon','mech']){
   state=go(state,w);ui.render(state);
   assert.equal(root.dataset.world,w);
   assert.match(root.innerHTML,/data-cmd="journal"/);
   assert.match(root.innerHTML,/aria-label="World selector"/);
   assert.match(root.innerHTML,/data-cmd="interact"/);
   assert.match(root.innerHTML, new RegExp(state.world==='mech'?'TITAN NEURAL':state.world==='past'?'ALTER HISTORY':state.world==='future'?'CAUSAL WORLD':state.world==='dungeon'?'CHOOSE YOUR PATH':'CONTINUE THE CONVERSATION'));
 }
});
test('dungeon cipher and mech meter display authoritative simulation state',()=>{
 const {root,ui}=makeUI();let s=go(initialState(),'dungeon');s=act(s,'power-phase');
 s=act(s,`rune-${RUNE_SEQUENCES.phase[0]}`);ui.render(s);
 assert.match(root.innerHTML,/CIPHER OF THE HOLLOW CROWN/);assert.match(root.innerHTML,/1\/3/);
 s=go(s,'mech');s=act(s,'train-pilot');s=act(s,'deploy-mech');s=act(s,'start-defense');s=act(s,'fire-pulse');ui.render(s);
 assert.match(root.innerHTML,/REACTOR HEAT/);assert.match(root.innerHTML,/84%/);
 assert.match(root.innerHTML,/2 HOSTILES REMAINING/);
});
test('private letters are escaped and cloud and microphone controls are absent',()=>{
 const {root,ui}=makeUI();let s=go(initialState(),'self');s=writeLetter(s,'<script>alert(1)</script>');ui.render(s);
 assert.ok(!root.innerHTML.includes('<script>'));assert.match(root.innerHTML,/&lt;script&gt;/);
 assert.match(root.innerHTML,/No upload or optional sharing/);
 assert.ok(!root.innerHTML.includes('id="share-letter"'));
 assert.ok(!root.innerHTML.includes('id="cloud-consent"'));
 assert.ok(!root.innerHTML.includes('data-cmd="mic"'));
});

test('optional Stillwater dialogue leaves game state untouched',()=>{
 const {root,ui}=makeUI();const s=go(initialState(),'self');
 ui.render(s);assert.match(root.innerHTML,/data-cmd="stillwater-open"/);
 const old=structuredClone(s);ui.openStillwater();
 assert.match(root.innerHTML,/The Quiet Between Worlds/);
 assert.match(root.innerHTML,/data-stillwater="garden"/);
 assert.deepEqual(ui.getState(),old);
 ui.resetEphemeral();ui.render(s);
 assert.ok(!root.innerHTML.includes('stillwater-shade'));
});
test('glasses companion forbids network APIs and sensor use',async()=>{
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(new URL('../public/glasses/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../public/glasses/glasses.js',import.meta.url),'utf8');
 assert.match(html,/connect-src 'none'/);
 assert.doesNotMatch(js,/\b(fetch|localStorage|sessionStorage|getUserMedia|XMLHttpRequest)\s*\(/);
});
