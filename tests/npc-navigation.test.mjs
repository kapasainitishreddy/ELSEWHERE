import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NPC_PATROL_RADIUS, navPatrolStops, navIsWalkable, createNpcNavigator} from '../src/npc-navigation.js';

// Lightweight Yuka-compatible adapter for local route tests. Browser bundle and headset still need QA.
class Vector3 {
  constructor(x=0,y=0,z=0){this.set(x,y,z);}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
}
class ArriveBehavior { constructor(target){this.target=target;} }
class Vehicle {
  constructor(){this.position=new Vector3();this.velocity=new Vector3();this.steering={behaviors:[],add:b=>this.steering.behaviors.push(b)};}
  update(dt){
    const destination=this.steering.behaviors[0].target;
    const dx=destination.x-this.position.x,dz=destination.z-this.position.z;
    const dist=Math.hypot(dx,dz);
    const distance=Math.min(dist,(this.maxSpeed||1)*dt);
    if(dist>.001){this.velocity.set(dx/dist*distance/dt,0,dz/dist*distance/dt);this.position.x+=dx/dist*distance;this.position.z+=dz/dist*distance;}
    return this;
  }
}
const fakeYuka={Vector3,ArriveBehavior,Vehicle};

test('stable patrol stops remain within the actor neighborhood',()=>{
  const actor={id:'iris',x:7,z:-7}, points=navPatrolStops(actor);
  assert.equal(points.length,4);
  assert.deepEqual(points,navPatrolStops(actor));
  assert.notDeepEqual(points,navPatrolStops({...actor,id:'ada'}));
  for(const p of points)assert.ok(Math.hypot(p.x-7,p.z+7)<=NPC_PATROL_RADIUS);
  assert.deepEqual(navPatrolStops({id:'bad',x:NaN,z:0}),[]);
});

test('NPC steering stays within safe walkable areas for 700 frames',()=>{
  assert.equal(navIsWalkable({x:0,z:0},[[-1,1,-1,1]]),false);
  assert.equal(navIsWalkable({x:Infinity,z:0}),false);
  const rects=[[-3.7,3.7,-11.7,-4]];
  const npc=createNpcNavigator(fakeYuka,{id:'iris',x:7,z:-7,rects});
  for(let i=0;i<700;i++){
    const pose=npc.step(.05);
    assert.equal(navIsWalkable(pose,rects),true);
    assert.ok(Math.hypot(pose.x-7,pose.z+7)<=NPC_PATROL_RADIUS+.000001);
  }
});

test('approaching an NPC pauses navigation and reduced motion keeps it still',()=>{
  const npc=createNpcNavigator(fakeYuka,{id:'sol',x:7.8,z:-7});
  let first;
  for(let i=0;i<25;i++)first=npc.step(.05);
  const stopped=npc.step(.05,{x:first.x+1,z:first.z+1});
  assert.equal(stopped.listening,true);
  assert.equal(stopped.walking,false);
  assert.deepEqual(npc.step(.05,{x:stopped.x+.2,z:stopped.z}),stopped);
  assert.equal(npc.step(.05,null,true).walking,false);
  assert.equal(npc.step(Infinity).walking,false);
});

test('actual world wires Yuka steering into moving interaction prompts',()=>{
 const scene=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf8');
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.match(scene,/import \* as YUKA from 'yuka'/);
 assert.match(scene,/createNpcNavigator\(YUKA,/);
 assert.match(scene,/npcHint\.x=figure\.position\.x/);
 assert.match(scene,/npcHint\.z=figure\.position\.z/);
 assert.match(scene,/model\.setMode\(pose\.walking\?'walking'/);
 assert.equal(pkg.dependencies.yuka,'^0.7.8');
 assert.equal(pkg.scripts.dev,'vite --host 127.0.0.1');
});
