import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createLocalVault,VAULT_KEY} from '../src/vault.js';
import {SAVE_KEY,initialState,saveState,travel,applyAction} from '../src/game.js';
const PASSPHRASE='my offline library has many stories';
const memory=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const makeVault=storage=>createLocalVault(storage,{crypto:webcrypto});
test('vault creation is ciphertext-only, unlock recovers same state and passphrase cannot be found in storage',async()=>{
 const storage=memory(),v=makeVault(storage);
 const first=await v.create(PASSPHRASE);assert.equal(first.world,'future');
 let s=travel(first,'self').state;s={...s,letter:'A secret only I should know',conversation:[{role:'user',text:'secret question'}]};
 await v.save(s);assert.ok(v.present());assert.equal(storage.getItem(SAVE_KEY),null);
 const raw=storage.getItem(VAULT_KEY);assert.ok(!raw.includes('secret question'));assert.ok(!raw.includes('A secret only'));
 assert.ok(!raw.includes(PASSPHRASE));
 await v.lock();assert.equal(v.locked(),true);
 await assert.rejects(v.unlock('incorrect password here'),/Could not unlock/);
 assert.deepEqual(await v.unlock(PASSPHRASE),s);
});
test('legacy plaintext save migrates with no plaintext copy',async()=>{
 const storage=memory();let s=travel(initialState(),'past').state;s=applyAction(s,'invent-oracle').state;saveState(storage,s);
 const v=makeVault(storage);assert.equal(v.recoverableLegacy(),true);
 assert.deepEqual(await v.create(PASSPHRASE),s);assert.equal(storage.getItem(SAVE_KEY),null);
 await v.lock();assert.equal((await v.unlock(PASSPHRASE)).invention,'oracle');
});
test('tampering or wrong key does not mutate the vault and new passphrase rotates keys',async()=>{
 const storage=memory(),v=makeVault(storage);await v.create(PASSPHRASE);
 const before=v.exportCiphertext(),part=JSON.parse(before);part.data=part.data.slice(0,-3)+'AAA';
 await assert.rejects(v.importCiphertext(JSON.stringify(part),PASSPHRASE),/Cannot decrypt/);
 assert.equal(v.exportCiphertext(),before);
 await v.rekey(PASSPHRASE,'an entirely new passphrase 123');
 await v.lock();await assert.rejects(v.unlock(PASSPHRASE),/Could not unlock/);
 assert.equal((await v.unlock('an entirely new passphrase 123')).world,'future');
});
test('encrypted export imports into a distinct local vault and never needs an HTTP request',async()=>{
 const a=memory(),v=makeVault(a);await v.create(PASSPHRASE);
 await v.save(travel(initialState(),'mech').state);
 const exported=v.exportCiphertext();const b=memory(),w=makeVault(b);
 const result=await w.importCiphertext(exported,PASSPHRASE);
 assert.equal(result.world,'mech');assert.equal(b.getItem(SAVE_KEY),null);
 await w.lock();assert.equal((await w.unlock(PASSPHRASE)).world,'mech');
});
test('rapid queued encrypted saves preserve the last state without dropping writes',async()=>{
 const mem=memory(),v=makeVault(mem);await v.create(PASSPHRASE);
 await Promise.all([v.save({...initialState(),fame:1}),v.save({...initialState(),fame:2}),v.save({...initialState(),fame:3})]);
 await v.lock();assert.equal((await v.unlock(PASSPHRASE)).fame,3);
});
test('lock revokes the key synchronously and a pending save cannot replace the last ciphertext',async()=>{
 const storage=memory();let unblock,entered,shouldDelay=false;
 const enteredEncrypt=new Promise(resolve=>{entered=resolve;});
 const gate=new Promise(resolve=>{unblock=resolve;});
 const crypto={
  getRandomValues:webcrypto.getRandomValues.bind(webcrypto),
  subtle:{
   importKey:(...args)=>webcrypto.subtle.importKey(...args),
   deriveKey:(...args)=>webcrypto.subtle.deriveKey(...args),
   decrypt:(...args)=>webcrypto.subtle.decrypt(...args),
   encrypt:async(...args)=>{if(shouldDelay){entered();await gate;}return webcrypto.subtle.encrypt(...args);}
  }
 };
 const v=createLocalVault(storage,{crypto});
 await v.create(PASSPHRASE);
 shouldDelay=true;
 const previous=storage.getItem(VAULT_KEY);
 const pending=v.save({...initialState(),fame:99});
 await enteredEncrypt;
 v.lock();
 assert.equal(v.locked(),true,'lock must revoke key before pending encryption completes');
 unblock();
 await assert.rejects(pending,/Vault locked before save/);
 assert.equal(storage.getItem(VAULT_KEY),previous,'stale pending save must not replace recoverable ciphertext');
 assert.deepEqual(await v.unlock(PASSPHRASE),initialState());
});
