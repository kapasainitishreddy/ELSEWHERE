import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_VISIBLE_SCENE_SIGNS,SCENE_ACTION_SIGN_VISIBILITY_RADIUS,SCENE_SIGN_VISIBILITY_RADIUS,shouldShowSceneSign,visibleSceneSignIndexes} from '../src/scene-label-visibility.js';

test('nearby decorative signs remain readable while distant signs leave the view',()=>{
 assert.equal(shouldShowSceneSign((SCENE_SIGN_VISIBILITY_RADIUS-1)**2),true);
 assert.equal(shouldShowSceneSign((SCENE_SIGN_VISIBILITY_RADIUS+1)**2),false);
});

test('interactive labels appear near the action while distant text leaves the vista',()=>{
 assert.equal(shouldShowSceneSign((SCENE_ACTION_SIGN_VISIBILITY_RADIUS-1)**2,true),true);
 assert.equal(shouldShowSceneSign((SCENE_ACTION_SIGN_VISIBILITY_RADIUS+1)**2,true),false);
});

test('interactive sign radius is shorter than the decorative-sign radius',()=>{
 assert(SCENE_ACTION_SIGN_VISIBILITY_RADIUS<SCENE_SIGN_VISIBILITY_RADIUS);
});

test('only the three closest eligible scene signs remain visible with stable tie ordering',()=>{
 const visible=visibleSceneSignIndexes([
  {index:0,distanceSquared:36,interactive:false},{index:1,distanceSquared:4,interactive:true},
  {index:2,distanceSquared:16,interactive:false},{index:3,distanceSquared:121,interactive:false},
  {index:4,distanceSquared:9**2+1,interactive:true}
 ]);
 assert.equal(MAX_VISIBLE_SCENE_SIGNS,3);
 assert.deepEqual([...visible],[1,2,0]);
});

test('non-finite and malformed action-sign distances are never selected',()=>{
 assert.deepEqual([...visibleSceneSignIndexes([
  {index:0,distanceSquared:Number.NaN,interactive:false},{index:1,distanceSquared:Number.POSITIVE_INFINITY,interactive:true},
  {index:2,distanceSquared:-1,interactive:true}
 ])],[]);
});

test('invalid distances fail closed for decorative signs',()=>{
 assert.equal(shouldShowSceneSign(Number.NaN),false);
 assert.equal(shouldShowSceneSign(Number.POSITIVE_INFINITY),false);
 assert.equal(shouldShowSceneSign(Number.NaN,true),false);
});
