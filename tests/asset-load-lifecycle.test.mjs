import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {dressWithKenney} from '../src/open-assets.js';
import {COMPANION_SOURCE,COMPANION_INDEX} from '../src/animated-companion-manifest.js';
import {installAnimatedCompanion} from '../src/animated-companion.js';

function deferred(){let resolve;const promise=new Promise(r=>{resolve=r;});return{promise,resolve};}
function disposableModel(){
 const geometry=new THREE.BoxGeometry(1,2,1),texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture});
 const disposed={geometry:false,texture:false,material:false};
 for(const [object,key] of [[geometry,'geometry'],[texture,'texture'],[material,'material']])object.addEventListener('dispose',()=>{disposed[key]=true;});
 const scene=new THREE.Group();scene.add(new THREE.Mesh(geometry,material));
 return{gltf:{scene,animations:[]},disposed};
}
async function waitFor(promise,label){
 const result=await Promise.race([promise.then(()=>true),new Promise(resolve=>setTimeout(()=>resolve(false),1000))]);
 assert.equal(result,true,`${label} did not reach the deferred GLTF load`);
}

test('a Kenney GLTF that finishes after world exit is discarded and fully disposed',async()=>{
 const stage=new THREE.Scene(),world=new THREE.Group();stage.add(world);
 const started=deferred(),late=deferred(),resources=disposableModel();let calls=0;
 const loader={loadAsync:async()=>{calls++;started.resolve();return late.promise;}};let mounted=0;
 const pending=dressWithKenney(world,{world:'future'},[],()=>{mounted++;},()=>{mounted++;},{getInstalledModels:async()=>new Set(['skyline-a']),loader});
 await waitFor(started.promise,'Kenney loader');stage.remove(world);late.resolve(resources.gltf);
 assert.equal(await pending,0);assert.equal(calls,1);assert.equal(mounted,0);
 assert.deepEqual(resources.disposed,{geometry:true,texture:true,material:true});
});

test('an animated companion GLTF that finishes after world exit is discarded and fully disposed',async()=>{
 const stage=new THREE.Scene(),world=new THREE.Group();stage.add(world);
 const started=deferred(),late=deferred(),resources=disposableModel();let calls=0;
 const index={version:1,revision:COMPANION_SOURCE.revision,sourceSha:COMPANION_SOURCE.sha,installed:true};
 const pending=installAnimatedCompanion(world,[],()=>({x:0,z:0}),false,{
  fetcher:async url=>{assert.equal(url,COMPANION_INDEX);return new Response(JSON.stringify(index),{status:200});},
  loader:{loadAsync:async url=>{assert.equal(url,'/assets/companions/fox.glb');calls++;started.resolve();return late.promise;}}
 });
 await waitFor(started.promise,'companion loader');stage.remove(world);late.resolve(resources.gltf);
 assert.equal(await pending,false);assert.equal(calls,1);
 assert.deepEqual(resources.disposed,{geometry:true,texture:true,material:true});
});

test('an animated companion manifest finishing after world exit does not start a stale GLTF request',async()=>{
 const stage=new THREE.Scene(),world=new THREE.Group();stage.add(world);
 const response=deferred(),manifestStarted=deferred();let gltfRequests=0;
 const index={version:1,revision:COMPANION_SOURCE.revision,sourceSha:COMPANION_SOURCE.sha,installed:true};
 const pending=installAnimatedCompanion(world,[],()=>({x:0,z:0}),false,{
  fetcher:async()=>{manifestStarted.resolve();return response.promise;},
  loader:{loadAsync:async()=>{gltfRequests++;return disposableModel().gltf;}}
 });
 await manifestStarted.promise;stage.remove(world);response.resolve(new Response(JSON.stringify(index),{status:200}));
 assert.equal(await pending,false);assert.equal(gltfRequests,0);
});
