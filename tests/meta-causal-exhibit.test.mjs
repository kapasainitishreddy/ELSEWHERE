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
test('all three authored forms use distinct Three.js meshes and dispose every expected geometry and shared material once',()=>{
 const cases=[['gift','people'],['patent','infrastructure'],['auction','memory']];
 for(const [fate,focus] of cases){
  const scene=new THREE.Group(),plan=causalExhibitPlan({fate},focus,'authored');
  const exhibit=installCausalExhibit(THREE,scene,plan),root=scene.children[0];
  assert.match(root.name,/AUTHORED PREVIEW/);
  assert.equal(root.children.length,11,`${focus} form has a platform, ring and 9 physical detail meshes`);
  const geometries=new Set(root.children.map(object=>object.geometry));
  const materials=new Set(root.children.map(object=>object.material));
  assert.equal(geometries.size,11,'each physical mesh owns one geometry');assert.equal(materials.size,3,'the 11 meshes use exactly three shared materials');
  const geometryDisposals=new Map(),materialDisposals=new Map();
  for(const geometry of geometries)geometry.addEventListener('dispose',()=>geometryDisposals.set(geometry,(geometryDisposals.get(geometry)||0)+1));
  for(const material of materials)material.addEventListener('dispose',()=>materialDisposals.set(material,(materialDisposals.get(material)||0)+1));
  exhibit.dispose();exhibit.dispose();
  assert.equal(scene.children.length,0);
  assert.equal(geometryDisposals.size,geometries.size);assert.ok([...geometryDisposals.values()].every(count=>count===1),'all expected geometries dispose exactly once');
  assert.equal(materialDisposals.size,materials.size);assert.ok([...materialDisposals.values()].every(count=>count===1),'all shared materials dispose exactly once');
 }
});
test('DOM-capable authored exhibits dispose the expected readable label geometry, material, and texture',()=>{
 const before=Object.getOwnPropertyDescriptor(globalThis,'document'),labels=[];
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(tag){
  assert.equal(tag,'canvas');
  return{width:0,height:0,getContext(){return{fillRect(){},fillText(text){labels.push(text);}};}};
 }}});
 try{
  for(const [fate,focus] of [['gift','people'],['patent','infrastructure'],['auction','memory']]){
   const scene=new THREE.Group(),plan=causalExhibitPlan({fate},focus,'authored'),exhibit=installCausalExhibit(THREE,scene,plan),root=scene.children[0];
   assert.equal(root.children.length,12,'the textured exhibit includes 11 physical forms and one label');
   const geometries=new Set(root.children.map(object=>object.geometry)),materials=new Set(root.children.map(object=>object.material));
   const textures=new Set([...materials].map(material=>material.map).filter(Boolean));
   assert.equal(geometries.size,12);assert.equal(materials.size,4);assert.equal(textures.size,1);
   const disposed={geometry:new Map(),material:new Map(),texture:new Map()};
   for(const [items,kind] of [[geometries,'geometry'],[materials,'material'],[textures,'texture']])for(const item of items)item.addEventListener('dispose',()=>disposed[kind].set(item,(disposed[kind].get(item)||0)+1));
   exhibit.dispose();exhibit.dispose();
   for(const kind of Object.keys(disposed)){assert.equal(disposed[kind].size,kind==='geometry'?12:kind==='material'?4:1);assert.ok([...disposed[kind].values()].every(count=>count===1),`${kind} resources dispose exactly once`);}
  }
  assert.ok(labels.some(text=>text.includes('AUTHORED PREVIEW')));assert.ok(labels.includes('OPEN WORKSHOPS'));assert.ok(labels.includes('PATENTED TOWERS'));assert.ok(labels.includes('AN AUCTION RECORD'));
 }finally{if(before)Object.defineProperty(globalThis,'document',before);else delete globalThis.document;}
});
test('focus flows through consented Meta handler into a reversible scene',()=>{
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const api=read('api/character.js'),world=read('src/worlds.js'),main=read('src/main.js');
 assert.match(api,/parseDirectedFocus/);
 assert.match(main,/visualFocus=safeSceneFocus\(data\.focus\)/);
 assert.match(main,/reactToDialogue\?\.\(visualCue,visualFocus\)/);
 assert.match(world,/installCausalExhibit\(THREE,world,causalExhibitPlan\(state,focus,provenance\)\)/);
 assert.match(world,/authoredCausalFocus\(state\)/);
 const mountAt=world.indexOf('function mount(next){'),markerClearAt=world.indexOf('delete renderer.domElement.dataset.causalExhibit;',mountAt),stateMountAt=world.indexOf('state=next;',mountAt);
 assert(mountAt>=0&&markerClearAt>mountAt&&markerClearAt<stateMountAt,'world mount clears rendered-exhibit metadata before rebuilding another world or branch');
 assert.match(world,/metaExhibit\?\.dispose\(\)/);
 assert.doesNotMatch(main,/if\(physicsPreview\)ui\.enterSandbox\(\);toast\('Remote conversations disabled/);
});
