import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialState,loadState,SAVE_KEY} from '../src/game.js';
import {branchSnapshot,switchBranch,forkIntoEcho} from '../src/branches.js';
import {updateMemoryCards,sanitizeMemoryCards,pinnedRecall} from '../src/memory-cards.js';
import {reviewGeneratedCharacterReply,overlapScore} from '../src/conversation-coherence.js';
import {createSessionCare} from '../src/session-care.js';
import {comfortPreset,walkableLanding} from '../src/xr-comfort.js';
import {localCharacterRequest} from '../src/local-ai.js';
import {safeDialoguePayload,buildLocalModelMessages} from '../local-server.mjs';
import {futureConversationReply} from '../src/future-dialogue.js';

const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('memory cards are explicit, bounded, deduplicated and private per branch',()=>{
 let s=initialState();
 assert.deepEqual(s.memoryCards,[]);
 let outcome=updateMemoryCards(s,'pin','  I want to finish my first novel.  ');
 assert.equal(outcome.ok,true);
 s=outcome.state;
 assert.deepEqual(pinnedRecall(s),['I want to finish my first novel.']);
 assert.equal(updateMemoryCards(s,'pin','i want to finish my first novel.').ok,false);
 assert.equal(updateMemoryCards(s,'pin','x'.repeat(240)).ok,false);
 assert.equal(updateMemoryCards(s,'forget',99).ok,false);
 assert.equal(sanitizeMemoryCards([' Test  memory ','test memory','a',' Another memory ']).length,2);
 s.stars=3;s.chronal.hours=20;
 assert.ok(forkIntoEcho(s));
 s=updateMemoryCards(s,'pin','An Echo-only promise').state;
 assert.ok(s.memoryCards.some(x=>x.text==='An Echo-only promise'));
 assert.ok(switchBranch(s));
 assert.equal(s.parallel.active,'prime');
 assert.ok(!s.memoryCards.some(x=>x.text==='An Echo-only promise'));
 assert.ok(switchBranch(s));
 assert.ok(s.memoryCards.some(x=>x.text==='An Echo-only promise'));
});

test('memory cards survive safe save migration and are never sent to Meta',()=>{
 let s=initialState();s.world='self';s=updateMemoryCards(s,'pin','Remember our imaginary library in the clouds.').state;
 const loaded=loadState({getItem:key=>key===SAVE_KEY?JSON.stringify(s):null});
 assert.equal(loaded.memoryCards[0].text,s.memoryCards[0].text);
 assert.match(futureConversationReply(loaded,'What did I ask you to remember?'),/imaginary library/i);
 const payload=localCharacterRequest(loaded,'elder','Do you remember our story?');
 assert.ok(payload.context.pinnedMemories[0].includes('imaginary library'));
 assert.match(JSON.stringify(buildLocalModelMessages(safeDialoguePayload(payload))),/imaginary library/i);
 const main=source('src/main.js');const remote=main.match(/const body=\{cloudConsent:true,[\s\S]*?\}\};/);
 assert.ok(remote);
 assert.doesNotMatch(remote[0],/memoryCards|pinnedMemories|letter|cast:|conversation:/);
});

test('model guard rejects invented life history, story contradictions and repeated filler',()=>{
 const s={...initialState(),world:'self'};
 for(const reply of [
  'I remember your childhood and the year we went to school together.',
  'We invented the Aether Cell and became celebrities.',
  'As an AI language model, I think you should try again.'
 ])assert.equal(reviewGeneratedCharacterReply(s,'elder',reply).ok,false,reply);
 s.invention='cell';s.fate='gift';
 assert.equal(reviewGeneratedCharacterReply(s,'elder','You patented the invention and became wealthy.').ok,false);
 assert.equal(reviewGeneratedCharacterReply(s,'elder','You gave the invention to the workers.').ok,true);
 s.conversation=[{role:'assistant',text:'The city is quiet tonight. Maybe we should watch the rain from the balcony.'}];
 assert.equal(reviewGeneratedCharacterReply(s,'elder','The city is quiet tonight. Maybe we should watch the rain from the balcony.').ok,false);
 assert.equal(reviewGeneratedCharacterReply(s,'elder','Would you like to revisit the public workshop?').ok,true);
 assert.ok(overlapScore('The same day in the same apartment','The same day in another apartment')>.6);
});

test('comfort includes seated reach and private, break-friendly activity counter',()=>{
 assert.equal(comfortPreset('seated').teleportDistance,16);
 assert.equal(comfortPreset('seated').snapDegrees,30);
 assert.equal(walkableLanding({x:0,z:0,distance:15,rects:[],limit:comfortPreset('seated').teleportDistance}),true);
 const care=createSessionCare({intervalSeconds:60,maxInvitations:2});
 for(let i=0;i<100;i++)assert.equal(care.sample(.5,{xr:false}),false);
 for(let i=0;i<119;i++)assert.equal(care.sample(.5,{xr:true}),false);
 assert.equal(care.sample(.5,{xr:true}),true);
 assert.equal(care.sample(60,{xr:true}),false); // ignore tab-sleep spikes
 for(let i=0;i<120;i++)care.sample(.5,{xr:true});
 assert.equal(care.snapshot().invitations,2);
 care.reset();assert.equal(care.snapshot().invitations,0);
});

test('service worker prefers updated documents and excludes private/API requests',()=>{
 const sw=source('public/sw.js');
 assert.match(sw,/request\.mode==='navigate'/);
 assert.match(sw,/fetch\(request,\{cache:'no-store'\}\)/);
 assert.match(sw,/url\.origin!==self\.location\.origin/);
 assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)/);
 assert.match(sw,/url\.pathname\.startsWith\('\/private\/'\)/);
 assert.match(sw,/if\(!\/\^\\\/\(assets/);
 assert.match(sw,/elsewhere-static-v8/);
});

test('future-self UI allows pinning and forgetting from a local encrypted vault',()=>{
 assert.match(source('src/ui.js'),/id="memory-pin-form"/);
 assert.match(source('src/ui.js'),/data-memory-forget/);
 assert.match(source('src/main.js'),/updateMemoryCards/);
 assert.match(source('src/worlds.js'),/createSessionCare/);
});
