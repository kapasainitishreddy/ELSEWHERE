/**
 * Tangible local physics gallery for the Hollow Crown and Titan Foundry.
 * Rapier is Apache-2.0. This simulation never changes canonical game state.
 */
export const PHYSICS_WORLDS=Object.freeze(['dungeon','mech']);
export const PHYSICS_ORIGIN=Object.freeze({x:8.4,z:5.8});
export const PHYSICS_STEP=1/60;

export function createPhysicsSimulation(RAPIER,worldId){
 if(!PHYSICS_WORLDS.includes(worldId)||!RAPIER?.World||!RAPIER?.RigidBodyDesc||!RAPIER?.ColliderDesc)
   throw new TypeError('Physics requires Rapier and a supported world');
 const space=new RAPIER.World({x:0,y:-9.81,z:0});
 space.timestep=PHYSICS_STEP;
 const ground=space.createRigidBody(RAPIER.RigidBodyDesc.fixed());
 space.createCollider(RAPIER.ColliderDesc.cuboid(3,.22,2.6).setTranslation(0,-.22,0).setFriction(.85),ground);
 for(const side of [-1,1]){
   space.createCollider(RAPIER.ColliderDesc.cuboid(.18,1.5,2.6).setTranslation(side*3,1.4,0),ground);
   space.createCollider(RAPIER.ColliderDesc.cuboid(3,1.5,.18).setTranslation(0,1.4,side*2.6),ground);
 }
 const bodies=new Map();
 for(let i=0;i<3;i++){
   const id=worldId+'-relic-'+(i+1);
   const body=space.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation((i-1)*1.3,.86+(i%2)*.25,-.2+(i%2)*.5));
   space.createCollider(RAPIER.ColliderDesc.cuboid(.37,.37,.37).setRestitution(.26).setFriction(.75),body);
   bodies.set(id,body);
 }
 let elapsed=0,remainder=0,disposed=false;
 const lastImpulse=new Map();
 function step(delta){
   if(disposed)return 0;
   const dt=Number.isFinite(delta)?Math.max(0,Math.min(.05,delta)):0;
   remainder+=dt;let updates=0;
   while(remainder>=PHYSICS_STEP&&updates<3){space.step();remainder-=PHYSICS_STEP;elapsed+=PHYSICS_STEP;updates++;}
   return updates;
 }
 function impulse(id,traveler=null,reducedMotion=false){
   const body=bodies.get(id);
   if(!body||disposed||elapsed-(lastImpulse.get(id)??-Infinity)<.35)return false;
   const p=body.translation();
   const dx=Number.isFinite(traveler?.x)?PHYSICS_ORIGIN.x+p.x-traveler.x:p.x+.5;
   const dz=Number.isFinite(traveler?.z)?PHYSICS_ORIGIN.z+p.z-traveler.z:p.z+1;
   const len=Math.max(.01,Math.hypot(dx,dz));
   const strength=reducedMotion?1.25:3.5;
   body.applyImpulse({x:strength*dx/len,y:reducedMotion?1.15:2.7,z:strength*dz/len},true);
   if(!reducedMotion)body.applyTorqueImpulse({x:.24,y:.46,z:-.18},true);
   lastImpulse.set(id,elapsed);return true;
 }
 function dispose(){if(disposed)return;disposed=true;lastImpulse.clear();bodies.clear();space.free();}
 return {bodies,step,impulse,dispose,get disposed(){return disposed;}};
}

/** Synchronize an isolated Rapier arena with original Three.js sculptures. */
export function createPhysicsStage(THREE,RAPIER,parent,worldId,targets,nearby,options={}){
 if(!parent?.add||!Array.isArray(targets)||!Array.isArray(nearby))throw new TypeError('Invalid physics stage');
 const simulation=createPhysicsSimulation(RAPIER,worldId);
 const root=new THREE.Group();
 root.position.set(PHYSICS_ORIGIN.x,0,PHYSICS_ORIGIN.z);
 root.name='Tactile physics gallery';parent.add(root);
 const isMech=worldId==='mech',accent=isMech?0x82e9ff:0xc3a1ff;
 const material=new THREE.MeshStandardMaterial({color:isMech?0x28627b:0x685386,emissive:accent,emissiveIntensity:.35,metalness:isMech?.65:.22,roughness:.32});
 const plinth=new THREE.Mesh(new THREE.CylinderGeometry(3.35,3.35,.20,48),new THREE.MeshStandardMaterial({color:0x17202c,metalness:.7,roughness:.28}));
 plinth.position.y=-.11;root.add(plinth);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(2.95,.035,8,64),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.6}));
 rim.rotation.x=Math.PI/2;rim.position.y=.015;root.add(rim);
 const visuals=[];
 for(const [id,body] of simulation.bodies){
   const crate=new THREE.Mesh(new THREE.BoxGeometry(.74,.74,.74),material);
   crate.name=isMech?'Training cargo':'Runic practice stone';
   crate.userData.action={type:'physics',id,label:isMech?'PUSH TRAINING CARGO':'PUSH RUNIC STONE'};
   root.add(crate);
   const lines=new THREE.LineSegments(new THREE.EdgesGeometry(crate.geometry),new THREE.LineBasicMaterial({color:0xe0faff,transparent:true,opacity:.64}));
   crate.add(lines);
   const hint={x:PHYSICS_ORIGIN.x,z:PHYSICS_ORIGIN.z,action:crate.userData.action};
   targets.push(crate);nearby.push(hint);visuals.push({body,crate,hint});
 }
 let ended=false;
 function step(delta){
   if(ended)return;
   simulation.step(delta);
   for(const {body,crate,hint} of visuals){
     const p=body.translation(),q=body.rotation();
     crate.position.set(p.x,p.y,p.z);crate.quaternion.set(q.x,q.y,q.z,q.w);
     hint.x=PHYSICS_ORIGIN.x+p.x;hint.z=PHYSICS_ORIGIN.z+p.z;
   }
 }
 step(0);
 function dispose(){
   if(ended)return;ended=true;simulation.dispose();
   for(const {crate,hint} of visuals){
     const i=targets.indexOf(crate);if(i!==-1)targets.splice(i,1);
     const j=nearby.indexOf(hint);if(j!==-1)nearby.splice(j,1);
   }
   root.traverse(obj=>{
     obj.geometry?.dispose();
     if(obj.material)for(const m of (Array.isArray(obj.material)?obj.material:[obj.material]))if(m!==material)m.dispose();
   });
   material.dispose();root.parent?.remove(root);
 }
 return {step,dispose,impulse:(id,traveler)=>simulation.impulse(id,traveler,Boolean(options.reducedMotion)),root};
}

/** Lazy WASM initialization; discarded immediately if a player changes worlds. */
export async function installPhysicsStage(THREE,parent,worldId,targets,nearby,options={}){
 if(!PHYSICS_WORLDS.includes(worldId)||!parent?.parent)return null;
 const lib=await import('@dimforge/rapier3d-compat');
 const RAPIER=lib.default?.World?lib.default:lib;
 await RAPIER.init();
 if(!parent.parent)return null;
 return createPhysicsStage(THREE,RAPIER,parent,worldId,targets,nearby,options);
}
