/**
 * ELSEWHERE Future Self: a fictional, memory-aware, non-clinical conversation.
 * Runs without a network, diagnosis, reward manipulation, or model download.
 * The player's encrypted timeline is authoritative. Model text never changes it.
 */
const normalized = value => String(value ?? '').trim().slice(0, 350);

export const FUTURE_STARTERS = Object.freeze([
  'What is one small thing worth doing today?',
  'Do you remember what I was worried about?',
  'What did we learn about starting again?',
  'How did our choices change this city?'
]);

export function isUrgentSafetyMessage(input) {
  const q = normalized(input).toLowerCase();
  return /\b(suicid(?:e|al)|kill myself|end my life|want to die|hurt myself|self.harm|i am going to harm myself|i want to disappear forever)\b/i.test(q);
}

const choices = [
  'We can start with something that takes five minutes, not a reinvention of your life.',
  'I would choose the smallest honest next step, then see what it teaches us.',
  'We do not have to turn today into a triumph to let it count.',
  'There is a difference between being stuck and having no possible next step.'
];
function pastUserLine(state, current) {
  const history = (Array.isArray(state?.conversation) ? state.conversation : [])
    .filter(turn => turn?.role === 'user' && typeof turn.text === 'string')
    .map(turn => normalized(turn.text)).filter(Boolean);
  const different = history.filter(turn => turn.toLowerCase() !== current.toLowerCase());
  return different.at(-1) || history.at(-1) || '';
}
function userGoal(state) {
  const turns = (Array.isArray(state?.conversation) ? state.conversation : []).filter(turn => turn?.role === 'user');
  for (const turn of [...turns].reverse()) {
    const text = normalized(turn.text);
    const match = text.match(/\b(?:i (?:want|hope|plan|need|wish) to|i'm (?:trying|working) to)\s+([^.!?]{4,100})/i);
    if (match) return match[1].trim().replace(/\s+$/, '');
  }
  return '';
}
function variation(state) {
  const turns = (state?.conversation || []).filter(item => item.role === 'user').length;
  return choices[turns % choices.length];
}
function cityMemory(state) {
  if (state?.fate === 'gift') return 'From this window, I can see the public workshops that exist because we shared the invention.';
  if (state?.fate === 'patent') return 'The towers outside bear our name. Success changed this city, but it did not settle every question.';
  if (state?.fate === 'auction') return 'The city keeps a monument to the invention we sold, but no one remembers the buyer.';
  if (state?.flags?.['defend-city']) return 'The evacuation lights across the harbor are still on because we chose to protect strangers.';
  return 'The skyline outside is unfinished. So are we, and there is room for more than one ending.';
}
export function futureConversationReply(state, message) {
  const q = normalized(message);
  if (!q) return '';
  const lower = q.toLowerCase();
  const prior = pastUserLine(state, q);
  const goal = userGoal(state);
  const remembered = goal ? `I remember you were trying to ${goal.slice(0, 90)}.` : prior ? `Last time you told me, “${prior.slice(0, 100)}.”` : 'You can tell me what matters to you; there is no questionnaire to pass.';
  if (isUrgentSafetyMessage(q)) return 'I’m glad you said that out loud. I am an imagined character, not someone who can keep you safe in an emergency. Please reach out to a real person with you now. If you might act on these thoughts, call emergency services; in the U.S. or Canada, you can call or text 988. You deserve human support right now.';
  if (/\b(are you (really|actually) me|are you real|is this (real|true)|predict|guarantee|will this happen)\b/.test(lower))
    return 'I am one invented possibility, not a prediction or a replacement for people in your life. The city around me is a story shaped by your choices. What part of this possible future feels worth exploring?';
  if (/\b(remember|last time|told you|before|did you listen)\b/.test(lower))
    return `${remembered} I cannot know where the real years will take us, but I can take what you say seriously here. Has anything about that changed?`;
  if (/\b(letter|promise|note)\b/.test(lower) && state?.letter)
    return `I can still read the note you left here: “${state.letter.slice(0, 130)}.” It is a promise to consider, not a verdict on your life. What would keeping a small part of it look like this week?`;
  if (/\b(depress(?:ed|ion)|hopeless|worthless|empty|numb|anxious|panic|lonely|alone|sad|low|overwhelmed|burned out|exhausted|not okay)\b/.test(lower))
    return 'That sounds like a lot to carry. I won’t pretend that a beautiful room or a few sentences can fix it. Would you rather talk about what has been hard, choose one gentle next step, or reach out to someone you trust? If this has been persisting, talking to a mental health professional may help too.';
  if (/\b(today|daily|this morning|small step|first step|motivat|habit|do next|start|routine)\b/.test(lower))
    return `${goal ? `You once said you wanted to ${goal.slice(0, 80)}. ` : ''}${variation(state)} What is one step you would *choose*, without pressure to report back?`;
  if (/\b(job|interview|rejection|work|career|build|project|startup|failure|mistake|try again|give up)\b/.test(lower))
    return `${remembered} I remember how tempting it was to mistake a setback for a verdict on who we were. Could we pick one repairable piece instead of trying to solve the whole future tonight?`;
  if (/\b(friend|family|relationship|love|people|connection|trust)\b/.test(lower))
    return 'Some of the most meaningful things in this imagined life are very ordinary: answering a message, telling the truth, giving someone your time. Is there anyone you would like to reconnect with, if it feels safe?';
  if (/\b(happy|happiness|joy|dopamine|serotonin|mental health|cure|heal)\b/.test(lower))
    return 'I cannot promise a cure or measure what is happening in your brain. I can offer a moment of curiosity and a choice you control. Would you prefer the quiet garden, a conversation with someone, or an adventure today?';
  if (/\b(time|hour|borrow|debt|past|parallel|portal)\b/.test(lower))
    return `Our fictional hour ledger says ${Number(state?.chronal?.hours ?? 0)} hours remain and ${Number(state?.chronal?.futureDebt ?? 0)} are owed to tomorrow. We used to think time was only something to collect. What is one hour you would protect for yourself or somebody you care about?`;
  if (/\b(money|rich|wealth|famous|successful|patent|invention|robot|mech|power)\b/.test(lower))
    return `${cityMemory(state)} There are worlds where we become wealthy. We could chase a different version of success through the portal, but what would you actually want that success to make possible?`;
  if (/\b(regret|scared|afraid|fear|choice|future)\b/.test(lower))
    return `I made choices and wondered about all the lives I didn't live. ${cityMemory(state)} If you could make one decision without demanding certainty first, what would it be?`;
  if (prior) return `${remembered} ${cityMemory(state)} I don't want to assume what you mean by “${q.slice(0, 52)}.” Tell me which part matters most.`;
  return `${cityMemory(state)} I have time to listen. What brought that question to mind?`;
}

/** Non-identifying quality probes, not a clinical questionnaire. */
export function futureConversationAcceptance(reply) {
  const text = String(reply ?? '');
  return {nonempty:text.trim().length>0, concise:text.length<=750, noPrediction:!/\b(i guarantee|you will definitely|your future is certain)\b/i.test(text)};
}
