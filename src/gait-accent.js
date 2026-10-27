/** Distance-weighted gait accents. The animation mixer handles the joints. */
export function gaitAccent(speed=0,time=0,{reducedMotion=false}={}){
 const v=Number.isFinite(speed)?Math.max(0,Math.min(speed,9)):0;
 const t=Number.isFinite(time)?time:0;
 if(reducedMotion||v<.2)return {lift:0,lean:0,roll:0,weight:0};
 const weight=Math.min(1,v/5.7);
 const phase=t*(v>5.5?15.2:12.2);
 const lift=(.008+.022*weight)*Math.abs(Math.sin(phase));
 return {lift,lean:-.022*weight,roll:.018*weight*Math.sin(phase*.5),weight};
}
