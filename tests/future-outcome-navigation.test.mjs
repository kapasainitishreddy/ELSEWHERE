import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlayerMotion} from '../src/player-motion.js';
import {chooseNearby} from '../src/motion-language.js';
import {walkableLanding} from '../src/xr-comfort.js';
import {collisionRects} from '../src/scenery.js';
import {
 FUTURE_OUTCOME_LAYOUTS,FUTURE_PORTAL_APPROACH,FUTURE_PORTAL_Z,
 futureOutcomeCollisionRects,overlaps,portalXAt
} from '../src/future-outcomes.js';

const futurePortalXs=Array.from({length:4},(_,index)=>portalXAt(index,4));

test('patent and auction landmarks stay clear of every portal approach',()=>{
 assert.deepEqual(futurePortalXs,[-8.55,-2.85,2.85,8.55]);
 for(const fate of ['patent','auction']){
  const layout=FUTURE_OUTCOME_LAYOUTS[fate];
  assert.ok(layout.bounds.maxZ>FUTURE_PORTAL_APPROACH.minZ,'the visible landmark should meet the playable depth so its collision proxy is exercised');
  assert.ok(layout.bounds.minZ<FUTURE_PORTAL_APPROACH.minZ);
  for(const x of futurePortalXs){
   const approach={minX:x-FUTURE_PORTAL_APPROACH.halfWidth,maxX:x+FUTURE_PORTAL_APPROACH.halfWidth,
    minZ:FUTURE_PORTAL_APPROACH.minZ,maxZ:FUTURE_PORTAL_APPROACH.maxZ};
   assert.equal(overlaps(layout.bounds,approach),false,`${fate} landmark overlaps portal approach at x=${x}`);
  }
  assert.deepEqual(futureOutcomeCollisionRects(fate),[layout.collisionRect]);
  assert.ok(layout.bounds.minX<=layout.collisionRect[0]&&layout.bounds.maxX>=layout.collisionRect[1]);
  assert.ok(layout.bounds.minZ<=layout.collisionRect[2]&&layout.bounds.maxZ>=layout.collisionRect[3]);
 }
});

test('portal travel remains walkable and landings avoid outcome structures',()=>{
 for(const fate of ['gift','patent','auction']){
  const rects=collisionRects('future',fate);
  for(const x of [futurePortalXs[0],futurePortalXs.at(-1)]){
   const motion=createPlayerMotion();let z=0;
   for(let frame=0;frame<700&&z>-17.9;frame++){
    z=motion.step({x,z,inputZ:-1,dt:.05,rects}).z;
   }
   assert.ok(z<=-17.9,`${fate} blocks the walk-in route to portal x=${x}: stopped at z=${z}`);
   assert.ok(chooseNearby([{x,z:FUTURE_PORTAL_Z,action:{type:'world',world:'self'}}],x,z),`${fate} portal is outside interaction reach`);
   const landingZ=-17.9;
   assert.equal(walkableLanding({x,z:landingZ,source:{x,z:landingZ+8},distance:8,rects,limit:11}),true,
    `${fate} should allow teleport landing within interaction reach of portal x=${x}`);
   assert.ok(chooseNearby([{x,z:FUTURE_PORTAL_Z,action:{type:'world',world:'self'}}],x,landingZ),
    `${fate} should allow E to activate the portal from the XR landing point`);
  }
 }
});

test('solid outcome landmarks block walking and XR landing through their footprint',()=>{
 for(const fate of ['patent','auction']){
  const layout=FUTURE_OUTCOME_LAYOUTS[fate],rects=collisionRects('future',fate),rect=layout.collisionRect;
  assert.ok(rects.some(r=>r[0]===rect[0]&&r[1]===rect[1]&&r[2]===rect[2]&&r[3]===rect[3]),`${fate} is missing its walk collision proxy`);
  const x=(layout.bounds.minX+layout.bounds.maxX)/2;
  const motion=createPlayerMotion();let z=-18;
  for(let frame=0;frame<160;frame++)z=motion.step({x,z,inputZ:-1,dt:.05,rects}).z;
  assert.ok(z>=rect[3]-.55,`${fate} player passed through its structure: z=${z}`);
  assert.equal(walkableLanding({x,z:rect[3]+.2,source:{x:0,z:0},distance:8,rects,limit:11}),false,
   `${fate} permits teleporting into its structure`);
 }
 assert.deepEqual(collisionRects('future','gift'),[[-3.7,3.7,-11.7,-4]],'the open workshop should stay traversable');
});
