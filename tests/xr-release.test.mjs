import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_COMFORT,COMFORT_PRESETS,comfortPreset,comfortTurn,walkableLanding} from '../src/xr-comfort.js';

const world=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf-8');
test('Quest gentle locomotion defaults to 30-degree snap and bounded teleport',()=>{
 assert.equal(DEFAULT_COMFORT,'gentle');
 assert.equal(comfortPreset('unknown').snapDegrees,30);
 assert.equal(comfortPreset('standard').snapDegrees,45);
 assert.equal(comfortTurn(1,true,'gentle').radians,-Math.PI/6);
 assert.equal(comfortTurn(-1,true,'standard').radians,Math.PI/4);
 assert.equal(comfortTurn(1,false,'standard').radians,0);
 assert.equal(comfortTurn(0,false,'standard').armed,true);
 assert.equal(walkableLanding({x:0,z:1,distance:5,rects:[],limit:11}),true);
 assert.equal(walkableLanding({x:0,z:1,distance:16,rects:[],limit:11}),false);
 assert.equal(walkableLanding({x:22,z:1,distance:5,rects:[],limit:11}),false);
 assert.equal(walkableLanding({x:0,z:1,distance:5,rects:[[-1,1,0,2]],limit:11}),false);
 assert.equal(walkableLanding({x:NaN,z:0,distance:3,rects:[],limit:11}),false);
});

test('VR hands, headset and ray follow one tracking rig and never reset headset on scene refresh',()=>{
 assert.match(world,/rig\.add\(vrController\)/);
 assert.doesNotMatch(world,/scene\.add\(vrController\)/);
 assert.match(world,/if\(!renderer\.xr\.isPresenting\)\{[\s\S]*?camera\.position\.copy\(lastCamera\)/);
 assert.match(world,/else if\(!sameWorld\)\{[\s\S]*?rig\.position\.set\(0,0,5\)/);
 assert.match(world,/if\(!renderer\.xr\.isPresenting\)controls\.update\(\)/);
 assert.match(world,/vrControllers\[0\]\.add\(xrWatch\)/);
 assert.match(world,/if\(walkableLanding\(/);
 assert.match(world,/comfortTurn\(horizontal,snapReady,comfortId\)/);
 assert.doesNotMatch(world,/camera\.rotation\.z\s*=/);
});

test('guided release UI is available to keyboard-only and Quest users',()=>{
 const ui=readFileSync(new URL('../src/ui.js',import.meta.url),'utf-8');
 assert.match(ui,/data-cmd="first-crossing"/);
 assert.match(ui,/data-cmd="journey-skip"/);
 assert.match(ui,/data-cmd="comfort-open"/);
 assert.match(ui,/data-comfort="\$\{id\}"/);
 assert.match(world,/type:'comfort'/);
 assert.match(ui,/aria-pressed="\$\{comfortMode===id\}"/);
});

test('physical XR choice panels stay out of the desktop view and desktop ray targets',()=>{
 assert.match(world,/xrChoicePanel\.visible=xrActive/);
 assert.match(world,/xrChoiceTargets\.push\(plane\)/);
 assert.match(world,/setXrChoicePanelActive\(renderer\.xr\.isPresenting\)/);
 assert.match(world,/setXrChoicePanelActive\(true\)/);
 assert.match(world,/setXrChoicePanelActive\(false\)/);
 assert.match(world,/targets=targets\.filter\(target=>!xrChoiceTargets\.includes\(target\)\)/);
});
