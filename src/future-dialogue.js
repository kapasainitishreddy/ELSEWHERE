/**
 * ELSEWHERE Future Self: a fictional, memory-aware, non-clinical conversation.
 * Runs without a network, diagnosis, reward manipulation, or model download.
 * The player's encrypted timeline is authoritative. Model text never changes it.
 */
import {pinnedRecall} from './memory-cards.js';
const normalized = value => String(value ?? '').trim().slice(0, 350);

export const FUTURE_STARTERS = Object.freeze([
  'What is one small thing worth doing today?',
  'Do you remember what I was worried about?',
  'What did we learn about starting again?',
  'Tell me about an ordinary day we might live in 2046.'
]);

export function isUrgentSafetyMessage(input) {
  const q = normalized(input).toLowerCase();
  return /\b(suicid(?:e|al)|kill myself|end my life|want to die|hurt myself|self.harm|i am going to harm myself|i want to disappear forever|i don.t want to live|i can.t keep living|i might hurt myself)\b/i.test(q);
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
function compassHint(state) {
  const value=state?.compass;
  if(!value?.step||value.status==='empty')return '';
  const text=normalized(value.step).slice(0,155);
  return value.status==='tried'
    ? `You gave “${text}” a try. Nothing here grades the outcome.`
    : `You chose “${text}” for yourself. There's no deadline and you can always change your mind.`;
}
function followUp(state, prior) {
  const compass=compassHint(state);
  if(compass)return `${compass} What did you notice about trying it, even if it didn't go as planned?`;
  if(/write|book|story|draw|paint|create/i.test(prior))return 'We could begin with a single rough sentence or a sketch no one else needs to see. What part of making something feels interesting to you right now?';
  if(/job|work|career|interview|build|startup/i.test(prior))return 'I would narrow it to one controllable move: ask for feedback, send one thoughtful application, or finish a small piece of the work. Which feels possible rather than overwhelming?';
  if(/friend|family|relationship|lonely|alone/i.test(prior))return 'Sometimes one genuine message is enough for today. You can choose who feels safe and when to reach out. Would connection help, or would quiet feel kinder?';
  if(/time|hour|past|future|portal/i.test(prior))return `This timeline has ${Number(state?.chronal?.hours??0)} fictional hours available. I wonder which ordinary hour you'd protect if nobody could buy it from you.`;
  return 'Maybe the first thing is naming what matters, before choosing what to do. We can explore another possible future, or stay right here and talk.';
}
/** Reject unsafe claims in optional local/cloud model narration; fallback is authored dialogue. */
export function sanitizeGeneratedDialogue(raw,limit=600) {
  const value=typeof raw==='string'?raw:raw?.reply;
  if(typeof value!=='string')return null;
  const text=value.trim().slice(0,Math.max(20,Math.min(1200,limit)));
  if(!text)return null;
  const forbidden=[
    /\b(?:guarantee|promise)\s+(?:that\s+)?(?:your|you|the)\s+(?:future|depression|life|recovery)\b/i,
    /\b(?:cure|cures|cured|treats|treat)\s+(?:your\s+|all\s+)?(?:depression|mental illness|anxiety)\b/i,
    /\b(?:boost|boosts|raise|raises|increase|increases|optimize|optimizes)\s+(?:your\s+|the\s+)?(?:dopamine|serotonin)\b/i,
    /\b(?:quit|stop|skip|avoid)\s+(?:your\s+|taking\s+)?(?:medication|antidepressants|therapy)\b/i,
    /\b(?:only i|no one else)\s+(?:can help|understands|really cares)\b/i,
    /\b(?:you will definitely|your future is certain|i can predict your future)\b/i
  ];
  return forbidden.some(pattern=>pattern.test(text))?null:text;
}
function cityMemory(state) {
  if (state?.fate === 'gift') return 'From this window, I can see the public workshops that exist because we shared the invention.';
  if (state?.fate === 'patent') return 'The towers outside bear our name. Success changed this city, but it did not settle every question.';
  if (state?.fate === 'auction') return 'The city keeps a monument to the invention we sold, but no one remembers the buyer.';
  if (state?.flags?.['defend-city']) return 'The evacuation lights across the harbor are still on because we chose to protect strangers.';
  return 'The skyline outside is unfinished. So are we, and there is room for more than one ending.';
}
/** Vignettes are authored alternate-history fiction, never personal predictions. */
export function possibleFutureVignette(state) {
  if(state?.fate==='gift')
    return 'This morning I passed the public workshop. A little girl was teaching her grandfather to repair a lamp powered by the invention we gave away. I bought bread, carried it home through the rain, and remembered that sharing something can keep changing a city long after we stop watching.';
  if(state?.fate==='patent')
    return 'A tram stopped outside a tower with our name on it. I used to stare at that name and wonder whether it made me important. Today I let the next tram go, sat beside a stranger, and listened to her describe a small idea nobody had funded yet.';
  if(state?.fate==='auction')
    return 'The city has a museum exhibit about the invention we sold. The plaque talks about a fortune, but not the people who built it. I spent my morning asking the archivist whether we could add their names. There are always more choices after the big one.';
  if(state?.flags?.['defend-city'])
    return 'After the breakwater defense, the city felt strangely quiet. I walked past the harbor where the evacuation lights still worked, and a mechanic waved from a rooftop. Sometimes the best adventure is the ordinary day that comes afterward.';
  return 'I got up, made tea, and watched the sunlight crawl across this table. On the shelf are train tickets from places we might visit and an unopened letter. Nothing spectacular happened, and I found myself grateful that this version of life still had room for a new decision.';
}

export function futureConversationReply(state, message) {
  const q = normalized(message);
  if (!q) return '';
  const lower = q.toLowerCase();
  const prior = pastUserLine(state, q);
  const goal = userGoal(state);
  const compass=compassHint(state);
  const pinned=pinnedRecall(state);
  const remembered = pinned.length ? `You specifically asked me to keep this memory: “${pinned.at(-1).slice(0, 150)}.”` : goal ? `I remember you were trying to ${goal.slice(0, 90)}.` : prior ? `Last time you told me, “${prior.slice(0, 100)}.”` : 'You can tell me what matters to you; there is no questionnaire to pass.';
  if (isUrgentSafetyMessage(q)) return 'I’m glad you said that out loud. I am an imagined character, not someone who can keep you safe in an emergency. Please reach out to a real person with you now. If you might act on these thoughts, call emergency services; in the U.S. or Canada, you can call or text 988. You deserve human support right now.';
  if (/\b(are you (really|actually) me|are you real|is this (real|true)|predict|guarantee|will this happen)\b/.test(lower))
    return 'I am one invented possibility, not a prediction or a replacement for people in your life. The city around me is a story shaped by your choices. What part of this possible future feels worth exploring?';
  if (/^(?:yes|yeah|okay|ok|please|tell me more|go on|why|how|and then|what next)[.!? ]*$/.test(lower))
    return followUp(state,prior);
  if (/\b(?:tell me (?:a story|about (?:your|our|an ordinary) day)|what (?:is|was|will) (?:an ordinary day|your life) like|what happened (?:this morning|yesterday)|show me (?:our|the) future)\b/i.test(lower))
    return `${possibleFutureVignette(state)} Of all those details, which one would you have wanted to see for yourself?`;
  if (/\b(?:do you know my name|what is my name|do you know everything about me|have you seen my real future)\b/.test(lower))
    return 'I only know what you choose to tell me in this world, and what happens in this fictional timeline. I would rather ask than pretend I know the years you have not lived. What should I understand about you?';
  if (/\b(?:i (?:tried|did it|finished|made it|started)|i gave it a try)\b/.test(lower))
    return `${compass||'You came back and told me you tried something. That matters more than a perfect outcome.'} What was the experience like for you?`;
  if (/\b(?:my (?:intention|small step|compass|plan)|the (?:small step|compass)|did i (?:plan|choose))\b/.test(lower))
    return compass ? `${compass} Would you like to keep it, change it, or leave it for another day?` : 'You have not left yourself an intention here yet. We could choose one that takes only a few minutes, or skip it entirely.';
  if (/\b(remember|last time|told you|before|did you listen)\b/.test(lower))
    return `${remembered} I cannot know where the real years will take us, but I can take what you say seriously here. Has anything about that changed?`;
  if (/\b(letter|promise|note)\b/.test(lower) && state?.letter)
    return `I can still read the note you left here: “${state.letter.slice(0, 130)}.” It is a promise to consider, not a verdict on your life. What would keeping a small part of it look like this week?`;
  if (/\b(depress(?:ed|ion)|hopeless|worthless|empty|numb|anxious|panic|lonely|alone|sad|low|overwhelmed|burned out|exhausted|not okay)\b/.test(lower))
    return 'That sounds like a lot to carry. I won’t pretend that a beautiful room or a few sentences can fix it. Would you rather talk about what has been hard, choose one gentle next step, or reach out to someone you trust? If this has been persisting, talking to a mental health professional may help too.';
  if (/\b(today|daily|this morning|small step|first step|motivat|habit|do next|start|routine)\b/.test(lower))
    return `${compass ? compass+' ' : goal ? `You once said you wanted to ${goal.slice(0, 80)}. ` : ''}${variation(state)} What is one step you would *choose*, without pressure to report back?`;
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
