import './style.css';
import { initialState, loadState, saveState, resetState, travel, applyAction, addConversation, dialogueFallback, SAVE_KEY } from './game.js';
import { createExperience } from './worlds.js';
import { createInterface } from './ui.js';

let state=loadState(window.localStorage);let experience;
const toastRoot=document.querySelector('#toast-region');
function toast(message,positive=true){
  const el=document.createElement('div');el.className=`toast ${positive?'positive':'negative'}`;el.textContent=message;toastRoot.append(el);
  setTimeout(()=>el.remove(),4500);
}
function publish(next,event){
  state=next;saveState(window.localStorage,state);experience.mount(state);ui.render(state);
  if(event)toast(event.title);
}
function chooseWorld(world){const result=travel(state,world);if(!result.ok){toast(result.error,false);return;}if(result.event)publish(result.state,result.event);}
function chooseAction(id){const result=applyAction(state,id);if(!result.ok){toast(result.error,false);return;}publish(result.state,result.event);}
function reset(){publish(resetState(window.localStorage),{title:'A new timeline begins.'});}
function say(text){if(!('speechSynthesis' in window))return;
 window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text.slice(0,700));utterance.rate=.89;utterance.pitch=.83;window.speechSynthesis.speak(utterance);
}
async function ask(question){
  let answer,live=false;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch('/api/character',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,world:state.world,timeline:{credits:state.credits,fame:state.fame,trust:state.trust,influence:state.influence,invention:state.invention,fate:state.fate,power:state.power,owned:state.owned},history:state.conversation.slice(-8)}),signal:controller.signal});
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
const ui=createInterface(document.querySelector('#app-ui'),{travel:chooseWorld,action:chooseAction,reset,ask,listen});
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
window.addEventListener('keydown',e=>{if(e.code==='Escape'){window.speechSynthesis?.cancel();}});
