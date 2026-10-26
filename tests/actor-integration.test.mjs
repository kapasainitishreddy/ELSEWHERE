import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {futureKeepsakes,keepsakeReaction} from '../src/keepsake-scenes.js';

const source=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('keepsakes reference fictional causality and never read personal private letters',async()=>{
 const empty=futureKeepsakes({parallel:{active:'prime'},chronal:{hours:5,pastDebt:2,futureDebt:1}});
 assert.equal(empty.length,3);assert.match(empty[0].text,/empty notebook/);
 const gift=futureKeepsakes({invention:'Aether Cell',fate:'gift',parallel:{active:'echo'},chronal:{hours:9,pastDebt:0,futureDebt:3},owned:['library']});
 assert.match(gift[0].text,/public gift/);assert.match(gift[1].text,/Echo timeline/);assert.match(gift[1].text,/3 owed/);
 assert.match(gift[2].text,/public library/);
 const patent=futureKeepsakes({invention:'Skyrail',fate:'patent'});
 const auction=futureKeepsakes({invention:'Skyrail',fate:'auction'});
 assert.notEqual(patent[0].text,auction[0].text);
 assert.notEqual(keepsakeReaction('blueprint'),keepsakeReaction('hourglass'));
 assert.doesNotMatch(await source('src/keepsake-scenes.js'),/\b(?:fetch|localStorage|XMLHttpRequest|navigator|sendBeacon)\b/);
});

test('real skeleton coat is animated by offline original clips with no external dependencies',async()=>{
 const code=await source('src/actor-studio.js');
 assert.match(code,/new THREE\.SkinnedMesh\(/);
 assert.match(code,/robe\.bind\(new THREE\.Skeleton\(/);
 assert.match(code,/new THREE\.AnimationMixer\(/);
 assert.match(code,/new THREE\.NumberKeyframeTrack\(/);
 assert.match(code,/crossFadeTo\(to,\.28,true\)/);
 assert.match(code,/reducedMotion/);
 assert.doesNotMatch(code,/https?:\/\/|\bfetch\s*\(|localStorage|sendBeacon/);
});

test('the interactive future apartment is wired to actor gestures and near-world object rays',async()=>{
 const world=await source('src/worlds.js');
 assert.match(world,/createActor\(\{age:'older'/);
 assert.match(world,/elder\.update\(t,dt,\{target:getTraveler\?\.\(\)/);
 assert.match(world,/buildFutureKeepsakes\(world,state,targets,animated,nearbyProps\)/);
 assert.match(world,/setDialogueActivity\(keepsakeReaction\(action\.id\),2\.2\)/);
 assert.match(world,/buildLivingCharacters\(world,state,targets,animated,\(\)=>playerPos,nearbyProps\)/);
 assert.match(world,/fx\?\.emit\('memory',new THREE\.Vector3\(\.\.\.at\)\)/);
 assert.match(world,/renderer\.xr\.getController/);
 assert.match(world,/renderer\.setPixelRatio\(Math\.min\(window\.devicePixelRatio\|\|1,1\.5\)\)/);
});
