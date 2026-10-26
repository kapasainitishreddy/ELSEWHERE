import {stillwaterView} from './stillwater.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderStillwaterDialog(session){
 const p=stillwaterView(session);
 return '<div class="modal-shade stillwater-shade" data-cmd="stillwater-close">'+
 '<section class="modal stillwater-dialog" role="dialog" aria-modal="true" aria-labelledby="stillwater-title">'+
 '<div class="stillwater-hero" aria-hidden="true"><div class="stillwater-moon"></div><div class="stillwater-ripple"></div></div>'+
 '<div class="modal-top"><span class="eyebrow">ELSEWHERE · A MOMENT BETWEEN WORLDS</span><button type="button" class="icon-btn" data-cmd="stillwater-close" aria-label="Close quiet story">✕</button></div>'+
 '<div class="stillwater-content" aria-live="polite"><span class="eyebrow">NO SCORES · NO STREAKS · NO DEADLINES</span><h2 id="stillwater-title">'+esc(p.title)+'</h2>'+
 '<p class="stillwater-subtitle">'+esc(p.subtitle)+'</p><p class="stillwater-body">'+esc(p.body)+'</p>'+
 (p.question?'<h3 class="stillwater-question">'+esc(p.question)+'</h3>':'')+
 '<div class="stillwater-choices">'+p.options.map(o=>'<button type="button" class="stillwater-choice" data-stillwater="'+esc(o.id)+'"><strong>'+esc(o.title)+'</strong><small>'+esc(o.description)+'</small></button>').join('')+'</div>'+
 '<p class="stillwater-notice">Optional fictional reflection, not therapy or medical advice. No mood scores, biometric measurements or personal answers are collected here. Closing forgets your choices. Your real future remains unwritten.</p></div>'+
 '<div class="stillwater-footer"><button type="button" class="stillwater-exit" data-cmd="stillwater-close">RETURN TO MY WORLD</button><span>PRIVATE · NO NETWORK REQUESTS</span></div></section></div>';
}
