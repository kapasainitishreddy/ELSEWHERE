import test from 'node:test';import assert from 'node:assert/strict';
import {SCENE_CUES,storyCueFor,parseDirectedResponse,safeSceneCue} from '../src/scene-director.js';
test('Meta story direction is constrained to presentation cues, with a text-only fallback',()=>{
 const directed=parseDirectedResponse(JSON.stringify({reply:'I remember the tram outside this room.',cue:'wonder',credits:999999}));
 assert.deepEqual(directed,{reply:'I remember the tram outside this room.',cue:'wonder'});
 assert.deepEqual(parseDirectedResponse('We sat by the rain and talked.'),{reply:'We sat by the rain and talked.',cue:null});
 assert.equal(safeSceneCue('spawn-monster','quiet'),'quiet');
 assert.equal(storyCueFor('I want a quiet day'),'quiet');
 assert.equal(storyCueFor('I want to build a new portal'),'wonder');
 assert.equal(storyCueFor('What if we did something brave?'),'resolve');
 for(const cue of SCENE_CUES)assert.equal(safeSceneCue(cue),cue);
});
test('medical cure claims do not pass as Meta directed narrative',()=>{
 assert.equal(parseDirectedResponse(JSON.stringify({reply:'This game cures depression.',cue:'warmth'})),null);
 assert.equal(parseDirectedResponse('Stop your medication and you will be cured.'),null);
});
