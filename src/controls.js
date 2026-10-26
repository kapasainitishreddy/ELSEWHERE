/** Controller mapping shared by the desktop gamepad and future VR comfort panels.
 * No telemetry, no global listeners, and no per-device calibration is stored.
 */
export const deadzone=(value,threshold=.19)=>{
 const v=Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;
 return Math.abs(v)<threshold?0:Math.sign(v)*(Math.abs(v)-threshold)/(1-threshold);
};
export function stickMovement(pad){
 if(!pad||!Array.isArray(pad.axes))return {x:0,z:0};
 return {x:deadzone(pad.axes[0]),z:deadzone(pad.axes[1])};
}
export function buttonEdges(pad,previous=new Set()){
 const current=new Set(),edges=[];
 for(let i=0;i<(pad?.buttons?.length||0);i++){
  if(pad.buttons[i]?.pressed || (pad.buttons[i]?.value||0)>.65){
   current.add(i);if(!previous.has(i))edges.push(i);
  }
 }
 return {current,edges};
}
export function gamepadCommand(world,battle,button){
 if(button===0){if(world==='mech'&&battle?.active)return 'fire-pulse';if(world==='dungeon'&&battle?.active)return 'warden-strike';return 'interact';}
 if(button===2){if(world==='mech'&&battle?.active)return 'raise-shield';if(world==='dungeon'&&battle?.active)return 'warden-guard';}
 if(button===1){if(world==='mech'&&battle?.active)return 'vent-reactor';if(world==='dungeon'&&battle?.active)return 'warden-power';}
 if(button===3&&world==='dungeon'&&battle?.active)return 'warden-parley';
 return null;
}
