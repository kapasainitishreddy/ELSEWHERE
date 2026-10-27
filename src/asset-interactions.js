/**
 * Local inspection of developer-installed Kenney art. Optionally uses
 * three-mesh-bvh (MIT); no remote URLs, save access, or global raycast patch.
 */
const LORE=Object.freeze({
 future:'An object from a city rewritten by the inventions of an earlier century. The skyline remembers your choices.',
 self:'A trace of an imagined life, not a prediction. This home reflects the fictional timeline you created.',
 past:'A material witness to 1889. What you share, patent or hide here can echo into the world to come.',
 dungeon:'An artifact of the Hollow Crown. Its meaning changes with the choices its inhabitants remember.',
 mech:'Equipment from the Titan Foundry. The city can only be protected by the choices made in this campaign.'
});
export function canBuildStaticBVH(node){
 const geometry=node?.geometry;
 if(!node?.isMesh||node.isSkinnedMesh||node.morphTargetInfluences?.length||!geometry?.attributes?.position)return false;
 const count=geometry.index?.count??geometry.attributes.position.count;
 return Number.isFinite(count)&&count>=360&&count<=300000&&!geometry.attributes.position.isInterleavedBufferAttribute;
}
/** All models stay usable even without an optional BVH. */
export function registerAssetInteractions(model,{id,worldId,x,z,targets,nearby}={},bvh=null){
 if(!model?.traverse||!Array.isArray(targets)||!Array.isArray(nearby)||!Number.isFinite(x)||!Number.isFinite(z))return 0;
 if(!/^[a-z0-9-]{1,64}$/.test(String(id??'')))return 0;
 const title=String(id).replace(/-/g,' ').replace(/\b[a-z]/g,c=>c.toUpperCase());
 const action={type:'inspect',label:title.toUpperCase(),text:LORE[worldId]||LORE.future};
 let count=0;
 model.traverse(node=>{
   if(!node.isMesh||!node.geometry||count>=32)return;
   node.userData.action=action;
   if(bvh?.MeshBVH&&bvh.acceleratedRaycast&&canBuildStaticBVH(node)){
     try{
       if(!node.geometry.boundsTree)node.geometry.boundsTree=new bvh.MeshBVH(node.geometry,{maxLeafTris:12});
       node.raycast=bvh.acceleratedRaycast;
     }catch{/* Native Three raycast still works for unusual geometries. */}
   }
   targets.push(node);count++;
 });
 if(count)nearby.push({x,z,action});
 return count;
}
/** Loaded *only* when a verified local GLB has already been mounted. */
export async function registerAssetsWithBVH(model,options){
 if(!model?.parent)return 0;
 let bvh;
 try{bvh=await import('three-mesh-bvh');}catch{bvh=null;}
 if(!model.parent)return 0;
 return registerAssetInteractions(model,options,bvh);
}
