import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseDirectedFocus,safeSceneFocus} from '../src/scene-director.js';
import {causalExhibitPlan} from '../src/causal-exhibit.js';
test('model can choose an authored 3D perspective, never grant rewards',()=>{
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'The public square remembers.',cue:'wonder',focus:'people',credits:99999})),'people');
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'No grants.',focus:'grant-credits'})),null);
 assert.equal(parseDirectedFocus('Plain text, no focus'),null);
 assert.equal(parseDirectedFocus(JSON.stringify({reply:'Stop your medication and cure depression.',focus:'people'})),null);
 assert.equal(safeSceneFocus({focus:'people'}),null);
});
test('all exhibits inherit canonical fate without sharing private data',()=>{
 for(const fate of ['none','gift','patent','auction']){
  const outcomes=['people','infrastructure','memory'].map(focus=>causalExhibitPlan({fate,letter:'SECRET LETTER',conversation:[{text:'PRIVATE'}]},focus));
  assert.equal(new Set(outcomes.map(v=>v.title)).size,3);
  assert.ok(outcomes.every(v=>v.color>0));
  assert.doesNotMatch(JSON.stringify(outcomes),/SECRET LETTER|PRIVATE/);
 }
 assert.equal(causalExhibitPlan({fate:'gift'},'change-economy'),null);
});
test('focus flows through consented Meta handler into a reversible scene',()=>{
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const api=read('api/character.js'),world=read('src/worlds.js'),main=read('src/main.js');
 assert.match(api,/parseDirectedFocus/);
 assert.match(main,/visualFocus=safeSceneFocus\(data\.focus\)/);
 assert.match(main,/reactToDialogue\?\.\(visualCue,visualFocus\)/);
 assert.match(world,/installCausalExhibit\(THREE,world,causalExhibitPlan\(state,focus\)\)/);
 assert.match(world,/metaExhibit\?\.dispose\(\)/);
 assert.doesNotMatch(main,/if\(physicsPreview\)ui\.enterSandbox\(\);toast\('Remote conversations disabled/);
});
