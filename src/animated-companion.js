/** Optional Khronos glTF Fox: one genuinely skin-animated creature with three authored clips.
 * Only same-origin local bytes are loaded, or no fox is displayed. This never contacts Khronos.
 */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {COMPANION_INDEX,validCompanionIndex,companionMoodDistance} from './animated-companion-manifest.js';
const loader=new GLTFLoader();
export async function installAnimatedCompanion(parent,animated,getTraveler,reducedMotion=false){
 try{
  if(!parent.parent)return false;
  const response=await fetch(COMPANION_INDEX,{credentials:'same-origin',cache:'no-cache'});
  if(!response.ok || !validCompanionIndex(await response.json()))return false;
  const model=await loader.loadAsync('/assets/companions/fox.glb');
  if(!parent.parent)return false; // stop stale world loads
  const avatar=model.scene;
  avatar.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(avatar),extent=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(extent.y)||extent.y<=.001)return false;
  const scale=Math.min(16,Math.max(.001,.75/extent.y));
  avatar.scale.setScalar(scale);
  avatar.position.set(-3.0,-bounds.min.y*scale,-3.0);
  avatar.rotation.y=.65;
  avatar.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=false;}});
  avatar.userData.attribution='Khronos glTF Sample Assets Fox. See docs/ANIMATED_ASSET_LICENSE.md';
  parent.add(avatar);
  const mixer=new THREE.AnimationMixer(avatar);
  const modes={};for(const clip of model.animations||[]){
   const name=String(clip.name).toLowerCase();
   const id=/survey/.test(name)?'survey':/walk/.test(name)?'walk':/run/.test(name)?'run':null;
   if(id)modes[id]=mixer.clipAction(clip);
  }
  let active=modes.survey||modes.walk||modes.run;
  if(active)active.play();
  animated.push((t,moving,dt)=>{
   if(!parent.parent)return;
   const traveler=getTraveler();const distance=traveler?Math.hypot(traveler.x-avatar.position.x,traveler.z-avatar.position.z):0;
   const preference=reducedMotion?'survey':companionMoodDistance(distance);
   // Unlike a running-in-place exhibit, the companion travels toward the player.
   // Bounded velocity and position keep it inside the apartment's walkable area.
   if(traveler && !reducedMotion && dt>0 && distance>2.45){
     const dx=traveler.x-avatar.position.x,dz=traveler.z-avatar.position.z;
     const speed=preference==='run'?2.1:.88;
     const step=Math.min(Math.max(0,distance-2.45),speed*Math.min(dt,.05));
     const nx=THREE.MathUtils.clamp(avatar.position.x+dx/distance*step,-8.5,8.5);
     const nz=THREE.MathUtils.clamp(avatar.position.z+dz/distance*step,-9.0,8.5);
     avatar.position.x=nx;avatar.position.z=nz;
     const angle=Math.atan2(dx,dz);avatar.rotation.y+=Math.atan2(Math.sin(angle-avatar.rotation.y),Math.cos(angle-avatar.rotation.y))*Math.min(1,dt*4);
   }
   const next=modes[preference]||modes.survey||active;
   if(next && next!==active){next.reset().play();active?.crossFadeTo(next,.3,true);active=next;}
   if(dt>0)mixer.update(Math.min(dt,.05));
  });
  return true;
 }catch{return false;}
}
