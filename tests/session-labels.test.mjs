import test from 'node:test';
import assert from 'node:assert/strict';
import {createInterface} from '../src/ui.js';
import {initialState,travel} from '../src/game.js';
import {dialogueStatus,privacyIndicator} from '../src/session-labels.js';

test('the visible privacy sigil and chat header distinguish storage from dialogue transport in every session mode',()=>{
 const cases=[
  {name:'guest offline',guestMode:true,cloudEnabled:false,localAiEnabled:false,source:'authored',privacy:'GUEST · NOT SAVED',status:'LOCAL · AUTHORED · GUEST · NOT SAVED'},
  {name:'saved offline',guestMode:false,cloudEnabled:false,localAiEnabled:false,source:'authored',privacy:'PRIVATE LOCAL WORLD',status:'LOCAL · AUTHORED · ENCRYPTED SAVE'},
  {name:'guest on-device model',guestMode:true,cloudEnabled:false,localAiEnabled:true,source:'local-model',privacy:'GUEST · NOT SAVED · ON-DEVICE MODEL',status:'ON-DEVICE AI · GUEST · NOT SAVED'},
  {name:'saved on-device model',guestMode:false,cloudEnabled:false,localAiEnabled:true,source:'local-model',privacy:'ON-DEVICE MODEL · LOCAL ONLY',status:'ON-DEVICE AI · ENCRYPTED SAVE'},
  {name:'guest Meta enabled before a reply',guestMode:true,cloudEnabled:true,localAiEnabled:false,source:'meta-enabled',privacy:'GUEST · NOT SAVED · META TEXT LEAVES DEVICE',status:'META CLOUD ENABLED · GUEST · NOT SAVED'},
  {name:'saved Meta enabled before a reply',guestMode:false,cloudEnabled:true,localAiEnabled:false,source:'meta-enabled',privacy:'META CLOUD · TEXT LEAVES DEVICE',status:'META CLOUD ENABLED · ENCRYPTED SAVE'},
  {name:'guest Meta response',guestMode:true,cloudEnabled:true,localAiEnabled:false,source:'meta-response',privacy:'GUEST · NOT SAVED · META TEXT LEAVES DEVICE',status:'META CLOUD RESPONSE · GUEST · NOT SAVED'},
  {name:'saved Meta response',guestMode:false,cloudEnabled:true,localAiEnabled:false,source:'meta-response',privacy:'META CLOUD · TEXT LEAVES DEVICE',status:'META CLOUD RESPONSE · ENCRYPTED SAVE'},
  {name:'guest attempted cloud fallback',guestMode:true,cloudEnabled:true,localAiEnabled:false,source:'meta-fallback',privacy:'GUEST · NOT SAVED · META TEXT LEAVES DEVICE',status:'META ATTEMPTED · LOCAL FALLBACK · GUEST · NOT SAVED'},
  {name:'saved attempted cloud fallback',guestMode:false,cloudEnabled:true,localAiEnabled:false,source:'meta-fallback',privacy:'META CLOUD · TEXT LEAVES DEVICE',status:'META ATTEMPTED · LOCAL FALLBACK · ENCRYPTED SAVE'}
 ];
 const state=travel(initialState(),'self').state;
 for(const mode of cases){
  assert.equal(privacyIndicator(mode),mode.privacy,`${mode.name}: persistent privacy indicator`);
  const status=dialogueStatus({guestMode:mode.guestMode,source:mode.source});
  assert.equal(status,mode.status,`${mode.name}: actual dialogue header status`);
  const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(){},querySelector(){return null;}};
  const ui=createInterface(root,{guestMode:()=>mode.guestMode,cloudEnabled:()=>mode.cloudEnabled,localAiEnabled:()=>mode.localAiEnabled});
  ui.render(state);ui.updateStatus(status);
  const sigil=root.innerHTML.match(/<div class="privacy-sigil"[^>]*>([\s\S]*?)<\/div>/)?.[1]||'';
  const header=root.innerHTML.match(/<div class="chat-header">([\s\S]*?)<\/div>/)?.[1]||'';
  assert.ok(sigil.includes(mode.privacy),`${mode.name}: rendered privacy sigil must disclose both storage and transport`);
  assert.ok(header.includes(mode.status),`${mode.name}: rendered chat header must disclose both storage and transport`);
 }
});
