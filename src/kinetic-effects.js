/** Kinetic Worlds visual feedback. Built entirely from Three.js primitives.
 * No postprocessing, camera shaking, cookies, sensors or external downloads.
 * Effects are bounded, pooled by expiry and disposed on world transitions.
 */
import * as THREE from 'three';
import {clamp01, easeOutCubic, fxBudget} from './motion-language.js';
const COLORS={arrival:0x79e9e5,impact:0xd7b0ff,plasma:0xffab6e,invention:0xf9d191,memory:0xa6eada,magic:0xb6a6ff,choice:0x91dfea};
const coordinate=(position)=>position?.isVector3?position:new THREE.Vector3(Number(position?.x)||0,Number(position?.y)||2,Number(position?.z)||0);
export function createKineticEffects(parent,options={}){
 const budget=fxBudget(options), root=new THREE.Group();root.name='Kinetic feedback: ephemeral';parent.add(root);
 const live=[];let isDisposed=false;
 function release(item){
   root.remove(item.group);
   item.group.traverse(node=>{
     node.geometry?.dispose();
     const mats=Array.isArray(node.material)?node.material:node.material?[node.material]:[];
     for(const mat of mats)mat.dispose();
   });
 }
 function clear(){while(live.length)release(live.pop());}
 function emit(kind='choice',position=new THREE.Vector3(0,2,-8)){
   if(isDisposed)return;
   if(live.length>=budget.maxConcurrent)release(live.shift());
   const at=coordinate(position),color=COLORS[kind]||COLORS.choice;
   const group=new THREE.Group();group.position.copy(at);root.add(group);
   const planeMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.83,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
   const wave=new THREE.Mesh(new THREE.TorusGeometry(.55,.052,5,36),planeMat);group.add(wave);
   const wave2=new THREE.Mesh(new THREE.TorusGeometry(.84,.025,4,40),new THREE.MeshBasicMaterial({color:0xe8faff,transparent:true,opacity:.41,depthWrite:false,blending:THREE.AdditiveBlending}));group.add(wave2);
   const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,1),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false}));group.add(core);
   let sparks=null,transform=null;
   if(budget.sparks){
     sparks=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(.09,0),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.91,depthWrite:false,blending:THREE.AdditiveBlending}),budget.sparks);
     sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(sparks);transform=new THREE.Object3D();
   }
   live.push({kind,group,wave,wave2,core,planeMat,sparks,transform,age:0,duration:budget.duration});
 }
 function update(dt){
   if(isDisposed)return;
   const step=Math.max(0,Math.min(.05,Number(dt)||0));
   for(let i=live.length-1;i>=0;i--){
     const item=live[i];item.age+=step;const life=clamp01(item.age/item.duration),fade=(1-life)**1.65;
     item.wave.scale.setScalar(1+easeOutCubic(life)*3.5);
     item.wave2.scale.setScalar(1.1+easeOutCubic(life)*2.3);
     item.planeMat.opacity=.74*fade;
     item.wave2.material.opacity=.38*fade;
     item.core.scale.setScalar(Math.max(.01,.95-life));item.core.material.opacity=.8*fade;
     if(item.sparks){
       const N=item.sparks.count;
       for(let j=0;j<N;j++){
         const a=(j/N)*Math.PI*2+j*.08,speed=1.5+(j%5)*.32,d=life*speed*2.6;
         item.transform.position.set(Math.cos(a)*d, Math.sin(a*.91)*d*.7+(j%3)*life*.35, Math.sin(a)*d*.5);
         item.transform.scale.setScalar(Math.max(.001,(1-life)*(.55+(j%3)*.18)));
         item.transform.rotation.set(life*7+j,life*4-j,0);item.transform.updateMatrix();
         item.sparks.setMatrixAt(j,item.transform.matrix);
       }
       item.sparks.instanceMatrix.needsUpdate=true;
       item.sparks.material.opacity=.85*fade;
     }
     if(life>=1){release(item);live.splice(i,1);}
   }
 }
 function dispose(){if(isDisposed)return;isDisposed=true;clear();parent.remove(root);}
 return {emit,update,clear,dispose,get activeCount(){return live.length},get budget(){return budget}};
}
