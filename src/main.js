import './style.css';
import { loadState, saveState, resetState, travel, applyAction, addConversation, dialogueFallback, writeLetter } from './game.js';
import { createExperience } from './worlds.js';
import { createInterface } from './ui.js';
import { createSoundscape } from './audio.js';
import { createBackup, readBackup } from './backup.js';

let state=loadState(window.localStorage);let experience;
const soundscape=createSoundscape();
const transitionCurtain=document.querySelector('#transition-curtain');
let previousWorld=state.world;
const LETTER_CONSENT_KEY='syrava.elsewhere.letter-consent';
let shareLetter=window.localStorage.getItem(LETTER_CONSENT_KEY)==='yes';
const toastRoot=document.querySelector('#toast-region');
function toast(message,positive=true){
  const el=document.createElement('div');el.className=`toast ${positive?'positive':'negative'}`;el.textContent=message;toastRoot.append(el);
  setTimeout(()=>el.remove(),4500);
}
function publish(next,event){
  const shifted=previousWorld!==next.world;previousWorld=next.world;
  state=next;saveState(window.localStorage,state);experience.mount(state);
  soundscape.setScene(state.world);
  if(shifted){
    soundscape.effect('portal');
    if(transitionCurtain){transitionCurtain.querySelector('span').textContent=state.world==='self'?'SOMEWHERE IN YOUR FUTURE':`ENTERING ${state.world.toUpperCase()}`;transitionCurtain.classList.remove('is-crossing');void transitionCurtain.offsetWidth;transitionCurtain.classList.add('is-crossing');}
  } else if(event){
    soundscape.effect(event.title?.includes('Memory recovered')?'shard':event.title?.includes('Threat eliminated')?'pulse':event.title?.includes('Ending')?'victory':'choice');
    experience.effect?.(state,event);
  }
  ui.render(state);
  if(event)toast(event.title);
}
function chooseWorld(world){const result=travel(state,world);if(!result.ok){toast(result.error,false);return;}if(result.event)publish(result.state,result.event);}
function chooseAction(id){const result=applyAction(state,id);if(!result.ok){toast(result.error,false);return;}publish(result.state,result.event);}
function reset(){publish(resetState(window.localStorage),{title:'A new timeline begins.'});}
function say(text){if(!soundscape.enabled||!('speechSynthesis' in window))return;
 window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text.slice(0,700));utterance.rate=.89;utterance.pitch=.83;window.speechSynthesis.speak(utterance);
}
async function ask(question){
  let answer,live=false;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch('/api/character',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,world:state.world,timeline:{credits:state.credits,fame:state.fame,trust:state.trust,influence:state.influence,invention:state.invention,fate:state.fate,power:state.power,owned:state.owned,letter:shareLetter?state.letter:'',ending:state.ending,shards:state.echoShards.length},history:state.conversation.slice(-8)}),signal:controller.signal});
    if(!response.ok)throw new Error('Meta service unavailable');
    const data=await response.json();if(typeof data.reply!=='string'||!data.reply.trim())throw new Error('Empty response');
    answer=data.reply.slice(0,1200);live=true;
  }catch{answer=dialogueFallback(state,question);}
  finally{clearTimeout(timeout);}
  state=addConversation(state,question,answer);saveState(window.localStorage,state);
  ui.render(state);ui.updateStatus(live?'META MUSE SPARK LIVE':'LOCAL STORY MODE');
  say(answer);
}
function listen(){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){toast('Speech recognition is unavailable in this browser. You can type instead.',false);return;}
  try{
    const sr=new SpeechRecognition();sr.lang='en-US';sr.interimResults=false;sr.maxAlternatives=1;
    sr.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript;if(text)ask(text);};
    sr.onerror=()=>toast('Microphone was unavailable. You can type your question.',false);
    sr.start();toast('Listening. Speak your question.');
  }catch{toast('Microphone access is unavailable.',false);}
}
function writeFutureLetter(text){
  state=writeLetter(state,text);saveState(window.localStorage,state);ui.render(state);toast(state.letter?'Your letter was stored on this device.':'Your letter was cleared.');
}
function toggleSound(on){soundscape.toggle(on);soundscape.setScene(state.world);if(!on)window.speechSynthesis?.cancel();}
function setLetterConsent(on){shareLetter=on;window.localStorage.setItem(LETTER_CONSENT_KEY,on?'yes':'no');}
function mobileMove(code,on){experience?.setMove?.(code,on);}
function interact(){experience?.interact?.();}
function exportTimeline(){
  const json=createBackup(state),url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`elsewhere-timeline-${new Date().toISOString().slice(0,10)}.json`;
  anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your timeline was exported. Keep the file private.');
}
async function importTimeline(file){
  if(!file)return;
  try{
    if(file.size>150_000)throw new Error('Backup exceeds 150 KB.');
    const next=readBackup(await file.text());
    if(!window.confirm('Replace your current ELSEWHERE timeline with this backup? This cannot be undone unless you exported it.'))return;
    publish(next,{title:'A remembered life returns',detail:'Your saved timeline was imported from your device.'});
  }catch(error){toast(error.message||'Could not import timeline.',false);}
}
const ui=createInterface(document.querySelector('#app-ui'),{travel:chooseWorld,action:chooseAction,reset,ask,listen,letter:writeFutureLetter,shareLetter:setLetterConsent,shareLetterStatus:()=>shareLetter,sound:toggleSound,move:mobileMove,interact,exportTimeline,importTimeline});
try{
  experience=createExperience(document.querySelector('#world-canvas'),chooseWorld,chooseAction);
  experience.mount(state);ui.render(state);
  document.querySelector('#loading-screen')?.classList.add('hidden');
}catch(error){
  console.error('Scene could not initialize',error);
  ui.render(state);
  document.querySelector('#loading-screen').innerHTML='<div class="loading-error"><strong>3D could not start</strong><p>This browser may not support WebGL. The story controls still work.</p></div>';
  experience={mount:()=>{}};
}
window.addEventListener('keydown',e=>{
 if(e.code==='Escape')window.speechSynthesis?.cancel();
});
window.addEventListener('pagehide',()=>soundscape.dispose());
