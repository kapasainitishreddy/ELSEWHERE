import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {parseDirectedFocus,safeSceneFocus} from '../src/scene-director.js';
import {authoredCausalFocus,causalExhibitPlan,installCausalExhibit} from '../src/causal-exhibit.js';
test('model can choose an authored 3D perspective, never grant rewards',()=>{
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'The public square remembers.',cue:'wonder',focus:'people'})),'people');
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'The public square remembers.',cue:'wonder',focus:'people',credits:99999})),null);
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'No grants.',focus:'grant-credits'})),null);
 assert.equal(parseDirectedFocus('Plain text, no focus'),null);
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'Stop your medication and cure depression.',focus:'people'})),null);
 assert.equal(safeSceneFocus({focus:'people'}),null);
});
test('all exhibits inherit canonical fate without sharing private data',()=>{
 for(const fate of ['none','gift','patent','auction']){
  const letter='PLAYER_PRIVATE_LETTER_SENTINEL';
  const conversation='PLAYER_PRIVATE_CONVERSATION_SENTINEL';
  const outcomes=['people','infrastructure','memory'].map(focus=>causalExhibitPlan({fate,letter,conversation:[{role:'user',text:conversation}]},focus));
  assert.equal(new Set(outcomes.map(v=>v.title)).size,3);
  assert.ok(outcomes.every(v=>v.color>0));
  const serialized=JSON.stringify(outcomes);
  assert.ok(!serialized.includes(letter),'the exhibit must not contain the private letter');
  assert.ok(!serialized.includes(conversation),'the exhibit must not contain private conversation text');
 }
 assert.equal(causalExhibitPlan({fate:'gift'},'change-economy'),null);
});
test('offline focus is deterministic and clearly distinguished from a Meta-selected focus',()=>{
 const cases=[['gift','people'],['patent','infrastructure'],['auction','memory']];
 for(const [fate,focus] of cases){
  assert.equal(authoredCausalFocus({fate}),focus);
  const local=causalExhibitPlan({fate},authoredCausalFocus({fate}),'authored');
  const model=causalExhibitPlan({fate},focus,'meta');
  assert.equal(local.provenance,'AUTHORED PREVIEW');
  assert.equal(model.provenance,'META-SELECTED FOCUS');
  assert.equal(local.focus,focus);
  assert.equal(model.focus,focus);
  assert.equal(local.title,model.title,'both render canonical locally authored facts');
 }
 assert.equal(authoredCausalFocus({fate:'unknown'}),'people','unknown or unwritten outcomes use the safe authored default');
});
test('authored preview builds distinct real 3D forms and disposes each shared resource once',()=>{
 const scene=new THREE.Group();
 const plan=causalExhibitPlan({fate:'gift'},authoredCausalFocus({fate:'gift'}),'authored');
 const exhibit=installCausalExhibit(THREE,scene,plan),root=scene.children[0];
 assert.match(root.name,/AUTHORED PREVIEW/);
 assert.ok(root.children.length>=11,'the offline exhibit must contain its physical platform, people and display forms');
 const geometries=new Set(root.children.map(object=>object.geometry));
 const materials=new Set(root.children.map(object=>object.material));
 const geometryDisposals=new Map(),materialDisposals=new Map();
 for(const geometry of geometries)geometry.addEventListener('dispose',()=>geometryDisposals.set(geometry,(geometryDisposals.get(geometry)||0)+1));
 for(const material of materials)material.addEventListener('dispose',()=>materialDisposals.set(material,(materialDisposals.get(material)||0)+1));
 exhibit.dispose();exhibit.dispose();
 assert.equal(scene.children.length,0);
 assert.ok([...geometryDisposals.values()].every(count=>count===1),'unique exhibit geometries dispose exactly once');
 assert.ok([...materialDisposals.values()].every(count=>count===1),'shared exhibit materials dispose exactly once');
});
test('focus flows through consented Meta handler into a reversible scene',()=>{
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const api=read('api/character.js'),world=read('src/worlds.js'),main=read('src/main.js');
 assert.match(api,/parseDirectedFocus/);
 assert.match(main,/visualFocus=safeSceneFocus\(data\.focus\)/);
 assert.match(main,/reactToDialogue\?\.\(visualCue,visualFocus\)/);
 assert.match(world,/installCausalExhibit\(THREE,world,causalExhibitPlan\(state,focus,provenance\)\)/);
 assert.match(world,/authoredCausalFocus\(state\)/);
 assert.match(world,/metaExhibit\?\.dispose\(\)/);
 assert.doesNotMatch(main,/if\(physicsPreview\)ui\.enterSandbox\(\);toast\('Remote conversations disabled/);
});
