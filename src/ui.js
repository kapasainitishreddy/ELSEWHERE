import { WORLDS, INVENTIONS, futureProfile, worldOptions, cityRipple } from './game.js';

const ICONS = {future:'◇',self:'◉',past:'⌛',dungeon:'⚔',mech:'⬡'};
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(x)=>new Intl.NumberFormat('en-US').format(x);
const worldPreview = {
  future:{note:'A skyline written by the choices you have yet to make.',tag:'THE CITY OF TOMORROW'},
  self:{note:'One conversation. Many possible versions of you.',tag:'WHO YOU BECOME'},
  past:{note:'Ideas from the future are dangerous in the hands of the past.',tag:'THE INVENTION PARADOX'},
  dungeon:{note:'Step beyond ordinary physics. Power demands a decision.',tag:'THE FORGOTTEN KINGDOM'},
  mech:{note:'A steel giant waits for someone brave enough to move.',tag:'THE TITAN PROGRAM'}
};
export function createInterface(root, handlers){
  let state=null, journal=false, instructions=false, busy=false, apiStatus='OFFLINE READY', isSpeaking=false;
  function render(next){
    state=next;
    const w=WORLDS[state.world], p=worldPreview[state.world], future=futureProfile(state), ripple=cityRipple(state);
    root.innerHTML=`
      <div class="grain" aria-hidden="true"></div><div class="edge-shade" aria-hidden="true"></div>
      <header class="topbar">
        <div class="brand"><div class="brand-glyph">◎</div><div class="brand-type">ELSEWHERE<span class="brand-caption">ANOTHER LIFE AWAITS</span></div></div>
        <div class="top-center"><span class="live-pulse"></span><span class="world-current">YOU ARE IN ${esc(w.name.toUpperCase())}</span><span class="top-divider">/</span><span class="server-status">${esc(apiStatus)}</span></div>
        <div class="header-actions"><button class="icon-btn" data-cmd="help" title="Controls & accessibility" aria-label="Open controls">?</button><button class="journal-button" data-cmd="journal"><span>✧</span><span> MY TIMELINE</span></button></div>
      </header>
      <aside class="left-rail" aria-label="World selector">
        <div class="rail-title"><span class="eyebrow">THE MULTIVERSE</span><span class="rail-count">05 WORLDS</span></div>
        <nav class="world-list" aria-label="Explore worlds">
          ${Object.values(WORLDS).map((item,i)=>`<button class="world-link ${state.world===item.id?'is-active':''}" data-world="${item.id}" aria-current="${state.world===item.id?'page':'false'}"><span class="world-number">0${i+1}</span><span class="world-symbol">${ICONS[item.id]}</span><span class="world-link-text">${esc(item.name)}<small>${esc(item.type)}</small></span><span class="world-arrow">↗</span></button>`).join('')}
        </nav>
        <div class="rail-spacer"></div>
        <div class="identity-card"><div class="identity-icon">◌</div><div><span>YOUR EXISTENCE</span><strong>THE TRAVELER</strong><small>One soul. Infinite paths.</small></div></div>
        <div class="stats"><div class="stat"><span>WEALTH</span><strong>◈ ${num(state.credits)}</strong></div><div class="stat"><span>FAME</span><strong>✦ ${num(state.fame)}</strong></div><div class="stat"><span>TRUST</span><strong>♡ ${num(state.trust)}</strong></div></div>
        <div class="rail-footer">SYRAVA EXPERIMENTS <span>© 2026</span></div>
      </aside>
      <section class="world-heading" aria-label="Current world">
        <div class="section-kicker"><span class="thin-line"></span>${esc(w.kicker)}</div>
        <h1>${esc(w.name)}</h1><div class="world-subtitle">${esc(p.tag)}</div>
      </section>
      <section class="story-panel" aria-label="Interactive story">
        <div class="panel-edge"></div>
        <div class="chapter"><span class="eyebrow">THE STORY UNFOLDS</span><span class="chapter-counter">CHAPTER 0${Object.keys(WORLDS).indexOf(state.world)+1} / 05</span></div>
        <p class="chapter-copy">${esc(w.description)}</p>
        <div class="panel-meta"><span class="meta-glow"></span>${esc(w.atmosphere)}</div>
        ${state.world==='self' ? `<div class="future-box"><span class="eyebrow">A GLIMPSE OF YOUR FUTURE</span><strong>${esc(future.headline)}</strong><p>“${esc(future.speech)}”</p><small>${esc(future.warning)}</small></div>` : ''}
        ${state.world==='future' ? `<div class="future-box small"><span class="eyebrow">CAUSAL WORLD STATUS</span><strong>${esc(ripple.label)}</strong><p>${state.fate? 'Your 1889 invention has changed the city and the person you may become.' : 'The city is waiting for a choice you have yet to make in the past.'}</p></div>` : ''}
        ${state.world==='past' ? `<div class="future-box small"><span class="eyebrow">ALTER HISTORY</span><strong>${state.invention ? esc(INVENTIONS[state.invention].name) : 'Knowledge is your power.'}</strong><p>${state.fate ? `You chose to ${state.fate==='patent'?'patent':state.fate==='gift'?'share':'auction'} the invention. Return to 2087 to see what changed.` : state.invention?'Your prototype works. Decide how to use your advantage.':'Build an impossible invention, then choose whether to profit, share or sell.'}</p></div>` : ''}
        ${state.world==='dungeon' && state.power ? `<div class="future-box small"><span class="eyebrow">AWAKENED ABILITY</span><strong>${esc(({phase:'Phase Shift',gravity:'Gravity Weaving',storm:'Storm Calling'})[state.power])}</strong><p>${state.dungeonOutcome?'The Hollow Warden is defeated. Decide the relic’s fate.':'Your chosen power can open the throne chamber.'}</p></div>` : ''}
        ${state.world==='mech' ? `<div class="future-box small"><span class="eyebrow">PILOT INTERFACE</span><strong>${state.mechDeployed?'ATLAS-09: PILOT IN CONTROL':state.pilotTrained?'ATLAS-09: READY TO DEPLOY':'ATLAS-09: LINK REQUIRED'}</strong><p>${state.mechDeployed?'Drive your titan using WASD or arrow keys.':'Synchronize with the titan, then deploy to control it.'}</p></div>` : ''}
        <div class="decision-section"><div class="decision-title"><span class="eyebrow">${state.world==='self'?'QUESTIONS TO ASK':'CHOOSE YOUR PATH'}</span><span class="tiny-cross">+</span></div>
          <div class="choice-list">${worldOptions(state).map((c,i)=>`<button class="choice ${c.disabled?'choice-disabled':''}" data-action="${esc(c.id)}" ${c.disabled?'disabled':''}><span class="choice-index">${String(i+1).padStart(2,'0')}</span><span class="choice-copy"><strong>${esc(c.title)}</strong><small>${esc(c.detail)}</small>${c.disabled?`<em>${esc(c.reason || 'Not available')}</em>`:''}</span><span class="choice-arrow">↗</span></button>`).join('')}</div>
        </div>
        ${state.world==='self'?`<div class="chat-section"><div class="chat-header"><span>◉ CONTINUE THE CONVERSATION</span><span>${esc(apiStatus)}</span></div><div class="chat-history" id="chat-history">${state.conversation.slice(-8).map(m=>`<div class="chat-line ${m.role==='user'?'me':'elder'}"><span>${m.role==='user'?'YOU':'FUTURE YOU'}</span><p>${esc(m.text)}</p></div>`).join('')||'<p class="chat-placeholder">Your future self is waiting. Ask anything about these possible lives.</p>'}</div><form id="chat-form" class="chat-form"><input id="chat-question" maxlength="350" autocomplete="off" placeholder="Ask your future self..." aria-label="Ask your future self" ${busy?'disabled':''} required/><button title="Send question" aria-label="Send question" type="submit" ${busy?'disabled':''}>${busy?'···':'↗'}</button><button title="Speak your question" aria-label="Speak your question" type="button" data-cmd="mic">◉</button></form><div class="chat-note">${esc(future.warning)} Offline replies are available. Live Meta dialogue requires a server key.</div></div>`:''}
      </section>
      <div class="bottom-hud"><span class="bottom-line"></span><span class="hud-dot">◈</span><span>W A S D TO EXPLORE</span><span class="hud-separator">•</span><span>DRAG TO LOOK</span><span class="hud-separator">•</span><span>CLICK PORTALS TO TRAVEL</span><span class="bottom-line"></span></div>
      <div class="bottom-credit">ELSEWHERE / OPEN PROTOTYPE <span>v0.1</span></div>
      ${journal?`<div class="modal-shade" data-cmd="close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="journal-title"><div class="modal-top"><span class="eyebrow">ECHOES ACROSS LIVES</span><button class="icon-btn" data-cmd="close" aria-label="Close timeline">✕</button></div><h2 id="journal-title">Your Timeline</h2><p class="modal-lead">Every significant choice echoes into future worlds. Your progress stays in this browser.</p><div class="events">${state.history.map(h=>`<div class="event"><span class="event-dot"></span><div><small>${esc(WORLDS[h.world]?.name||h.world)} · EVENT ${esc(h.at)}</small><strong>${esc(h.title)}</strong><p>${esc(h.detail)}</p></div></div>`).join('')}</div><button class="reset" data-cmd="reset">↺ START ANOTHER LIFE</button></section></div>`:''}
      ${instructions?`<div class="modal-shade" data-cmd="close"><section class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><div class="modal-top"><span class="eyebrow">EXPLORATION GUIDE</span><button class="icon-btn" data-cmd="close" aria-label="Close controls">✕</button></div><h2 id="help-title">How to live another life</h2><p>Move with WASD or arrow keys, drag to orbit the camera, click glowing portals to travel, and select story choices on the right. On supported HTTPS WebXR headsets, choose ENTER VR and aim/select a portal or a future-self question with a controller.</p><p>Your wealth, fame, influence, owned places, magic and history persist in local browser storage. Wealth and fame are fictional game values, not real financial outcomes.</p><p>Future-self dialogue is a speculative fictional character, not a prediction or professional advice. A configured Meta API key enables additional generated dialogue; the offline script works without one.</p><button class="choice" data-cmd="close"><span class="choice-copy"><strong>CONTINUE YOUR JOURNEY</strong></span> ↗</button></section></div>`:''}
    `;
    const history=root.querySelector('#chat-history');if(history)history.scrollTop=history.scrollHeight;
  }
  root.addEventListener('click',e=>{
    const world=e.target.closest('[data-world]');if(world){handlers.travel(world.dataset.world);return;}
    const action=e.target.closest('[data-action]');if(action){handlers.action(action.dataset.action);return;}
    const cmd=e.target.closest('[data-cmd]');if(!cmd)return;
    if(cmd.dataset.cmd==='journal'){journal=true;render(state);}
    if(cmd.dataset.cmd==='help'){instructions=true;render(state);}
    if(cmd.dataset.cmd==='close'){if(cmd.classList.contains('modal-shade')&&e.target!==cmd)return;journal=false;instructions=false;render(state);}
    if(cmd.dataset.cmd==='reset'){handlers.reset();journal=false;}
    if(cmd.dataset.cmd==='mic')handlers.listen();
  });
  root.addEventListener('submit',async e=>{
    if(e.target.id!=='chat-form')return;e.preventDefault();if(busy)return;
    const question=root.querySelector('#chat-question')?.value.trim();if(!question)return;
    busy=true;render(state);
    try{await handlers.ask(question);}finally{busy=false;render(state);}
  });
  return {render,updateStatus(v){apiStatus=v;render(state);},getState:()=>state};
}
