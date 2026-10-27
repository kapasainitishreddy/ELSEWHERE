/**
 * ELSEWHERE / Living Atmosphere.
 * Pure deterministic environmental motion — never a camera animation.
 * No device sensors, hidden randomness, networking, persistent data or user identifiers.
 * In-world memory/actions may trigger a brief visual response, never award currency.
 */
const clamp = (n, low=0, high=1) => Math.max(low,Math.min(high, Number.isFinite(n)?n:low));
const fract = n => n-Math.floor(n);
const seed = (i, salt=0) => fract(Math.sin((i+1)*127.1 + salt*311.7)*43758.5453);
const fracTime = (t,period) => fract(t/period);

export const ENVIRONMENT_PALETTES = Object.freeze({
 future:Object.freeze({name:'signal trails',color:0x7eecf3,base:68}),
 self:Object.freeze({name:'window rain',color:0xa2d9eb,base:78}),
 past:Object.freeze({name:'forge embers',color:0xffc58a,base:64}),
 dungeon:Object.freeze({name:'arcane drift',color:0xbba1ff,base:76}),
 mech:Object.freeze({name:'reactor sparks',color:0xffa875,base:65})
});

export function environmentalBudget(world,{xr=false,mobile=false,reducedMotion=false}={}) {
 const spec=ENVIRONMENT_PALETTES[world];
 if(!spec || reducedMotion)return 0;
 const ceiling=xr?42:mobile?34:84;
 return Math.min(spec.base,ceiling);
}

/** A stable [position + rotation + scale] for an instanced particle. */
export function environmentalParticle(world,index,time,{reducedMotion=false}={}) {
 const i=Math.max(0,Math.floor(Number.isFinite(index)?index:0));
 const t=Math.max(0,Number.isFinite(time)?time:0);
 const u=seed(i,0),v=seed(i,1),w=seed(i,2),p=seed(i,3);
 const phase=reducedMotion?0:t;
 let x=0,y=1,z=-10,rotation=0,size=.5;
 switch(world){
  case 'self': {
   // Behind the apartment's window, not in the player's walking area.
   x=-8+u*16;z=-13.0-w*1.9;
   y=.4+8*fract(v-phase*(.22+p*.13));
   rotation=(p-.5)*.09;size=.45+.50*p;
   break;
  }
  case 'future': {
   const progress=fracTime(phase*(.035+p*.015)+u,1);
   x=-26+52*progress; y=3+v*15; z=-21-19*w;
   rotation=0;size=.35+.58*p;
   break;
  }
  case 'past': {
   x=-7+u*14 + .12*Math.sin(phase*.38+i);
   y=.2+7*fract(v+phase*(.045+p*.045));
   z=-5-12*w;rotation=phase*.1+p;size=.35+.6*p;
   break;
  }
  case 'dungeon': {
   const radius=2.4+u*6.1,angle=v*Math.PI*2+phase*(.045+p*.04);
   x=Math.cos(angle)*radius; z=-10+Math.sin(angle)*radius;
   y=1.3+6*w + (reducedMotion?0:.22*Math.sin(phase*.9+i));
   rotation=angle;size=.35+.65*p;
   break;
  }
  case 'mech': {
   x=-12+u*24;
   y=1.3+10*fract(v+phase*(.11+p*.10));
   z=-8-16*w;rotation=phase*.22+p;size=.34+.65*p;
   break;
  }
  default: return {x:0,y:0,z:0,rotation:0,size:0};
 }
 return {x,y,z,rotation,size};
}

/** A soft single impulse after a player's voluntary action. */
export function environmentalResponse(kind='choice',elapsed=0,{reducedMotion=false}={}) {
 if(reducedMotion)return 0;
 const strength={choice:.22,memory:.32,arrival:.34,plasma:.52,magic:.44,invention:.4,impact:.34,inspect:.28}[kind]||.18;
 const age=Math.max(0,Number.isFinite(elapsed)?elapsed:0);
 return clamp(strength * Math.exp(-age*2.1),0,.6);
}
