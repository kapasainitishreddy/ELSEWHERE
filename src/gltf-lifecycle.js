const TEXTURE_SLOTS=['map','aoMap','emissiveMap','bumpMap','normalMap','displacementMap','roughnessMap','metalnessMap','alphaMap','envMap','lightMap','matcap','specularMap','specularColorMap','specularIntensityMap','gradientMap','clearcoatMap','clearcoatRoughnessMap','clearcoatNormalMap','iridescenceMap','iridescenceThicknessMap','sheenColorMap','sheenRoughnessMap','transmissionMap','thicknessMap','anisotropyMap'];

/** Dispose resources owned by an optional GLTF tree that was never mounted. */
export function disposeGltfResources(root){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 root?.traverse?.(node=>{
  if(node.geometry)geometries.add(node.geometry);
  if(node.skeleton?.boneTexture)textures.add(node.skeleton.boneTexture);
  for(const material of (Array.isArray(node.material)?node.material:node.material?[node.material]:[])){
   materials.add(material);
   for(const slot of TEXTURE_SLOTS){const texture=material[slot];if(texture?.isTexture)textures.add(texture);}
  }
 });
 for(const texture of textures)texture.dispose();
 for(const material of materials)material.dispose();
 for(const geometry of geometries)geometry.dispose();
}
