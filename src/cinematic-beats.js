/** Distinctive, deterministic beats for visual feedback, never gameplay damage.
 * A projectile flies toward its target; the shockwave begins only on arrival.
 * No shake, full-screen flashes, browser services, or personal-data collection.
 */
const norm=n=>Math.min(1,Math.max(0,Number.isFinite(n)?n:0));
export function visualBeat(kind='choice', progress=0, {reducedMotion=false}={}) {
 const p=norm(progress);
 if(reducedMotion)return {
  waveScale:1+.4*p,waveAlpha:.34*(1-p),
  coreScale:1-p,coreAlpha:.5*(1-p),
  projectileZ:0,projectileAlpha:0,projectileScale:0,rotation:0
 };
 const projectile=kind==='plasma';
 // Plasma bolt travels in from the player-facing side until frame ~0.37.
 const travel=norm(p/.37),arrival=norm((p-.32)/.68);
 const waveProgress=projectile?arrival:p;
 const fade=(1-waveProgress)**1.6;
 const softStart=projectile?norm((p-.3)/.13):1;
 return {
  waveScale:1 + (kind==='arrival'?4.7:kind==='memory'?2.35:3.1)*(waveProgress*waveProgress*(3-2*waveProgress)),
  waveAlpha:Math.min(1,(projectile?.78:.63)*fade*softStart),
  coreScale:Math.max(.01,1-waveProgress*.92),
  coreAlpha:.77*(1-waveProgress)*softStart,
  projectileZ:projectile?9*(1-travel):0,
  projectileAlpha:projectile?(1-norm((p-.32)/.07))*.9:0,
  projectileScale:projectile?.75+(1-travel)*.35:0,
  rotation: (kind==='magic'?.65:kind==='memory'?.25:.1) * p
 };
}
