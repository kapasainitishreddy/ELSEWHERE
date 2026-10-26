/**
 * ELSEWHERE's deterministic causal-world state machine.
 * The AI narrates worlds but never awards currency, superpowers or achievements.
 * All economy and timeline mutations happen here, and can be tested offline.
 */
export const SAVE_KEY = 'syrava.elsewhere.v1';
export const WORLDS = Object.freeze({
  future: { id: 'future', name: 'Neo Elysium', kicker: 'WORLD 01 · YEAR 2087', year: '2087', type: 'THE POSSIBLE FUTURE', description: 'A city that remembers every decision made in another century.', atmosphere: 'Neon rain. Sky traffic. A thousand lives unfolding.' },
  self: { id: 'self', name: 'The Other You', kicker: 'WORLD 02 · ANOTHER TOMORROW', year: '2046', type: 'FUTURE-SELF ENCOUNTER', description: 'A quiet room. An older stranger. The questions you have avoided.', atmosphere: 'Some conversations change the past without time travel.' },
  past: { id: 'past', name: 'The First Spark', kicker: 'WORLD 03 · YEAR 1889', year: '1889', type: 'ALTERED HISTORY', description: 'Arrive with knowledge of tomorrow. Decide what the past deserves.', atmosphere: 'Every invention sends ripples into the future.' },
  dungeon: { id: 'dungeon', name: 'The Hollow Crown', kicker: 'WORLD 04 · THE FORGOTTEN REALM', year: 'AGELESS', type: 'DUNGEONS & POWERS', description: 'Choose a power. Descend into a kingdom that should not exist.', atmosphere: 'Magic has a price. So does the crown.' },
  mech: { id: 'mech', name: 'Titan Foundry', kicker: 'WORLD 05 · YEAR 2199', year: '2199', type: 'MECH PILOT SIMULATION', description: 'Synchronize with your machine. Defend the last light of a distant world.', atmosphere: 'A steel giant moves because you do.' }
});

const AVAILABLE_INVENTIONS = Object.freeze({
  cell: { name: 'Aether Cell', description: 'A fictional clean-energy storage device, decades ahead of its era.', cost: 250, upside: 12700, city: 'clean' },
  oracle: { name: 'Clockwork Oracle', description: 'An early computational engine that reshapes communication.', cost: 350, upside: 15100, city: 'surveillance' },
  rail: { name: 'Skyrail Drive', description: 'An impossible propulsion breakthrough for the 19th century.', cost: 500, upside: 17800, city: 'skyrail' }
});
export { AVAILABLE_INVENTIONS as INVENTIONS };

export function initialState() {
  return {
    version: 1, world: 'future', credits: 1200, fame: 0, trust: 10, influence: 0,
    invention: null, fate: null, power: null, dungeonOutcome: null,
    pilotTrained: false, mechDeployed: false, owned: [], flags: {},
    history: [{ at: 1, title: 'The first crossing', detail: 'You arrived in Neo Elysium with only your choices.', world: 'future' }],
    conversation: [], revision: 0
  };
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const has = (s, item) => s.owned.includes(item);
const once = (s, action) => Boolean(s.flags[action]);
const copy = (s) => structuredClone(s);

export function worldOptions(s) {
  switch (s.world) {
    case 'future': return [
      { id: 'buy-penthouse', title: 'Buy the sky residence', detail: 'Own a home above the clouds.', price: 4800, disabled: has(s,'penthouse') || s.credits < 4800, reason: has(s,'penthouse') ? 'Already owned' : '4,800 credits' },
      { id: 'invest-robotics', title: 'Invest in robotics', detail: 'Back the future of human-machine collaboration.', price: 3200, disabled: once(s,'invest-robotics') || s.credits < 3200, reason: once(s,'invest-robotics') ? 'Investment made' : '3,200 credits' },
      { id: 'collect-dividend', title: 'Collect your return', detail: 'An investment matures across the timeline.', disabled: !once(s,'invest-robotics') || once(s,'collect-dividend'), reason: once(s,'collect-dividend') ? 'Collected' : 'Requires investment' },
      { id: 'fund-city', title: 'Fund a public library', detail: 'Turn your fortune into a lasting public good.', price: 2200, disabled: once(s,'fund-city') || s.credits < 2200, reason: once(s,'fund-city') ? 'Already founded' : '2,200 credits' }
    ];
    case 'past': return s.invention ? [
      { id: 'patent', title: 'Patent it. Build an empire.', detail: 'Sell licenses, earn wealth and become famous.', disabled: Boolean(s.fate), reason: s.fate ? 'Fate already chosen' : 'Own the invention' },
      { id: 'gift', title: 'Give it to the world', detail: 'A better future for everyone, not just you.', disabled: Boolean(s.fate), reason: s.fate ? 'Fate already chosen' : 'Public trust' },
      { id: 'auction', title: 'Sell it to the highest bidder', detail: 'Quick fortune. Uncertain consequences.', disabled: Boolean(s.fate), reason: s.fate ? 'Fate already chosen' : 'Short-term wealth' }
    ] : Object.entries(AVAILABLE_INVENTIONS).map(([id, invention]) => ({
      id: `invent-${id}`, title: `Invent ${invention.name}`, detail: invention.description, price: invention.cost,
      disabled: s.credits < invention.cost, reason: `${invention.cost} credits to prototype`
    }));
    case 'dungeon': return s.power ? [
      { id: 'face-warden', title: 'Face the Hollow Warden', detail: 'Use your power to claim the chamber.', disabled: Boolean(s.dungeonOutcome), reason: s.dungeonOutcome ? 'Encounter completed' : 'Dungeon challenge' },
      { id: 'sell-relic', title: 'Sell the Chrono Relic', detail: 'Exchange a timeless artifact for a fortune.', disabled: s.dungeonOutcome !== 'victory' || once(s,'relic-decision'), reason: once(s,'relic-decision') ? 'Choice made' : 'Requires victory' },
      { id: 'guard-relic', title: 'Protect the relic', detail: 'Some power should never belong to anyone.', disabled: s.dungeonOutcome !== 'victory' || once(s,'relic-decision'), reason: once(s,'relic-decision') ? 'Choice made' : 'Requires victory' }
    ] : [
      { id: 'power-phase', title: 'Learn Phase Shift', detail: 'Slip between seconds and dodge solid matter.' },
      { id: 'power-gravity', title: 'Learn Gravity Weaving', detail: 'Draw objects toward you and suspend them in the air.' },
      { id: 'power-storm', title: 'Learn Storm Calling', detail: 'Conduct electricity through forgotten runes.' }
    ];
    case 'mech': return [
      { id: 'train-pilot', title: 'Synchronize with ATLAS-09', detail: 'Establish a neural link and activate your mech.', disabled: s.pilotTrained, reason: 'One-time pilot certification' },
      { id: 'deploy-mech', title: 'Drive your titan', detail: 'Take direct control. Use WASD or arrow keys to move.', disabled: !s.pilotTrained, reason: s.pilotTrained ? 'Enter pilot mode' : 'Train first' },
      { id: 'defend-city', title: 'Defend the breakwater', detail: 'Save a coastal settlement. Your choices will be remembered.', disabled: !s.pilotTrained || once(s,'defend-city'), reason: once(s,'defend-city') ? 'Mission complete' : 'Requires pilot link' }
    ];
    case 'self': return [
      { id: 'confess', title: 'Ask about your biggest regret', detail: 'Hear an uncomfortable possibility.' },
      { id: 'purpose', title: 'Ask what mattered most', detail: 'Find out what survived the years.' },
      { id: 'paths', title: 'Ask what could have changed', detail: 'Explore the person you might still become.' }
    ];
    default: return [];
  }
}

export function futureProfile(s) {
  const wealthy = s.credits >= 10000 || has(s,'penthouse');
  const famous = s.fame >= 40;
  const guardian = s.trust >= 40 || once(s,'defend-city');
  if (wealthy && famous && s.fate === 'patent') {
    return { headline: 'The magnate timeline', badge: 'WEALTH & RENOWN',
      speech: 'You got rich by changing history. The city knows our name. But I still wonder who would have benefited if we had shared the discovery.',
      warning: 'A celebrated inventor. A world changed by private ownership.' };
  }
  if (guardian) return { headline: 'The guardian timeline', badge: 'SERVICE & LEGACY',
    speech: 'The headlines faded, but the people we helped kept living. That turned out to matter more than the things we could buy.',
    warning: 'A legacy measured in lives rather than coins.' };
  if (famous) return { headline: 'The legend timeline', badge: 'REPUTATION',
    speech: 'Everyone remembers our inventions. The strange part? Fame answered almost none of the questions I thought it would.',
    warning: 'A famous name. An uncertain inner life.' };
  if (wealthy) return { headline: 'The prosperous timeline', badge: 'WEALTH',
    speech: 'We built something valuable. We bought the view we dreamed about. I had to learn that having choices is different from knowing how to choose.',
    warning: 'Fortune grants freedom, not a guaranteed ending.' };
  return { headline: 'The unwritten timeline', badge: 'OPEN POSSIBILITY',
    speech: 'You keep wondering which choice will make everything work out. I cannot tell you. I am just one possible version of us. You still get to decide.',
    warning: 'Your future is a possibility, never a prediction.' };
}

export function cityRipple(s) {
  if (!s.invention || !s.fate) return {label:'ORIGINAL TIMELINE', skyrail:false, cell:false, surveillance:false};
  const cell = s.invention === 'cell';
  return {label:`ALTERED · ${s.fate.toUpperCase()}`, skyrail: s.invention === 'rail', cell, surveillance: s.invention === 'oracle'};
}

export function dialogueFallback(s, message) {
  const q = message.toLowerCase();
  const f = futureProfile(s);
  if (/rich|money|wealth|buy|famous|success|fortune|business/.test(q)) return s.fate === 'patent'
    ? 'We made a fortune from that invention. Yes, we could buy almost anything. But money kept expanding the questions, not answering them.'
    : 'There are futures where we become wealthy, but no future guarantees happiness. What would we want the money to make possible?';
  if (/regret|mistake|wrong|failure/.test(q)) return 'I regret the moments when I let fear decide for me. Not every bold choice succeeded, but the decisions I never made still echo.';
  if (/love|friend|family|alone|relationship/.test(q)) return 'The people who stayed mattered. So did the ones we made space to leave. A meaningful life is not a collection of people we convinced to stay.';
  if (/past|invent|change|timeline/.test(q)) return s.fate
    ? `You changed history with the ${AVAILABLE_INVENTIONS[s.invention].name}. Look outside. The effects are real in this simulation, but there are always consequences.`
    : 'You can visit the First Spark and bring impossible knowledge into 1889. The future will change, but no invention tells you what kind of person to become.';
  if (/power|dungeon|magic|robot|mech|pilot/.test(q)) return 'Every world offers a new way to be powerful. In the end, our choices about that power follow us home.';
  return `${f.speech} Ask me about a regret, money, the past, power, or the paths we did not take.`;
}

function write(s, actionId, title, detail) {
  s.revision += 1;
  s.history.unshift({ at: s.revision + 1, title, detail, world: s.world });
  s.history = s.history.slice(0, 32);
  s.credits = Math.max(0, Math.floor(s.credits));
  s.fame = clamp(s.fame, 0, 999);
  s.trust = clamp(s.trust, 0, 999);
  s.influence = clamp(s.influence, 0, 999);
  if (actionId) s.flags[actionId] = true;
  return s;
}

export function travel(state, world) {
  if (!WORLDS[world]) return { ok: false, state, error: 'Unknown destination.' };
  if (state.world === world) return { ok: true, state, event: null };
  const s = copy(state); s.world = world;
  const event = { title: `Crossed into ${WORLDS[world].name}`, detail: WORLDS[world].description };
  return { ok: true, state: write(s, null, event.title, event.detail), event };
}

export function applyAction(state, id) {
  const option = worldOptions(state).find((item) => item.id === id);
  if (!option) return { ok:false, state, error: 'This action is not available in this world.' };
  if (option.disabled) return { ok:false, state, error: option.reason || 'That choice is locked.' };
  const s = copy(state);
  let event = { title: option.title, detail: option.detail };
  if (id.startsWith('invent-')) {
    const kind = id.substring('invent-'.length); const invention = AVAILABLE_INVENTIONS[kind];
    if (!invention || s.invention) return { ok:false, state, error:'Prototype unavailable.' };
    s.credits -= invention.cost; s.invention = kind; s.fame += 5;
    event = { title: `${invention.name} prototyped`, detail: 'You introduced an impossible idea to 1889. Choose who owns it.' };
  } else if (['patent','gift','auction'].includes(id)) {
    if (!s.invention || s.fate) return { ok:false, state, error:'The invention was already decided.' };
    s.fate = id;
    const invention = AVAILABLE_INVENTIONS[s.invention];
    if (id === 'patent') { s.credits += invention.upside; s.fame += 62; s.trust = Math.max(0, s.trust - 7); s.influence += 32; }
    if (id === 'gift') { s.credits += 1400; s.fame += 37; s.trust += 50; s.influence += 17; }
    if (id === 'auction') { s.credits += Math.floor(invention.upside * .7); s.fame += 22; s.trust = Math.max(0, s.trust - 5); s.influence += 6; }
    event = { title: id === 'patent' ? 'An empire begins in 1889' : id === 'gift' ? 'The world receives your invention' : 'The invention is sold',
      detail: `${invention.name} changed history. Your 2087 city and future self will now reflect this choice.` };
  } else if (id === 'buy-penthouse') {
    s.credits -= 4800; s.owned.push('penthouse'); event = {title:'A home above the clouds',detail:'Your private sky residence now overlooks the altered city.'};
  } else if (id === 'invest-robotics') {
    s.credits -= 3200; s.influence += 8; event={title:'A stake in tomorrow',detail:'You invested in human-machine research. Your future return can be collected once.'};
  } else if (id === 'collect-dividend') {
    s.credits += 5400; event={title:'Investment matured',detail:'Your robotics investment paid 5,400 credits. This payout is single-use.'};
  } else if (id === 'fund-city') {
    s.credits -= 2200; s.trust += 30; s.fame += 6; s.owned.push('library'); event={title:'A city learns your name',detail:'The public library becomes a permanent landmark.'};
  } else if (id.startsWith('power-')) {
    s.power = id.slice(6); s.influence += 5; event={title:'A new power awakens',detail:`You learned ${s.power === 'phase' ? 'Phase Shift' : s.power === 'gravity' ? 'Gravity Weaving' : 'Storm Calling'}.`};
  } else if (id === 'face-warden') {
    s.dungeonOutcome = 'victory'; s.fame += 12; event={title:'The Warden falls',detail:'A Chrono Relic remains. Keep it safe or sell it.'};
  } else if (id === 'sell-relic') {
    s.credits += 3900; s.trust = Math.max(0, s.trust - 4); s.flags['relic-decision'] = true; event={title:'The relic changes hands',detail:'A mysterious collector pays 3,900 credits. The kingdom may remember.'};
  } else if (id === 'guard-relic') {
    s.trust += 20; s.influence += 8; s.flags['relic-decision'] = true; event={title:'A guardian, not an owner',detail:'You seal the relic beneath the forgotten throne.'};
  } else if (id === 'train-pilot') {
    s.pilotTrained = true; s.influence += 4; event={title:'ATLAS-09 synchronized',detail:'Your neural link is active. The titan responds to your movement.'};
  } else if (id === 'deploy-mech') {
    s.mechDeployed = !s.mechDeployed; event={title:s.mechDeployed ? 'ATLAS-09 deployed' : 'ATLAS-09 docked', detail:s.mechDeployed ? 'Move with WASD. Your titan is now under direct control.' : 'Pilot systems in standby.'};
  } else if (id === 'defend-city') {
    s.trust += 25; s.fame += 20; s.influence += 10; event={title:'The breakwater stands',detail:'You protected the city with ATLAS-09. Another timeline heard about your courage.'};
  } else if (['confess','purpose','paths'].includes(id)) {
    const answers = {
      confess:'I let the fear of being ordinary make some of my decisions. We do not need to impress everyone to matter.',
      purpose:futureProfile(s).speech,
      paths:'There are doors left unopened. The past, the dungeon, the foundry. What you do there could still remake our future.'
    };
    s.conversation.push({role:'user', text: id === 'confess' ? 'What is your biggest regret?' : id === 'purpose' ? 'What mattered most?' : 'What could have changed?' });
    s.conversation.push({role:'assistant', text:answers[id]});
    s.conversation = s.conversation.slice(-16);
    event = {title:'A conversation across time', detail:'Your future self answered your question.'};
  }
  return {ok:true, state:write(s,id,event.title,event.detail),event};
}

export function addConversation(state, question, answer) {
  const s = copy(state);
  const safeQuestion = String(question).trim().slice(0, 350);
  const safeAnswer = String(answer).trim().slice(0, 1200);
  if (!safeQuestion || !safeAnswer) return state;
  s.conversation.push({role:'user',text:safeQuestion}, {role:'assistant',text:safeAnswer});
  s.conversation = s.conversation.slice(-16);
  s.revision++;
  return s;
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return initialState();
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !WORLDS[value.world]) return initialState();
    const s = initialState();
    s.world = value.world;
    for (const key of ['credits','fame','trust','influence','revision']) {
      if (Number.isFinite(value[key])) s[key] = clamp(Math.floor(value[key]), 0, 100000000);
    }
    s.invention = Object.keys(AVAILABLE_INVENTIONS).includes(value.invention) ? value.invention : null;
    s.fate = ['patent','gift','auction'].includes(value.fate) && s.invention ? value.fate : null;
    s.power = ['phase','gravity','storm'].includes(value.power) ? value.power : null;
    s.dungeonOutcome = value.dungeonOutcome === 'victory' ? 'victory' : null;
    s.pilotTrained = value.pilotTrained === true;
    s.mechDeployed = s.pilotTrained && value.mechDeployed === true;
    s.owned = Array.isArray(value.owned) ? [...new Set(value.owned.filter((x) => ['penthouse','library'].includes(x)))].slice(0,2) : [];
    s.flags = Object.fromEntries(Object.entries(value.flags || {}).filter(([k,v]) => /^[a-z-]{2,40}$/.test(k) && v === true).slice(0,40));
    s.history = Array.isArray(value.history) ? value.history.slice(0,32).filter(x => x && WORLDS[x.world] && typeof x.title === 'string').map(x=>({at:Number.isFinite(x.at)?x.at:1, world:x.world, title:x.title.slice(0,120),detail:String(x.detail||'').slice(0,300)})) : s.history;
    s.conversation = Array.isArray(value.conversation) ? value.conversation.slice(-16).filter(x=>x && ['user','assistant'].includes(x.role) && typeof x.text==='string').map(x=>({role:x.role,text:x.text.slice(0,1200)})) : [];
    return s;
  } catch {return initialState();}
}
export function saveState(storage, state) { try { storage.setItem(SAVE_KEY, JSON.stringify(state)); return true; } catch { return false; } }
export function resetState(storage) { const s = initialState(); saveState(storage, s); return s; }
