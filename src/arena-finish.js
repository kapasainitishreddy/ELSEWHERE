/**
 * An original art-directed practice arena matching Rapier's visible collider cage.
 * Decorations are deterministic and disposed when the player leaves the world.
 */
export function createArenaFinish(THREE,parent,{worldId,accent,halfX=3,halfZ=2.6}={}){
 if(!THREE?.Mesh||!parent?.add)throw new TypeError('Arena stage requires a Three.js parent');
 const metal=new THREE.MeshStandardMaterial({color:worldId==='mech'?0x2a3d4b:0x302940,
    roughness:.43,metalness:.34});
 const bright=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.75,depthWrite:false});
 const glass=new THREE.MeshPhysicalMaterial({color:accent,metalness:.12,roughness:.22,
    transparent:true,opacity:.085,depthWrite:false,side:THREE.DoubleSide});
 const band=new THREE.MeshStandardMaterial({color:worldId==='mech'?0x6b8190:0x776c92,
    roughness:.47,metalness:.34});
 const add=(geo,mat,x,y,z,receiver=parent)=>{
   const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);receiver.add(o);return o;
 };
 // Rails reveal precisely where physical objects will stop, never an invisible 3m wall.
 for(const side of [-1,1]){
   add(new THREE.BoxGeometry(.16,.86,halfZ*2),glass,side*halfX,.43,0);
   add(new THREE.BoxGeometry(.09,.07,halfZ*2),metal,side*halfX,.86,0);
   add(new THREE.BoxGeometry(halfX*2,.86,.16),glass,0,.43,side*halfZ);
   add(new THREE.BoxGeometry(halfX*2,.07,.09),metal,0,.86,side*halfZ);
 }
 for(const x of [-halfX,halfX])for(const z of [-halfZ,halfZ]){
   add(new THREE.CylinderGeometry(.08,.10,.91,9),band,x,.455,z);
   const cap=add(new THREE.IcosahedronGeometry(.11,1),bright,x,.92,z);
   cap.name='Bounded collision corner';
 }
 const torus=(radius,tube,y)=>{
   const r=add(new THREE.TorusGeometry(radius,tube,8,72),bright,0,y,0);
   r.rotation.x=Math.PI/2;return r;
 };
 torus(2.12,.018,.014);
 torus(1.58,.018,.015);
 // Subtle etched floor diagonals and stepped pedestal edge give scale to the scene.
 for(let i=0;i<4;i++){
   const angle=Math.PI/4+i*Math.PI/2;
   const tile=add(new THREE.BoxGeometry(1.38,.018,.035),band,
     Math.cos(angle)*1.84,.018,Math.sin(angle)*1.84);
   tile.rotation.y=-angle;
 }
 const symbols=[];
 for(let i=0;i<8;i++){
   const a=Math.PI*2*i/8;
   const rune=add(worldId==='mech'
       ?new THREE.BoxGeometry(.24,.027,.32)
       :new THREE.OctahedronGeometry(.17,0),
     bright,Math.cos(a)*2.36,worldId==='mech'?.04:.14,Math.sin(a)*2.36);
   rune.rotation.y=-a;symbols.push(rune);
 }
 const key=new THREE.PointLight(accent,1.1,7.5,2);
 key.position.set(-1.4,3.7,2.2);parent.add(key);
 const fill=new THREE.PointLight(0xf4d7b6,.62,6,2);
 fill.position.set(2.3,2.7,-1.5);parent.add(fill);
 const footfall=[];
 for(let i=0;i<3;i++){
   const mark=add(new THREE.ConeGeometry(.12,.34,3),bright,-4.10-i*.6,.04,0);
   mark.rotation.x=Math.PI/2;mark.rotation.z=-Math.PI/2;
   footfall.push(mark);
 }
 return {symbols,footfall};
}
