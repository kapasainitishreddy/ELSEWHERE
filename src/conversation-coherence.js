/** A second, deterministic guard between generated language and the player.
 * No network, embeddings, demographics, subjective mood classification or logging.
 * Checks likely factual contradictions and repeated filler, not artistic style.
 */
import {sanitizeGeneratedDialogue} from './future-dialogue.js';

const normalize=s=>String(s??'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const compact=s=>normalize(s).split(' ').filter(Boolean);

export function overlapScore(a,b) {
  const x=new Set(compact(a)),y=new Set(compact(b));
  if (!x.size || !y.size) return 0;
  let shared=0;for(const word of x)if(y.has(word))shared++;
  return shared/Math.max(x.size,y.size);
}

export function reviewGeneratedCharacterReply(state,actor,reply) {
  const text=sanitizeGeneratedDialogue(reply,600);
  if (!text) return {ok:false,reason:'Unsupported or unsafe generated claim'};
  const lower=normalize(text);
  if (/\bas an ai (?:language model|assistant)\b/i.test(text))return {ok:false,reason:'Out-of-character assistant reply'};
  if (/\b(?:i remember (?:raising you|your childhood|when you were a child)|we (?:grew up|went to school) together)\b/i.test(text))
    return {ok:false,reason:'Claims an unprovided real-life memory'};
  if (actor==='elder') {
    if (!state?.invention && /\b(?:we|you) (?:invented|patented|auctioned) (?:the|a|an)\b/i.test(text))
      return {ok:false,reason:'Claims an invention that has not happened'};
    if (state?.fate!=='gift' && /\b(?:you|we) (?:gave|gifted|shared) (?:the|our) invention (?:to|with) (?:everyone|the public|the workers)\b/i.test(text))
      return {ok:false,reason:'Claims a public invention outcome that has not happened'};
    if (state?.fate!=='patent' && /\b(?:you|we) (?:patented|own the patents? on) (?:the|our) invention\b/i.test(text))
      return {ok:false,reason:'Claims a patent outcome that has not happened'};
    const replies=(state?.conversation||[]).filter(turn=>turn?.role==='assistant').slice(-3).map(turn=>turn.text);
    if (replies.some(prior=>normalize(prior)===lower || (compact(text).length>=14 && overlapScore(prior,text)>.88)))
      return {ok:false,reason:'Repeated dialogue'};
  } else {
    const prior=(state?.cast?.[actor]?.dialogue||[]).slice(-3).map(d=>d?.reply).filter(Boolean);
    if(prior.some(line=>normalize(line)===lower))return {ok:false,reason:'NPC repeated previous line'};
  }
  return {ok:true,reply:text};
}
