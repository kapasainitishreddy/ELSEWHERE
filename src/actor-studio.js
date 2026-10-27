/** ELSEWHERE character atelier.
 * Original low-poly character, skeletal coat, and cross-faded authored animation clips.
 * Nothing is fetched or stored: actors belong entirely to the transient 3D scene.
 */
import * as THREE from 'three';
import {clipSpec,ACTOR_MODES,wordMouthOpening,nearActorGaze} from './actor-choreography.js';
import {angleTo} from './motion-language.js';
import {performanceFrame} from './performance-direction.js';

const material=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.84,metalness:.10,...opts});
const element=(parent,geometry,mat,position)=>{
 const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(...position);parent.add(mesh);return mesh;
};
const sphere=(parent,r,m,x,y,z)=>element(parent,new THREE.SphereGeometry(r,14,10),m,[x,y,z]);
const box=(parent,x,y,z,sx,sy,sz,m)=>element(parent,new THREE.BoxGeometry(sx,sy,sz),m,[x,y,z]);
const pivot=(name,parent,x,y,z)=>{const bone=new THREE.Bone();bone.name=name;bone.position.set(x,y,z);parent.add(bone);return bone;};
function coatGeometry(){
 const geometry=new THREE.CylinderGeometry(.36,.49,1.18,14,12,false);
 geometry.translate(0,1.38,0);
 const v=geometry.getAttribute('position'),indices=[],weights=[];
 for(let i=0;i<v.count;i++){
  const blend=THREE.MathUtils.smoothstep(v.getY(i),1.05,1.78);
  indices.push(0,1,0,0);weights.push(1-blend,blend,0,0);
 }
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
 geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 return geometry;
}
function animationClip(mode){
 const {name,duration,channels}=clipSpec(mode);
 const tracks=channels.map(({path,times,values})=>new THREE.NumberKeyframeTrack(path,times,values));
 return new THREE.AnimationClip(name,duration,tracks);
}
export function createActor({skin=0xd0b69e,coat=0x3a485e,hair=0x91a2ad,accent=0xb6eedf,age='adult',mood='watchful',identity='citizen'}={}){
 const root=new THREE.Group();root.name='Original rigged citizen';
 const visual=new THREE.Group();root.add(visual);
 const lower=pivot('hips',visual,0,.91,0),spine=pivot('spine',lower,0,.67,0);
 const robe=new THREE.SkinnedMesh(coatGeometry(),material(coat,{metalness:.2,roughness:.8,side:THREE.DoubleSide}));
 // AnimationMixer drives a proper skinning skeleton instead of just rotating the whole torso.
 visual.add(robe);visual.remove(lower);robe.add(lower);
 // Bind-pose inverse matrices must be captured AFTER bones receive world transforms.
 robe.updateMatrixWorld(true);
 robe.bind(new THREE.Skeleton([lower,spine]));robe.frustumCulled=false;
 const undershirt=material(0x192b35),faceMat=material(skin),hairMat=material(hair),bootMat=material(0x18232f);
 // Shoulder and leg joints are real bones, driven by the same AnimationMixer clips.
 const head=pivot('head',spine,0,.67,0);
 sphere(head,.31,faceMat,0,.13,0);
 // Hair cap and simple swept fringe. Abstract visual identity, no biometric likeness.
 const scalp=element(head,new THREE.SphereGeometry(.325,16,12,0,Math.PI*2,0,Math.PI*.51),hairMat,[0,.235,-.024]);
 if(age==='older'){
  box(head,-.10,.21,.298,.13,.024,.025,material(0xd8e3e3));
  box(head,.10,.21,.298,.13,.024,.025,material(0xd8e3e3));
 }
 const brows=[],eyes=[];
 const eyeMaterial=material(0x19232b,{metalness:.04}),eyebrowMaterial=material(hair);
 for(const sign of [-1,1]){
  brows.push(box(head,sign*.123,.22,.291,.125,.027,.025,eyebrowMaterial));
  const white=sphere(head,.064,material(0xf2e5d1),sign*.127,.105,.293);
  const pupil=sphere(head,.030,eyeMaterial,sign*.127,.105,.343);
  eyes.push({white,pupil,baseX:sign*.127});
 }
 const mouth=element(head,new THREE.TorusGeometry(.080,.012,5,20,Math.PI),material(0x7b5351),[0,-.053,.294]);
 mouth.rotation.z=Math.PI; // subtle neutral lip curve
 const mouthInterior=element(head,new THREE.SphereGeometry(.061,10,8),material(0x503139),[0,-.060,.333]);
 mouthInterior.scale.set(1,.08,.20);
 const scarf=element(spine,new THREE.TorusGeometry(.34,.07,8,18),material(accent,{metalness:.28}),[0,.56,0]);scarf.rotation.x=Math.PI/2;
 const leftShoulder=pivot('leftShoulder',spine,-.42,.43,0),rightShoulder=pivot('rightShoulder',spine,.42,.43,0);
 const arms=[];
 for(const [shoulder,side] of [[leftShoulder,-1],[rightShoulder,1]]){
  const sleeve=element(shoulder,new THREE.CapsuleGeometry(.135,.43,4,9),material(coat),[0,-.37,0]);
  const elbow=pivot(side<0?'leftElbow':'rightElbow',shoulder,0,-.67,0);
  sphere(elbow,.12,faceMat,0,-.14,.022);
  const wrist=pivot(side<0?'leftWrist':'rightWrist',elbow,0,-.32,0);
  sphere(wrist,.095,faceMat,0,-.04,.018);
  arms.push({shoulder,elbow,wrist,sleeve});
 }
 const leftHip=pivot('leftHip',lower,-.2,-.035,0),rightHip=pivot('rightHip',lower,.2,-.035,0);
 for(const leg of [leftHip,rightHip]){
  element(leg,new THREE.CapsuleGeometry(.15,.57,4,9),undershirt,[0,-.48,0]);
  element(leg,new THREE.BoxGeometry(.26,.18,.44),bootMat,[0,-1.00,.09]);
 }
 // The head remains a deliberate illustration: no scan or generated likeness of a real person.
 const contactShadow=element(root,new THREE.CircleGeometry(.46,28),new THREE.MeshBasicMaterial({color:0x061019,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}),[0,.025,0]);
 contactShadow.rotation.x=-Math.PI/2;
 const mixer=new THREE.AnimationMixer(visual);
 const actions=Object.fromEntries(ACTOR_MODES.map(mode=>[mode,mixer.clipAction(animationClip(mode))]));
 let activeMode='idle',yaw=0;
 actions.idle.play();
 const indicator=sphere(visual,.075,new THREE.MeshBasicMaterial({color:accent}),0,2.83,0);
 function setMode(mode){
  const next=actions[mode]?mode:'idle';if(next===activeMode)return;
  const from=actions[activeMode],to=actions[next];to.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  from.crossFadeTo(to,next==='startled'?.16:.36,true);activeMode=next;
 }
 function update(time,dt,{target=null,walking=false,reducedMotion=false}={}){
  const step=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));
  if(walking && activeMode==='idle')setMode('walking');else if(!walking && activeMode==='walking')setMode('idle');
  // Stops skeletal animation for accessibility while retaining eye contact.
  if(!reducedMotion && step)mixer.update(step);
  if(target){
   const dist=Math.hypot(target.x-root.position.x,target.z-root.position.z),attention=nearActorGaze(dist);
   if(attention){const desired=Math.atan2(target.x-root.position.x,target.z-root.position.z);yaw=angleTo(yaw,desired,3.3,step);root.rotation.y=yaw;}
  }
  const distance = target ? Math.hypot(target.x-root.position.x,target.z-root.position.z) : 20;
  const acting=performanceFrame(time,{mode:activeMode,mood,identity,distance,reducedMotion});
  for(const eye of eyes){
    eye.white.scale.y=acting.eyelid;
    eye.pupil.scale.y=acting.eyelid;
    eye.pupil.position.x=eye.baseX+acting.eyeX;
    eye.pupil.position.y=.105+acting.eyeY;
  }
  // Separate speech shapes read clearly at conversational VR distance.
  mouth.scale.y=1+acting.mouth*.7;
  mouthInterior.scale.y=.08+acting.mouth*2.5;
  head.rotation.y=acting.headYaw;
  head.rotation.z=acting.headRoll;
  head.rotation.x=reducedMotion?acting.headNod:head.rotation.x+acting.headNod;
  head.position.y=.67+acting.chest;
  arms[0].wrist.rotation.z=acting.wristL;
  arms[1].wrist.rotation.z=acting.wristR;
  for(const [i,b] of brows.entries()){
    b.rotation.z=(i?1:-1)*(i?acting.browR:acting.browL);
  }
  contactShadow.material.opacity=acting.shadow;
  indicator.position.y=2.83+(reducedMotion?0:Math.sin(time*.8)*.045);
  indicator.material.color.setHex(activeMode==='speaking'?0xf3c7a7:activeMode==='listening'?0x8ccef8:accent);
  // Animated gestures never drive locomotion or camera pose.
  if(!reducedMotion){spine.rotation.z+=acting.shoulder*.17;}

 }
 return {root,visual,robe,mixer,setMode,update,get mode(){return activeMode;},bones:{lower,spine,head,arms,leftHip,rightHip},features:{mouth,mouthInterior,eyes,scalp,contactShadow}};
}
