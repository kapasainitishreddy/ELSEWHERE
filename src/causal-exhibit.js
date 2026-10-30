/** Model-selected physical exhibit. All facts are locally authored. No private state enters the mesh. */
const FOCI=Object.freeze(['people','infrastructure','memory']);
const LABELS=Object.freeze({
  none:{people:'THE CITY WAITS',infrastructure:'AN UNWRITTEN GRID',memory:'A BLANK ARCHIVE'},
  gift:{people:'OPEN WORKSHOPS',infrastructure:'SHARED ENERGY',memory:'A PUBLIC ARCHIVE'},
  patent:{people:'LICENSED BUILDERS',infrastructure:'PATENTED TOWERS',memory:'AN INVENTOR LEGACY'},
  auction:{people:'THE NEW OWNER',infrastructure:'PRIVATE FOUNDRIES',memory:'AN AUCTION RECORD'}
});
const COLORS=Object.freeze({none:0x92b8ca,gift:0x82e8c3,patent:0xb2c3f9,auction:0xffc48e});
const AUTHORED_FOCUS=Object.freeze({gift:'people',patent:'infrastructure',auction:'memory'});
export function authoredCausalFocus(state){
 return AUTHORED_FOCUS[state?.fate]||'people';
}
export function causalExhibitPlan(state,focus,source='authored'){
 if(!FOCI.includes(focus))return null;
 const fate=Object.hasOwn(LABELS,state?.fate)?state.fate:'none';
 const provenance=source==='meta'?'META-SELECTED FOCUS':'AUTHORED PREVIEW';
 return Object.freeze({focus,fate,provenance,title:LABELS[fate][focus],color:COLORS[fate],
   date:fate==='none'?'THE STORY IS UNWRITTEN':fate==='gift'?'1889 · SHARED WITH ALL':fate==='patent'?'1889 · PATENTED':'1889 · AUCTIONED'});
}
export function installCausalExhibit(THREE,parent,plan){
 if(!plan||!parent?.add)return null;
 const root=new THREE.Group();root.name=`Fictional causal exhibit · ${plan.provenance}`;
 root.position.set(1.5,0,-3.4);parent.add(root);
 const geometries=new Set(),materials=new Set(),textures=new Set();
 function make(geometry,material,x,y,z){
  const object=new THREE.Mesh(geometry,material);
  object.position.set(x,y,z);root.add(object);
  geometries.add(geometry);materials.add(material);return object;
 }
 const base=new THREE.MeshStandardMaterial({color:0x20313b,roughness:.48,metalness:.3});
 const ink=new THREE.MeshStandardMaterial({color:plan.color,roughness:.4,metalness:.18,emissive:plan.color,emissiveIntensity:.14});
 const aura=new THREE.MeshBasicMaterial({color:plan.color,opacity:.58,transparent:true,depthWrite:false});
 make(new THREE.CylinderGeometry(1.28,1.45,.15,24),base,0,.12,0);
 const ring=make(new THREE.TorusGeometry(1.2,.026,8,48),aura,0,.22,0);ring.rotation.x=Math.PI/2;
 for(let i=0;i<3;i++){
  const x=(i-1)*.68;
  make(new THREE.CylinderGeometry(.16,.2,.09,10),base,x,.24,-.04);
  if(plan.focus==='people'){
   make(new THREE.CapsuleGeometry(.12,.24,3,8),ink,x,.55,-.04);
   make(new THREE.IcosahedronGeometry(.13,1),ink,x,.89,-.04);
  }else if(plan.focus==='infrastructure'){
   make(new THREE.BoxGeometry(.34,.5+.20*i,.30),base,x,.56+i*.10,-.04);
   make(new THREE.BoxGeometry(.37,.05,.33),ink,x,.82+i*.20,-.04);
  }else{
   make(new THREE.BoxGeometry(.37,.43,.10),base,x,.65,-.04);
   make(new THREE.BoxGeometry(.26,.028,.11),ink,x,.68,.016);
  }
 }
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=240;
  const c=canvas.getContext('2d');
  if(c){
   c.fillStyle='#071923';c.fillRect(0,0,800,240);
   c.textAlign='center';c.fillStyle='#b9e1e5';c.font='bold 44px Arial';c.fillText(`${plan.provenance} · ${plan.focus.toUpperCase()}`,400,48,780);
   c.fillStyle='#f0fffd';c.font='bold 66px Arial';c.fillText(plan.title,400,131,780);
   c.fillStyle='#bfd4dc';c.font='44px Arial';c.fillText(plan.date,400,211,780);
   const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;textures.add(tex);
   const labelMat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true,depthWrite:false});
   make(new THREE.PlaneGeometry(6.4,1.92),labelMat,0,2.0,.13);
  }
 }
 let closed=false;
 return {update(t,reducedMotion=false){
  if(closed)return;
  ring.rotation.z=reducedMotion?0:Math.sin(t*.32)*.055;
 },dispose(){
  if(closed)return;closed=true;root.parent?.remove(root);
  geometries.forEach(geometry=>geometry.dispose());
  materials.forEach(material=>material.dispose());
  textures.forEach(texture=>texture.dispose());
 }};
}
