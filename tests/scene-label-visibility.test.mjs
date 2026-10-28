import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENE_SIGN_VISIBILITY_RADIUS,shouldShowSceneSign} from '../src/scene-label-visibility.js';

test('nearby decorative signs remain readable while distant signs leave the view',()=>{
 assert.equal(shouldShowSceneSign((SCENE_SIGN_VISIBILITY_RADIUS-1)**2),true);
 assert.equal(shouldShowSceneSign((SCENE_SIGN_VISIBILITY_RADIUS+1)**2),false);
});

test('interaction labels remain visible at any distance',()=>{
 assert.equal(shouldShowSceneSign(10_000,true),true);
});

test('invalid distances fail closed for decorative signs',()=>{
 assert.equal(shouldShowSceneSign(Number.NaN),false);
 assert.equal(shouldShowSceneSign(Number.POSITIVE_INFINITY),false);
});
