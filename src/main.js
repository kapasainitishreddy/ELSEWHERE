/** Privacy-first runtime. All state is passphrase encrypted locally before persistence.
 * No HTTP API, cloud inference, third-party voice transcription, tracking, or analytics in default private mode.
 * Meta remote conversation is separately opt-in, visibly labeled and off every session.
 */
import './style.css';
import './cinematic-shell.css';
import './director-cut.css';
import './submission-polish.css';
import './causal-proof.css';
import {initialState, travel, applyAction, addConversation, dialogueFallback, writeLetter, askCharacter, updateCompass} from './game.js';
import {createExperience} from './worlds.js';
import {createInterface} from './ui.js';
import {createSoundscape} from './audio.js';
import {createLocalVault} from './vault.js';
import {isUrgentSafetyMessage,sanitizeGeneratedDialogue} from './future-dialogue.js';
import {createPrivateSpeech,openPrivateDictation} from './local-voice.js';
import {isLoopbackHostname,localCharacterRequest,sanitizeLocalReply,LOCAL_AI_PATH} from './local-ai.js';
import {storyCueFor,safeSceneCue,safeSceneFocus} from './scene-director.js';
import {reviewGeneratedCharacterReply} from './conversation-coherence.js';
import {updateMemoryCards} from './memory-cards.js';

const storage=window.localStorage;
const vault=createLocalVault(storage);
const gate=document.querySelector('#vault-gate');
const gateForm=gate.querySelector('#vault-form');
const gateInput=gate.querySelector('#vault-passphrase');
const gateStatus=gate.querySelector('#vault-notice');
const gateTitle=gate.querySelector('#vault-title');
const gateButton=gate.querySelector('#vault-submit');
const guestButton=gate.querySelector('#guest-play');
const physicsButton=gate.querySelector('#physics-play');
const curtain=document.querySelector('#transition-curtain');
const toastRoot=document.querySelector('#toast-region');
const soundscape=createSoundscape();
let state=initialState(), experience=null, started=false, guestMode=false, previousWorld=state.world, cloudEnabled=false, localAiEnabled=false, sessionEpoch=0;
const pendingLocalRequests=new Set();
const onLocalMachine=isLoopbackHostname(window.location.hostname);
// No microphone or voice activity starts automatically. Only voices explicitly
// marked local by the browser may speak. A private passphrase is never read.
const privateSpeech=createPrivateSpeech({
 synthesis:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,
 onActivity:mode=>experience?.setDialogueActivity?.(mode)
});
let dictationSession=null,dictationStatus='idle',dictationPending=false;
function stopDictation(){dictationSession?.stop();dictationSession=null;dictationStatus='idle';}
function stopPresence(){privateSpeech.stop();stopDictation();experience?.setDialogueActivity?.('idle');}
function togglePrivateVoice(){
 if(privateSpeech.enabled()){
  privateSpeech.disable();experience?.setDialogueActivity?.('idle');toast('On-device future-self speech disabled.');
 }else{
  const result=privateSpeech.enable();toast(result.ok?'On-device future-self voice enabled for this session.':result.reason,result.ok);
 }
 ui.render(state);
}
async function listen(){
 if(dictationPending){toast('Checking the on-device speech capability.',false);return;}
 if(dictationSession){stopDictation();ui.updateVoiceStatus?.('NOT LISTENING');return;}
 dictationPending=true;
 const epoch=sessionEpoch;
 ui.updateVoiceStatus?.('CHECKING LOCAL SPEECH PACK');
 const result=await openPrivateDictation({
  browser:window,mayStart:()=>started&&state?.world==='self'&&epoch===sessionEpoch,
  onText:text=>{if(started&&epoch===sessionEpoch&&state?.world==='self'){
   ui.injectDictation?.(text);toast('Local transcription inserted. Review it before sending.');
  }},
  onStatus:status=>{dictationStatus=status;ui.updateVoiceStatus?.(status==='listening'?'MICROPHONE · ON DEVICE':'NOT LISTENING');if(status==='idle')dictationSession=null;}
 });
 dictationPending=false;
 if(!result.ok){ui.updateVoiceStatus?.('TYPING · PRIVATE');toast(result.reason,false);return;}
 if(!started||epoch!==sessionEpoch){result.stop();return;}
 dictationSession=result;
 ui.updateVoiceStatus?.('MICROPHONE · ON DEVICE');
}

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
 if(guestMode)return Promise.resolve(true); // Guest choices never touch browser storage.
 return vault.save(state).catch(error=>{toast('Your changes could not be saved securely: '+error.message,false);return false;});
}
function publish(next,event){
 const changed=previousWorld!==next.world;
 if(changed)stopPresence();
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
function reset(){const question=guestMode?'Restart guest demo? Your unsaved choices will be lost.':'Begin a new story in this vault? The current story will be replaced unless you export an encrypted backup.';if(!window.confirm(question))return;publish(initialState(),{title:'A new life begins'});}
/** Explicitly enabled on-device inference. This never routes to Meta or an internet URL.
 * The only backend it contacts is the separately launched local loopback proxy.
 */
async function localNpcReply(snapshot,id,question){
 if(!localAiEnabled || !onLocalMachine)return null;
 const payload=localCharacterRequest(snapshot,id,question);
 if(!payload)return null;
 const controller=new AbortController();pendingLocalRequests.add(controller);
 const timer=setTimeout(()=>controller.abort(),27000);
 try{
  const response=await fetch(LOCAL_AI_PATH,{
   method:'POST',credentials:'same-origin',cache:'no-store',
   headers:{'content-type':'application/json','x-elsewhere-local':'1'},
   body:JSON.stringify(payload),signal:controller.signal
  });
  if(!response.ok)throw new Error('On-device inference not ready');
  const reply=sanitizeLocalReply(await response.json());
  const assessment=reviewGeneratedCharacterReply(snapshot,id,reply);
  if(!assessment.ok)throw new Error('Local response failed grounding');
  return assessment.reply;
 }catch{
  toast('On-device model unavailable. Using the private authored character instead.',false);
  return null;
 }finally{clearTimeout(timer);pendingLocalRequests.delete(controller);}
}
async function toggleLocalAi(){
 if(localAiEnabled){localAiEnabled=false;ui.render(state);ui.updateStatus('LOCAL · AUTHORED');toast('On-device language model disabled.');return;}
 if(!onLocalMachine){toast('On-device AI can only be enabled from a local computer-hosted game.',false);return;}
 // Read a non-private health endpoint first. No player content is sent here.
 try{
  const response=await fetch(`${LOCAL_AI_PATH}/health`,{cache:'no-store',signal:AbortSignal.timeout(1800)});
  const data=await response.json();
  if(!response.ok||data.mode!=='device-only')throw new Error('Not running');
 }catch{toast('Start Ollama and run npm run dev:local-ai to unlock private generative dialogue.',false);return;}
 localAiEnabled=true;cloudEnabled=false;ui.render(state);ui.updateStatus('ON-DEVICE AI · NO CLOUD');
 toast('Local model selected. Conversations stay on this computer.');
}
async function ask(question){
 // Local authored dialogue by default. Consent never survives a reload or vault lock.
 privateSpeech.stop();stopDictation();experience?.setDialogueActivity?.('listening');
 let reply=dialogueFallback(state,question), mode='LOCAL · ENCRYPTED';
 let visualCue=storyCueFor(question,state.world),visualFocus=null;
 const before=state, epoch=sessionEpoch;
 if(isUrgentSafetyMessage(question)){
  mode='PRIVATE · SUPPORT INFORMATION';
 }else if(localAiEnabled){
  const local=await localNpcReply(before,'elder',question);
  if(!started||sessionEpoch!==epoch||state!==before){toast('World changed. Old dialogue was discarded.',false);return;}
  if(local){reply=local;mode='ON-DEVICE AI · ENCRYPTED SAVE';}else mode='LOCAL · AUTHORED FALLBACK';
 }else if(cloudEnabled){
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
    const safe=reviewGeneratedCharacterReply(before,'elder',data.reply);if(!safe.ok)throw new Error('Unreliable or repetitive generated claim');
    reply=safe.reply;visualCue=safeSceneCue(data.cue,visualCue);visualFocus=safeSceneFocus(data.focus);mode='META · CLOUD RESPONSE';
   }finally{clearTimeout(timer);}
  }catch{
   mode='META ATTEMPTED · LOCAL FALLBACK';
   toast('Meta unavailable. Continuing with local dialogue. A remote request may have been attempted.',false);
  }
 }
 if(!started||sessionEpoch!==epoch||state!==before){experience?.setDialogueActivity?.('idle');return;}
 state=addConversation(state,question,reply);
 void persist();ui.render(state);ui.updateStatus(mode);
 experience?.reactToDialogue?.(visualCue,visualFocus);
 if(!privateSpeech.speak(reply))experience?.setDialogueActivity?.('speaking',Math.min(5,1.6+reply.length/80));
}
function toggleCloud(){
 if(cloudEnabled){cloudEnabled=false;ui.render(state);ui.updateStatus(guestMode?'GUEST · NOT SAVED':'LOCAL · ENCRYPTED');
  toast('Remote conversations disabled.');return;}
 if(!window.confirm('Optional CLOUD MODE: Each submitted question and a small fictional game summary will be sent to Meta Model API. This is NOT completely local. Your passphrase, future letter, encrypted save, other timeline, and NPC memories will NOT be sent. Enable until you lock or reload?'))return;
 cloudEnabled=true;localAiEnabled=false;ui.render(state);ui.updateStatus('META OPT-IN · CLOUD');toast('Cloud conversation is now enabled. Type only what you want to send.');
}
async function npcAsk(person,question){
 const before=state,epoch=sessionEpoch;
 const reply=await localNpcReply(before,person,question);
 if(!started||sessionEpoch!==epoch||state!==before){toast('Reality changed before the conversation ended.',false);return;}
 const answer=askCharacter(state,person,question,reply);
 if(!answer.ok){toast(answer.error,false);return;}
 publish(answer.state);
 ui.updateStatus(reply?'ON-DEVICE NPC · ENCRYPTED SAVE':'LOCAL · AUTHORED NPC');
}
function forgetConversation(){
 stopPresence();
 if(!window.confirm('Erase the future-self conversation in this reality? An old encrypted export may still contain it.'))return;
 state={...state,conversation:[],revision:state.revision+1};
 void persist();ui.render(state);toast('Conversation erased from the active encrypted timeline.');
}
function compassAction(type,data={}){
 const result=updateCompass(state,type,data);
 if(!result.ok){toast(result.error,false);return;}
 publish(result.state,result.event);
}
function memoryAction(action,value){
 const outcome=updateMemoryCards(state,action,value);
 if(!outcome.ok){toast(outcome.error,false);return;}
 state=outcome.state;void persist();ui.render(state);
 toast(action==='pin'?'Memory saved inside this private reality.':'Memory removed from this reality.');
}
function compassSave(focus,step){compassAction('plan',{focus,step});}
function compassTried(){compassAction('tried');}
function compassClear(){compassAction('clear');}
function writeFutureLetter(text){state=writeLetter(state,text);void persist();ui.render(state);toast(state.letter?'Private letter encrypted on this device.':'Letter cleared.');}
function toggleSound(enabled){soundscape.toggle(enabled);soundscape.setScene(state.world);}
function mobileMove(code,on){experience?.setMove?.(code,on);}
function interact(){experience?.interact?.();}
async function exportTimeline(){
 if(guestMode){toast('Guest runs are not saved or exported. Create a private world to keep progress.',false);return;}
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
 if(guestMode){toast('Leave guest mode to import an encrypted vault.',false);return;}
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
 if(guestMode){toast('There is no passphrase in guest mode.',false);return;}
 const old=window.prompt('Current private vault passphrase (not saved):');if(old===null)return;
 const newer=window.prompt('New private vault passphrase, at least 10 characters:');if(newer===null)return;
 try{await vault.save(state);await vault.rekey(old,newer);toast('Your vault is encrypted under the new passphrase. Replace any older backups.');}
 catch(e){toast(e.message||'Could not change passphrase.',false);}
}
async function lock(){
 if(!started)return;
 stopPresence();privateSpeech.disable();
 if(!guestMode){await vault.save(state);await vault.lock();}
 const wasGuest=guestMode;guestMode=false;
 ui.resetEphemeral();sessionEpoch++;for(const c of pendingLocalRequests)c.abort();cloudEnabled=false;localAiEnabled=false;soundscape.toggle(false);
 experience?.dispose?.();experience=null;started=false;
 document.querySelector('#app').dataset.sceneReady='false';
 document.querySelector('#app-ui').replaceChildren();
 document.querySelector('#loading-screen')?.classList.remove('hidden');
 showGate(wasGuest?'Guest demo ended. Nothing was saved.':'Your key has been cleared from this session. Your encrypted timeline remains on this device.');
}
const ui=createInterface(document.querySelector('#app-ui'),{
 travel:chooseWorld,action:chooseAction,reset,ask,listen,letter:writeFutureLetter,
 sound:toggleSound,forgetConversation,pinMemory:text=>memoryAction('pin',text),forgetMemory:index=>memoryAction('forget',index),compassSave,compassTried,compassClear,move:mobileMove,interact,exportTimeline,importTimeline,lock,rekey,
 privacyStatus:()=>true,cloudEnabled:()=>cloudEnabled,toggleCloud,localAiEnabled:()=>localAiEnabled,toggleLocalAi,npcAsk,
 voiceEnabled:()=>privateSpeech.enabled(),togglePrivateVoice,dictationStatus:()=>dictationStatus,comfort:id=>experience?.setComfort?.(id)
});
function begin(next,{guest=false,physicsPreview=false}={}){
 stopPresence();privateSpeech.disable();
 guestMode=Boolean(guest);
 state=next;previousWorld=state.world;cloudEnabled=false;localAiEnabled=false;sessionEpoch++;gate.hidden=true;started=true;ui.resetEphemeral();
 try{
  experience=createExperience(document.querySelector('#world-canvas'),chooseWorld,chooseAction,()=>ui.openStillwater(),message=>toast(message),()=>ui.enterWorld(),{spawnNearPhysics:physicsPreview});
  experience.mount(state);document.querySelector('#app').dataset.sceneReady='true';ui.render(state);ui.updateStatus(guestMode?'GUEST · NOT SAVED':'LOCAL · ENCRYPTED');
  if(physicsPreview)ui.enterSandbox();
  document.querySelector('#loading-screen')?.classList.add('hidden');
 }catch(error){
  console.error('3D initialization failed:',error?.message);
  document.querySelector('#app').dataset.sceneReady='false';
  experience={mount(){},dispose(){}};
  ui.render(state);ui.updateStatus('LOCAL · TEXT MODE');
  document.querySelector('#loading-screen').innerHTML='<div class="loading-error"><strong>3D unavailable</strong><p>Explore the entire story with the accessible story controls.</p></div>';
 }
}
guestButton.addEventListener('click',()=>begin(initialState(),{guest:true}));
physicsButton.addEventListener('click',()=>{
 const preview=travel(initialState(),'dungeon');
 begin(preview.ok?preview.state:initialState(),{guest:true,physicsPreview:true});
});
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
