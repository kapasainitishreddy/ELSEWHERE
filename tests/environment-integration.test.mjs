import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('all five worlds share a single bounded local environment stage',async()=>{
 const scene=await read('src/worlds.js'),stage=await read('src/environment-stage.js');
 assert.match(scene,/import \{installEnvironmentStage\} from '\.\/environment-stage\.js'/);
 assert.match(scene,/ambientStage=installEnvironmentStage\(world,state\.world,animated/);
 assert.match(stage,/new THREE\.InstancedMesh\(/);
 assert.match(stage,/parent\.add\(instances\)/);
 assert.match(stage,/animated\.push\(update\)/);
});
test('voluntary interactions visibly respond without manipulating the player',async()=>{
 const scene=await read('src/worlds.js');
 assert.match(scene,/ambientStage\?\.react\('memory'\)/);
 assert.match(scene,/ambientStage\?\.react\(kind\)/);
 assert.match(scene,/ambientStage\?\.react\('arrival'\)/);
 assert.doesNotMatch(await read('src/environment-stage.js'),/camera\.position|rig\.position|window\.location|document\.cookie/);
});
test('all instances reset with world disposal and no interval or storage keeps running',async()=>{
 const scene=await read('src/worlds.js'),stage=await read('src/environment-stage.js');
 assert.match(scene,/world\.traverse\(o=>\{/);
 assert.match(stage,/new THREE\.CylinderGeometry/);
 assert.match(stage,/instances\.instanceMatrix\.needsUpdate=true/);
 assert.doesNotMatch(stage,/setInterval|setTimeout|requestAnimationFrame|localStorage|indexedDB|fetch\(/);
});
