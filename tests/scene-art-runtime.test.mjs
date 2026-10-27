import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {createActor} from '../src/actor-studio.js';
import {createPhysicsStage} from '../src/physics-playground.js';

test('characters really construct finite skinned meshes and update over animation transitions',()=>{
 for(const identity of ['traveler','future-self','ada','sol']){
   const actor=createActor({identity,age:identity==='future-self'?'older':'adult'});
   const meshes=[],skins=[];
   actor.root.traverse(obj=>{if(obj.isMesh)meshes.push(obj);if(obj.isSkinnedMesh)skins.push(obj);});
   assert.ok(meshes.length>=35,identity+' has unexpectedly little geometry');
   assert.equal(skins.length,1);
   for(let i=0;i<240;i++){
     actor.setMode(i<140?'walking':i<190?'listening':'idle');
     actor.update(i/60,1/60,{locomotionSpeed:i<140?4.5:0,
       target:identity==='traveler'?null:{x:1.5,z:2.1},reducedMotion:false});
   }
   actor.root.updateMatrixWorld(true);
   actor.root.traverse(obj=>{
     const values=obj.position.toArray().concat(obj.scale.toArray());
     assert.ok(values.every(Number.isFinite),identity+' contains invalid pose data');
   });
   const bb=new THREE.Box3().setFromObject(actor.root);
   assert.ok(bb.min.y<bb.max.y,identity+' bounds invalid');
   assert.ok(bb.max.y<6&&bb.min.y>-4,identity+' pose escaped expected scene size');
 }
});
test('Rapier runs genuine colliders and the original Three.js arena without a WebGL context',async()=>{
 await RAPIER.init();
 const root=new THREE.Group();
 const targets=[],nearby=[];
 const stage=createPhysicsStage(THREE,RAPIER,root,'dungeon',targets,nearby);
 assert.equal(targets.length,3);
 assert.ok(root.children.includes(stage.root));
 assert.ok(stage.root.children.length>=25);
 for(let i=0;i<80;i++)stage.step(1/60);
 const before=targets[1].position.clone();
 assert.equal(stage.impulse('dungeon-relic-2',{x:6,z:7}),true);
 for(let i=0;i<70;i++)stage.step(1/60);
 const after=targets[1].position;
 assert.ok(Number.isFinite(after.x)&&Number.isFinite(after.y)&&Number.isFinite(after.z));
 assert.ok(after.distanceTo(before)>.01,'Object did not respond to physics impulse');
 stage.dispose();
 assert.equal(targets.length,0);
 assert.equal(nearby.length,0);
 assert.equal(root.children.length,0);
});
test('main 3D scene exposes an actual clickable physics interaction in desktop mode',()=>{
 const s=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf8');
 assert.match(s,/physicsControl\.addEventListener\('click'/);
 assert.match(s,/physicsStage\.impulse\(id,playerPos\)/);
 assert.match(s,/physicsControl\.hidden=renderer\.xr\.isPresenting/);
 assert.match(s,/const showcase=options\.spawnNearPhysics/);
});
