/**
 * ELSEWHERE private vault. No key, plaintext save, or passphrase is sent to a server.
 * PBKDF2-HMAC-SHA256 -> AES-256-GCM; a fresh IV per write and authenticated metadata.
 * This protects browser storage at rest, not an infected device or a malicious site update.
 */
import { SAVE_KEY, initialState, loadState } from './game.js';

export const VAULT_KEY='syrava.elsewhere.private-v1';
export const VAULT_VERSION=1;
const ITERATIONS=310_000;
const AAD='ELSEWHERE-private-vault-2026-v1';
const encoder=new TextEncoder(),decoder=new TextDecoder();
const b64=(bytes)=>{let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);};
const unb64=(text)=>Uint8Array.from(atob(text),v=>v.charCodeAt(0));
const random=(crypto,n)=>crypto.getRandomValues(new Uint8Array(n));
const no=(message)=>{throw new Error(message);};
function validateEnvelope(json){
 const e=typeof json==='string'?JSON.parse(json):json;
 if(!e||e.version!==VAULT_VERSION||e.kdf!=='PBKDF2-SHA256'||e.cipher!=='AES-256-GCM'||e.iterations!==ITERATIONS||typeof e.salt!=='string'||typeof e.iv!=='string'||typeof e.data!=='string'||e.data.length>900000)no('Invalid encrypted vault format.');
 const salt=unb64(e.salt),iv=unb64(e.iv),data=unb64(e.data);
 if(salt.length!==16||iv.length!==12||data.length<16)no('Invalid encrypted vault fields.');
 return {e,salt,iv,data};
}
async function derive(crypto,pass,salt){
 if(typeof pass!=='string'||pass.length<10||pass.length>256)no('Use a passphrase of 10 to 256 characters.');
 const secret=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},secret,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encrypt(crypto,key,salt,payload){
 const iv=random(crypto,12),encoded=encoder.encode(JSON.stringify(payload));
 if(encoded.byteLength>500000)no('Your local save is larger than the 500 KB vault limit.');
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(AAD)},key,encoded);
 return JSON.stringify({version:VAULT_VERSION,kdf:'PBKDF2-SHA256',iterations:ITERATIONS,cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(cipher))});
}
async function decrypt(crypto,key,part){
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:part.iv,additionalData:encoder.encode(AAD)},key,part.data);
 const value=JSON.parse(decoder.decode(plain));
 return loadState({getItem:(name)=>name===SAVE_KEY?JSON.stringify(value):null});
}
export function createLocalVault(storage,{crypto=globalThis.crypto}={}){
 if(!crypto?.subtle||!crypto.getRandomValues)no('Web Crypto is unavailable. Use a secure HTTPS page or localhost.');
 let key=null,salt=null,queue=Promise.resolve();
 const run=(job)=>{const current=queue.then(job);queue=current.catch(()=>{});return current;};
 const present=()=>storage.getItem(VAULT_KEY)!==null;
 const locked=()=>key===null;
 const recoverableLegacy=()=>!present()&&!!storage.getItem(SAVE_KEY);
 async function create(pass){
  if(present())no('Vault already exists. Unlock it instead.');
  const nextSalt=random(crypto,16);const nextKey=await derive(crypto,pass,nextSalt);
  const legacy=recoverableLegacy()?loadState(storage):initialState();
  const record=await encrypt(crypto,nextKey,nextSalt,legacy);
  storage.setItem(VAULT_KEY,record);
  // Only remove the plaintext legacy save after the authenticated vault is committed.
  storage.removeItem(SAVE_KEY);
  storage.removeItem('syrava.elsewhere.letter-consent');
  key=nextKey;salt=nextSalt;return legacy;
 }
 async function unlock(pass){
  const part=validateEnvelope(storage.getItem(VAULT_KEY)||no('No local vault exists on this device.'));
  let derived;let value;
  try{derived=await derive(crypto,pass,part.salt);value=await decrypt(crypto,derived,part);}catch{no('Could not unlock the vault. Check the passphrase or file integrity.');}
  key=derived;salt=part.salt;
  // Legacy plaintext from interrupted upgrades must not remain beside an encrypted vault.
  storage.removeItem(SAVE_KEY);
  return value;
 }
 function save(state){
  if(locked())return Promise.reject(new Error('Vault is locked.'));
  const captured=structuredClone(state),secret=key,seed=salt;
  return run(async()=>{const json=await encrypt(crypto,secret,seed,captured);if(key!==secret)no('Vault locked before save.');storage.setItem(VAULT_KEY,json);return true;});
 }
 // Revoke access synchronously. Pending saves capture the old key and check it
 // again after encryption, so they cannot commit ciphertext after this boundary.
 function lock(){key=null;salt=null;queue=Promise.resolve();}
 function exportCiphertext(){const file=storage.getItem(VAULT_KEY);validateEnvelope(file);return file;}
 async function importCiphertext(text,pass){
  if(typeof text!=='string'||text.length>1000000)no('Encrypted backup exceeds the safe limit.');
  const part=validateEnvelope(text);let derived,value;
  try{derived=await derive(crypto,pass,part.salt);value=await decrypt(crypto,derived,part);}catch{no('Cannot decrypt this backup with that passphrase.');}
  await queue;storage.setItem(VAULT_KEY,text);storage.removeItem(SAVE_KEY);key=derived;salt=part.salt;return value;
 }
 async function rekey(oldPass,newPass){
  const existing=await unlock(oldPass),newSalt=random(crypto,16),newKey=await derive(crypto,newPass,newSalt);
  await queue;storage.setItem(VAULT_KEY,await encrypt(crypto,newKey,newSalt,existing));key=newKey;salt=newSalt;
  return existing;
 }
 return {present,locked,recoverableLegacy,create,unlock,save,lock,exportCiphertext,importCiphertext,rekey};
}
