import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createLocalVault,VAULT_KEY} from '../src/vault.js';
import {initialState,SAVE_KEY,saveState,travel,writeLetter} from '../src/game.js';
function storage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),map:m};}

test('vault creates AES-GCM ciphertext, migrates plaintext once, and rejects wrong passphrases',async()=>{
 const store=storage();let s=travel(initialState(),'self').state;s=writeLetter(s,'VERY PRIVATE: a promise never sent');saveState(store,s);
 const vault=createLocalVault(store,{crypto:webcrypto});assert.equal(vault.present(),false);assert.equal(vault.recoverableLegacy(),true);
 const moved=await vault.create('long private passphrase 2026');assert.equal(moved.letter,s.letter);
 assert.equal(store.getItem(SAVE_KEY),null);
 const encrypted=store.getItem(VAULT_KEY);assert.ok(encrypted.includes('AES-256-GCM'));assert.equal(encrypted.includes('VERY PRIVATE'),false);
 await vault.lock();await assert.rejects(vault.unlock('wrong passphrase'),/Could not unlock/);
 const restored=await vault.unlock('long private passphrase 2026');assert.equal(restored.letter,s.letter);
 restored.fame=77;await vault.save(restored);await vault.lock();assert.equal((await vault.unlock('long private passphrase 2026')).fame,77);
});

test('encrypted backups are portable but authenticated and require a passphrase',async()=>{
 const a=storage(),b=storage();const pass='separate stored backup password';
 const v1=createLocalVault(a,{crypto:webcrypto}),v2=createLocalVault(b,{crypto:webcrypto});
 await v1.create(pass);const encrypted=v1.exportCiphertext();
 assert.equal(JSON.parse(encrypted).kdf,'PBKDF2-SHA256');
 await assert.rejects(v2.importCiphertext(encrypted,'wrong passphrase'),/Cannot decrypt/);
 const newState=await v2.importCiphertext(encrypted,pass);assert.equal(newState.world,'future');
 const record=JSON.parse(encrypted);record.data=record.data.slice(0,-6)+'AAAAAA';
 await assert.rejects(v2.importCiphertext(JSON.stringify(record),pass),/Cannot decrypt/);
 assert.equal(v2.present(),true);
 await v2.rekey(pass,'new private password that is longer');await v2.lock();
 await assert.rejects(v2.unlock(pass),/Could not unlock/);
 assert.equal((await v2.unlock('new private password that is longer')).world,'future');
});

test('erasing a local vault removes its saves and revokes the key without clearing unrelated storage',async()=>{
 const store=storage(),vault=createLocalVault(store,{crypto:webcrypto}),pass='synthetic delete passphrase';
 await vault.create(pass);store.setItem(SAVE_KEY,'legacy plaintext sentinel');store.setItem('syrava.elsewhere.letter-consent','true');store.setItem('other-app.setting','keep');
 vault.erase();
 assert.equal(vault.present(),false);assert.equal(vault.locked(),true);
 assert.equal(store.getItem(VAULT_KEY),null);assert.equal(store.getItem(SAVE_KEY),null);assert.equal(store.getItem('syrava.elsewhere.letter-consent'),null);
 assert.equal(store.getItem('other-app.setting'),'keep');
 await assert.rejects(vault.save(initialState()),/Vault is locked/);
});

test('erasing during an in-flight encrypted save prevents the old write from recreating the vault',async()=>{
 const store=storage();let blockNext=false,startedResolve,releaseResolve;
 const started=new Promise(resolve=>{startedResolve=resolve}),blocked=new Promise(resolve=>{releaseResolve=resolve});
 const native=webcrypto.subtle;
 const crypto={getRandomValues:webcrypto.getRandomValues.bind(webcrypto),subtle:{
  importKey:native.importKey.bind(native),deriveKey:native.deriveKey.bind(native),decrypt:native.decrypt.bind(native),
  encrypt:async(...args)=>{if(blockNext){blockNext=false;startedResolve();await blocked;}return native.encrypt(...args);}
 }};
 const vault=createLocalVault(store,{crypto});await vault.create('synthetic delayed delete passphrase');
 blockNext=true;const pendingWrite=vault.save({...initialState(),fame:1});await started;
 vault.erase();releaseResolve();
 await assert.rejects(pendingWrite,/Vault locked before save/);
 assert.equal(store.getItem(VAULT_KEY),null);assert.equal(vault.present(),false);assert.equal(vault.locked(),true);
});

test('storage failure during erasure revokes the key and reports that the vault remains',async()=>{
 const store=storage(),vault=createLocalVault(store,{crypto:webcrypto});await vault.create('synthetic partial delete passphrase');
 store.setItem(SAVE_KEY,'legacy plaintext sentinel');const remove=store.removeItem;
 store.removeItem=key=>{if(key===VAULT_KEY)throw new Error('synthetic storage denial');remove(key);};
 assert.throws(()=>vault.erase(),/synthetic storage denial/);
 assert.equal(vault.locked(),true,'a failed erase must still revoke the in-memory decryption key');
 assert.equal(vault.present(),true,'a failed ciphertext removal must remain visible as an existing vault');
 assert.equal(store.getItem(SAVE_KEY),null,'legacy plaintext should be removed before attempting encrypted-vault deletion');
 await assert.rejects(vault.save(initialState()),/Vault is locked/);
});
