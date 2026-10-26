import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, travel, applyAction, futureProfile, cityRipple, worldOptions, dialogueFallback, addConversation, loadState, saveState, resetState, SAVE_KEY, RUNE_SEQUENCES, sealClue, SHARD_NAMES, echoMap, writeLetter, encounterDialogue } from '../src/game.js';
function go(state,world){const r=travel(state,world);assert.equal(r.ok,true);return r.state;}
function act(state,action){const r=applyAction(state,action);assert.equal(r.ok,true,`Action ${action}: ${r.error||'unknown'}`);return r.state;}
function defeatWarden(state){
 for(const action of ['warden-power','warden-strike','warden-guard','warden-power','warden-strike','warden-strike']){
  if(state.dungeonOutcome)break;state=act(state,action);
 }
 assert.equal(state.dungeonOutcome,'victory');return state;
}

test('initial timeline and available destinations',()=>{
 const s=initialState();assert.equal(s.credits,1200);assert.equal(s.world,'future');assert.equal(s.fame,0);
 assert.equal(travel(s,'unknown').ok,false);assert.equal(applyAction(s,'invent-cell').ok,false);
});

test('patenting an impossible invention changes wealth, fame, reputation and city',()=>{
 let s=go(initialState(),'past');s=act(s,'invent-cell');assert.equal(s.credits,950);
 s=act(s,'patent');assert.equal(s.fate,'patent');assert.equal(s.credits,13650);assert.equal(s.fame,67);
 assert.equal(cityRipple(s).cell,true);assert.match(futureProfile(s).headline,/magnate/);
 assert.equal(applyAction(s,'patent').ok,false);
 s=go(s,'future');s=act(s,'buy-penthouse');assert.equal(s.credits,8850);assert.ok(s.owned.includes('penthouse'));
 assert.equal(applyAction(s,'buy-penthouse').ok,false);
});

test('sharing an invention produces a different future from selling it',()=>{
 let a=go(initialState(),'past');a=act(a,'invent-oracle');a=act(a,'gift');
 let b=go(initialState(),'past');b=act(b,'invent-oracle');b=act(b,'auction');
 assert.ok(a.trust>b.trust);assert.ok(b.credits>a.credits);
 assert.equal(cityRipple(a).surveillance,true);assert.equal(a.fate,'gift');
 assert.match(futureProfile(a).headline,/guardian/);
});

test('future investment and one-time dividend prevent infinite currency farming',()=>{
 let s=go(initialState(),'past');s=act(s,'invent-rail');s=act(s,'patent');s=go(s,'future');
 s=act(s,'invest-robotics');const c=s.credits;s=act(s,'collect-dividend');assert.equal(s.credits,c+5400);
 assert.equal(applyAction(s,'collect-dividend').ok,false);assert.equal(applyAction(s,'invest-robotics').ok,false);
});

test('dungeon powers and relic resolve exactly once',()=>{
 let s=go(initialState(),'dungeon');assert.equal(applyAction(s,'face-warden').ok,false);
 s=act(s,'power-phase');assert.equal(s.power,'phase');assert.equal(applyAction(s,'power-gravity').ok,false);
 for(const rune of RUNE_SEQUENCES.phase)s=act(s,`rune-${rune}`);
 s=defeatWarden(act(s,'face-warden'));s=act(s,'guard-relic');assert.equal(s.dungeonOutcome,'victory');
 assert.equal(applyAction(s,'sell-relic').ok,false);assert.ok(s.trust>10);
});

test('pilot certification unlocks drivable titan and choices persist',()=>{
 let s=go(initialState(),'mech');assert.equal(applyAction(s,'deploy-mech').ok,false);
 s=act(s,'train-pilot');s=act(s,'deploy-mech');assert.equal(s.mechDeployed,true);
 s=act(s,'start-defense');for(let i=0;i<3;i++){s=act(s,'raise-shield');s=act(s,'fire-pulse');}
 assert.equal(s.mechBattle.enemies,0);s=act(s,'defend-city');assert.ok(s.fame>=20);assert.equal(applyAction(s,'defend-city').ok,false);
 s=act(s,'deploy-mech');assert.equal(s.mechDeployed,false);
});

test('future self responds to simulated choices and has deterministic offline conversation',()=>{
 let s=go(initialState(),'self');assert.match(dialogueFallback(s,'will I be rich'),/wealthy/);
 s=act(s,'purpose');assert.equal(s.conversation.length,2);
 s=addConversation(s,'Tell me about regrets','I changed my mind.');assert.equal(s.conversation.length,4);
 assert.match(futureProfile(s).warning,/never a prediction/);
});

test('saves can be reloaded and tampered or obsolete files do not crash',()=>{
 const memory=new Map();const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 let s=go(initialState(),'past');s=act(s,'invent-cell');s=act(s,'patent');saveState(storage,s);
 assert.deepEqual(loadState(storage),s);
 memory.set(SAVE_KEY,'not-json');assert.equal(loadState(storage).world,'future');
 memory.set(SAVE_KEY,JSON.stringify({...s,version:999}));assert.equal(loadState(storage).world,'future');
 memory.set(SAVE_KEY,JSON.stringify({...s,credits:-100,owned:['weird','penthouse'],conversation:[{role:'hacker',text:'test'}]}));
 const corrected=loadState(storage);assert.equal(corrected.credits,0);assert.deepEqual(corrected.owned,['penthouse']);assert.equal(corrected.conversation.length,0);
 assert.equal(resetState(storage).world,'future');
});

test('history remains bounded and all worlds have actions',()=>{
 let s=initialState();for(let i=0;i<70;i++){s=go(s,i%2?'future':'past');}
 assert.ok(s.history.length<=32);
 for(const w of ['future','self','past','dungeon','mech'])assert.ok(worldOptions(go(s,w)).length>0);
});

test('the first active action leads into the past and returns to the transformed future',()=>{
 const initial=initialState(); const start=worldOptions(initial)[0];assert.equal(start.id,'go-past');
 let s=act(initial,'go-past');assert.equal(s.world,'past');s=act(s,'invent-cell');s=act(s,'gift');
 s=act(s,'go-future');assert.equal(s.world,'future');assert.equal(cityRipple(s).cell,true);
});


test('dungeon seal gives deterministic hints, wrong order resets and all three powers differ',()=>{
 for(const power of ['phase','gravity','storm']){
   let s=go(initialState(),'dungeon');s=act(s,`power-${power}`);
   assert.ok(sealClue(s).length>20);
   const wrong=['moon','crown','star'].find(r=>r!==RUNE_SEQUENCES[power][0]);
   s=act(s,`rune-${wrong}`);assert.equal(s.runeProgress,0);assert.equal(s.runeMistakes,1);
   assert.equal(applyAction(s,'face-warden').ok,false);
   for(const rune of RUNE_SEQUENCES[power])s=act(s,`rune-${rune}`);
   assert.equal(s.runeProgress,3);s=defeatWarden(act(s,'face-warden'));assert.equal(s.dungeonOutcome,'victory');
 }
});

test('reactor heat, shield and mission rewards are bounded and non-farmable',()=>{
 let s=go(initialState(),'mech');s=act(s,'train-pilot');s=act(s,'deploy-mech');s=act(s,'start-defense');
 assert.equal(applyAction(s,'defend-city').ok,false);
 s=act(s,'fire-pulse');assert.equal(s.mechBattle.enemies,2);assert.equal(s.mechBattle.hull,84);
 s=act(s,'raise-shield');const before=s.mechBattle.hull;s=act(s,'fire-pulse');assert.equal(s.mechBattle.hull,before-3);
 s=act(s,'vent-reactor');assert.equal(s.mechBattle.enemies,1);s=act(s,'fire-pulse');s=act(s,'defend-city');
 assert.equal(applyAction(s,'defend-city').ok,false);assert.equal(applyAction(s,'start-defense').ok,false);
});

test('echo fragments unlock a single branch ending after history changes',()=>{
 let s=initialState();assert.equal(applyAction(s,'seal-legacy').ok,false);
 for(const w of ['future','past','self']){s=go(s,w);s=act(s,'find-shard');assert.equal(applyAction(s,'find-shard').ok,false);}
 s=go(s,'past');s=act(s,'invent-oracle');s=act(s,'gift');s=go(s,'future');
 s=act(s,'seal-legacy');assert.equal(s.ending,'legacy');assert.match(futureProfile(s).headline,/city you gave/);
 assert.equal(applyAction(s,'seal-empire').ok,false);assert.equal(s.echoShards.length,3);
 assert.equal(echoMap(s).length,5);assert.equal(Object.keys(SHARD_NAMES).length,5);
});

test('local future letter and world conversations persist across saves',()=>{
 const storage={data:{},setItem(k,v){this.data[k]=v},getItem(k){return this.data[k]||null}};
 let s=go(initialState(),'past');s=act(s,'talk-clockmaker');
 assert.match(encounterDialogue(s),/machine ahead/);assert.equal(s.encounters.past,1);
 s=go(s,'self');s=writeLetter(s,'Build a home with people you trust.');
 assert.match(dialogueFallback(s,'Did you read my letter?'),/Build a home/);
 saveState(storage,s);const loaded=loadState(storage);assert.deepEqual(loaded,s);
});

test('existing v1 local saves migrate safely without losing history',()=>{
 const old={version:1,world:'past',credits:905,fame:5,trust:10,influence:0,invention:'cell',fate:null,power:null,dungeonOutcome:null,pilotTrained:false,mechDeployed:false,owned:[],flags:{},history:[],conversation:[],revision:2};
 const storage={getItem:()=>JSON.stringify(old)};
 const s=loadState(storage);assert.equal(s.invention,'cell');assert.deepEqual(s.echoShards,[]);
 assert.equal(s.mechBattle.hull,100);assert.equal(s.runeProgress,0);assert.ok(s.worldVisits.future>=1);
});

test('deterministic playthroughs preserve invariants across random valid choices',()=>{
 let seed=1889;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let trial=0;trial<40;trial++){
   let s=initialState();
   for(let step=0;step<90;step++){
     if(rand()<.24){s=go(s,Object.keys(s.worldVisits)[Math.floor(rand()*5)]);}
     else {
       const options=worldOptions(s).filter(o=>!o.disabled);
       if(options.length)s=act(s,options[Math.floor(rand()*options.length)].id);
     }
     assert.ok(s.credits>=0);
     assert.ok(s.fame>=0 && s.trust>=0);
     assert.ok(s.history.length<=32);
     assert.ok(s.echoShards.length<=5);
     assert.ok(s.mechBattle.heat>=0&&s.mechBattle.heat<=100);
     assert.ok(s.mechBattle.hull>=0&&s.mechBattle.hull<=100);
   }
   const memory=new Map();const storage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)};
   saveState(storage,s);assert.deepEqual(loadState(storage),s);
 }
});
