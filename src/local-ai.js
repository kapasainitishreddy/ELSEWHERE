/**
 * Session-optional, same-device inference requests for ELSEWHERE.
 * No key, letter, vault data, parallel-world snapshot or other character's memory
 * is included. The receiving service is loopback-only and does not persist prompts.
 */
import { CAST } from './characters.js';

export const LOCAL_AI_PATH = '/api/local-dialogue';
export function isLoopbackHostname(hostname) {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(String(hostname).toLowerCase());
}
const boundedText = (value, length) => typeof value === 'string' ? value.trim().slice(0, length) : '';
const cappedInt = (value, low, high) => Math.min(high, Math.max(low, Number.isFinite(value) ? Math.round(value) : low));

/** Export only a controlled, bounded fiction summary and this character's memory. */
export function localCharacterRequest(state, id, question) {
  const actor = CAST[id];
  const clean = boundedText(question, 350);
  if (!actor || !clean || actor.world !== state?.world) return null;
  const memory = state.cast?.[id] || {};
  return {
    id,
    question: clean,
    branch: state.parallel?.active === 'echo' ? 'echo' : 'prime',
    context: {
      mood: ['watchful', 'hopeful', 'wary', 'grateful', 'angry', 'curious'].includes(memory.mood) ? memory.mood : 'watchful',
      affinity: cappedInt(memory.affinity, -100, 100),
      memories: Array.isArray(memory.memories) ? memory.memories.slice(-5).map(x=>boundedText(x, 180)).filter(Boolean) : [],
      dialogue: Array.isArray(memory.dialogue) ? memory.dialogue.slice(-3).map(x=>({
        question: boundedText(x?.question, 180), reply: boundedText(x?.reply, 380)
      })) : [],
      fiction: {
        invention: boundedText(state.invention, 20), fate: boundedText(state.fate, 20),
        power: boundedText(state.power, 20), ending: boundedText(state.ending, 20),
        credits: cappedInt(state.credits, 0, 100000000), fame: cappedInt(state.fame, 0, 100000),
        trust: cappedInt(state.trust, 0, 100000), hours: cappedInt(state.chronal?.hours, 0, 100000),
        pastDebt: cappedInt(state.chronal?.pastDebt, 0, 100000),
        futureDebt: cappedInt(state.chronal?.futureDebt, 0, 100000)
      }
    }
  };
}
export function sanitizeLocalReply(data) {
  if (!data || typeof data.reply !== 'string' || !data.reply.trim()) return null;
  return data.reply.trim().slice(0, 600);
}
