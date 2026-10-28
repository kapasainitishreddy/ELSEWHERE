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
test('changing worlds resets the hour-trade filter so new-world actions stay visible',()=>{
 const listeners=[];const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(type,handler){if(type==='click')listeners.push(handler);},querySelector(){return null;}};
 const ui=createInterface(root,{});let s=go(initialState(),'self');ui.render(s);
 const selected={dataset:{chooser:'time'}};
 const event={target:{closest(selector){return selector==='[data-chooser]'?selected:null;}}};
 for(const listener of listeners)listener(event);
 assert.match(root.innerHTML,/class="selected" data-chooser="time"/,'time filter should be selected before travel');
 s=go(s,'past');ui.render(s);
 assert.match(root.innerHTML,/class="selected" data-chooser="world"/,'world actions should be the default after travel');
 assert.match(root.innerHTML,/data-action="invent-cell"/,'the 1889 invention action should be visible after travel');
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
test('guest play shows a not-saved label while normal local mode stays private',()=>{
 const guestRoot={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
 const guestUI=createInterface(guestRoot,{guestMode:()=>true});guestUI.render(initialState());
 assert.match(guestRoot.innerHTML,/GUEST · NOT SAVED/);
 assert.match(guestRoot.innerHTML,/Guest demo; progress is not saved/);
 const localRoot={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
 createInterface(localRoot,{}).render(initialState());
 assert.match(localRoot.innerHTML,/PRIVATE LOCAL WORLD/);
 assert.doesNotMatch(localRoot.innerHTML,/GUEST · NOT SAVED/);
});
test('touch d-pad forwards a captured pointer hold and release to movement controls',()=>{
 const listeners={};const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(type,handler){listeners[type]=handler;},querySelector(){return null;}};
 const moves=[];createInterface(root,{move:(key,pressed)=>moves.push([key,pressed])});
 const button={dataset:{move:'KeyW'},closest(selector){return selector==='[data-move]'?this:null;},setPointerCapture(id){this.captured=id;}};
 let prevented=false;
 listeners.pointerdown({target:button,pointerId:17,preventDefault(){prevented=true;}});
 listeners.pointerup({target:button});
 assert.equal(prevented,true);assert.equal(button.captured,17);assert.deepEqual(moves,[['KeyW',true],['KeyW',false]]);
});
test('Stillwater offers four private stories without changing or scoring game state',()=>{
 const {root,ui}=makeUI();const s=go(initialState(),'self');const snapshot=structuredClone(s);
 ui.render(s);assert.match(root.innerHTML,/data-cmd="stillwater-open"/);
 ui.openStillwater();
 assert.match(root.innerHTML,/The Quiet Between Worlds/);
 assert.match(root.innerHTML,/data-stillwater="garden"/);
 assert.match(root.innerHTML,/data-stillwater="mirror"/);
 assert.match(root.innerHTML,/data-stillwater="kindness"/);
 assert.match(root.innerHTML,/data-stillwater="agency"/);
 assert.match(root.innerHTML,/No mood scores, biometric measurements or personal answers/);
 assert.deepEqual(ui.getState(),snapshot);
});
test('Pocket companion forbids remote connections, sensors and persistent personal data',async()=>{
 const {readFile}=await import('node:fs/promises');const base=new URL('../public/glasses/',import.meta.url);
 const html=await readFile(new URL('index.html',base),'utf8');const js=await readFile(new URL('glasses.js',base),'utf8');
 assert.match(html,/connect-src 'none'/);
 assert.doesNotMatch(js,/\b(fetch|localStorage|sessionStorage|XMLHttpRequest|getUserMedia|indexedDB)\s*\(/);
 assert.doesNotMatch(js,/https?:\/\//);
});

test('One-Hour Compass escapes private intentions and exposes optional reversible controls',()=>{
 const {root,ui}=makeUI();const s=go(initialState(),'self');
 s.compass={focus:'create',step:'<img src=x onerror=alert(1)>',status:'planned'};
 ui.render(s);
 assert.ok(!root.innerHTML.includes('<img src=x onerror=alert(1)>'));
 assert.match(root.innerHTML,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(root.innerHTML,/id="compass-form"/);
 assert.match(root.innerHTML,/data-cmd="compass-tried"/);
 assert.match(root.innerHTML,/data-cmd="compass-clear"/);
 assert.match(root.innerHTML,/No streaks, no scores/);
 const cloudRoot={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
 const cloudUI=createInterface(cloudRoot,{cloudEnabled:()=>true});cloudUI.render(s);
 assert.match(cloudRoot.innerHTML,/META CLOUD · TEXT LEAVES DEVICE/);
});
