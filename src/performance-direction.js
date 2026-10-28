/**
 * ELSEWHERE / Presence Director
 * Tiny, deterministic secondary-acting layer for animated inhabitants.
 * No remote inference, biometric inputs, randomness, storage, or camera movement.
 * Animation blending lives in actor-studio; this layer only provides bounded poses.
 */
const finite = (v, fallback = 0) => Number.isFinite(v) ? v : fallback;
const clamp = (v, low, high) => Math.min(high, Math.max(low, finite(v)));
const fraction = v => v - Math.floor(v);
const smooth = t => { const n = clamp(t, 0, 1); return n*n*(3-2*n); };

/** Bounded local-space envelope for the nine animated Neo Elysium vehicles. */
export const SKYLINE_VEHICLE_BOUNDS = Object.freeze({x:0,y:14,z:-29,radius:50});
/** Wrap motion in both directions without JavaScript's negative-remainder underflow. */
export function skylineVehicleX(seconds,direction,phase){
  const cycle=78;
  return (((finite(seconds)*finite(direction)+finite(phase))%cycle+cycle)%cycle)-cycle/2;
}

export const ACTING_PALETTES = Object.freeze({
  watchful: Object.freeze({brow:0, warmth:.08, shoulders:.04}),
  grateful: Object.freeze({brow:.10, warmth:.32, shoulders:-.07}),
  angry: Object.freeze({brow:-.13, warmth:-.05, shoulders:.15}),
  curious: Object.freeze({brow:.08, warmth:.14, shoulders:-.03}),
  hopeful: Object.freeze({brow:.07, warmth:.24, shoulders:-.04}),
  neutral: Object.freeze({brow:0, warmth:0, shoulders:0})
});

/** Character offsets make separate inhabitants blink/look on different beats. */
export function characterSeed(identity = 'someone') {
  let hash = 2166136261;
  for (const c of String(identity).slice(0,80)) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return (hash % 9991) / 9991;
}

function softBlink(time, seed) {
  const cycle = 3.4 + seed*.8;
  const phase = fraction((time + seed*2.7) / cycle);
  // A small closing arc: ~150ms blink. No high-frequency flashing.
  const duration = .16 / cycle;
  if (phase >= duration) return 1;
  const closing = Math.sin(Math.PI * phase/duration);
  return clamp(1 - .90 * Math.pow(closing, .85), .10, 1);
}

/** Returns a secondary acting pose; all outputs bounded and frame-time independent. */
export function performanceFrame(time, {mode='idle', mood='watchful', identity='someone', distance=6, reducedMotion=false}={}) {
  const t = Math.max(0, finite(time));
  const seed = characterSeed(identity);
  const palette = ACTING_PALETTES[mood] || ACTING_PALETTES.watchful;
  const attention = 1-smooth((distance-1.25)/4.5);
  const speaking = mode === 'speaking';
  const listening = mode === 'listening';
  const delighted = mode === 'delighted';
  const startled = mode === 'startled';
  const walking = mode === 'walking';
  const emotionalLift = palette.warmth + (delighted?.17:startled?-.04:0);
  if(reducedMotion) return {
    eyelid:1, eyeX:0, eyeY:0, mouth:0, headYaw:0, headRoll:0,
    headNod:listening?-.035:0, chest:0, shoulder:0, wristL:0, wristR:0,
    browL:palette.brow, browR:palette.brow, shadow: .13,
    attention, expression:emotionalLift
  };
  const listeningNod = listening ? Math.max(0,Math.sin(t*1.62+seed))*.045 : 0;
  // Two leisurely conversation rhythms; not a one-frequency talking metronome.
  const phrase = speaking ? .11 + .40*Math.abs(Math.sin(t*6.6+seed*2.8)) *
    (.55+.45*Math.abs(Math.sin(t*1.7+.7*seed))) : 0;
  const gesturing = speaking ? .075*Math.sin(t*2.1+seed) : delighted ? .11 : .016;
  const saccade = Math.sin(t*.42+seed*6)*.042 + Math.sin(t*1.13+seed*3)*.018;
  return {
    eyelid:softBlink(t,seed),
    eyeX:clamp(saccade*.65*attention,-.047,.047),
    eyeY:clamp((Math.sin(t*.32+seed*7)*.018 +(listening ? -.014:0))*attention,-.04,.04),
    mouth:clamp(phrase + (delighted?.025:0),0,.65),
    headYaw:clamp((Math.sin(t*.38+seed*6)*.058 + (speaking?.022:0))*attention,-.11,.11),
    headRoll:clamp(Math.sin(t*.56+seed*4)*.026 +(listening?-.04:0),-.08,.08),
    headNod:clamp(listeningNod + (speaking?Math.sin(t*1.3+seed)*.035:0),-.08,.09),
    chest:walking?0:Math.sin(t*1.52+seed*4)*.007,
    shoulder:palette.shoulders + gesturing,
    wristL:speaking? .12*Math.sin(t*1.5+seed) : delighted?.20:0,
    wristR:speaking?-.14*Math.sin(t*1.7+seed+1) : delighted?-.2:0,
    browL:clamp(palette.brow + emotionalLift*.1 + (startled?.15:0),-.2,.25),
    browR:clamp(palette.brow + emotionalLift*.1 + (speaking?Math.sin(t*1.1+seed)*.035:0) +(startled?.15:0),-.2,.25),
    shadow: walking ? .12 : .16,
    attention,expression:emotionalLift
  };
}

/** World portals react when approached but never animate or tilt the VR camera. */
export function portalFrame(time, distance, {seed=0, reducedMotion=false}={}) {
  const t = Math.max(0, finite(time));
  const near = 1-smooth((finite(distance, 15)-2)/7);
  if(reducedMotion) return {proximity:near, glow:.95+near*.25, radius:1, twist:0, shardMotion:0, opacity:.60};
  return {
    proximity:near,
    glow:clamp(1.05+.12*Math.sin(t*.64+seed) + near*.56,.78,1.8),
    radius:1+.014*Math.sin(t*1.2+seed)+near*.042,
    twist:.24*Math.sin(t*.22+seed),
    shardMotion:.18+near*.23,
    opacity:clamp(.46+near*.2+.03*Math.sin(t*.7+seed),.42,.72)
  };
}

/** Cues are visual-only, not simulated damage or combat decisions. */
export function combatFrame(time, index=0, {reducedMotion=false}={}) {
  if(reducedMotion)return {hover:0, yaw:0, halo:1, sweep:0};
  const t=Math.max(0,finite(time)),phase=index*1.618;
  return {
    hover: Math.sin(t*1.1+phase)*.24,
    yaw:Math.sin(t*.44+phase)*.21,
    halo:1+.06*Math.sin(t*.8+phase),
    sweep:Math.sin(t*.65+phase)*.36
  };
}
