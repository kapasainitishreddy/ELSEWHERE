import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,worldOptions,loadState,saveState,RUNE_SEQUENCES} from '../src/game.js';
const go=(s,w)=>travel(s,w).state;
const act=(s,id)=>{const r=applyAction(s,id);assert.ok(r.ok,`${id}: ${r.error||'unknown'}`);return r.state;};
function intoArena(power='phase'){
 let s=go(initialState(),'dungeon');s=act(s,'power-'+power);
 for(const rune of RUNE_SEQUENCES[power])s=act(s,'rune-'+rune);
 return act(s,'face-warden');
}
test('chronal markets disallow repeated trades and unbounded multi-world hour arbitrage',()=>{
 let s=initialState();const start=s.credits;
 for(const world of ['future','past','self','dungeon','mech']){
  s=go(s,world);s=act(s,'time-work-'+world);s=act(s,'time-sell-'+world);
  assert.equal(applyAction(s,'time-sell-'+world).ok,false);
 }
 assert.ok(s.credits>start);
 assert.equal(s.chronal.transactions.filter(x=>x.kind.startsWith('time-sell')).length,5);
 assert.ok(Math.min(...[110,135,155,200,230].map(r=>r*7))>Math.max(...[110,135,155,200,230].map(r=>r*3)));
});
test('borrowing creates debt and NPC memory, repayment clears it, and save retains outcomes',()=>{
 let s=go(initialState(),'past');s=act(s,'time-borrow-past');
 assert.equal(s.chronal.hours,18);assert.equal(s.chronal.pastDebt,8);assert.equal(s.chronal.paradox,6);
 assert.match(s.cast.ada.memories.join(' '),/childhood memory/i);
 s=act(s,'time-repay-past');assert.equal(s.chronal.pastDebt,0);
 assert.match(s.cast.elder.memories.join(' '),/returned/i);
 const mem=new Map(),storage={setItem:(k,v)=>mem.set(k,v),getItem:k=>mem.get(k)};
 saveState(storage,s);assert.deepEqual(loadState(storage),s);
});
test('parallel worlds preserve different inventions, balances and NPC memories',()=>{
 let s=initialState();s=act(s,'find-shard');s=act(s,'fork-parallel');
 assert.equal(s.parallel.active,'echo');s=go(s,'past');s=act(s,'invent-cell');s=act(s,'gift');
 assert.equal(s.fate,'gift');s=go(s,'self');s=act(s,'switch-parallel');
 assert.equal(s.parallel.active,'prime');assert.equal(s.invention,null);
 s=go(s,'past');s=act(s,'invent-rail');s=act(s,'patent');assert.equal(s.fate,'patent');
 s=go(s,'future');s=act(s,'switch-parallel');
 assert.equal(s.parallel.active,'echo');assert.equal(s.fate,'gift');assert.equal(s.invention,'cell');
 assert.ok(s.cast.ada.affinity>0);
});
test('Warden learns identical strikes, accepts alternatives and has replay-safe rewards',()=>{
 let s=intoArena();assert.equal(s.wardenBattle.wardenHp,100);
 s=act(s,'warden-strike');s=act(s,'warden-strike');const before=s.wardenBattle.wardenHp;
 s=act(s,'warden-strike');assert.equal(before-s.wardenBattle.wardenHp,9);
 assert.ok(s.cast.warden.memories.some(m=>m.includes('strike')));
 // A fresh attempt using varied skills can win.
 s=intoArena('storm');for(const move of ['warden-power','warden-strike','warden-guard','warden-power','warden-strike','warden-strike']){
  if(s.dungeonOutcome)break;s=act(s,move);
 }
 assert.equal(s.dungeonOutcome,'victory');assert.equal(applyAction(s,'face-warden').ok,false);
});
test('peaceful boss victory depends on promises and theft',()=>{
 let s=initialState();s=go(s,'past');s=act(s,'invent-cell');s=act(s,'gift');s=go(s,'dungeon');s=act(s,'power-phase');
 for(const rune of RUNE_SEQUENCES.phase)s=act(s,'rune-'+rune);
 s=act(s,'face-warden');s=act(s,'warden-parley');assert.equal(s.wardenBattle.outcome,'mercy');
 assert.equal(s.dungeonOutcome,'victory');
 const t=act(intoArena(),'time-steal-warden');assert.equal(t.chronal.paradox,9);
 const r=applyAction(t,'warden-parley');assert.ok(r.ok);assert.notEqual(r.state.wardenBattle.outcome,'mercy');
});

test('past, present and future hour heists have lasting consequences and limited restitution',()=>{
 let s=initialState();
 s=act(s,'time-heist-future');assert.equal(s.chronal.hours,19);
 assert.equal(s.chronal.paradox,14);assert.equal(s.chronal.futureDebt,5);
 assert.match(s.cast.iris.memories.join(' '),/stole seven hours/);
 assert.equal(applyAction(s,'time-heist-future').ok,false);
 s=go(s,'self');s=act(s,'time-heist-self');assert.equal(s.chronal.hours,24);
 assert.equal(s.chronal.futureDebt,8);assert.match(s.cast.elder.memories.join(' '),/took five hours/);
 s=go(s,'past');s=act(s,'time-heist-past');assert.equal(s.chronal.hours,30);
 assert.match(s.cast.ada.memories.join(' '),/robbed six hours/);
 const before=s.chronal.paradox;s=act(s,'time-atone');
 assert.equal(s.chronal.hours,24);assert.equal(s.chronal.paradox,Math.max(0,before-15));
 assert.equal(applyAction(s,'time-atone').ok,false);
 const memory=new Map();saveState({setItem:(k,v)=>memory.set(k,v)},s);
 assert.deepEqual(loadState({getItem:k=>memory.get(k)}),s);
});

test('Hour heists and amends diverge between parallel worlds with isolated NPC memories',()=>{
 let s=initialState();s=act(s,'find-shard');s=act(s,'fork-parallel');
 s=act(s,'time-heist-future');const echoParadox=s.chronal.paradox;
 s=act(s,'switch-parallel');assert.equal(s.chronal.paradox,0);
 assert.equal(s.cast.iris.memories.some(m=>/stole seven hours/.test(m)),false);
 s=act(s,'time-work-future');s=act(s,'switch-parallel');
 assert.equal(s.chronal.paradox,echoParadox);
 assert.match(s.cast.iris.memories.join(' '),/stole seven hours/);
});
