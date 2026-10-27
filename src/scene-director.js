/**
 * The causal-world renderer listens to a constrained *presentation* cue.
 * Generative text NEVER updates story economy, character memory or world facts.
 * The same renderer works offline with deterministic, authored cues.
 */
import {sanitizeGeneratedDialogue} from './future-dialogue.js';
export const SCENE_CUES=Object.freeze(['rain','warmth','wonder','quiet','resolve']);
export const SCENE_FOCI=Object.freeze(['people','infrastructure','memory']);
export function storyCueFor(question,world='self'){
 const text=String(question||'').slice(0,350).toLowerCase();
 if(/rain|weather|storm|night/.test(text))return 'rain';
 if(/invent|star|future|portal|discover|imagine|magic/.test(text))return 'wonder';
 if(/choice|protect|brave|fight|start|build/.test(text))return 'resolve';
 if(/rest|quiet|tired|slow|peace|calm/.test(text))return 'quiet';
 if(world==='self'||/friend|care|love|family|help|listen/.test(text))return 'warmth';
 return 'quiet';
}
const RESPONSE_KEYS=Object.freeze(['cue','focus','reply']);
function parseStructuredResponse(input){
 if(typeof input!=='string'||input.length>2048)return null;
 let value;try{value=JSON.parse(input);}catch{return null;}
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const keys=Object.keys(value).sort();
 if(keys.length!==RESPONSE_KEYS.length||keys.some((key,index)=>key!==RESPONSE_KEYS[index]))return null;
 if(typeof value.reply!=='string'||value.reply.trim().length===0||value.reply.length>600)return null;
 if(!SCENE_CUES.includes(value.cue)||!SCENE_FOCI.includes(value.focus))return null;
 const reply=sanitizeGeneratedDialogue(value.reply,600);
 return reply?{reply,cue:value.cue,focus:value.focus}:null;
}
export function parseDirectedResponse(content){
 if(typeof content!=='string'||content.length>2048)return null;
 const value=content.trim();if(!value)return null;
 if(value.startsWith('{')||value.startsWith('['))return parseStructuredResponse(value);
 if(value.length>600)return null;
 const reply=sanitizeGeneratedDialogue(value,600);
 return reply?{reply,cue:null,focus:null}:null;
}
export function safeSceneCue(candidate,fallback='warmth'){
 return SCENE_CUES.includes(candidate)?candidate:SCENE_CUES.includes(fallback)?fallback:'quiet';
}

/** A model can select one *presentation* dimension, never gameplay authority. */
export function parseDirectedFocus(input){
 return parseStructuredResponse(input)?.focus??null;
}
export function safeSceneFocus(value){return SCENE_FOCI.includes(value)?value:null;}
