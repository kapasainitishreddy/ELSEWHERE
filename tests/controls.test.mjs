import test from 'node:test';
import assert from 'node:assert/strict';
import {deadzone,stickMovement,buttonEdges,gamepadCommand} from '../src/controls.js';
test('gamepad controls have a dead zone and never overspeed on malformed axes',()=>{
 assert.equal(deadzone(.1),0);assert.equal(deadzone(NaN),0);assert.equal(deadzone(99),1);
 assert.deepEqual(stickMovement({axes:[0,-.9]}),{x:0,z:deadzone(-.9)});
 assert.deepEqual(stickMovement(null),{x:0,z:0});
});
test('controller button presses trigger once per press and map battle intents clearly',()=>{
 const pad={buttons:[{pressed:true},{pressed:false},{pressed:true},{pressed:false}]};
 const first=buttonEdges(pad);assert.deepEqual(first.edges,[0,2]);
 assert.deepEqual(buttonEdges(pad,first.current).edges,[]);
 assert.equal(gamepadCommand('mech',{active:true},0),'fire-pulse');
 assert.equal(gamepadCommand('mech',{active:true},2),'raise-shield');
 assert.equal(gamepadCommand('mech',{active:true},1),'vent-reactor');
 assert.equal(gamepadCommand('dungeon',{active:true},3),'warden-parley');
 assert.equal(gamepadCommand('dungeon',{active:false},0),'interact');
 assert.equal(gamepadCommand('future',null,3),null);
});
