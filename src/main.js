/** Privacy-first runtime. All state is passphrase encrypted locally before persistence.
 * No HTTP API, cloud inference, third-party voice transcription, tracking, or analytics in default private mode.
 * Meta remote conversation is separately opt-in, visibly labeled and off every session.
 */
import './style.css';
import {initialState, travel, applyAction, addConversation, dialogueFallback, writeLetter, askCharacter} from './game.js';
import {createExperience} from './worlds.js';
import {createInterface} from './ui.js';
import {createSoundscape} from './audio.js';
import {createLocalVault} from './vault.js';

const storage=window.localStorage;
const vault=createLocalVault(storage);
const gate=document.querySelector('#vault-gate');
const gateForm=gate.querySelector('#vault-form');
const gateInput=gate.querySelector('#vault-passphrase');
const gateStatus=gate.querySelector('#vault-notice');
const gateTitle=gate.querySelector('#vault-title');
const gateButton=gate.querySelector('#vault-submit');
const curtain=document.querySelector('#transition-curtain');
const toastRoot=document.querySelector('#toast-region');
const soundscape=createSoundscape();
let state=initialState(), experience=null, started=false, previousWorld=state.world, cloudEnabled=false;

function toast(message,positive=true){
 const node=document.createElement('div');node.className=`toast ${positive?'positive':'negative'}`;node.textContent=String(message).slice(0,240);
 toastRoot.append(node);setTimeout(()=>node.remove(),4800);
}
function showGate(message=''){
 gate.hidden=false;gateTitle.textContent=vault.present()?'UNLOCK YOUR PRIVATE WORLD':'CREATE YOUR PRIVATE WORLD';
 gateButton.textContent=vault.present()?'UNLOCK ELSEWHERE':'CREATE ENCRYPTED WORLD';
 gateStatus.textContent=message || (vault.present()?'Only your passphrase decrypts this save. It never leaves your device.':vault.recoverableLegacy()?'An existing unencrypted timeline will be migrated into an encrypted vault.':'Everything you do stays in this encrypted browser vault.');
 gateInput.value='';gateInput.focus();
}
function persist(){
 return vault.save(state).catch(error=>{toast('Your changes could not be saved securely: '+error.message,false);return false;});
}
function publish(next,event){
 const changed=previousWorld!==next.world;
 previousWorld=next.world;
 state=next;
 void persist();
 experience?.mount(state);
 soundscape.setScene(state.world);
 if(changed){
  soundscape.effect('portal');
  if(curtain){curtain.querySelector('span').textContent=state.world==='self'?'SOMEWHERE IN YOUR FUTURE':`ENTERING ${state.world.toUpperCase()}`;
   curtain.classList.remove('is-crossing');void curtain.offsetWidth;curtain.classList.add('is-crossing');}
 }else if(event){
  soundscape.effect(event.title?.includes('Memory')?'shard':/Warden|Threat|Steel/.test(event.title)?'pulse':'choice');
  experience?.effect?.(state,event);
 }
 ui.render(state);
 if(event)toast(event.title);
}
function chooseWorld(world){const outcome=travel(state,world);if(outcome.ok&&outcome.event)publish(outcome.state,outcome.event);else if(!outcome.ok)toast(outcome.error,false);}
function chooseAction(id){const outcome=applyAction(state,id);if(outcome.ok)publish(outcome.state,outcome.event);else toast(outcome.error,false);}
function reset(){if(!window.confirm('Begin a new story in this vault? The current story will be replaced unless you export an encrypted backup.'))return;publish(initialState(),{title:'A new life begins'});}
async function ask(question){
 // Local authored dialogue by default. Consent never survives a reload or vault lock.
 let reply=dialogueFallback(state,question), mode='LOCAL · ENCRYPTED';
 if(cloudEnabled){
  mode='META REQUEST ATTEMPTED';
  try{
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),11000);
   try{
    // Share only the player-typed question and an explicit, allowlisted *fictional* game summary.
    // Never transmit saved NPC memories, the future letter, other branches, personal saves or the passphrase.
    const body={cloudConsent:true,world:'self',question:question.slice(0,350),timeline:{
     credits:state.credits,fame:state.fame,trust:state.trust,invention:state.invention,
     fate:state.fate,power:state.power,ending:state.ending
    }};
    const res=await fetch('/api/character',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal,credentials:'same-origin',cache:'no-store'});
    if(!res.ok)throw new Error('Provider unavailable');
    const data=await res.json();if(typeof data?.reply!=='string'||!data.reply.trim())throw new Error('No AI dialogue');
    reply=data.reply.slice(0,1200);mode='META · CLOUD RESPONSE';
   }finally{clearTimeout(timer);}
  }catch{
   mode='META ATTEMPTED · LOCAL FALLBACK';
   toast('Meta unavailable. Continuing with local dialogue. A remote request may have been attempted.',false);
  }
 }
 state=addConversation(state,question,reply);
 void persist();ui.render(state);ui.updateStatus(mode);
}
function toggleCloud(){
 if(cloudEnabled){cloudEnabled=false;ui.render(state);ui.updateStatus('LOCAL · ENCRYPTED');toast('Remote conversations disabled.');return;}
 if(!window.confirm('Optional CLOUD MODE: Each submitted question and a small fictional game summary will be sent to Meta Model API. This is NOT completely local. Your passphrase, future letter, encrypted save, other timeline, and NPC memories will NOT be sent. Enable until you lock or reload?'))return;
 cloudEnabled=true;ui.render(state);ui.updateStatus('META OPT-IN · CLOUD');toast('Cloud conversation is now enabled. Type only what you want to send.');
}
function npcAsk(person,question){const answer=askCharacter(state,person,question);if(!answer.ok){toast(answer.error,false);return;}publish(answer.state);ui.updateStatus('LOCAL · ENCRYPTED');}
function listen(){toast('Voice transcription is disabled in Private Mode because browser services may transmit your speech. Type instead.',false);}
function writeFutureLetter(text){state=writeLetter(state,text);void persist();ui.render(state);toast(state.letter?'Private letter encrypted on this device.':'Letter cleared.');}
function toggleSound(enabled){soundscape.toggle(enabled);soundscape.setScene(state.world);}
function mobileMove(code,on){experience?.setMove?.(code,on);}
function interact(){experience?.interact?.();}
async function exportTimeline(){
 try{
  await vault.save(state);
  const text=vault.exportCiphertext();
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const node=document.createElement('a');node.href=url;node.download=`elsewhere-private-${new Date().toISOString().slice(0,10)}.vault.json`;
  node.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
  toast('Encrypted vault exported. Keep the passphrase separately.');
 }catch(e){toast(e.message,false);}
}
async function importTimeline(file){
 if(!file)return;
 try{
  if(file.size>1_000_000)throw new Error('Vault file is too large.');
  const pass=window.prompt('Enter the passphrase for this encrypted backup. Your current vault will be replaced.');
  if(pass===null)return;
  if(!window.confirm('Replace your current private timeline? This cannot be undone without a backup.'))return;
  const next=await vault.importCiphertext(await file.text(),pass);
  publish(next,{title:'A private life restored'});
 }catch(e){toast(e.message||'Could not read the encrypted backup.',false);}
}
async function rekey(){
 const old=window.prompt('Current private vault passphrase (not saved):');if(old===null)return;
 const newer=window.prompt('New private vault passphrase, at least 10 characters:');if(newer===null)return;
 try{await vault.save(state);await vault.rekey(old,newer);toast('Your vault is encrypted under the new passphrase. Replace any older backups.');}
 catch(e){toast(e.message||'Could not change passphrase.',false);}
}
async function lock(){
 if(!started)return;
 await vault.save(state);
 await vault.lock();cloudEnabled=false;soundscape.toggle(false);
 experience?.dispose?.();experience=null;started=false;
 document.querySelector('#app-ui').replaceChildren();
 document.querySelector('#loading-screen')?.classList.remove('hidden');
 showGate('Your key has been cleared from this session. Your encrypted timeline remains on this device.');
}
const ui=createInterface(document.querySelector('#app-ui'),{
 travel:chooseWorld,action:chooseAction,reset,ask,listen,letter:writeFutureLetter,
 sound:toggleSound,move:mobileMove,interact,exportTimeline,importTimeline,lock,rekey,
 privacyStatus:()=>true,cloudEnabled:()=>cloudEnabled,toggleCloud,npcAsk
});
function begin(next){
 state=next;previousWorld=state.world;cloudEnabled=false;gate.hidden=true;started=true;
 try{
  experience=createExperience(document.querySelector('#world-canvas'),chooseWorld,chooseAction);
  experience.mount(state);ui.render(state);ui.updateStatus('LOCAL · ENCRYPTED');
  document.querySelector('#loading-screen')?.classList.add('hidden');
 }catch(error){
  console.error('3D initialization failed:',error?.message);
  experience={mount(){},dispose(){}};
  ui.render(state);ui.updateStatus('LOCAL · TEXT MODE');
  document.querySelector('#loading-screen').innerHTML='<div class="loading-error"><strong>3D unavailable</strong><p>Explore the entire story with the accessible story controls.</p></div>';
 }
}
gateForm.addEventListener('submit',async(event)=>{
 event.preventDefault();const pass=gateInput.value;gateInput.value='';gateButton.disabled=true;gateStatus.textContent='Securing your local world…';
 try{const next=vault.present()?await vault.unlock(pass):await vault.create(pass);begin(next);}
 catch(e){showGate(e.message);}
 finally{gateButton.disabled=false;}
});
// Production shell only. Cache executable/static assets, never personal data.
// In development the SW stays disabled so hot reload cannot serve stale game rules.
if(import.meta.env.PROD && 'serviceWorker' in navigator){
 window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
window.addEventListener('pagehide',()=>soundscape.dispose());
showGate();
