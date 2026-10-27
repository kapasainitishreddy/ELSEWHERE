import test from 'node:test';
import assert from 'node:assert/strict';
import {publicWorldSnapshot,causalReceipt,causalWorldAudit,compareParallelWorlds,previewFates} from '../src/causal-proof.js';
import {initialState,travel,applyAction} from '../src/game.js';
import {createInterface} from '../src/ui.js';
const act=(s,id)=>{const r=applyAction(s,id);assert.equal(r.ok,true,r.error);return r.state;};
test('causal audit is grounded in state, not private memories',()=>{
 const s=initialState(),before=causalReceipt(s);
 assert.equal(causalWorldAudit(s).status,'ORIGINAL TIMELINE');
 assert.equal(causalWorldAudit(s).nodes.length,5);
 s.letter='PRIVATE UNPUBLISHED STORY';s.conversation=[{role:'user',text:'SENSITIVE CONTENT'}];s.memoryCards=[{text:'MY SECRET'}];
 assert.equal(causalReceipt(s),before);
 assert.doesNotMatch(JSON.stringify(causalWorldAudit(s)),/PRIVATE UNPUBLISHED STORY|SENSITIVE CONTENT|MY SECRET/);
 assert.equal(Object.keys(publicWorldSnapshot(s)).includes('conversation'),false);
});
test('what-if preview uses the real action, never mutates the actual past',()=>{
 let s=travel(initialState(),'past').state;s=act(s,'invent-cell');
 const before=structuredClone(s);
 const options=previewFates(s,applyAction);
 assert.equal(options.length,3);
 for(const p of options){
  const actual=act(s,p.id);
  assert.equal(p.deltaCredits,actual.credits-before.credits);
  assert.equal(p.deltaFame,actual.fame-before.fame);
  assert.equal(p.deltaTrust,actual.trust-before.trust);
  assert.equal(p.receipt,causalReceipt(actual));
 }
 assert.deepEqual(s,before);
 assert.deepEqual(previewFates(act(s,'gift'),applyAction),[]);
});
test('parallel receipts separate Prime and Echo and survive a branch swap',()=>{
 let s=act(initialState(),'find-shard');
 s=act(s,'fork-parallel');
 assert.equal(s.parallel.active,'echo');
 s=travel(s,'past').state;s=act(s,'invent-rail');s=act(s,'patent');
 const before=compareParallelWorlds(s);
 assert.equal(before.rows.find(x=>x.key==='fate').prime,'Undecided');
 assert.equal(before.rows.find(x=>x.key==='fate').echo,'Patent and license');
 assert.notEqual(before.primeReceipt,before.echoReceipt);
 s=travel(s,'future').state;s=act(s,'switch-parallel');
 const after=compareParallelWorlds(s);
 assert.equal(after.primeReceipt,before.primeReceipt);
 assert.equal(after.echoReceipt,before.echoReceipt);
});
test('UI exposes causal evidence and what-if actions without 3D',()=>{
 const clickHandlers=[];
 const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},
  addEventListener(type,handler){if(type==='click')clickHandlers.push(handler);},querySelector(){return null}};
 const ui=createInterface(root,{});
 let state=travel(initialState(),'past').state;state=act(state,'invent-cell');ui.render(state);
 assert.match(root.innerHTML,/Preview three possible futures/);
 assert.match(root.innerHTML,/data-action="gift"/);
 assert.match(root.innerHTML,/data-cmd="receipt-open"/);
 const openReceipt={target:{closest(selector){return selector==='[data-cmd]'?{dataset:{cmd:'receipt-open'}}:null;}}};
 for(const listener of clickHandlers)listener(openReceipt);
 assert.match(root.innerHTML,/CAUSAL REPLAY/);
 assert.match(root.innerHTML,/CW-[A-F0-9]{8}/);
});
