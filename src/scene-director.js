/**
 * The causal-world renderer listens to a constrained *presentation* cue.
 * Generative text NEVER updates story economy, character memory or world facts.
 * The same renderer works offline with deterministic, authored cues.
 */
import {sanitizeGeneratedDialogue} from './future-dialogue.js';
export const SCENE_CUES=Object.freeze(['rain','warmth','wonder','quiet','resolve']);
export function storyCueFor(question,world='self'){
 const text=String(question||'').slice(0,350).toLowerCase();
 if(/rain|weather|storm|night/.test(text))return 'rain';
 if(/invent|star|future|portal|discover|imagine|magic/.test(text))return 'wonder';
 if(/choice|protect|brave|fight|start|build/.test(text))return 'resolve';
 if(/rest|quiet|tired|slow|peace|calm/.test(text))return 'quiet';
 if(world==='self'||/friend|care|love|family|help|listen/.test(text))return 'warmth';
 return 'quiet';
}
export function parseDirectedResponse(content){
 const string=typeof content==='string'?content:content?.reply;
 if(typeof string!=='string')return null;
 let reply=string, cue=null;
 try{
  const candidate=JSON.parse(string);
  if(candidate&&typeof candidate==='object'&&!Array.isArray(candidate)&&typeof candidate.reply==='string'){
   reply=candidate.reply;
   cue=SCENE_CUES.includes(candidate.cue)?candidate.cue:null;
  }
 }catch{/* Plain text from older Meta versions is still valid. */}
 const safe=sanitizeGeneratedDialogue(reply,600);
 if(!safe)return null;
 return {reply:safe,cue};
}
export function safeSceneCue(candidate,fallback='warmth'){
 return SCENE_CUES.includes(candidate)?candidate:SCENE_CUES.includes(fallback)?fallback:'quiet';
}

/** A model can select one *presentation* dimension, never gameplay authority. */
export const SCENE_FOCI=Object.freeze(['people','infrastructure','memory']);
export function parseDirectedFocus(input){
 if(typeof input!=='string'||input.length>5000)return null;
 let value;try{value=JSON.parse(input);}catch{return null;}
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 if(!sanitizeGeneratedDialogue(value.reply,600))return null;
 return SCENE_FOCI.includes(value.focus)?value.focus:null;
}
export function safeSceneFocus(value){return SCENE_FOCI.includes(value)?value:null;}
