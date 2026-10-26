import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseLocalVoice,createPrivateSpeech,openPrivateDictation} from '../src/local-voice.js';

const local={name:'Desktop English',lang:'en-US',localService:true};
const remote={name:'Network English',lang:'en-US',localService:false};

test('private voice never selects a remote voice',()=>{
 assert.equal(chooseLocalVoice([remote]),null);
 assert.equal(chooseLocalVoice([remote,local]),local);
 assert.equal(chooseLocalVoice([{...local,lang:'fr-FR'}]),null);
});

test('future self only speaks after explicit enable, uses local voice and can be stopped',()=>{
 const utterances=[];const activity=[];
 const synthesis={getVoices:()=>[remote,local],speak:u=>utterances.push(u),cancel:()=>{}};
 class Utterance{constructor(text){this.text=text;}}
 const voice=createPrivateSpeech({synthesis,Utterance,onActivity:s=>activity.push(s)});
 assert.equal(voice.speak('hello'),false);
 assert.equal(utterances.length,0);
 assert.equal(voice.enable().ok,true);
 assert.equal(voice.speak('Something worth remembering.'),true);
 assert.equal(utterances[0].voice,local);
 utterances[0].onstart();assert.equal(activity.at(-1),'speaking');
 utterances[0].onend();assert.equal(activity.at(-1),'idle');
 voice.disable();assert.equal(voice.enabled(),false);
});

test('no local voices means no browser audio output',()=>{
 let invoked=0;
 const voice=createPrivateSpeech({synthesis:{getVoices:()=>[remote],speak:()=>invoked++},Utterance:class {}});
 assert.equal(voice.enable().ok,false);
 assert.equal(voice.speak('secret'),false);
 assert.equal(invoked,0);
});

test('unverified speech recognition never opens a microphone',async()=>{
 let starts=0;
 class Legacy {start(){starts++;}}
 const unsupported=await openPrivateDictation({browser:{SpeechRecognition:Legacy}});
 assert.equal(unsupported.ok,false);
 Legacy.available=async()=> 'available';
 const noSwitch=await openPrivateDictation({browser:{SpeechRecognition:Legacy}});
 assert.equal(noSwitch.ok,false);
 assert.equal(starts,0);
});

test('offline language pack must be installed before opening mic',async()=>{
 let starts=0,installs=0,opts;
 class Offline {constructor(){this.processLocally=false;} start(){starts++;}}
 Offline.available=async o=>{opts=o;return 'downloadable';};
 Offline.install=async()=>{installs++;};
 const response=await openPrivateDictation({browser:{SpeechRecognition:Offline}});
 assert.equal(response.ok,false);
 assert.deepEqual(opts,{langs:['en-US'],processLocally:true});
 assert.equal(starts,0);assert.equal(installs,0);
});

test('cancelled vault session cannot open microphone after async browser check',async()=>{
 let starts=0;
 class Offline {constructor(){this.processLocally=false;} start(){starts++;}}
 Offline.available=async()=> 'available';
 const response=await openPrivateDictation({browser:{SpeechRecognition:Offline},mayStart:()=>false});
 assert.equal(response.ok,false);assert.equal(starts,0);
});

test('verified on-device recognition delivers editable text but never submits',async()=>{
 let instance,requested=0,final=[],status=[];
 class Offline {constructor(){this.processLocally=false;instance=this;} start(){requested++;}abort(){status.push('aborted');}}
 Offline.available=async()=> 'available';
 const response=await openPrivateDictation({browser:{SpeechRecognition:Offline},onText:t=>final.push(t),onStatus:s=>status.push(s)});
 assert.equal(response.ok,true);
 assert.equal(instance.processLocally,true);
 assert.equal(requested,1);
 instance.onresult({results:[[{transcript:'I want to meet my future self'}]]});
 assert.deepEqual(final,['I want to meet my future self']);
 assert.ok(status.includes('listening'));
 response.stop();assert.equal(status.at(-1),'idle');
});
