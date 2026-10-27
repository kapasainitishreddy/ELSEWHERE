/** Player-authored memory cards. Never inferred by AI, never transmitted to Meta.
 * These cards become part of the encrypted vault and are isolated per branch.
 */
export const MAX_MEMORY_CARDS = 6;
export const MAX_MEMORY_LENGTH = 220;
const normalize = text => typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';

export function sanitizeMemoryCards(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const cards = [];
  for (const item of raw) {
    const text = normalize(typeof item === 'string' ? item : item?.text).slice(0, MAX_MEMORY_LENGTH);
    const key = text.toLocaleLowerCase();
    if (text.length < 4 || seen.has(key)) continue;
    seen.add(key);
    cards.push({ text });
  }
  return cards.slice(-MAX_MEMORY_CARDS);
}

export function updateMemoryCards(state, action, value) {
  const cards = sanitizeMemoryCards(state?.memoryCards);
  if (action === 'pin') {
    const text = normalize(value);
    if (text.length < 4 || text.length > MAX_MEMORY_LENGTH)
      return { ok: false, error: `Enter a memory between 4 and ${MAX_MEMORY_LENGTH} characters.` };
    if (cards.some(item => item.text.toLowerCase() === text.toLowerCase()))
      return { ok: false, error: 'You have already kept this memory.' };
    cards.push({text});
  } else if (action === 'forget') {
    if (!Number.isInteger(value) || value < 0 || value >= cards.length)
      return { ok: false, error: 'That memory is no longer present.' };
    cards.splice(value, 1);
  } else return { ok: false, error: 'Unsupported memory action.' };
  return {ok:true,state:{...state,memoryCards:cards.slice(-MAX_MEMORY_CARDS),revision:(state.revision||0)+1}};
}

export function pinnedRecall(state) {
  return sanitizeMemoryCards(state?.memoryCards).map(card => card.text);
}
