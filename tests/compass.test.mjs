import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {initialState, travel, applyAction, updateCompass, loadState, SAVE_KEY, addConversation} from '../src/game.js';
import {initialCompass, sanitizeCompass, COMPASS_FOCI} from '../src/compass.js';
import {createLocalVault, VAULT_KEY} from '../src/vault.js';
import {futureConversationReply} from '../src/future-dialogue.js';
import {localCharacterRequest} from '../src/local-ai.js';
const go=(s,w)=>{const x=travel(s,w);assert.equal(x.ok,true);return x.state};
const act=(s,id)=>{const x=applyAction(s,id);assert.equal(x.ok,true,x.error);return x.state};
const doCompass=(s,op,data)=>{const x=updateCompass(s,op,data);assert.equal(x.ok,true,x.error);return x.state};
const store=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),values};};

test('Compass is voluntary, bounded and scores nothing',()=>{
 const starting=initialState();assert.deepEqual(starting.compass,initialCompass());
 const notHere=updateCompass(starting,'plan',{focus:'create',step:'Write a single page'});
 assert.equal(notHere.ok,false);
 const self=go(starting,'self');
 assert.equal(updateCompass(self,'plan',{focus:'unknown',step:'Write a single page'}).ok,false);
 assert.equal(updateCompass(self,'plan',{focus:'rest',step:'x'}).ok,false);
 assert.equal(updateCompass(self,'plan',{focus:'rest',step:'a'.repeat(161)}).ok,false);
 const next=doCompass(self,'plan',{focus:'rest',step:'Breathe near an open window'});
 assert.equal(next.compass.status,'planned');assert.equal(self.compass.status,'empty');
 for(const prop of ['credits','fame','trust','stars','chronal'])assert.deepEqual(next[prop],self[prop]);
 const tried=doCompass(next,'tried');assert.equal(tried.compass.status,'tried');
 assert.equal(updateCompass(tried,'tried').ok,false);
 const cleared=doCompass(tried,'clear');assert.deepEqual(cleared.compass,initialCompass());
 assert.equal(COMPASS_FOCI.length,4);
 assert.deepEqual(sanitizeCompass({focus:'rest',step:' tiny...',status:'fake'}).status,'planned');
});

test('An intention belongs to its parallel reality and never duplicates resources',()=>{
 let s=initialState();s=act(s,'find-shard');s=go(s,'past');s=act(s,'find-shard');s=go(s,'self');
 s=doCompass(s,'plan',{focus:'create',step:'Write a paragraph'});
 s=act(s,'fork-parallel');assert.equal(s.parallel.active,'echo');
 s=doCompass(s,'plan',{focus:'connect',step:'Write to a friend'});
 s=act(s,'switch-parallel');assert.equal(s.parallel.active,'prime');
 assert.equal(s.compass.step,'Write a paragraph');
 s=act(s,'switch-parallel');assert.equal(s.parallel.active,'echo');
 assert.equal(s.compass.step,'Write to a friend');
 const restored=loadState({getItem:k=>k===SAVE_KEY?JSON.stringify(s):null});
 assert.equal(restored.compass.step,'Write to a friend');
});

test('Private intention is encrypted at rest and omitted from Meta cloud payload',async()=>{
 let s=go(initialState(),'self');s=doCompass(s,'plan',{focus:'create',step:'UNIQUE PERSONAL ACTION NEVER IN PLAIN TEXT'});
 const storage=store();const vault=createLocalVault(storage,{crypto:webcrypto});await vault.create('secure passphrase for fictional world');
 await vault.save(s);const raw=storage.getItem(VAULT_KEY);
 assert.equal(raw.includes('UNIQUE PERSONAL'),false);
 await vault.lock();const recovered=await vault.unlock('secure passphrase for fictional world');
 assert.equal(recovered.compass.step,s.compass.step);
 const remoteSource=(await import('node:fs/promises')).readFile(new URL('../src/main.js',import.meta.url),'utf8');
 const src=await remoteSource;const portion=src.match(/const body=\{cloudConsent:true,[\s\S]*?\}\};/)?.[0]||'';
 assert.ok(portion);assert.equal(portion.includes('compass:'),false);
 const onDevice=localCharacterRequest(recovered,'elder','Remind me what I chose');
 assert.match(JSON.stringify(onDevice),/UNIQUE PERSONAL ACTION/);
});

test('Future self can discuss a small plan without a streak or a guaranteed outcome',()=>{
 let s=go(initialState(),'self');s=doCompass(s,'plan',{focus:'create',step:'Draw one page of my comic'});
 assert.match(futureConversationReply(s,'What should I do today?'),/Draw one page/);
 assert.match(futureConversationReply(s,'Tell me more'),/Draw one page/);
 s=doCompass(s,'tried');assert.match(futureConversationReply(s,'Did I choose a plan?'),/gave/);
 s=addConversation(s,'I want to write a book','That sounds worth exploring.');
 assert.match(futureConversationReply(s,'Yes'),/Draw one page/);
 const text=futureConversationReply(s,'I tried');
 assert.match(text,/experience|try/i);
 assert.doesNotMatch(text,/streak|earned 10|guaranteed happiness|cured depression/i);
});
