import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPlayerMotion,PLAYER_MOTION} from '../src/player-motion.js';

function simulate(input, frames=90, dt=1/60){
 const movement=createPlayerMotion();let position={x:0,z:6};
 for(let i=0;i<frames;i++)position=movement.step({...position,...input,dt});
 return position;
}
test('WASD follows the orbit-camera heading',()=>{
 const front=simulate({inputZ:-1,cameraYaw:0});
 assert.ok(front.z<0&&Math.abs(front.x)<.00001);
 const rightCamera=simulate({inputZ:-1,cameraYaw:Math.PI/2});
 assert.ok(rightCamera.x< -5&&Math.abs(rightCamera.z-6)<.00001);
 const sideways=simulate({inputX:1,cameraYaw:Math.PI/2});
 assert.ok(sideways.z<0&&Math.abs(sideways.x)<.00001);
});
test('accelerating never jumps instantly to maximum movement speed',()=>{
 const motion=createPlayerMotion();
 const first=motion.step({inputZ:-1,sprint:true,dt:1/60});
 assert.ok(first.speed>0 && first.speed<PLAYER_MOTION.sprint*.35);
 assert.ok(Math.abs(first.z)<.07);
 const fast=simulate({inputX:1,inputZ:-1,sprint:true},200);
 assert.ok(fast.speed<=PLAYER_MOTION.sprint+.0001);
});
test('walking is consistent between 30 and 60 Hz simulations',()=>{
 const a=simulate({inputZ:-1},120,1/60),b=simulate({inputZ:-1},60,1/30);
 assert.ok(Math.abs(a.z-b.z)<.2,'Refresh-rate drift: '+a.z+' / '+b.z);
});
test('deceleration is gradual and wall collision permits sliding',()=>{
 const motion=createPlayerMotion();let p={x:0,z:6};
 p=motion.step({...p,inputX:1,dt:.016});
 assert.ok(p.heading<Math.PI && p.heading>1);
 for(let i=0;i<90;i++)p=motion.step({...p,inputX:1,dt:.016});
 let s=motion.step({...p,dt:.016});
 assert.ok(s.speed>0&&s.speed<p.speed);
 for(let i=0;i<85;i++)s=motion.step({...s,dt:.016});
 assert.ok(s.speed<.08);
 const runner=createPlayerMotion(),rects=[[-1,1,-1,1]];let pos={x:-1.8,z:1.7};
 for(let i=0;i<100;i++){
   pos=runner.step({...pos,inputX:1,inputZ:-1,dt:.016,rects});
   assert.ok(!(pos.x> -1.45 && pos.x<1.45 && pos.z> -1.45 && pos.z<1.45),'Collision rectangle penetrated');
 }
});
test('rigged avatar and damping are wired to the renderer',()=>{
 const scene=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf8');
 const actor=readFileSync(new URL('../src/actor-studio.js',import.meta.url),'utf8');
 assert.match(scene,/createPlayerMotion\(/);
 assert.match(scene,/const actor=createActor\(/);
 assert.match(scene,/player\.userData\.actor/);
 assert.match(scene,/actor\.mixer\.timeScale/);
 assert.match(scene,/Math\.exp\(-7\.5\*dt\)/);
 assert.doesNotMatch(actor,/head\.rotation\.x\+=acting\.headNod/);
 assert.doesNotMatch(actor,/spine\.rotation\.z\+=acting\.shoulder/);
});
