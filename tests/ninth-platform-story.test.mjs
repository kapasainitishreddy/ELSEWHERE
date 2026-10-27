import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,askCharacter,dialogueFallback,loadState,SAVE_KEY,worldOptions} from '../src/game.js';
import {availableChapters,chapterById,activeChapter} from '../src/story.js';
import {storyCluesFound,storyAfterimage,narrativeOptions,STORY_CLUES} from '../src/story-thread.js';
const go=(s,w)=>{const r=travel(s,w);assert.equal(r.ok,true,r.error);return r.state};
const act=(s,id)=>{const r=applyAction(s,id);assert.equal(r.ok,true,`${id}: ${r.error}`);return r.state};

test('new mystery starts as five locked discoveries with a visible first clue',()=>{
 const s=initialState();
 for(const id of STORY_CLUES)assert.equal(s.flags[id],undefined);
 assert.equal(availableChapters(s).find(x=>x.id==='unpriced-hour').open,false);
 assert.equal(worldOptions(s).some(x=>x.id==='story-platform'),false);
 const self=go(s,'self');
 assert.ok(worldOptions(self).some(x=>x.id==='story-photograph'));
 assert.equal(activeChapter(self).id,'elder');
});

test('investigations are optional, once-only and never mint hours or money',()=>{
 let s=go(initialState(),'self');
 const money=s.credits,hours=s.chronal.hours,stars=s.stars;
 s=act(s,'story-photograph');
 assert.equal(s.credits,money);assert.equal(s.chronal.hours,hours);assert.equal(s.stars,stars);
 assert.equal(s.flags['story-photograph'],true);
 assert.match(s.cast.elder.memories.join(' '),/empty seat/);
 assert.equal(worldOptions(s).some(x=>x.id==='story-photograph'),false);
 assert.equal(applyAction(s,'story-photograph').ok,false);
 assert.equal(chapterById(s,'the-photograph').title,'Two Shadows, One Umbrella');
 assert.match(activeChapter(s).body,/Platform Nine/i);
});

test('narrative investigation follows each world and unlocks climactic receipt at three clues',()=>{
 let s=go(initialState(),'self');
 s=act(s,'story-photograph');s=go(s,'past');s=act(s,'story-contract');
 s=act(s,'invent-cell');s=act(s,'gift');
 s=go(s,'future');assert.equal(worldOptions(s).some(x=>x.id==='story-unpriced'),false);
 s=act(s,'story-platform');
 assert.deepEqual(storyCluesFound(s),['story-photograph','story-contract','story-platform']);
 assert.equal(worldOptions(s).some(x=>x.id==='story-unpriced'),true);
 s=act(s,'story-unpriced');
 assert.equal(chapterById(s,'unpriced-hour').open,true);
 assert.equal(activeChapter(s).id,'unpriced-hour');
 assert.equal(applyAction(s,'story-unpriced').ok,false);
 const words=chapterById(s,'unpriced-hour').body;
 assert.match(words,/Mara/);assert.match(words,/asked me/i);
 assert.doesNotMatch(words,/cure depression|guaranteed prediction/i);
});

test('time-debt stories respond to actual borrowing and restitution without overwriting original chapters',()=>{
 let s=go(initialState(),'self');
 assert.equal(chapterById(s,'elder').body.includes('AFTERIMAGE'),false);
 s=go(s,'future');s=act(s,'time-borrow-future');s=go(s,'self');
 assert.match(chapterById(s,'elder').body,/AN HOUR ON LOAN/);
 s=go(s,'future');s=act(s,'time-repay-future');s=go(s,'self');
 assert.doesNotMatch(chapterById(s,'elder').body,/AN HOUR ON LOAN/);
});

test('invention ownership produces three distinct paragraphs while preserving chapter identity',()=>{
 const texts=[];
 for(const fate of ['gift','patent','auction']){
  let s=go(initialState(),'past');s=act(s,'invent-cell');s=act(s,fate);
  const chapter=chapterById(s,'invention');
  assert.equal(chapter.id,'invention');assert.match(chapter.body,/THE CHOICE YOU MADE/);
  assert.match(chapter.body,/Aether Cell/);
  texts.push(chapter.body);
 }
 assert.equal(new Set(texts).size,3);
});

test('ending voices are distinct for Empire, Legacy and Wanderer',()=>{
 const endings=['empire','legacy','wanderer'].map(ending=>{
  const state=initialState();state.invention='cell';state.fate='gift';state.ending=ending;
  return storyAfterimage(state,'epilogue');
 });
 assert.equal(new Set(endings).size,3);
 for(const scene of endings)assert.ok(scene.length>150);
});

test('the Warden and Titan scenes respect combat outcomes and previous actions',()=>{
 const s=initialState();s.wardenBattle.outcome='mercy';
 assert.match(storyAfterimage(s,'warden'),/blade touches the floor/);
 s.wardenBattle.outcome='victory';
 assert.match(storyAfterimage(s,'warden'),/blade lies broken/);
 s.flags['defend-city']=true;
 assert.match(storyAfterimage(s,'titan'),/mechanic/);
});

test('clues, conversations and chapter access never leak between Prime and Echo',()=>{
 let s=go(initialState(),'self');s=act(s,'story-photograph');
 s=act(s,'find-shard');s=go(s,'future');s=act(s,'find-shard');
 s=act(s,'fork-parallel');
 s=act(s,'story-platform');assert.equal(storyCluesFound(s).includes('story-platform'),true);
 s=act(s,'switch-parallel');
 assert.equal(storyCluesFound(s).includes('story-platform'),false);
 s=act(s,'story-platform');
 const saved=JSON.stringify(s);
 const reloaded=loadState({getItem:k=>k===SAVE_KEY?saved:null});
 assert.deepEqual(storyCluesFound(reloaded),storyCluesFound(s));
 assert.equal(reloaded.parallel.active,'prime');
});

test('future self and cast acknowledge the clue only when it was discovered',()=>{
 let s=go(initialState(),'self');
 assert.match(dialogueFallback(s,'What is in the photograph?'),/facedown/);
 s=act(s,'story-photograph');
 assert.match(dialogueFallback(s,'Tell me about the photograph'),/Platform Nine|turned the photograph over/i);
 const reply=askCharacter(s,'elder','Who is in the photograph?');
 assert.equal(reply.ok,true);assert.match(reply.reply,/two shadows/i);
 s=go(s,'past');
 assert.match(askCharacter(s,'ada','Did Vey sign a clause?').reply,/biscuit tin/);
 s=act(s,'story-contract');
 assert.match(askCharacter(s,'ada','Did Vey sign a clause?').reply,/hadn’t consented/);
});

test('the new chapters do not need a model, network or private player information',()=>{
 const src=JSON.stringify(narrativeOptions(go(initialState(),'past')));
 assert.doesNotMatch(src,/https?:\/\/|fetch\(|localStorage|email|userId|medical claim/i);
 const required=['the-photograph','vey-contract','first-promise','titan-blackbox','ninth-platform','unpriced-hour'];
 assert.equal(required.every(id=>availableChapters(initialState()).some(ch=>ch.id===id)),true);
});


test('story UI surfaces the clue count and keeps all chapter prose escaped', async()=>{
 const {createInterface}=await import('../src/ui.js');
 const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null}};
 const ui=createInterface(root,{});
 let s=go(initialState(),'self');s=act(s,'story-photograph');
 ui.render(s);
 assert.match(root.innerHTML,/THE NINTH PLATFORM/);
 assert.match(root.innerHTML,/1 \/ 5 CLUES/);
 assert.match(root.innerHTML,/THREE CLUES AND ONE INVENTION DECISION/);
 assert.equal(root.innerHTML.includes('<script>'),false);
});
