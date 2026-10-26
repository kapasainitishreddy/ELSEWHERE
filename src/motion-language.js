/**
 * Kinetic Worlds: deterministic, frame-rate-independent animation language.
 * All calculations are local. These functions have no browser, storage or network access.
 */
export const clamp01 = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export const easeOutCubic = t => 1 - (1 - clamp01(t)) ** 3;
export const easeInOutCubic = t => { const x = clamp01(t); return x < 0.5 ? 4 * x ** 3 : 1 - (-2*x + 2) ** 3 / 2; };
export function damp(current, target, speed, dt) {
  if (![current, target, speed, dt].every(Number.isFinite)) return Number.isFinite(target) ? target : 0;
  return current + (target - current) * (1 - Math.exp(-Math.max(0, speed) * Math.min(Math.max(0, dt), .1)));
}
export function angleTo(current, target, speed, dt) {
  const difference = Math.atan2(Math.sin(target-current), Math.cos(target-current));
  return current + difference * (1 - Math.exp(-Math.max(0, speed)*Math.min(Math.max(0, dt), .1)));
}
const phase = (time, cycle, offset=0) => (((time + offset) % cycle) + cycle) % cycle;
export function characterPose(time, mode='idle', seed=0) {
  const t = Number.isFinite(time) ? Math.max(0, time) : 0;
  const s = Number.isFinite(seed) ? seed : 0;
  // Short natural eye closures, not always-synchronized metronomic blinking.
  const blinkTime = phase(t, 4.25 + (s % 5) * .31, s*.17);
  const blink = blinkTime < .15 ? .08 + .92 * Math.min(1, Math.abs(blinkTime-.075)/.075) : 1;
  const speaking = mode === 'speaking', listening = mode === 'listening';
  const walking = mode === 'walking', warm = mode === 'warm';
  return {
    eye: blink,
    breath: Math.sin(t*1.6+s)*.018,
    headTilt: listening ? -.12 + Math.sin(t*.45+s)*.02 : warm ? -.075 : Math.sin(t*.62+s)*.025,
    headYaw: speaking ? Math.sin(t*.81+s)*.09 : Math.sin(t*.38+s)*.045,
    mouth: speaking ? .15 + .18 * Math.abs(Math.sin(t*7.4+s)) : 0,
    gesture: speaking ? .30 + .22*Math.sin(t*2.4+s) : warm ? .16 : listening ? .08 : .03,
    stride: walking ? Math.sin(t*7.1+s)*.57 : 0,
    sway: walking ? Math.sin(t*7.1+s)*.038 : Math.sin(t*.65+s)*.018,
    bob: walking ? Math.abs(Math.sin(t*7.1+s))*.075 : Math.sin(t*.63+s)*.017,
  };
}
export function classifyMoment(event, world='future') {
  const title=String(event?.title||'').toLowerCase();
  if (/portal|arriv|world|cross|reality|travel/.test(title)) return 'arrival';
  if (/fire|pulse|dron|warden|strik|attack|reactor|shield|guard|defend/.test(title)) return world==='mech' ? 'plasma' : 'impact';
  if (/inven|prototype|patent|clock|auction|legacy/.test(title)) return 'invention';
  if (/memory|remember|letter|hour|time|compass|shard/.test(title)) return 'memory';
  if (/power|crown|rune|star|magic/.test(title)) return 'magic';
  return 'choice';
}
export function interactionHint(action, names={}) {
  if (!action || typeof action !== 'object') return '';
  if (action.type === 'world') return `ENTER ${String(names[action.world]||action.world||'PORTAL').toUpperCase()}`;
  if (action.type === 'inspect') return `EXAMINE ${String(action.label||'ARTIFACT').toUpperCase()}`;
  if (action.type === 'stillwater') return 'ENTER THE QUIET GARDEN';
  if (action.type === 'choice') return String(action.label||'MAKE YOUR CHOICE').toUpperCase();
  return '';
}
export function chooseNearby(items, x, z, maxDistance=3.8) {
  const eligible=(items||[]).filter(p=>p && Number.isFinite(p.x) && Number.isFinite(p.z) && p.action)
    .map(p=>({...p, distance:Math.hypot(p.x-x,p.z-z)}))
    .filter(p=>p.distance <= maxDistance);
  eligible.sort((a,b)=>a.distance-b.distance);
  return eligible[0]||null;
}
export function fxBudget({xr=false,reducedMotion=false,mobile=false}={}) {
  return {sparks:reducedMotion?0:xr||mobile?9:19, maxConcurrent:reducedMotion?2:xr||mobile?4:7, duration:reducedMotion?.28:.9};
}
