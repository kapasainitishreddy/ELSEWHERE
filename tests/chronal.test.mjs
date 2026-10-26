import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,loadState,saveState,SAVE_KEY} from '../src/game.js';
import {worldDossier} from '../src/characters.js';
import {activeChapter,availableChapters} from '../src/story.js';
const go=(s,w)=>{const r=travel(s,w);assert.equal(r.ok,true);return r.state};
const act=(s,id)=>{const r=applyAction(s,id);assert.equal(r.ok,true,`${id}: ${r.error}`);return r.state};

test('time is a bounded fictional currency, one offer per world, no same-era arbitrage',()=>{
 let s=initialState();assert.equal(s.chronal.hours,12);
 s=act(s,'time-sell-future');assert.equal(s.chronal.hours,9);assert.equal(s.credits,1800);
 assert.equal(applyAction(s,'time-sell-future').ok,false);
 s=act(s,'time-buy-future');assert.equal(s.chronal.hours,12);assert.equal(s.credits,400);
 assert.equal(applyAction(s,'time-buy-future').ok,false);
 s=go(s,'past');s=go(s,'future');assert.equal(applyAction(s,'time-sell-future').ok,false);
 s=act(s,'time-work-future');assert.equal(s.chronal.hours,16);
 assert.equal(applyAction(s,'time-work-future').ok,false);
});

test('borrowing future and past hours creates larger debt and impacts NPC memory',()=>{
 let s=initialState();s=act(s,'time-borrow-future');
 assert.equal(s.chronal.hours,20);assert.equal(s.chronal.futureDebt,12);
 assert.match(s.cast.elder.memories.at(-1),/borrowed hours/);
 assert.equal(applyAction(s,'time-borrow-future').ok,false);
 s=act(s,'time-repay-future');assert.equal(s.chronal.hours,8);assert.equal(s.chronal.futureDebt,0);
 s=go(s,'past');s=act(s,'time-borrow-past');assert.equal(s.chronal.paradox,6);
 assert.match(s.cast.ada.memories.join(' '),/childhood memory/);
 s=act(s,'time-work-past');s=act(s,'time-repay-past');assert.equal(s.chronal.pastDebt,0);assert.equal(s.chronal.paradox,0);
 assert.equal(applyAction(s,'time-repay-past').ok,false);
});

test('opponent remembers a theft, roleplays without network and remembers failed strategies',()=>{
 let s=go(initialState(),'dungeon');s=act(s,'power-storm');s=act(s,'time-steal-warden');
 assert.equal(s.chronal.paradox,9);assert.match(s.cast.warden.memories.at(-1),/stole five/);
 s=act(s,'talk-warden');assert.match(s.lastEncounter.text,/stole five/);
 assert.equal(s.cast.warden.interactions,1);
 s=act(s,'rune-star');s=act(s,'rune-crown');s=act(s,'rune-moon');s=act(s,'face-warden');
 s=act(s,'warden-strike');s=act(s,'warden-strike');s=act(s,'warden-strike');
 assert.equal(s.wardenBattle.tactic,'countering');assert.ok(s.wardenBattle.wardenHp>0);
 assert.ok(s.cast.warden.memories.at(-1).includes('traveler chose strike'));
});

test('parallel branches preserve independent wealth, memory and moral choices',()=>{
 let s=initialState();s=act(s,'find-shard');s=go(s,'past');s=act(s,'find-shard');s=act(s,'invent-cell');s=go(s,'future');
 const beforeForkHours=s.chronal.hours,beforeForkStars=s.stars;
 s=act(s,'fork-parallel');assert.equal(s.parallel.active,'echo');assert.equal(s.chronal.hours,beforeForkHours-3);assert.equal(s.stars,beforeForkStars-2);
 s=go(s,'past');s=act(s,'gift');assert.equal(s.fate,'gift');const echoTrust=s.trust;
 s=go(s,'future');s=act(s,'switch-parallel');assert.equal(s.parallel.active,'prime');assert.equal(s.fate,null);
 s=go(s,'past');s=act(s,'patent');assert.equal(s.fate,'patent');assert.ok(s.credits>8000);
 s=go(s,'future');s=act(s,'switch-parallel');assert.equal(s.parallel.active,'echo');assert.equal(s.fate,'gift');assert.equal(s.trust,echoTrust);
 const memory=new Map();saveState({setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)},s);
 const restored=loadState({getItem:k=>memory.get(k)});assert.deepEqual(restored,s);
 s=act(s,'switch-parallel');assert.equal(s.fate,'patent');
});

test('original chapters unlock from game decisions with a meaningful authored story',()=>{
 let s=initialState();let chapters=availableChapters(s);assert.ok(chapters.length>=12);assert.equal(chapters.find(x=>x.id==='parallel').open,false);
 s=go(s,'self');assert.equal(activeChapter(s).id,'elder');
 s=act(s,'find-shard');s=go(s,'future');s=act(s,'find-shard');s=act(s,'fork-parallel');
 chapters=availableChapters(s);assert.equal(chapters.find(x=>x.id==='parallel').open,true);
 const archive=worldDossier(s);assert.ok(archive.length>0);assert.ok(archive.every(c=>c.role&&c.memory));
});
