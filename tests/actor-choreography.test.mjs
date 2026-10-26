import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTOR_MODES,clipSpec,selectActorMode,wordMouthOpening,nearActorGaze} from '../src/actor-choreography.js';

test('every original animation clip loops seamlessly with aligned keyframe tracks',()=>{
 assert.deepEqual(ACTOR_MODES,['idle','listening','speaking','walking','delighted','startled']);
 for(const mode of ACTOR_MODES){
  const clip=clipSpec(mode);assert.ok(clip.duration>0&&clip.duration<5);assert.ok(clip.channels.length>=7);
  for(const {times,values,path} of clip.channels){
   assert.equal(times.length,5);assert.equal(values.length,5);
   assert.equal(times[0],0);assert.equal(times[4],clip.duration);
   assert.equal(values[0],values[4],`${mode} ${path} loop seam`);
   assert.match(path,/^(?:spine|head|leftShoulder|rightShoulder|leftElbow|rightElbow|leftHip|rightHip)\.rotation\[[xyz]\]$/);
   assert.ok(values.every(Number.isFinite));
  }
 }
});

test('character posture prioritizes dialogue, surprise, and movement correctly',()=>{
 assert.equal(selectActorMode(), 'idle');
 assert.equal(selectActorMode({walking:true}), 'walking');
 assert.equal(selectActorMode({speaking:true,walking:true}), 'speaking');
 assert.equal(selectActorMode({speaking:true,listening:true}), 'speaking');
 assert.equal(selectActorMode({startled:true,speaking:true}), 'startled');
 assert.equal(selectActorMode({delighted:true,walking:true}), 'delighted');
});

test('mouth movement is reduced-motion-aware and does not fabricate speech',()=>{
 assert.equal(wordMouthOpening(1,false),0);
 assert.equal(wordMouthOpening(1,true,true),0);
 for(let i=0;i<100;i++){
  const value=wordMouthOpening(i/16,true,false);
  assert.ok(value>=0&&value<=.85);
 }
});

test('attention only follows a traveler at conversational distance',()=>{
 assert.equal(nearActorGaze(-1),0);assert.equal(nearActorGaze(Infinity),0);
 assert.equal(nearActorGaze(6),0);assert.ok(nearActorGaze(1)>nearActorGaze(3));
});
