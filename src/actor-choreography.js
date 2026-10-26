/** Original animation clip choreography for ELSEWHERE's locally rigged characters.
 * Presets are authored, deterministic, and contain no personal data or services.
 * The last keyframe equals the first keyframe so looping remains seamless.
 */
const keys = {
  idle: {
    duration: 3.6, spineZ:[0,.018,0,-.018,0], spineX:[0,-.013,0,.014,0], headX:[-.025,-.012,-.02,-.035,-.025],
    leftArmX:[-.10,-.08,-.07,-.08,-.10],rightArmX:[-.10,-.12,-.10,-.06,-.10],
    leftLegX:[0,0,0,0,0],rightLegX:[0,0,0,0,0],leftElbowX:[-.10,-.09,-.08,-.09,-.10],rightElbowX:[-.10,-.10,-.09,-.08,-.10]
  },
  listening: {
    duration: 2.6,spineZ:[0,.01,0,-.01,0],spineX:[-.055,-.062,-.068,-.058,-.055],
    headX:[-.12,-.145,-.11,-.132,-.12],leftArmX:[-.17,-.18,-.2,-.18,-.17],rightArmX:[-.18,-.2,-.18,-.16,-.18],
    leftElbowX:[-.24,-.25,-.25,-.24,-.24],rightElbowX:[-.25,-.26,-.24,-.23,-.25]
  },
  speaking: {
    duration: 2.8,spineZ:[0,.026,0,-.018,0],spineX:[-.03,-.05,-.04,-.02,-.03],
    headX:[-.04,-.08,-.06,-.10,-.04],leftArmX:[-.16,-.66,-.3,-.54,-.16],rightArmX:[-.25,-.44,-.75,-.34,-.25],
    leftElbowX:[-.25,-.65,-.35,-.52,-.25],rightElbowX:[-.2,-.48,-.4,-.6,-.2]
  },
  walking: {
    duration: 1.12,spineZ:[0,.04,0,-.04,0],spineX:[-.04,-.06,-.04,-.06,-.04],
    headX:[0,.04,0,.04,0],leftArmX:[.35,0,-.35,0,.35],rightArmX:[-.35,0,.35,0,-.35],
    leftLegX:[-.45,0,.45,0,-.45],rightLegX:[.45,0,-.45,0,.45],
    leftElbowX:[-.15,-.24,-.15,-.12,-.15],rightElbowX:[-.15,-.12,-.15,-.24,-.15]
  },
  delighted: {
    duration: 2.4,spineZ:[0,.09,.02,-.03,0],spineX:[-.02,-.12,-.08,0,-.02],
    headX:[-.04,-.16,-.11,-.03,-.04],leftArmX:[-.2,-.9,-.65,-.35,-.2],rightArmX:[-.2,-1.1,-.75,-.4,-.2],
    leftElbowX:[-.2,-.9,-.6,-.35,-.2],rightElbowX:[-.2,-.85,-.6,-.4,-.2]
  },
  startled: {
    duration: 1.1,spineZ:[0,-.04,.04,0,0],spineX:[-.04,.14,.03,0,-.04],
    headX:[-.02,.16,.05,0,-.02],leftArmX:[-.1,.3,.1,-.1,-.1],rightArmX:[-.1,.3,.1,-.1,-.1],
    leftElbowX:[-.12,-.34,-.3,-.12,-.12],rightElbowX:[-.12,-.34,-.3,-.12,-.12]
  }
};
export const ACTOR_MODES=Object.freeze(Object.keys(keys));
export const ANIMATION_BINDINGS=Object.freeze({
  spineZ:'spine.rotation[z]',spineX:'spine.rotation[x]',headX:'head.rotation[x]',
  leftArmX:'leftShoulder.rotation[x]',rightArmX:'rightShoulder.rotation[x]',
  leftElbowX:'leftElbow.rotation[x]',rightElbowX:'rightElbow.rotation[x]',
  leftLegX:'leftHip.rotation[x]',rightLegX:'rightHip.rotation[x]'
});
export function clipSpec(mode='idle'){
 const raw=keys[mode]||keys.idle;
 return {name:mode in keys?mode:'idle',duration:raw.duration,channels:Object.entries(raw).filter(([k])=>k!=='duration')
   .map(([name,values])=>({path:ANIMATION_BINDINGS[name],times:[0,raw.duration*.25,raw.duration*.5,raw.duration*.75,raw.duration],values:[...values]}))};
}
export function selectActorMode({walking=false,listening=false,speaking=false,delighted=false,startled=false}={}){
 if(startled)return 'startled';if(delighted)return 'delighted';if(speaking)return 'speaking';
 if(listening)return 'listening';return walking?'walking':'idle';
}
export function wordMouthOpening(time, speaking=false, reducedMotion=false){
 if(!speaking||reducedMotion)return 0;
 const t=Math.max(0,Number.isFinite(time)?time:0);
 // Variation prevents an obvious clockwork open/shut cycle. Not phoneme lip sync.
 return Math.min(.85,.12+.30*Math.abs(Math.sin(t*7.1))+.14*Math.abs(Math.sin(t*3.7+.4)));
}
export function nearActorGaze(distance){return Number.isFinite(distance)&&distance>=0&&distance<5?Math.max(0,1-distance/6):0;}
