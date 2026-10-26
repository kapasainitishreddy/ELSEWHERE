/** ELSEWHERE's original GPU-friendly environment effects.
 * Single sky draw-call, one instanced debris draw-call and one particle field per world.
 * No remote textures or image-generation calls. XR-safe: no screen-space post effects.
 */
import * as THREE from 'three';

export const BIOMES = Object.freeze({
 future:{zenith:0x03111e,horizon:0x154b69,twilight:0x5be4ff,motes:0x85eaff,seed:9},
 self:{zenith:0x101524,horizon:0x5b3745,twilight:0xffc991,motes:0xffe7b6,seed:27},
 past:{zenith:0x231923,horizon:0x86543b,twilight:0xffd38a,motes:0xf6c58b,seed:51},
 dungeon:{zenith:0x09081a,horizon:0x352352,twilight:0xbb89ff,motes:0xa4a5ff,seed:72},
 mech:{zenith:0x070c18,horizon:0x283f57,twilight:0xff9975,motes:0x96dfff,seed:104},
});

const frac=x=>x-Math.floor(x);
const rand=x=>frac(Math.sin(x*81.17+17.2)*43758.5453);
export function biomeFor(id){return BIOMES[id]||BIOMES.future;}
export function atmosphereBudget({headset=false,reducedMotion=false,smallScreen=false}={}){
 return {motes:reducedMotion?56:headset||smallScreen?96:210,debris:headset||smallScreen?18:44,animate:!reducedMotion};
}

export function addAtmosphere(world,worldId,animated,budget=atmosphereBudget()){
 const biome=biomeFor(worldId);
 const skyMaterial=new THREE.ShaderMaterial({
  uniforms:{zenith:{value:new THREE.Color(biome.zenith)},horizon:{value:new THREE.Color(biome.horizon)},twilight:{value:new THREE.Color(biome.twilight)},uTime:{value:0}},
  vertexShader:`varying vec3 vDir; void main(){vec4 p=modelMatrix*vec4(position,1.);vDir=normalize(position);gl_Position=projectionMatrix*viewMatrix*p;}`,
  fragmentShader:`varying vec3 vDir; uniform vec3 zenith,horizon,twilight;uniform float uTime;void main(){float h=clamp(vDir.y*.5+.5,0.,1.);vec3 c=mix(horizon,zenith,smoothstep(.27,.95,h));float band=pow(max(0.,1.-abs(vDir.y-.045)*3.),5.);c+=twilight*band*(.09+.018*sin(uTime*.18));gl_FragColor=vec4(c,1.);}`,
  side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false
 });
 const sky=new THREE.Mesh(new THREE.SphereGeometry(115,24,14),skyMaterial);sky.renderOrder=-200;world.add(sky);
 // A veil of soft, colored floating dust. Geometry is deterministic and purely decorative.
 const vertices=new Float32Array(budget.motes*3);
 for(let i=0;i<budget.motes;i++){
  const r=8+rand(i*7+biome.seed)*62,a=rand(i*2+biome.seed)*Math.PI*2;
  vertices[i*3]=Math.cos(a)*r;vertices[i*3+1]=1+rand(i*17+biome.seed)*20;vertices[i*3+2]=Math.sin(a)*r-10;
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
 const points=new THREE.Points(geometry,new THREE.PointsMaterial({color:biome.motes,size:worldId==='dungeon'?.2:.13,transparent:true,opacity:.66,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
 points.frustumCulled=false;world.add(points);
 // Instancing avoids a draw call for every fragment; the same geometry is shared.
 const fragments=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.25,0),new THREE.MeshStandardMaterial({color:biome.twilight,emissive:biome.twilight,emissiveIntensity:.33,transparent:true,opacity:.55,roughness:.4,metalness:.45}),budget.debris);
 const transform=new THREE.Object3D();
 for(let i=0;i<budget.debris;i++){
  const r=11+rand(i*5+biome.seed)*23,a=rand(i*13+biome.seed)*Math.PI*2;
  transform.position.set(Math.cos(a)*r,1+rand(i*11+biome.seed)*8,Math.sin(a)*r-8);
  transform.scale.setScalar(.3+rand(i*19+biome.seed)*.85);
  transform.rotation.set(rand(i)*4,rand(i*3)*6,rand(i*7)*6);transform.updateMatrix();
  fragments.setMatrixAt(i,transform.matrix);
 }
 fragments.instanceMatrix.needsUpdate=true;fragments.frustumCulled=false;world.add(fragments);
 // Shimmer and drift only. The user camera stays perfectly still: no forced movement or shake.
 if(budget.animate){animated.push(t=>{skyMaterial.uniforms.uTime.value=t;points.rotation.y=t*.0025;fragments.rotation.y=t*.009;});}
 return {sky,points,fragments};
}

/** Shader driven portal corona is accessible even with particles disabled. */
export function addPortalCorona(group,worldId,animated,index=0){
 const tint=new THREE.Color(biomeFor(worldId).twilight);
 const material=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0},uTint:{value:tint}},
  vertexShader:`varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 uv0;uniform float uTime;uniform vec3 uTint;void main(){vec2 p=uv0*2.-1.;float r=length(p),a=atan(p.y,p.x);if(r<.69||r>1.)discard;float pulse=.54+.4*sin(a*13.+uTime*1.2);float outer=smoothstep(1.,.86,r);float inner=smoothstep(.69,.8,r);float alpha=outer*inner*(.2+.15*pulse);gl_FragColor=vec4(uTint*(.6+.3*pulse),alpha);}`,
  transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 });
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(3.95,3.95),material);plane.position.set(0,2.1,-.06);group.add(plane);
 animated.push(t=>{material.uniforms.uTime.value=t+index*1.42;});
 return plane;
}
