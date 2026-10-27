import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createInterface} from '../src/ui.js';
import {initialState,travel} from '../src/game.js';

function rootHarness(){
  const listeners=new Map();
  const root={dataset:{},innerHTML:'',parentElement:{classList:{toggle(){}}},addEventListener(type,handler){
    if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(handler);
  },querySelector(){return null}};
  const ui=createInterface(root,{cloudEnabled:()=>false,localAiEnabled:()=>false,travel(){},action(){}});
  function command(name){
    const button={dataset:{cmd:name},classList:{contains:()=>false}};
    const event={target:{closest(query){return query==='[data-cmd]'?button:null}}};
    for(const h of listeners.get('click')??[])h(event);
  }
  return {root,ui,command};
}

test('cinematic shell is actually connected to real source and does not replace world actions',()=>{
  const {root,ui,command}=rootHarness();
  let state=initialState();ui.render(state);
  assert.equal(root.dataset.storyOpen,'false');
  assert.equal(root.dataset.atlasOpen,'false');
  assert.match(root.innerHTML,/class="portal-dock"/);
  assert.match(root.innerHTML,/class="scene-postcard"/);
  assert.match(root.innerHTML,/data-cmd="story-toggle"/);
  assert.match(root.innerHTML,/data-cmd="time-exchange"/);
  assert.match(root.innerHTML,/data-world="dungeon"/);
  command('story-toggle');
  assert.equal(root.dataset.storyOpen,'true');
  assert.doesNotMatch(root.innerHTML,/<section class="story-panel"[^>]* inert>/);
  assert.match(root.innerHTML,/WORLD ACTIONS/);
  command('atlas-toggle');
  assert.equal(root.dataset.storyOpen,'false');
  assert.equal(root.dataset.atlasOpen,'true');
  command('close-world-sheets');
  assert.equal(root.dataset.atlasOpen,'false');
  state=travel(state,'self').state;ui.render(state);
  assert.match(root.innerHTML,/Talk to your future self/);
  command('talk-to-future');
  assert.equal(root.dataset.storyOpen,'true');
  assert.match(root.innerHTML,/id="chat-question"/);
});

test('every world has an original scenic fallback but no hidden third-party fetch',()=>{
  const path=new URL('../public/assets/vistas/',import.meta.url);
  const stylesheet=readFileSync(new URL('../src/cinematic-shell.css',import.meta.url),'utf8');
  for(const w of ['future','self','past','dungeon','mech']){
    const art=readFileSync(new URL(`${w}.svg`,path),'utf8');
    assert.match(art,/<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(art,/<\/svg>/);
    assert.doesNotMatch(art,/<script|<image|<foreignObject|(?:href|src)="https?:/i);
    const {root,ui}=rootHarness();let state=initialState();if(w!=='future')state=travel(state,w).state;ui.render(state);
    assert.match(root.innerHTML,new RegExp(`vistas/${w}\\.svg`));
  }
  assert.match(stylesheet,/#app\[data-scene-ready="true"\] \.world-vista/);
  assert.doesNotMatch(stylesheet,/@import|url\(https?:/i);
});
