import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canBuildStaticBVH,registerAssetInteractions} from '../src/asset-interactions.js';

function node({count=600,skinned=false,morphed=false}={}){
 return {isMesh:true,isSkinnedMesh:skinned,morphTargetInfluences:morphed?[.2]:[],geometry:{attributes:{position:{count}},index:{count}},userData:{}};
}
test('only bounded static imported meshes get BVH builds',()=>{
 assert.equal(canBuildStaticBVH(node()),true);
 assert.equal(canBuildStaticBVH(node({count:100})),false);
 assert.equal(canBuildStaticBVH(node({skinned:true})),false);
 assert.equal(canBuildStaticBVH(node({morphed:true})),false);
 assert.equal(canBuildStaticBVH(node({count:500000})),false);
 assert.equal(canBuildStaticBVH(null),false);
});
test('Kenney GLBs can be inspected by E, mouse, gamepad or XR and optionally accelerated',()=>{
 const tall=node(),small=node({count:90}),targets=[],nearby=[],model={traverse(fn){fn(tall);fn(small);}};
 let trees=0;
 const BVH={MeshBVH:class {constructor(){trees++;}},acceleratedRaycast(){}};
 assert.equal(registerAssetInteractions(model,{id:'castle-tower',worldId:'past',x:2,z:-4,targets,nearby},BVH),2);
 assert.equal(trees,1);
 assert.equal(tall.raycast,BVH.acceleratedRaycast);
 assert.equal(small.raycast,undefined);
 assert.deepEqual(nearby.map(p=>[p.x,p.z]),[[2,-4]]);
 assert.match(tall.userData.action.text,/1889/);
 assert.equal(registerAssetInteractions(model,{id:'../../bad',worldId:'past',x:2,z:0,targets,nearby},BVH),0);
});
test('BVH builder failures fall back to the normal renderer and raycast',()=>{
 const a=node(),targets=[],nearby=[];
 const bad={MeshBVH:class {constructor(){throw Error('unusual geometry');}},acceleratedRaycast(){}};
 assert.equal(registerAssetInteractions({traverse(fn){fn(a);}}, {id:'sample',worldId:'future',x:3,z:3,targets,nearby},bad),1);
 assert.equal(targets[0],a);
 assert.equal(a.raycast,undefined);
});
test('runtime keeps GLB downloads same-origin and registers immersive interactions',()=>{
 const scene=readFileSync(new URL('../src/worlds.js',import.meta.url),'utf8');
 const loader=readFileSync(new URL('../src/open-assets.js',import.meta.url),'utf8');
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.match(scene,/registerAssetsWithBVH/);
 assert.match(loader,/const url=.*\/assets\/kenney\//);
 assert.match(loader,/onModel\?\.\(model,id,\{x,z\}\)/);
 assert.equal(pkg.dependencies['three-mesh-bvh'],'^0.9.16');
});
