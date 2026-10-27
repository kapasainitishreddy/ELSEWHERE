/**
 * One instanced draw call per world for authored ambience. All models are procedural;
 * visual state never reads private memories or executes an AI prompt.
 */
import * as THREE from 'three';
import {ENVIRONMENT_PALETTES,environmentalBudget,environmentalParticle,environmentalResponse} from './environment-motion.js';

export function installEnvironmentStage(parent,world,animated,options={}) {
 const count=environmentalBudget(world,options),palette=ENVIRONMENT_PALETTES[world];
 if(!count||!palette)return {react(){},get count(){return 0;}};
 // Rain is a narrow vertical trail; all other worlds use faceted illuminated motes.
 const geometry=world==='self'
   ? new THREE.CylinderGeometry(.012,.012,.53,4,1)
   : new THREE.TetrahedronGeometry(.12,0);
 const material=new THREE.MeshBasicMaterial({color:palette.color,transparent:true,opacity:world==='self'?.26:.47,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 const instances=new THREE.InstancedMesh(geometry,material,count);
 instances.name=`Living Atmosphere · ${palette.name}`;
 instances.frustumCulled=false;
 instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 parent.add(instances);
 const dummy=new THREE.Object3D();
 let reaction='choice',reactionAge=100,lastUpdate=-Infinity;
 function react(kind='choice'){
  if(typeof kind!=='string')return;
  reaction=kind.slice(0,24);reactionAge=0;
 }
 function update(time,moving,dt){
  const t=Number.isFinite(time)?Math.max(0,time):0;
  const delta=Number.isFinite(dt)?Math.max(0,Math.min(.05,dt)):0;
  reactionAge=Math.min(100,reactionAge+delta);
  // Keep draw calls constant, and limit XR instance updates to 30/s.
  const limit=options.xr?1/30:1/60;
  if(t-lastUpdate<limit && lastUpdate!==-Infinity)return;
  lastUpdate=t;
  const boost=environmentalResponse(reaction,reactionAge,options);
  material.opacity=Math.min(.68,(world==='self'?.25:.42)+boost);
  for(let i=0;i<count;i++){
   const particle=environmentalParticle(world,i,t,options);
   dummy.position.set(particle.x,particle.y,particle.z);
   dummy.rotation.set(0,0,particle.rotation);
   if(world==='self')dummy.scale.set(particle.size,.5+particle.size,particle.size);
   else dummy.scale.setScalar(particle.size*(1+boost*.25));
   dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix);
  }
  instances.instanceMatrix.needsUpdate=true;
 }
 // Populate transforms before first render to avoid a frame with all particles at origin.
 update(0,false,1/60);
 animated.push(update);
 return {react,get count(){return count;}};
}
