import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,askCharacter,dialogueFallback,loadState,SAVE_KEY,worldOptions} from '../src/game.js';
import {availableChapters,chapterById,activeChapter} from '../src/story.js';
import {storyCluesFound,storyClueJournal,storyAfterimage,narrativeOptions,STORY_CLUES} from '../src/story-thread.js';
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
 assert.deepEqual(storyClueJournal(s).found.map(c=>c.id),['story-photograph','story-platform']);
 assert.equal(storyClueJournal(s).branch,'echo');
 s=act(s,'switch-parallel');
 assert.equal(storyCluesFound(s).includes('story-platform'),false);
 assert.equal(storyClueJournal(s).branch,'prime');
 assert.equal(storyClueJournal(s).found.some(c=>c.id==='story-platform'),false);
 s=act(s,'story-platform');
 const saved=JSON.stringify(s);
 const reloaded=loadState({getItem:k=>k===SAVE_KEY?saved:null});
 assert.deepEqual(storyCluesFound(reloaded),storyCluesFound(s));
 assert.deepEqual(storyClueJournal(reloaded),storyClueJournal(s));
 assert.equal(reloaded.parallel.active,'prime');
});

test('the journal reveals only found clue details and keeps final-chapter prerequisites spoiler-safe',()=>{
 let s=go(initialState(),'self');
 const empty=storyClueJournal(s);
 assert.equal(empty.status,'LOCKED');assert.equal(empty.found.length,0);
 assert.match(empty.hint,/Build an invention in 1889, decide who owns it/);
 assert.doesNotMatch(JSON.stringify(empty),/invisible ink|empty seat|sealed black box|timetable/);
 const credits=s.credits,hours=s.chronal.hours,stars=s.stars;
 s=act(s,'story-photograph');
 const one=storyClueJournal(s);
 assert.deepEqual(one.found.map(c=>({world:c.world,title:c.title})),[{world:'self',title:'The photograph remembers an empty seat'}]);
 assert.doesNotMatch(JSON.stringify(one),/invisible ink|sealed black box|Platform Nine appears/);
 assert.equal(one.status,'LOCKED');assert.match(one.hint,/Build an invention in 1889, decide who owns it/);
 assert.equal(s.credits,credits);assert.equal(s.chronal.hours,hours);assert.equal(s.stars,stars);
 s=go(s,'past');s=act(s,'story-contract');s=act(s,'invent-cell');s=act(s,'gift');s=go(s,'future');s=act(s,'story-platform');
 const ready=storyClueJournal(s);
 assert.equal(ready.status,'READY');assert.equal(ready.ready,true);assert.equal(ready.found.length,3);
 assert.match(ready.hint,/ready in Neo Elysium/);assert.equal(ready.final,null);
 s=act(s,'story-unpriced');
 const revealed=storyClueJournal(s);
 assert.equal(revealed.status,'REVEALED');assert.match(revealed.final.title,/hour nobody could own/i);
 assert.deepEqual(storyClueJournal(s),storyClueJournal(s),'inspection remains deterministic and read-only');
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

test('timeline mystery tab exposes only discoveries in the active reality and viewing it is read-only',async()=>{
 const {createInterface}=await import('../src/ui.js');
 const listeners=[],root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(type,listener){if(type==='click')listeners.push(listener);},querySelector(){return null;}};
 const ui=createInterface(root,{});let s=go(initialState(),'self');s=act(s,'story-photograph');
 const snapshot=structuredClone(s);ui.render(s);
 const dispatch=target=>{for(const listener of listeners)listener({target:{closest(selector){if(selector==='[data-cmd]'&&target.dataset.cmd)return target;if(selector==='[role="tab"][data-tab]'&&target.dataset.tab)return target;return null;}}});};
 dispatch({dataset:{cmd:'journal'}});dispatch({dataset:{tab:'mystery'}});
 assert.match(root.innerHTML,/id="timeline-panel" class="timeline-tabpanel" role="tabpanel" aria-labelledby="timeline-tab-mystery"/);
 assert.match(root.innerHTML,/The photograph remembers an empty seat/);assert.match(root.innerHTML,/DISCOVERED IN The Other You/);
 assert.match(root.innerHTML,/FINAL INQUIRY LOCKED/);assert.doesNotMatch(root.innerHTML,/invisible ink|sealed black box|Platform Nine appears in the timetable/);
 assert.deepEqual(ui.getState(),snapshot,'opening the read-only clue journal cannot mutate rewards or story state');
});
