/**
 * ELSEWHERE illustrated-3D character finishing.
 * Original locally generated geometry; no GLB downloads or personal data.
 * Narrow highlight bands and tailored layers add readable silhouettes in XR.
 */
function shaded(THREE,color,{metalness=.12,roughness=.72,glow=0}={}){
 return new THREE.MeshStandardMaterial({color,metalness,roughness,
   emissive:color,emissiveIntensity:glow});
}
function mesh(THREE,parent,geometry,material,xyz=[0,0,0]){
 const o=new THREE.Mesh(geometry,material);o.position.set(...xyz);parent.add(o);return o;
}
function oval(THREE,parent,color,xyz,scale){
 const o=mesh(THREE,parent,new THREE.SphereGeometry(1,12,9),shaded(THREE,color),xyz);
 o.scale.set(...scale);return o;
}
function softShadowTexture(THREE,size=64){
 const data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=(x+.5-size/2)/(size/2),v=(y+.5-size/2)/(size/2);
   const distance=Math.sqrt(u*u+v*v),alpha=Math.pow(Math.max(0,1-distance),2.2);
   const k=(y*size+x)*4;
   data[k]=5;data[k+1]=13;data[k+2]=22;data[k+3]=Math.round(alpha*255);
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;
 texture.needsUpdate=true;return texture;
}
export function createCharacterFinish(THREE,{root,head,spine,lower,arms,legs,coat,hair,skin,accent,age,identity,contactShadow}){
 if(!THREE?.Group||!root||!head||!spine||!lower)throw new TypeError('Character rig is missing');
 const accentMat=shaded(THREE,accent,{metalness:.36,roughness:.4,glow:.12});
 const coatHi=shaded(THREE,coat,{metalness:.2,roughness:.53});
 const coatDark=shaded(THREE,0x15212d,{metalness:.14,roughness:.8});
 const hairMat=shaded(THREE,hair,{roughness:.9});
 const skinMat=shaded(THREE,skin,{roughness:.94});
 // Oval jaw and cheeks replace the anonymous single-sphere expression.
 oval(THREE,head,skin,[0,-.055,.046],[.243,.222,.264]);
 for(const sign of [-1,1]){
   oval(THREE,head,skin,[sign*.29,.09,0],[.07,.10,.055]); // ears
   const sideburn=oval(THREE,head,hair,[sign*.27,.225,.04],[.072,.19,.11]);
   sideburn.rotation.z=sign*.18;
   const brow=mesh(THREE,head,new THREE.CapsuleGeometry(.014,.12,3,6),hairMat,[sign*.127,.236,.299]);
   brow.rotation.z=Math.PI/2+sign*.10;
 }
 oval(THREE,head,skin,[0,.065,.300],[.062,.084,.059]); // subtle bridge
 // Layered sculpted hair, distinct between elder, traveler and NPC silhouettes.
 const elder=age==='older', traveler=identity==='traveler';
 for(let i=0;i<5;i++){
   const off=i-2;
   const tuft=mesh(THREE,head,new THREE.ConeGeometry(.09+(i%2)*.018,.29+((i+1)%3)*.05,6),
      hairMat,[off*.117,.38-(i%2)*.028,.165+Math.abs(off)*-.029]);
   tuft.rotation.z=.35+off*.16;tuft.rotation.x=-.27;
 }
 if(traveler){
   // Tiny leather headband makes the playable hero recognizable from a chase camera.
   const band=mesh(THREE,head,new THREE.TorusGeometry(.306,.027,6,30,Math.PI),coatDark,[0,.34,-.01]);
   band.rotation.x=Math.PI/2;band.rotation.z=Math.PI;
 }
 if(elder){
   const temple=shaded(THREE,0xc5d8dc,{metalness:.45,roughness:.36});
   for(const sign of [-1,1]){
     const bar=mesh(THREE,head,new THREE.BoxGeometry(.125,.017,.018),temple,[sign*.21,.19,.293]);
     bar.rotation.y=sign*.12;
   }
 }
 // Proper collar, asymmetric shoulder panels, fitted belt and cuffs.
 for(const sign of [-1,1]){
   const collar=mesh(THREE,spine,new THREE.BoxGeometry(.20,.52,.09),coatHi,[sign*.205,.235,.347]);
   collar.rotation.z=sign*.27;collar.rotation.y=sign*.15;
   const seam=mesh(THREE,collar,new THREE.BoxGeometry(.020,.49,.012),accentMat,[sign*.092,0,.055]);
   seam.rotation.z=0;
   const shoulder=mesh(THREE,spine,new THREE.CapsuleGeometry(.20,.12,3,8),coatHi,[sign*.39,.405,-.045]);
   shoulder.rotation.z=Math.PI/2;
   mesh(THREE,shoulder,new THREE.BoxGeometry(.27,.022,.09),accentMat,[0,.10,.10]);
   const cuff=mesh(THREE,arms[sign<0?0:1].wrist,new THREE.CylinderGeometry(.105,.103,.07,10),
      accentMat,[0,-.01,0]);
   cuff.rotation.z=.12*sign;
 }
 const belt=mesh(THREE,lower,new THREE.TorusGeometry(.367,.038,7,24),coatDark,[0,.39,0]);
 belt.rotation.x=Math.PI/2;
 const clasp=mesh(THREE,lower,new THREE.BoxGeometry(.16,.14,.065),accentMat,[0,.39,.34]);
 mesh(THREE,clasp,new THREE.BoxGeometry(.065,.055,.018),shaded(THREE,0xd6e8dd,{metalness:.4}),[0,0,.040]);
 const cloak=[];
 for(const sign of [-1,1]){
   const pivot=new THREE.Group();pivot.position.set(sign*.29,.15,-.40);spine.add(pivot);
   // Rigid tapered back-coat segments are deliberately subtle in VR.
   const tail=mesh(THREE,pivot,new THREE.CylinderGeometry(.22,.31,1.03,7,1,false,Math.PI*.55,Math.PI*.95),
     coatHi,[sign*.055,-.52,-.02]);
   tail.rotation.y=sign*.17;
   const hem=mesh(THREE,pivot,new THREE.BoxGeometry(.47,.045,.037),accentMat,
     [sign*.045,-1.01,-.08]);
   hem.rotation.z=sign*.025;
   cloak.push({pivot,tail});
 }
 for(const leg of legs){
   mesh(THREE,leg,new THREE.CylinderGeometry(.14,.165,.24,10),
     coatHi,[0,-.86,.01]);
   const toe=mesh(THREE,leg,new THREE.CapsuleGeometry(.13,.13,3,8),
     coatDark,[0,-1.04,.145]);
   toe.rotation.x=Math.PI/2;
 }
 const shadowTexture=softShadowTexture(THREE);
 if(contactShadow){
   contactShadow.material.map=shadowTexture;
   contactShadow.material.transparent=true;
   contactShadow.material.opacity=.38;
   contactShadow.material.needsUpdate=true;
   contactShadow.scale.setScalar(1.28);
 }
 // A single quiet insignia instead of continuously flashing halos.
 const insignia=mesh(THREE,spine,new THREE.OctahedronGeometry(.085,0),accentMat,[0,.30,.415]);
 insignia.rotation.z=Math.PI/4;
 function update(time,{walking=false,reducedMotion=false,speed=0}={}){
   const t=Number.isFinite(time)?time:0;
   const pace=walking?Math.min(1,Math.max(0,speed)/6.5):0;
   for(let i=0;i<cloak.length;i++){
     const {pivot}=cloak[i];
     pivot.rotation.x=reducedMotion?0:.018*Math.sin(t*.9+i)+pace*(.05+.04*Math.sin(t*5+i*1.8));
     pivot.rotation.z=reducedMotion?0:(i?1:-1)*(.018+.027*Math.sin(t*.7+i));
   }
   insignia.rotation.y=reducedMotion?0:Math.sin(t*.48)*.1;
 }
 return {update,shadowTexture};
}
