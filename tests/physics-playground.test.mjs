import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPhysicsSimulation,PHYSICS_ORIGIN,PHYSICS_WORLDS} from '../src/physics-playground.js';

class Descriptor {
 constructor(type){this.type=type;this.point={x:0,y:0,z:0};}
 setTranslation(x,y,z){this.point={x,y,z};return this;}
 setFriction(){return this;}
 setRestitution(){return this;}
}
class Body {
 constructor(desc){this.point={...desc.point};this.lastImpulse=null;this.lastTorque=null;}
 translation(){return this.point;}
 rotation(){return {x:0,y:0,z:0,w:1};}
 applyImpulse(v){this.lastImpulse={...v};}
 applyTorqueImpulse(v){this.lastTorque={...v};}
}
class Space {
 constructor(gravity){this.gravity=gravity;this.bodies=[];this.steps=0;this.freed=false;}
 createRigidBody(desc){const b=new Body(desc);this.bodies.push(b);return b;}
 createCollider(){return {};}
 step(){this.steps++;}
 free(){this.freed=true;}
}
const RAPIER={
 World:Space,
 RigidBodyDesc:{fixed:()=>new Descriptor('fixed'),dynamic:()=>new Descriptor('dynamic')},
 ColliderDesc:{cuboid:()=>new Descriptor('cuboid')}
};
test('Rapier gallery is bounded to two worlds with fixed timesteps',()=>{
 assert.deepEqual([...PHYSICS_WORLDS],['dungeon','mech']);
 assert.deepEqual(PHYSICS_ORIGIN,{x:8.4,z:5.8});
 assert.throws(()=>createPhysicsSimulation(RAPIER,'self'),/supported world/);
 const sim=createPhysicsSimulation(RAPIER,'dungeon');
 assert.equal(sim.bodies.size,3);
 assert.equal(sim.step(NaN),0);
 assert.equal(sim.step(10),3);
 assert.equal(sim.step(-1),0);
 assert.equal(sim.step(.04),2);
 sim.dispose();
 assert.equal(sim.disposed,true);
 assert.equal(sim.step(.05),0);
 sim.dispose();
});
test('physical interactions are rate-limited, reversible and finite',()=>{
 const sim=createPhysicsSimulation(RAPIER,'mech'),id='mech-relic-2';
 assert.equal(sim.impulse('invalid'),false);
 assert.equal(sim.impulse(id,{x:4,z:6}),true);
 const body=sim.bodies.get(id);
 assert.ok(Number.isFinite(body.lastImpulse.x)&&Number.isFinite(body.lastImpulse.z));
 assert.ok(Math.hypot(body.lastImpulse.x,body.lastImpulse.z)<=3.500001);
 assert.ok(body.lastTorque);
 assert.equal(sim.impulse(id,{x:4,z:6}),false);
 for(let i=0;i<8;i++)sim.step(.05);
 assert.equal(sim.impulse(id,{x:4,z:6},true),true);
 assert.equal(body.lastImpulse.y,1.15);
 assert.equal(body.lastTorque.y,.46);
 sim.dispose();
 assert.equal(sim.impulse(id),false);
});
test('scene interaction connects E, click and XR to transient physics',()=>{
 const scene=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf8');
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.match(scene,/installPhysicsStage\(THREE,/);
 assert.match(scene,/action\.type==='physics'/);
 assert.match(scene,/physicsStage\?\.step\(dt\)/);
 assert.match(scene,/physicsStage\?\.dispose\(\)/);
 assert.equal(pkg.dependencies['@dimforge/rapier3d-compat'],'^0.21.0');
 assert.equal(pkg.scripts.dev,'vite --host 127.0.0.1');
 const simulation=readFileSync(new URL('../src/physics-playground.js',import.meta.url),'utf8');
 assert.doesNotMatch(simulation,/localStorage|XMLHttpRequest|sendBeacon|passphrase|fetch\(/);
});
