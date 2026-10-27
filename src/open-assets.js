/** Private runtime loader for developer-vendored Kenney CC0 models.
 * Only reads same-origin /assets/kenney files, never Kenney/GitHub/CDN addresses.
 * Missing optional packs leave the original procedural world fully playable.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KENNEY_SOURCE, KENNEY_PLACEMENTS } from './asset-catalog.js';

export const LOCAL_ASSET_INDEX = '/assets/kenney/index.json';
export function validAssetIndex(index){
 return Boolean(index && index.version===1 && index.license==='CC0-1.0' && index.sourceCommit===KENNEY_SOURCE.commit &&
  Array.isArray(index.models) && index.models.length<=100 && index.models.every(v=>typeof v==='string' && /^[-a-z0-9]+$/.test(v)));
}
export function isLocalAssetUrl(url){return /^\/assets\/kenney\/[-a-z0-9]+\.glb$/.test(url);}

const loader = new GLTFLoader();
let indexPromise;
async function getInstalledModels(){
 if(!indexPromise){
  indexPromise=fetch(LOCAL_ASSET_INDEX,{credentials:'same-origin'})
   .then(r=>r.ok?r.json():null).then(v=>validAssetIndex(v)?new Set(v.models):new Set())
   .catch(()=>new Set());
 }
 return indexPromise;
}

/** The scene is a disposable world group. Stale async loads are discarded. */
export async function dressWithKenney(world,state,animated,onAsset,onModel){
 const available=await getInstalledModels();
 if(!world.parent || available.size===0)return 0;
 const placements=KENNEY_PLACEMENTS[state.world]||[];
 let count=0;
 // Serial loading is friendlier to Quest memory and prevents a large scene-fetch burst.
 for(const [id,x,z,targetHeight,yaw] of placements){
  if(!world.parent)break;
  if(!available.has(id))continue;
  const url=`/assets/kenney/${id}.glb`;
  if(!isLocalAssetUrl(url))continue;
  try{
   const gltf=await loader.loadAsync(url);
   if(!world.parent){gltf.scene.traverse(n=>{n.geometry?.dispose();});break;}
   const model=gltf.scene;
   model.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(model);
   const extent=bounds.getSize(new THREE.Vector3());
   if(!Number.isFinite(extent.y)||extent.y<.001)continue;
   const scale=THREE.MathUtils.clamp(targetHeight/extent.y,.02,30);
   model.scale.setScalar(scale);
   // Place the actual bounding-box bottom at ground height, without shifting x/z art direction.
   model.position.set(x-bounds.getCenter(new THREE.Vector3()).x*scale,-bounds.min.y*scale,z-bounds.getCenter(new THREE.Vector3()).z*scale);
   model.rotation.y=yaw;
   model.traverse(node=>{
    if(node.isMesh){node.castShadow=false;node.receiveShadow=false;node.frustumCulled=true;}
   });
   model.userData.openSource={author:'Kenney',license:'CC0-1.0',asset:id};
   world.add(model);count++;
   if(gltf.animations?.length){
     const mixer=new THREE.AnimationMixer(model);
     const idle=gltf.animations.find(a=>/idle|static/i.test(a.name))||gltf.animations[0];
     mixer.clipAction(idle).play();
     animated.push((t,moving,dt)=>{if(dt>0)mixer.update(Math.min(dt,.05));});
   }
   onAsset?.(id);
   onModel?.(model,id,{x,z});
  }catch{
   // The game's procedural scenery still works if a local file is missing or corrupt.
   continue;
  }
 }
 return count;
}
