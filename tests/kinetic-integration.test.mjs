import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
test('all kinetic effects and performance measurements remain offline',async()=>{
 const files=await Promise.all(['src/motion-language.js','src/kinetic-effects.js','src/performance.js'].map(source));
 for(const code of files){
  assert.doesNotMatch(code,/\b(?:fetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|localStorage\.|sessionStorage\.)/);
  assert.doesNotMatch(code,/https?:\/\/[^\s]+/);
 }
});
test('all five worlds carry locally inspectable artifacts and animate in VR and desktop',async()=>{
 const worlds=await source('src/worlds.js');
 for(const world of ['future','self','past','dungeon','mech'])assert.match(worlds,new RegExp(`${world}:\\{label:`));
 assert.match(worlds,/buildTouchableArtifacts\(world,state,targets,animated,nearbyProps\)/);
 assert.match(worlds,/focusReticle\.visible/);
 assert.match(worlds,/renderer\.xr\.isPresenting/);
 assert.match(worlds,/showXRNote\(action\.text/);
 assert.match(worlds,/fx\?\.update\(dt\)/);
 assert.match(worlds,/renderer\.setAnimationLoop\(tick\)/);
});
test('city background uses instanced geometry and opt-in performance HUD',async()=>{
 const worlds=await source('src/worlds.js');
 assert.match(worlds,/new THREE\.InstancedMesh\(new THREE\.BoxGeometry\(1,1,1\),buildings,94\)/);
 assert.match(worlds,/get\('perf'\)==='1'/);
 assert.match(worlds,/describeFrame\(frameSample\.snapshot\(\)/);
});
test('default safe flow still starts only after vault unlock and model remains opt-in',async()=>{
 const main=await source('src/main.js');
 assert.match(main,/gateForm\.addEventListener\('submit'/);
 assert.match(main,/createExperience\(document\.querySelector\('#world-canvas'\)/);
 assert.match(main,/window\.confirm\('Optional CLOUD MODE/);
 const readme=await source('README.md');
 assert.match(readme,/physical Quest controls are not verified/);
});
