import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, travel, applyAction, futureProfile, cityRipple, worldOptions, dialogueFallback, addConversation, loadState, saveState, resetState, SAVE_KEY } from '../src/game.js';
function go(state,world){const r=travel(state,world);assert.equal(r.ok,true);return r.state;}
function act(state,action){const r=applyAction(state,action);assert.equal(r.ok,true,`Action ${action}: ${r.error||'unknown'}`);return r.state;}

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
 s=act(s,'face-warden');s=act(s,'guard-relic');assert.equal(s.dungeonOutcome,'victory');
 assert.equal(applyAction(s,'sell-relic').ok,false);assert.ok(s.trust>10);
});

test('pilot certification unlocks drivable titan and choices persist',()=>{
 let s=go(initialState(),'mech');assert.equal(applyAction(s,'deploy-mech').ok,false);
 s=act(s,'train-pilot');s=act(s,'deploy-mech');assert.equal(s.mechDeployed,true);
 s=act(s,'defend-city');assert.ok(s.fame>=20);assert.equal(applyAction(s,'defend-city').ok,false);
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
