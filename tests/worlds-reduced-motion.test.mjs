import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('scene stages receive the reduced-motion preference from createExperience',()=>{
 const source=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf8');
 assert.match(source,/atmosphereBudget\(\{headset:renderer\.xr\.isPresenting,reducedMotion:reduceMotion,/);
 assert.match(source,/installEnvironmentStage\(world,state\.world,animated,\{xr:renderer\.xr\.isPresenting,reducedMotion:reduceMotion,/);
 assert.match(source,/installPhysicsStage\(THREE,level,state\.world,levelTargets,levelNearby,\{reducedMotion:reduceMotion\}\)/);
});
