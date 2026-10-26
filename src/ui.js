import { WORLDS, INVENTIONS, futureProfile, worldOptions, cityRipple, sealClue, echoMap, SHARD_NAMES, RUNES } from './game.js';

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
  let state=null, journal=false, instructions=false, busy=false, apiStatus='OFFLINE READY', isSpeaking=false, journalTab='echoes', sound=false, focus=false, sharedLetter=handlers.shareLetterStatus?.()===true;
  function render(next){
    state=next;
    const w=WORLDS[state.world], p=worldPreview[state.world], future=futureProfile(state), ripple=cityRipple(state);
    root.dataset.world=state.world;
    root.innerHTML=`
      <div class="world-wash world-wash-${esc(state.world)}" aria-hidden="true"></div>
      <div class="grain" aria-hidden="true"></div><div class="edge-shade" aria-hidden="true"></div>
      <header class="topbar">
        <div class="brand"><div class="brand-glyph">◎</div><div class="brand-type">ELSEWHERE<span class="brand-caption">ANOTHER LIFE AWAITS</span></div></div>
        <div class="top-center"><span class="live-pulse"></span><span class="world-current">YOU ARE IN ${esc(w.name.toUpperCase())}</span><span class="top-divider">/</span><span class="server-status">${esc(apiStatus)}</span></div>
        <div class="header-actions"><button class="icon-btn sound-toggle ${sound?'is-on':''}" data-cmd="sound" title="Toggle procedural sound" aria-label="${sound?'Mute':'Enable'} sound" aria-pressed="${sound}">${sound?'♫':'♪'}</button><button class="icon-btn focus-toggle ${focus?'is-on':''}" data-cmd="focus" title="Toggle cinematic view" aria-label="Toggle cinematic view" aria-pressed="${focus}">${focus?'▣':'▢'}</button><button class="icon-btn" data-cmd="help" title="Controls & accessibility" aria-label="Open controls">?</button><button class="journal-button" data-cmd="journal"><span>✧</span><span> MY TIMELINE</span></button></div>
      </header>
      <aside class="left-rail" aria-label="World selector">
        <div class="rail-title"><span class="eyebrow">THE MULTIVERSE</span><span class="rail-count">05 WORLDS</span></div>
        <nav class="world-list" aria-label="Explore worlds">
          ${Object.values(WORLDS).map((item,i)=>`<button class="world-link ${state.world===item.id?'is-active':''}" data-world="${item.id}" aria-current="${state.world===item.id?'page':'false'}"><span class="world-number">0${i+1}</span><span class="world-symbol">${ICONS[item.id]}</span><span class="world-link-text">${esc(item.name)}<small>${esc(item.type)}</small></span><span class="world-arrow">${state.echoShards.includes(item.id)?'✦':'↗'}</span></button>`).join('')}
        </nav>
        <div class="rail-spacer"></div>
        <div class="identity-card"><div class="identity-icon">◌</div><div><span>YOUR EXISTENCE</span><strong>THE TRAVELER</strong><small>One soul. Infinite paths.</small></div></div>
        <div class="stats"><div class="stat"><span>WEALTH</span><strong>◈ ${num(state.credits)}</strong></div><div class="stat"><span>FAME</span><strong>✦ ${num(state.fame)}</strong></div><div class="stat"><span>TRUST</span><strong>♡ ${num(state.trust)}</strong></div></div>
        <div class="shard-indicator" title="Memory fragments collected"><span>MEMORY FRAGMENTS</span><strong>${state.echoShards.length} / 5</strong><div class="shard-track">${Object.keys(WORLDS).map(w=>`<span class="${state.echoShards.includes(w)?'collected':''}"></span>`).join('')}</div></div><div class="rail-footer">SYRAVA EXPERIMENTS <span>© 2026</span></div>
      </aside>
      <section class="world-heading" aria-label="Current world">
        <div class="section-kicker"><span class="thin-line"></span>${esc(w.kicker)}</div>
        <h1>${esc(w.name)}</h1><div class="world-subtitle">${esc(p.tag)}</div><div class="world-quote">${esc(p.note)}</div>
      </section>
      <section class="story-panel" aria-label="Interactive story">
        <div class="panel-edge"></div><div class="signal-line"><span class="signal-symbol">◉</span><span>THE WORLD IS LISTENING</span><span>▲ ${String(state.revision).padStart(3,"0")} ECHOES</span></div>
        <div class="chapter"><span class="eyebrow">THE STORY UNFOLDS</span><span class="chapter-counter">CHAPTER 0${Object.keys(WORLDS).indexOf(state.world)+1} / 05</span></div>
        <p class="chapter-copy">${esc(w.description)}</p>
        <div class="panel-meta"><span class="meta-glow"></span>${esc(w.atmosphere)}</div>
        ${state.world==='self' ? `<div class="future-box"><span class="eyebrow">A GLIMPSE OF YOUR FUTURE</span><strong>${esc(future.headline)}</strong><p>“${esc(future.speech)}”</p><small>${esc(future.warning)}</small></div>` : ''}
        ${state.world==='future' ? `<div class="future-box small"><span class="eyebrow">CAUSAL WORLD STATUS</span><strong>${esc(ripple.label)}</strong><p>${state.fate? 'Your 1889 invention has changed the city and the person you may become.' : 'The city is waiting for a choice you have yet to make in the past.'}</p></div>` : ''}
        ${state.world==='past' ? `<div class="future-box small"><span class="eyebrow">ALTER HISTORY</span><strong>${state.invention ? esc(INVENTIONS[state.invention].name) : 'Knowledge is your power.'}</strong><p>${state.fate ? `You chose to ${state.fate==='patent'?'patent':state.fate==='gift'?'share':'auction'} the invention. Return to 2087 to see what changed.` : state.invention?'Your prototype works. Decide how to use your advantage.':'Build an impossible invention, then choose whether to profit, share or sell.'}</p></div>` : ''}
        ${state.world==='dungeon' && state.power ? `<div class="future-box small rune-console"><span class="eyebrow">CIPHER OF THE HOLLOW CROWN</span><strong>${esc(({phase:'Phase Shift',gravity:'Gravity Weaving',storm:'Storm Calling'})[state.power])} · ${state.runeProgress}/3</strong><div class="rune-slots">${[0,1,2].map(i=>`<span class="${i<state.runeProgress?'active':''}">${i<state.runeProgress?'✦':'◇'}</span>`).join('')}</div><p>${esc(sealClue(state))}</p><small>${state.dungeonOutcome?'The Warden has fallen. The relic awaits its fate.':state.runeMistakes?`The seal has rejected ${state.runeMistakes} attempt${state.runeMistakes===1?'':'s'}.`:'Tap runes in the order described. A mistake resets the sequence.'}</small></div>` : ''}
        ${state.world==='mech' ? `<div class="future-box small"><span class="eyebrow">TITAN NEURAL INTERFACE / 09</span><strong>${state.mechDeployed?'ATLAS-09: PILOT IN CONTROL':state.pilotTrained?'ATLAS-09: READY TO DEPLOY':'ATLAS-09: LINK REQUIRED'}</strong><p>${state.mechDeployed?'Drive with WASD, fire with SPACE during combat.':'Synchronize with the titan, then deploy to control it.'}</p>${state.mechBattle.active?`<div class="combat-console"><div><span>HULL</span><strong>${state.mechBattle.hull}%</strong><div class="meter"><i style="width:${state.mechBattle.hull}%"></i></div></div><div><span>REACTOR HEAT</span><strong>${state.mechBattle.heat}%</strong><div class="meter heat"><i style="width:${state.mechBattle.heat}%"></i></div></div><div class="enemies">${state.mechBattle.enemies} HOSTILES REMAINING ${state.mechBattle.guard?'· SHIELD ACTIVE':''}</div></div>`:''}</div>` : ''}
        ${state.lastEncounter?.world===state.world?`<div class="encounter-card"><div class="encounter-heading"><span class="live-pulse"></span><span>${esc(state.lastEncounter.name)}</span></div><p>“${esc(state.lastEncounter.text)}”</p><small>THIS CHARACTER REMEMBERS YOUR WORLD STATE</small></div>`:''}
        ${state.ending && state.world==='future'?`<div class="ending-card"><span class="eyebrow">YOUR CHOSEN ENDING</span><strong>${esc(future.headline)}</strong><p>${esc(future.speech)}</p><span>THE STORY CONTINUES WHENEVER YOU CHOOSE</span></div>`:''}
        <div class="decision-section"><div class="decision-title"><span class="eyebrow">${state.world==='self'?'QUESTIONS TO ASK':'CHOOSE YOUR PATH'}</span><span class="tiny-cross">+</span></div>
          <div class="choice-list">${worldOptions(state).map((c,i)=>`<button class="choice ${c.disabled?'choice-disabled':''}" data-action="${esc(c.id)}" ${c.disabled?'disabled':''}><span class="choice-index">${String(i+1).padStart(2,'0')}</span><span class="choice-copy"><strong>${esc(c.title)}</strong><small>${esc(c.detail)}</small>${c.disabled?`<em>${esc(c.reason || 'Not available')}</em>`:''}</span><span class="choice-arrow">↗</span></button>`).join('')}</div>
        </div>
        ${state.world==='self'?`<div class="chat-section"><div class="chat-header"><span>◉ CONTINUE THE CONVERSATION</span><span>${esc(apiStatus)}</span></div><div class="chat-history" id="chat-history">${state.conversation.slice(-8).map(m=>`<div class="chat-line ${m.role==='user'?'me':'elder'}"><span>${m.role==='user'?'YOU':'FUTURE YOU'}</span><p>${esc(m.text)}</p></div>`).join('')||'<p class="chat-placeholder">Your future self is waiting. Ask anything about these possible lives.</p>'}</div><form id="chat-form" class="chat-form"><input id="chat-question" maxlength="350" autocomplete="off" placeholder="Ask your future self..." aria-label="Ask your future self" ${busy?'disabled':''} required/><button title="Send question" aria-label="Send question" type="submit" ${busy?'disabled':''}>${busy?'···':'↗'}</button><button title="Speak your question" aria-label="Speak your question" type="button" data-cmd="mic">◉</button></form><div class="chat-note">${esc(future.warning)} Offline replies are available. Live Meta dialogue requires a server key. Browser speech recognition may send voice to its provider.</div><form id="letter-form" class="letter-form"><div class="letter-head"><span class="eyebrow">A LETTER TO YOUR POSSIBLE FUTURE</span><span>PRIVATE TO THIS BROWSER</span></div><textarea id="letter-text" maxlength="480" rows="3" aria-label="Letter to your future self" placeholder="There is something I do not want you to forget...">${esc(state.letter)}</textarea><label class="consent-line"><input type="checkbox" id="share-letter" ${sharedLetter?'checked':''}><span>Include this letter in live Meta AI conversations. Optional, and off by default.</span></label><button type="submit">${state.letter?'UPDATE YOUR LETTER':'LEAVE A LETTER'} ↗</button></form></div>`:''}
      </section>
      <div class="artifact-tracker"><span>✧</span> ${state.echoShards.length} / 5 MEMORIES FOUND</div>
      <div class="mobile-dpad" aria-label="Movement controls"><button data-move="KeyW" aria-label="Move forward">↑</button><div><button data-move="KeyA" aria-label="Move left">←</button><button data-cmd="interact" aria-label="Interact with nearby object">◎</button><button data-move="KeyD" aria-label="Move right">→</button></div><button data-move="KeyS" aria-label="Move backward">↓</button></div>
      <div class="bottom-hud"><span class="bottom-line"></span><span class="hud-dot">◈</span><span>W A S D TO EXPLORE</span><span class="hud-separator">•</span><span>DRAG TO LOOK</span><span class="hud-separator">•</span><span>CLICK PORTALS TO TRAVEL</span><span class="hud-separator">•</span><span>E TO INTERACT · SPACE TO FIRE</span><span class="bottom-line"></span></div>
      <div class="bottom-credit">ELSEWHERE / ECHO PROTOCOL <span>v0.2</span></div>
      ${journal?`<div class="modal-shade" data-cmd="close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="journal-title"><div class="modal-top"><span class="eyebrow">ECHOES ACROSS LIVES</span><button class="icon-btn" data-cmd="close" aria-label="Close timeline">✕</button></div><h2 id="journal-title">Your Timeline</h2><p class="modal-lead">Every significant choice echoes into future worlds. Your progress stays in this browser.</p><div class="atlas-tabs" role="tablist" aria-label="Timeline tabs"><button class="${journalTab==='echoes'?'selected':''}" data-tab="echoes" role="tab" aria-selected="${journalTab==='echoes'}">CAUSE & EFFECT</button><button class="${journalTab==='history'?'selected':''}" data-tab="history" role="tab" aria-selected="${journalTab==='history'}">EVENTS</button><button class="${journalTab==='fragments'?'selected':''}" data-tab="fragments" role="tab" aria-selected="${journalTab==='fragments'}">FRAGMENTS</button></div>
          ${journalTab==='echoes'?`<div class="atlas-map">${echoMap(state).map((a,i)=>`<div class="atlas-node ${a.active?'activated':''}"><span class="atlas-year">${esc(a.year)}</span><div><strong>${esc(a.title)}</strong><p>${esc(a.detail)}</p></div><span>${a.active?'◉':'◌'}</span></div>`).join('')}</div><p class="atlas-disclaimer">Each echo reflects choices inside the simulation. No future described here is a real prediction.</p>`:journalTab==='fragments'?`<div class="fragment-grid">${Object.entries(SHARD_NAMES).map(([id,title])=>`<div class="fragment ${state.echoShards.includes(id)?'unlocked':''}"><span>${state.echoShards.includes(id)?'✦':'◇'}</span><strong>${esc(title)}</strong><small>${esc(WORLDS[id].name)} · ${state.echoShards.includes(id)?'RECOVERED':'UNDISCOVERED'}</small></div>`).join('')}</div><p class="atlas-disclaimer">Collect any three fragments and alter history to unlock three original endings in Neo Elysium.</p>`:`<div class="events">${state.history.map(h=>`<div class="event"><span class="event-dot"></span><div><small>${esc(WORLDS[h.world]?.name||h.world)} · EVENT ${esc(h.at)}</small><strong>${esc(h.title)}</strong><p>${esc(h.detail)}</p></div></div>`).join('')}</div>`}
          <div class="portable-saves"><div><button data-cmd="export">↓ EXPORT TIMELINE</button><button data-cmd="import">↑ IMPORT TIMELINE</button><input id="import-timeline-input" type="file" accept="application/json,.json" hidden></div><p>Exported files include your local future-self letter and conversation history. Keep them private.</p></div>
          <button class="reset" data-cmd="reset">↺ START ANOTHER LIFE</button></section></div>`:''}
      ${instructions?`<div class="modal-shade" data-cmd="close"><section class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><div class="modal-top"><span class="eyebrow">EXPLORATION GUIDE</span><button class="icon-btn" data-cmd="close" aria-label="Close controls">✕</button></div><h2 id="help-title">How to live another life</h2><p>Move with WASD or arrow keys, drag to orbit the camera, click glowing portals to travel, and select story choices on the right. Press E near a memory beacon to interact, and SPACE while piloting in combat. On supported HTTPS WebXR headsets, choose ENTER VR and aim/select a portal or a future-self question with a controller.</p><p>Your wealth, fame, influence, owned places, collected memory fragments, saved letter, magic and history persist in local browser storage. Wealth and fame are fictional game values, not real financial outcomes.</p><p>Future-self dialogue is a speculative fictional character, not a prediction or professional advice. A configured Meta API key enables additional generated dialogue; the offline script works without one.</p><button class="choice" data-cmd="close"><span class="choice-copy"><strong>CONTINUE YOUR JOURNEY</strong></span> ↗</button></section></div>`:''}
    `;
    const history=root.querySelector('#chat-history');if(history)history.scrollTop=history.scrollHeight;
  }
  root.addEventListener('click',e=>{
    const world=e.target.closest('[data-world]');if(world){handlers.travel(world.dataset.world);return;}
    const action=e.target.closest('[data-action]');if(action){handlers.action(action.dataset.action);return;}
    const cmd=e.target.closest('[data-cmd]');if(!cmd)return;
    if(cmd.dataset.cmd==='journal'){journal=true;render(state);}
    if(cmd.dataset.cmd==='sound'){sound=!sound;handlers.sound(sound);render(state);}
    if(cmd.dataset.cmd==='focus'){focus=!focus;root.parentElement.classList.toggle('cinematic',focus);render(state);}
    if(cmd.dataset.cmd==='interact')handlers.interact();
    if(cmd.dataset.cmd==='export')handlers.exportTimeline();
    if(cmd.dataset.cmd==='import')root.querySelector('#import-timeline-input')?.click();
    if(cmd.dataset.cmd==='help'){instructions=true;render(state);}
    if(cmd.dataset.cmd==='close'){if(cmd.classList.contains('modal-shade')&&e.target!==cmd)return;journal=false;instructions=false;render(state);}
    if(cmd.dataset.cmd==='reset'){handlers.reset();journal=false;}
    if(cmd.dataset.cmd==='mic')handlers.listen();
  });
  root.addEventListener('click',e=>{const tab=e.target.closest('[data-tab]');if(tab){journalTab=tab.dataset.tab;render(state);}});
  root.addEventListener('change',e=>{if(e.target.id==='share-letter'){sharedLetter=e.target.checked;handlers.shareLetter(sharedLetter);}else if(e.target.id==='import-timeline-input'){handlers.importTimeline(e.target.files?.[0]);}});
  root.addEventListener('pointerdown',e=>{const m=e.target.closest('[data-move]');if(!m)return;e.preventDefault();m.setPointerCapture(e.pointerId);handlers.move(m.dataset.move,true);});
  const stopMove=e=>{const m=e.target.closest?.('[data-move]');if(m)handlers.move(m.dataset.move,false);};
  root.addEventListener('pointerup',stopMove);root.addEventListener('pointercancel',stopMove);
  root.addEventListener('submit',async e=>{
    if(e.target.id==='letter-form'){
      e.preventDefault();handlers.letter(root.querySelector('#letter-text')?.value||'');return;
    }

    if(e.target.id!=='chat-form')return;e.preventDefault();if(busy)return;
    const question=root.querySelector('#chat-question')?.value.trim();if(!question)return;
    busy=true;render(state);
    try{await handlers.ask(question);}finally{busy=false;render(state);}
  });
  return {render,updateStatus(v){apiStatus=v;render(state);},getState:()=>state};
}
