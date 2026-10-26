/** An authored, deterministic combat director. A persistent opponent learns your repeated moves.
 * The player may negotiate; no real-time inputs, random chance or paid currency is required.
 */
export const initialWardenBattle = () => ({active:false,wardenHp:100,playerHp:100,focus:55,guard:false,turn:0,lastMove:'',repeat:0,tactic:'observing',outcome:null});
const bound=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function sanitizeWardenBattle(raw){
 const v=initialWardenBattle();if(!raw||typeof raw!=='object')return v;
 for(const k of ['wardenHp','playerHp','focus'])v[k]=bound(Number.isInteger(raw[k])?raw[k]:v[k],0,100);
 v.turn=bound(Number.isInteger(raw.turn)?raw.turn:0,0,99);
 v.repeat=bound(Number.isInteger(raw.repeat)?raw.repeat:0,0,99);
 v.active=raw.active===true&&v.wardenHp>0&&v.playerHp>0;
 v.guard=raw.guard===true;
 v.lastMove=['strike','power','guard','parley'].includes(raw.lastMove)?raw.lastMove:'';
 v.tactic=['observing','countering','pressing','hesitating','fallen'].includes(raw.tactic)?raw.tactic:'observing';
 v.outcome=['victory','mercy','defeat'].includes(raw.outcome)?raw.outcome:null;
 return v;
}
export function wardenOptions(s){
 const b=s.wardenBattle??initialWardenBattle();
 if(s.dungeonOutcome)return [];
 if(!s.power||s.runeProgress!==3)return [];
 if(!b.active)return [{id:'face-warden',title:b.outcome==='defeat'?'Try again · The Warden remembers':'Enter the Warden’s arena',detail:'Begin a tactical encounter. Fight with blade, power, guard or words.'}];
 return [
  {id:'warden-strike',title:'Quick strike [SPACE / VR trigger]',detail:'Reliable attack. The Warden learns repeated patterns.'},
  {id:'warden-power',title:'Unleash your power [F]',detail:`Consumes 22 focus. Your ${s.power} ability alters its defenses.`,disabled:b.focus<22,reason:'Guard to regain focus'},
  {id:'warden-guard',title:'Guard and breathe [Q]',detail:'Reduce the next blow and recover focus.'},
  {id:'warden-parley',title:'Try to negotiate [E]',detail:'Offer the Warden a future without stolen hours. Mercy is possible.'}
 ];
}
/** Mutates a cloned authoritative state only. Returns a narrative event. */
export function resolveWardenTurn(s,id){
 const b=s.wardenBattle;
 if(!b.active||b.playerHp<=0||b.wardenHp<=0)return null;
 const move=id.slice('warden-'.length);
 if(!['strike','power','guard','parley'].includes(move))return null;
 if(move==='power'&&b.focus<22)return null;
 b.repeat=b.lastMove===move?b.repeat+1:0;
 b.lastMove=move;b.turn=Math.min(99,b.turn+1);
 const adaptation=b.repeat>=2;
 let line='',dmg=0;
 if(move==='strike'){
  dmg=adaptation?9:18;
  line=adaptation?'The Warden anticipates the third identical swing. Try another approach.':'Your blade finds a gap in the ancient armor.';
 }else if(move==='power'){
  b.focus-=22;
  dmg=(s.power==='storm'?31:s.power==='gravity'?27:25)-(adaptation?13:0);
  b.tactic='countering';line=adaptation?'The Warden grounds your familiar spell. Its memory has become a shield.':`Your ${s.power} power tears through the Warden’s defenses.`;
 }else if(move==='guard'){
  b.guard=true;b.focus=bound(b.focus+28,0,100);line='You lower the weapon and steady your breathing. Focus returns.';
 }else if(move==='parley'){
  const stolen=s.flags['time-steal-warden'];
  const eligible=!stolen&&s.trust>=22&&s.chronal.paradox<=5;
  if(eligible){b.active=false;b.outcome='mercy';b.tactic='hesitating';s.dungeonOutcome='victory';s.trust+=16;s.fame+=8;
   return {title:'The Warden lays down its sword',detail:'You offered a future without confiscated hours. The Crown opens through mercy, not violence.'};}
  b.focus=bound(b.focus+6,0,100);line=stolen?'The Warden remembers the hours you stole. It refuses to bargain until you face the consequences.':'The Warden studies you. Trust is not yet strong enough for peace.';
 }
 b.wardenHp=bound(b.wardenHp-dmg,0,100);
 if(b.wardenHp===0){b.active=false;b.outcome='victory';b.tactic='fallen';s.dungeonOutcome='victory';s.fame+=12;
  return {title:'The Warden yields',detail:`The final blow breaks the seal after ${b.turn} turns. The opponent remembers every tactic you used. The Chrono Relic remains.`};}
 // Once the player repeats a move, the Warden adjusts its own tactics.
 const retaliate=move==='guard'?8:adaptation?22:b.turn%3===0?18:13;
 const blocked=b.guard?Math.ceil(retaliate*.2):retaliate;
 b.guard=false;b.playerHp=bound(b.playerHp-blocked,0,100);
 b.tactic=adaptation?'countering':move==='parley'?'hesitating':'pressing';
 if(b.playerHp===0){b.active=false;b.outcome='defeat';s.trust=Math.max(0,s.trust-2);
  return {title:'You fall, but time keeps its promise',detail:'You awaken at the arena threshold. The Warden remembers your approach; you may return to try again.'};}
 return {title:move==='power'?'A power answered':move==='guard'?'Guard stance':move==='parley'?'The Warden weighs your words':'Steel against memory',
  detail:`${line} The Warden counters for ${blocked}. Your vitality ${b.playerHp}/100, Warden ${b.wardenHp}/100, focus ${b.focus}/100.`};
}
