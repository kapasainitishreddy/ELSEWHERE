/**
 * PRIVATE VOICE: opt-in, device-local browser speech only. No generic Web Speech
 * fallback is permitted because some implementations send recordings to a server.
 * Browser/OS implementations are not independently audited by ELSEWHERE.
 */
const bounded = (value, max) => String(value ?? '').trim().slice(0, max);

/** Reject remote voices, even if they happen to be in the preferred language. */
export function chooseLocalVoice(voices, language='en-US') {
  const list = Array.from(voices ?? []).filter(v => v && v.localService === true && typeof v.lang === 'string');
  if (!list.length) return null;
  const lang = String(language).toLowerCase();
  const primary = lang.split('-')[0];
  return list.find(v => v.lang.toLowerCase() === lang) ||
    list.find(v => v.lang.toLowerCase().split('-')[0] === primary) || null;
}

export function createPrivateSpeech({synthesis, Utterance, onActivity=()=>{}}={}) {
  let enabled=false;
  let speaking=false;
  let generation=0;
  const available = () => Boolean(synthesis?.getVoices && typeof Utterance === 'function' && chooseLocalVoice(synthesis.getVoices()));
  function stop() {
    generation++;
    if (synthesis?.cancel) synthesis.cancel();
    if (speaking) {speaking=false;onActivity('idle');}
  }
  return {
    available,
    enabled:()=>enabled,
    enable(){
      if (!available()) return {ok:false,reason:'No verified on-device English voice is available. Text dialogue remains private.'};
      enabled=true;return {ok:true};
    },
    disable(){enabled=false;stop();},
    stop,
    speak(text){
      if(!enabled) return false;
      const voice=chooseLocalVoice(synthesis?.getVoices?.());
      if(!voice){this.disable();return false;}
      const utterance=new Utterance(bounded(text,950));
      if(!utterance.text)return false;
      utterance.voice=voice;utterance.lang=voice.lang;
      utterance.rate=.94;utterance.pitch=.96;
      stop();
      const turn=generation;
      let finished=false;
      utterance.onstart=()=>{if(!finished&&turn===generation){speaking=true;onActivity('speaking');}};
      const finish=()=>{if(!finished){finished=true;if(turn===generation){speaking=false;onActivity('idle');}}};
      utterance.onend=finish;utterance.onerror=finish;
      try{synthesis.speak(utterance);return true;}
      catch{finish();return false;}
    }
  };
}

/**
 * Feature-test the *on-device* Web Speech API before granting microphone use.
 * No automatic language-pack installation, no transcription upload and no
 * auto-submit: recognized words are put in an editable field only.
 */
export async function openPrivateDictation({browser, onText=()=>{}, onStatus=()=>{}, mayStart=()=>true}={}) {
  const Recognition = browser?.SpeechRecognition || browser?.webkitSpeechRecognition;
  if (typeof Recognition !== 'function' || typeof Recognition.available !== 'function')
    return {ok:false,reason:'This browser cannot verify on-device dictation. Type instead.'};
  let recognition;
  try {
    recognition=new Recognition();
    // In unverified/legacy browser implementations, do not start the mic.
    if (!('processLocally' in recognition))
      return {ok:false,reason:'This browser does not expose a local-only speech switch.'};
    recognition.processLocally=true;
    if (recognition.processLocally!==true)
      return {ok:false,reason:'Local-only recognition could not be enforced.'};
    const status=await Recognition.available({langs:['en-US'],processLocally:true});
    if(status!=='available')
      return {ok:false,reason:'An offline speech pack is not installed. No microphone was opened.'};
    if(!mayStart()) return {ok:false,reason:'Private world was locked or changed before dictation could begin.'};
    recognition.lang='en-US';recognition.continuous=false;
    recognition.interimResults=false;recognition.maxAlternatives=1;
    recognition.onresult=event=>{
      const text=bounded(event?.results?.[0]?.[0]?.transcript,350);
      if(text)onText(text);
    };
    recognition.onerror=()=>onStatus('idle');
    recognition.onend=()=>onStatus('idle');
    recognition.start();
    onStatus('listening');
    return {ok:true,stop(){try{recognition.abort();}catch{}onStatus('idle');}};
  } catch {
    try{recognition?.abort();}catch{}
    return {ok:false,reason:'On-device transcription could not start. You can still type.'};
  }
}
