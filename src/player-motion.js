/** Offline frame-rate-independent third-person movement, shared by keyboard and gamepad. */
const finite=(v,fallback=0)=>Number.isFinite(v)?v:fallback;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const PLAYER_MOTION=Object.freeze({walk:4.6,sprint:7.8,accelerate:10,brake:15,turn:9.5,bodyRadius:.45});
export function createPlayerMotion(options={}){
 const cfg={...PLAYER_MOTION,...options};
 let vx=0,vz=0,heading=Math.PI;
 function reset(angle=Math.PI){vx=0;vz=0;heading=finite(angle,Math.PI);}
 function step({x=0,z=0,inputX=0,inputZ=0,cameraYaw=0,sprint=false,dt=0,rects=[],collisions=true}={}){
   const elapsed=clamp(finite(dt),0,.05);
   const ix=clamp(finite(inputX),-2,2),iz=clamp(finite(inputZ),-2,2);
   const magnitude=Math.hypot(ix,iz),power=Math.min(1,magnitude);
   const yaw=finite(cameraYaw);
   const rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);
   const backwardX=Math.sin(yaw),backwardZ=Math.cos(yaw);
   const maxSpeed=sprint?cfg.sprint:cfg.walk;
   const wantedX=magnitude>0?(rightX*ix+backwardX*iz)/magnitude*power*maxSpeed:0;
   const wantedZ=magnitude>0?(rightZ*ix+backwardZ*iz)/magnitude*power*maxSpeed:0;
   const blend=1-Math.exp(-(power>.005?cfg.accelerate:cfg.brake)*elapsed);
   vx+=(wantedX-vx)*blend;vz+=(wantedZ-vz)*blend;
   if(!power&&Math.abs(vx)<.017)vx=0;
   if(!power&&Math.abs(vz)<.017)vz=0;
   let nx=finite(x),nz=finite(z);
   const blocked=(px,pz)=>collisions&&Array.isArray(rects)&&rects.some(rect=>{
     if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite))return false;
     const [a,b,c,d]=rect;
     return px>a-cfg.bodyRadius&&px<b+cfg.bodyRadius&&pz>c-cfg.bodyRadius&&pz<d+cfg.bodyRadius;
   });
   const tryX=clamp(nx+vx*elapsed,-22,22);
   if(blocked(tryX,nz) || (Math.abs(tryX-nx)<.00001 && Math.abs(vx)>.1))vx=0;
   else nx=tryX;
   const tryZ=clamp(nz+vz*elapsed,-22,18);
   if(blocked(nx,tryZ) || (Math.abs(tryZ-nz)<.00001 && Math.abs(vz)>.1))vz=0;
   else nz=tryZ;
   const speed=Math.hypot(vx,vz);
   if(speed>.085){
     const wantedHeading=Math.atan2(vx,vz);
     const delta=Math.atan2(Math.sin(wantedHeading-heading),Math.cos(wantedHeading-heading));
     heading+=delta*(1-Math.exp(-cfg.turn*elapsed));
   }
   return {x:nx,z:nz,heading,speed,moving:speed>.28,intensity:clamp(speed/cfg.sprint,0,1)};
 }
 return {step,reset,get heading(){return heading;}};
}
