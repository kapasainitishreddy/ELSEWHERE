import test from 'node:test';
import assert from 'node:assert/strict';
import {createPhysicsSimulation,PHYSICS_ORIGIN} from '../src/physics-playground.js';

test('real Rapier props settle and stay inside matched cage colliders through a ten-minute simulation',async()=>{
 const module=await import('@dimforge/rapier3d-compat');
 const RAPIER=module.default?.World?module.default:module;
 await RAPIER.init();
 for(const world of ['dungeon','mech']){
  const sim=createPhysicsSimulation(RAPIER,world);
  try{
   const bodies=[...sim.bodies.entries()];
   for(let frame=0;frame<100;frame++)sim.step(.05); // five seconds to settle from the authored spawn pose
   for(const [id,body] of bodies){
    const position=body.translation(),velocity=body.linvel();
    assert(Math.abs(position.y-(world==='dungeon'?.45:.37))<.08,`${world} ${id} should rest on the visible floor: ${JSON.stringify(position)}`);
    assert(Math.hypot(velocity.x,velocity.y,velocity.z)<.08,`${world} ${id} should settle after the initial drop`);
   }
   const [id,body]=bodies[1];
   for(let push=0;push<24;push++){
    assert.equal(sim.impulse(id,{x:PHYSICS_ORIGIN.x-4,z:PHYSICS_ORIGIN.z-4}),true,`${world} impulse ${push+1} should pass the cooldown`);
    for(let frame=0;frame<8;frame++)sim.step(.05);
   }
   for(let frame=0;frame<12_000;frame++)sim.step(.05); // ten simulated minutes at the capped 20 Hz render delta
   const after=body.translation(),velocity=body.linvel();
   assert(Math.abs(after.x)<2.7&&Math.abs(after.z)<2.35,`${world} relic crossed the visible collision cage: ${JSON.stringify(after)}`);
   assert(after.y>(world==='dungeon'?.34:.27)&&after.y<1,`${world} relic left the floor after ten simulated minutes: ${JSON.stringify(after)}`);
   assert(Math.hypot(velocity.x,velocity.y,velocity.z)<.12,`${world} relic failed to settle after ten simulated minutes: ${JSON.stringify(velocity)}`);
   for(let frame=0;frame<120;frame++)sim.step(.05);
   const settled=body.translation();
   assert(Math.hypot(settled.x-after.x,settled.y-after.y,settled.z-after.z)<.04,`${world} relic continued drifting after the long idle interval`);
  }finally{sim.dispose();}
 }
});
