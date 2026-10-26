import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { WORLDS, INVENTIONS, cityRipple, worldOptions } from './game.js';
import { addScenery, collisionRects } from './scenery.js';
import { stickMovement, buttonEdges, gamepadCommand } from './controls.js';
import { addAtmosphere, addPortalCorona, atmosphereBudget } from './atmosphere.js';
import { dressWithKenney } from './open-assets.js';

const COLORS = { future: 0x62dbe7, self: 0xe5b78c, past: 0xe9b972, dungeon: 0xaa88ff, mech: 0xf5b079 };
const palettes = {
  future:{bg:0x061018,ground:0x111e2b,fog:0x071923,light:0x74dff4},
  self:{bg:0x131b26,ground:0x1b252c,fog:0x161c29,light:0xe7bb91},
  past:{bg:0x1c1920,ground:0x392d29,fog:0x24202c,light:0xf2b56b},
  dungeon:{bg:0x0e101c,ground:0x1c1729,fog:0x171224,light:0xb89aff},
  mech:{bg:0x080f1b,ground:0x17202e,fog:0x0a1826,light:0xf3aa6a}
};
const mat=(color,metalness=.25,roughness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const emissive=(color,intensity=2)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,metalness:.32,roughness:.28});
const glass=(color, opacity=.3)=>new THREE.MeshPhysicalMaterial({color,transparent:true,opacity,depthWrite:false,metalness:.22,roughness:.22,side:THREE.DoubleSide});
function mesh(parent,geo,material,x=0,y=0,z=0,rx=0,ry=0,rz=0){const obj=new THREE.Mesh(geo,material);obj.position.set(x,y,z);obj.rotation.set(rx,ry,rz);parent.add(obj);return obj;}
function box(parent,w,h,d,material,x,y,z){return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);}
function orb(parent,r,material,x,y,z){return mesh(parent,new THREE.IcosahedronGeometry(r,1),material,x,y,z);}
function cylinder(parent,r1,r2,h,material,x,y,z){return mesh(parent,new THREE.CylinderGeometry(r1,r2,h,10),material,x,y,z);}
function ring(parent,r,t,material,x,y,z,rotation=0){return mesh(parent,new THREE.TorusGeometry(r,t,12,72),material,x,y,z,0,rotation,0);}
function line(parent,points,color,opacity=.6){const g=new THREE.BufferGeometry().setFromPoints(points.map(([x,y,z])=>new THREE.Vector3(x,y,z)));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(l);return l;}
function light(parent,color,intensity,x,y,z,dist=28){const o=new THREE.PointLight(color,intensity,dist,2);o.position.set(x,y,z);parent.add(o);return o;}
function seeded(n){let x=Math.sin(n*126.14+12.3)*43758.5453123;return x-Math.floor(x);}
function labelTexture(title,subtitle='',fg='#c6faff',accent='#60e8e8'){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const c=canvas.getContext('2d');
 c.fillStyle='rgba(3,11,18,.76)';c.fillRect(0,0,768,256);c.strokeStyle=accent;c.lineWidth=3;c.strokeRect(5,5,758,246);
 c.textAlign='center';c.fillStyle=fg;c.font='600 51px Space Grotesk, Arial';c.fillText(title,384,111);
 c.font='26px monospace';c.fillStyle='#a1b8c5';c.fillText(subtitle,384,169);
 const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;return tx;
}
function sign(parent,title,subtitle,x,y,z,w=3.8){const t=labelTexture(title,subtitle);const plane=mesh(parent,new THREE.PlaneGeometry(w,w/3),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide}),x,y,z);return plane;}
function ground(g,p){mesh(g,new THREE.PlaneGeometry(170,170),mat(p.ground,.1,.9),0,-.12,0,-Math.PI/2);const grid=new THREE.GridHelper(170,80,p.light,0x31414e);grid.material.transparent=true;grid.material.opacity=.12;grid.position.y=-.097;g.add(grid);}
function stars(group,color=0xc2edff,count=300){const vertices=[];for(let i=0;i<count;i++){const a=seeded(i*2)*Math.PI*2;const r=20+seeded(i*3+17)*65;vertices.push(Math.sin(a)*r,3+seeded(i*11+9)*30,Math.cos(a)*r);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));const p=new THREE.Points(g,new THREE.PointsMaterial({color,size:.14,transparent:true,opacity:.5,sizeAttenuation:true,depthWrite:false}));group.add(p);}
function buildPortal(group,world,x,z,interactables,animated){
 const base=new THREE.Group();base.position.set(x,0,z);group.add(base);
 addPortalCorona(base,world,animated,x);
 const frame=emissive(COLORS[world],1.4);const frameRing=ring(base,1.5,.105,frame,0,2.1,0);
 ring(base,1.68,.025,emissive(0xffffff,.55),0,2.1,0);
 const membraneMaterial=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0},uColor:{value:new THREE.Color(COLORS[world])}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
    void main(){vec2 p=vUv*2.0-1.0;float r=length(p);if(r>1.0)discard;
    float a=atan(p.y,p.x);float swirl=sin(12.0*r-2.9*uTime+sin(a*5.0+uTime)*1.6);
    float swirl2=sin(18.0*r+sin(a*8.0-uTime)*1.3+uTime*3.2);
    float central=1.0-smoothstep(0.2,1.0,r);float edge=smoothstep(.74,.97,r);
    vec3 col=uColor*(.23+.32*central+.2*swirl+.16*swirl2)+vec3(.17,.21,.3)*central;
    gl_FragColor=vec4(col,.32+.27*central+.2*edge);}`
 });
 const membrane=mesh(base,new THREE.CircleGeometry(1.4,64),membraneMaterial,0,2.1,-.03);
 membrane.userData.action={type:'world',world};interactables.push(membrane);
 const hit=mesh(base,new THREE.CircleGeometry(1.62,64),new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),0,2.1,.06);
 hit.userData.action={type:'world',world};interactables.push(hit);
 cylinder(base,1.48,1.63,.18,mat(0x111e29,.8,.2),0,.03,0);
 sign(base,WORLDS[world].name.toUpperCase(),'ENTER WORLD',0,4.4,.08,3.2);
 light(base,COLORS[world],1.8,0,2.2,0,10);
 animated.push((time)=>{frame.emissiveIntensity=1.3+Math.sin(time*1.25+x)*.35;frameRing.rotation.z=Math.sin(time*.21+x)*.1;membraneMaterial.uniforms.uTime.value=time;});
 return base;
}
function buildChronalOrrey(group,state,animated){
 // Original hourglass/orrery built from primitives. No external assets or telemetry.
 const location={future:[-8,0,-6],past:[-8,0,-6],self:[6.9,0,-4.2],dungeon:[9,0,-7],mech:[-8.7,0,-6.5]}[state.world];
 const [x,y,z]=location,clock=new THREE.Group();group.add(clock);clock.position.set(x,y,z);
 const core=orb(clock,.82,glass(0x9ee8e1,.35),0,2.8,0);core.material.depthWrite=false;
 const rings=[];
 for(let i=0;i<3;i++){const r=ring(clock,1.28+i*.36,.04,emissive(i===0?0x97e8ec:i===1?0xc4a4ee:0xf6bd83,1.3),0,2.8,0);
  r.rotation.x=i*.5+Math.PI/3;r.rotation.y=i*.4;rings.push(r);}
 const hourglass=new THREE.Group();clock.add(hourglass);hourglass.position.y=2.8;
 const brass=mat(0xb1a789,.82,.23);cylinder(hourglass,.47,.47,.13,brass,0,.88,0);cylinder(hourglass,.47,.47,.13,brass,0,-.88,0);
 mesh(hourglass,new THREE.ConeGeometry(.42,.75,18),glass(0xaceaea,.42),0,.44,0,Math.PI);
 mesh(hourglass,new THREE.ConeGeometry(.42,.75,18),glass(0xaceaea,.42),0,-.44,0);
 orb(hourglass,.14,emissive(0xcffcf2,1.7),0,0,0);
 sign(clock,'THE HOURS BANK',`${state.chronal.hours} STORED · ${state.chronal.futureDebt+state.chronal.pastDebt} OWED`,0,5.25,0,3.9);
 animated.push(t=>{rings.forEach((r,i)=>{r.rotation.y=t*(i%2?-.28:.22);r.rotation.z=Math.sin(t*.21+i)*.3;});hourglass.rotation.y=t*.13;core.position.y=2.8+Math.sin(t*.9)*.06;});
}
function buildLivingCharacters(group,state,targets,animated){
 // Hand-built original low-poly NPCs with readable silhouettes and interactive 3D dialogue.
 const actors={
  future:[{id:'iris',action:'talk-city',name:'IRIS VALE',x:7,z:-7,cape:0x345f71,hair:0xc7d8db}],
  past:[{id:'ada',action:'talk-clockmaker',name:'ADA VOSS',x:7.8,z:-5,cape:0x695142,hair:0x4c302b}],
  dungeon:[{id:'witness',action:'talk-witness',name:'THE WITNESS',x:-7.5,z:-9,cape:0x615076,hair:0xd8d1e5}],
  mech:[{id:'sol',action:'talk-commander',name:'COMMANDER SOL',x:7.8,z:-7,cape:0x475b6a,hair:0xb5ab9f}]
 }[state.world]||[];
 for(const actor of actors){
  const memory=state.cast?.[actor.id],affinity=memory?.affinity||0;
  const palette=memory?.mood==='grateful'?0x79f5c0:memory?.mood==='angry'?0xf58a90:0xbce3f3;
  const figure=new THREE.Group();figure.position.set(actor.x,0,actor.z);group.add(figure);
  // Sculpted coat, collar, gloves, hair, hands. Subtle, legible at headset distances.
  mesh(figure,new THREE.CapsuleGeometry(.36,.85,5,10),mat(actor.cape,.18,.82),0,1.35,0);
  box(figure,.5,.16,.1,mat(0xc5b1a0,.2,.7),0,1.85,.36);
  orb(figure,.32,mat(0xbfa38c,.07,.8),0,2.45,0);
  mesh(figure,new THREE.SphereGeometry(.33,12,9,0,Math.PI*2,0,Math.PI*.45),mat(actor.hair,0,.8),0,2.55,-.05);
  for(const dir of [-1,1]){
   const arm=box(figure,.18,.8,.2,mat(actor.cape,.2,.72),dir*.48,1.38,0);arm.rotation.z=dir*.13;
   orb(figure,.13,mat(0xd2ad92,0,.8),dir*.51,.94,.03);
   box(figure,.23,.72,.25,mat(0x29313b,.25,.55),dir*.2,.48,0);
   orb(figure,.027,emissive(0xf5e9d6,.85),dir*.105,2.45,.31);
  }
  const a=ring(figure,.53,.028,emissive(palette,1.2),0,.08,0);a.rotation.x=Math.PI/2;
  const memoryOrb=orb(figure,.14,emissive(palette,.8+Math.min(1,Math.max(0,affinity/70))),0,3.35,0);
  const plaque=sign(figure,actor.name,(memory?.mood||'WATCHFUL').toUpperCase()+' · REMEMBERS YOU',0,4.12,.1,3.3);
  for(const hit of [plaque]){hit.userData.action={type:'choice',id:actor.action};targets.push(hit);}
  const halo=mesh(figure,new THREE.PlaneGeometry(1.5,3.5),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,1.8,.42);
  halo.userData.action={type:'choice',id:actor.action};targets.push(halo);
  animated.push(t=>{figure.position.y=Math.sin(t*.7+actor.x)*.035;memoryOrb.position.y=3.3+Math.sin(t*1.1+actor.x)*.17;a.rotation.z=t*.19;});
 }
}
function buildParallelGate(group,state,targets,animated){
 if(!['future','self'].includes(state.world))return;
 const gate=new THREE.Group();gate.position.set(-9.3,0,-2.5);group.add(gate);
 const unlocked=state.parallel.forked,canFork=state.stars>=2&&state.chronal.hours>=3;
 const tint=unlocked?0x86fae4:canFork?0xc4b2ff:0x4c6676;
 for(let i=0;i<2;i++){const r=ring(gate,1.35+i*.17,.065,emissive(tint,unlocked?2:1),0,2.1,0);
  r.rotation.y=i?Math.PI/3:-Math.PI/4;animated.push(t=>r.rotation.y=(i?1:-1)*(.18*t+Math.PI/4));}
 const disc=mesh(gate,new THREE.CircleGeometry(1.26,48),glass(tint,.26),0,2.1,-.08);
 const action={type:'choice',id:unlocked?'switch-parallel':'fork-parallel'};
 disc.userData.action=action;targets.push(disc);
 const hit=mesh(gate,new THREE.PlaneGeometry(3,3.8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,2.3,.02);
 hit.userData.action=action;targets.push(hit);
 sign(gate,unlocked?'CROSS REALITIES':'THE ECHO DOOR',unlocked?`TO ${state.parallel.active==='prime'?'ECHO':'PRIME'}`:'2 STARS · 3 HOURS',0,4.5,0,3.5);
}
function buildActionBeacon(group,option,index,accent,animated,targets,beacons){
  const x=(index-1)*5.1,z=-1.5;
  const b=new THREE.Group();group.add(b);b.position.set(x,0,z);
  const base=cylinder(b,.66,.82,.24,mat(0x21303e,.76,.38),0,.14,0);
  const halo=ring(b,.75,.06,emissive(accent,1.4),0,.3,0);halo.rotation.x=Math.PI/2;
  const core=orb(b,.27,glass(accent,.52),0,1.02,0);const spine=cylinder(b,.035,.035,1.35,mat(accent,.7,.3),0,.95,0);
  const title=option.title.toUpperCase().slice(0,27);
  const panel=mesh(b,new THREE.PlaneGeometry(3.15,1.05),new THREE.MeshBasicMaterial({map:labelTexture(title,'TOUCH / CLICK / E','#effaff',`#${new THREE.Color(accent).getHexString()}`),side:THREE.DoubleSide,transparent:true,depthWrite:false}),0,2.34,.05);
  panel.userData.action={type:'choice',id:option.id};targets.push(panel);
  const hit=mesh(b,new THREE.PlaneGeometry(3.3,1.2),new THREE.MeshBasicMaterial({opacity:0,transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,2.34,.08);
  hit.userData.action={type:'choice',id:option.id};targets.push(hit);
  beacons.push({position:b.position.clone(),action:option.id,title:option.title});
  animated.push(t=>{core.position.y=1.03+Math.sin(t*1.1+index)*.13;halo.rotation.z=t*.45;spine.scale.y=.94+Math.sin(t*.9+index)*.05;});
}
function billboards(g,text,x,y,z,accent='#5fe5e0'){
 const signplane=sign(g,text,'EVERY CHOICE REMAINS',x,y,z,5.3);
 const glow=box(g,5.5,.045,.04,emissive(new THREE.Color(accent),1.4),x,y-1,z);
 return [signplane,glow];
}
function buildFuture(g,state,animated){
 const ripple=cityRipple(state);const buildings=mat(0x1c2936,.5,.28);const metal=mat(0x263b49,.65,.3);
 // Layered towers build the silhouette from any desktop viewing angle.
 for(let i=0;i<94;i++){
   let x=(seeded(i*3+4)-.5)*110;let z=-18-seeded(i*3+7)*75;
   if(Math.abs(x)<12&&z>-33)continue;
   const h=7+seeded(i*7+13)*39;const w=2+seeded(i*5+3)*5;
   box(g,w,h,w*.82,buildings,x,h/2-.1,z);
   box(g,w+.2,.1,w*.9,emissive(i%4===0?0x4ac4c5:0x53849b,.7),x,h-.5,z);
   if(i%3===0)for(let row=0;row<8;row++){
     const fy=2+row*Math.max(1,h/10);if(fy>h-1)break;
     box(g,w*.72,.05,.045,emissive(i%4===0?0xffb98b:0x5ee7ec,.7),x,fy,z+w*.41+.02);
   }
 }
 // Main avenue and sky-walk, mirrored light markers.
 box(g,11,.06,75,mat(0x0c151f,.34,.43),0,-.04,-12);
 for(let j=0;j<18;j++)for(let x of [-5.4,5.4]){
   box(g,.09,.07,2.3,emissive(j%3?0x30808f:0x9ed9ef,1),x,.035,15-j*4.7);
   cylinder(g,.07,.12,3.6,metal,x,1.8,15-j*4.7);orb(g,.15,emissive(0x6bddea,1.3),x,3.6,15-j*4.7);
 }
 const sculpture=new THREE.Group();g.add(sculpture);sculpture.position.set(0,4,-8);
 ring(sculpture,2.9,.08,emissive(ripple.cell?0x6cffbb:0x50c6ff,1.6),0,0,0,.4);
 ring(sculpture,2.1,.04,emissive(0xffffff,.8),0,0,0,-.35);
 orb(sculpture,.8,glass(0x9deaff,.25),0,0,0);
 animated.push(t=>{sculpture.rotation.y=t*.16;sculpture.rotation.z=Math.sin(t*.17)*.13;});
 if(ripple.skyrail){for(let s of [-1,1]){box(g,.5,.25,75,emissive(0xffca7b,1.3),s*10,15,-27);for(let z=-60;z<10;z+=11)cylinder(g,.18,.3,15,metal,s*10,7.4,z);}}
 if(ripple.surveillance){for(let i=0;i<9;i++){
   const x=(i-4)*4;const drone=new THREE.Group();g.add(drone);drone.position.set(x,12,-17-(i%3)*5);
   orb(drone,.4,emissive(0xff527d,1.6),0,0,0);ring(drone,.8,.025,emissive(0xf08ba1,1),0,0,0);
   animated.push(t=>{drone.position.y=12+Math.sin(t*.8+i)*1.3;drone.rotation.y=t*.5;});
 }}
 if(ripple.cell){for(let i=0;i<5;i++){const x=(i-2)*3;const c=cylinder(g,.27,.4,3,emissive(0x5effbe,1.3),x,1.5,-14);animated.push(t=>c.scale.y=1+Math.sin(t*1.5+i)*.07);}}
 if(state.owned.includes('penthouse')){
   const home=box(g,4.5,3.2,3,mat(0x40536b,.7,.15),-8,13,-7);
   box(g,4.6,2,.03,glass(0x72d8f4,.5),-8,13,-5.48);home.rotation.y=-.1;
 }
 if(state.owned.includes('library')){
   box(g,6,4,4,mat(0x4d6b70,.25,.45),8,2,-12);sign(g,'PUBLIC ARCHIVE','FOUNDED BY YOU',8,4.7,-9.95,3.8);
 }
 billboards(g,ripple.label,0,13,-20,ripple.cell?'#61ffc0':'#5ee5f6');
 // Flying vehicles suspended over the skyline.
 for(let i=0;i<9;i++){
   const vehicle=new THREE.Group();g.add(vehicle);
   vehicle.position.set(-33+seeded(i+20)*66,8+seeded(i+50)*12,-18-seeded(i+90)*22);
   box(vehicle,1.9,.33,.8,metal,0,0,0);box(vehicle,1.55,.08,.12,emissive(i%2?0xffbc77:0x78efff,2),0,-.24,.34);
   animated.push(t=>{vehicle.position.x=((t*(i%2?-.4:.6)+(i*7))%78)-39;vehicle.position.y+=Math.sin(t*.02+i)*.0003;});
 }
}
function buildSelf(g,state,animated){
 // Warm, intimate architectural contrast to the outer worlds.
 box(g,19,.14,20,mat(0x27333c,.15,.7),0,0,-2);
 box(g,20,9,.35,mat(0x1b222e,.25,.5),0,4,-12);
 for(let i=-9;i<=9;i+=3){box(g,.13,8,.12,mat(0x485260,.7,.3),i,4,-11.7);}
 const window=box(g,17,6,.08,glass(0x6ea0b0,.22),0,4.7,-11.8);
 const exterior=new THREE.Group();g.add(exterior);exterior.position.z=-13;
 for(let i=0;i<28;i++){const x=-13+i*1.1;const h=1+seeded(i*6)*5;box(exterior,.88,h,.7,mat(0x13212b,.2,.6),x,h/2,0);if(i%4===0)box(exterior,.64,.045,.04,emissive(0xeac4a1,.9),x,1.5,.41);}
 const sofa=box(g,5,1,1.65,mat(0x4c5057,0,.9),0,.7,-6);sofa.rotation.y=.07;
 box(g,5,1.4,.55,mat(0x4c5057,0,.9),0,1.4,-6.85);
 const table=cylinder(g,1.35,1.35,.18,mat(0x7b6555,.25,.45),0,.6,-2.7);
 cylinder(g,.1,.12,.7,mat(0x8e9a9f,.7,.35),0,.25,-2.7);
 box(g,1.5,.05,.92,emissive(0xe1bf93,.25),-3,1.65,-4);
 const lamp=cylinder(g,.28,.43,.9,emissive(0xffd6a8,.75),-5,2,-5);
 cylinder(g,.06,.06,2.3,mat(0x99968e,.65,.3),-5,1,-5);
 light(g,0xffc390,3,-4,5,-3,14);
 // Deliberately abstract, original character design. No face scan or personal likeness.
 const elder=new THREE.Group();g.add(elder);elder.position.set(0,0,-5.3);
 const body=mesh(elder,new THREE.CapsuleGeometry(.58,1.2,6,12),mat(0x323b48,.1,.78),0,1.7,0);
 orb(elder,.46,mat(0xbba38f,.1,.8),0,3.03,0);
 const hair=mesh(elder,new THREE.SphereGeometry(.47,14,12,0,Math.PI*2,0,Math.PI*.48),mat(0xb0bcc5,.1,.7),0,3.15,-.015);
 const eye=emissive(0xe7cfb2,.5);orb(elder,.035,eye,-.15,3.03,.43);orb(elder,.035,eye,.15,3.03,.43);
 for(let x of [-.75,.75]){box(elder,.21,.9,.23,mat(0x303a48,.1,.7),x,1.86,0);box(elder,.29,.65,.29,mat(0x313b48,.1,.72),x*.48,.48,0);}
 const halo=ring(g,1.3,.025,emissive(0xecc29f,.55),0,3.45,-5.5);
 animated.push(t=>{halo.rotation.z=t*.16;elder.position.y=Math.sin(t*.5)*.035;});
 sign(g,'THE OTHER YOU','A POSSIBLE FUTURE, NOT A PREDICTION',0,5,-7.9,5.3);
 window.userData.noRay=true;sofa.userData.noRay=true;lamp.userData.noRay=true;hair.userData.noRay=true;body.userData.noRay=true;table.userData.noRay=true;
}
function buildPast(g,state,animated){
 const brick=mat(0x67514c,.04,.9);const timber=mat(0x392c2d,.14,.6);const copper=mat(0xad7b50,.76,.28);
 for(let i=0;i<24;i++){const side=i%2?-1:1;const z=6-Math.floor(i/2)*6;const x=side*(12+seeded(i)*6);const h=7+seeded(i*4)*7;
   box(g,5.7,h,5.6,brick,x,h/2,z);box(g,6.2,.3,6.2,timber,x,h,z);
   for(let k=0;k<3;k++)box(g,.7,1.3,.07,emissive(0xf1b977,.26),x-side*3,k*2+3,z);
 }
 for(let i=0;i<14;i++){
   const z=12-i*4;for(let side of [-1,1]){
     cylinder(g,.07,.09,3.9,timber,side*7,1.8,z);orb(g,.23,emissive(0xffc16b,.6),side*7,3.7,z);light(g,0xffc16b,.45,side*7,3.6,z,6);
   }
 }
 // Inventor's workstation and a working gear sculpture.
 const bench=box(g,7,.55,2.8,mat(0x5d4037,.05,.7),0,1,-7);
 for(let x of [-2.7,2.7])cylinder(g,.17,.17,1.4,copper,x,.32,-8);
 const machine=new THREE.Group();g.add(machine);machine.position.set(0,3,-7);
 ring(machine,1.6,.14,copper,0,0,0);ring(machine,.85,.12,emissive(0xf7d293,1),0,0,.12);
 orb(machine,.35,emissive(0xc7e7fd,1.5),0,0,.2);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;box(machine,.2,.38,.16,copper,Math.sin(a)*1.75,Math.cos(a)*1.75,0).rotation.z=-a;}
 animated.push(t=>{machine.rotation.z=t*.18;});
 if(state.invention){sign(g,INVENTIONS[state.invention].name.toUpperCase(),state.fate ? `DESTINY: ${state.fate.toUpperCase()}` : 'DECIDE ITS FUTURE',0,6.4,-11,5);}
 else sign(g,'THE YEAR IS 1889','IDEAS ARRIVE BEFORE THEIR TIME',0,6.4,-11,5);
 light(g,0xffb761,2,0,6,-5,16);bench.userData.noRay=true;
}
function buildDungeon(g,state,animated){
 const stone=mat(0x322b3f,.1,.96);const rune=emissive(0xb98cff,1.4);
 for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;const x=Math.sin(a)*13,z=Math.cos(a)*13-8;
   cylinder(g,.85,.92,8+seeded(i)*5,stone,x,4,z);
   cylinder(g,1.15,1,.44,stone,x,8+seeded(i)*5,z);
 }
 for(let j=0;j<9;j++){box(g,9,.35,1.3,stone,0,j*.23,-8-j*1.5);}
 const altar=cylinder(g,3.1,3.6,.6,stone,0,.3,-10);
 ring(g,4.3,.06,rune,0,.08,-10).rotation.x=Math.PI/2;
 for(let k=0;k<12;k++){const a=k*Math.PI/6;const r=3.35;const q=orb(g,.11,emissive(0xe1baff,1.7),Math.cos(a)*r,.52,Math.sin(a)*r-10);animated.push(t=>q.position.y=.5+Math.sin(t*1.3+k)*.2);}
 const sentinel=new THREE.Group();g.add(sentinel);sentinel.position.set(0,2.6,-10);
 mesh(sentinel,new THREE.ConeGeometry(.95,3.3,7),mat(0x262337,.45,.6),0,.1,0);
 orb(sentinel,.43,emissive(state.dungeonOutcome ? 0x7f6591 : 0xbd8aff, state.dungeonOutcome ? .4 : 1.5),0,1.85,0);
 for(let x of [-1,1]){box(sentinel,.22,1.7,.2,stone,x*.95,.7,0).rotation.z=x*.25;}
 animated.push(t=>{sentinel.position.y=2.4+Math.sin(t*.8)*.23;sentinel.rotation.y=Math.sin(t*.3)*.15;});
 sign(g,'THE HOLLOW CROWN',state.dungeonOutcome?'THE WARDEN HAS FALLEN':'CHOOSE POWER · CHANGE FATE',0,8,-17,5);
 light(g,0x9259ef,4,0,6,-10,22);
 // Floating rune glyphs as magical ambient particles.
 stars(g,0xc5adff,150);
}
function makeMech(parent,animated){
 const titan=new THREE.Group();parent.add(titan);
 const armor=mat(0x55616b,.9,.25);const plating=mat(0x2c3744,.85,.3);const led=emissive(0x8cefff,2);
 box(titan,3.2,3.4,1.5,armor,0,6,0);
 box(titan,2.4,1.7,.24,plating,0,6.4,.9);
 orb(titan,.62,led,0,6.75,1.07);
 box(titan,1.6,.9,1.2,armor,0,8.1,0);
 box(titan,1.25,.19,.08,led,0,8.25,.66);
 box(titan,2.2,.5,1.55,plating,0,4.25,0);
 for(let dir of [-1,1]){
   const arm=new THREE.Group();titan.add(arm);arm.position.set(dir*2,7,0);
   orb(arm,.65,armor,0,0,0);
   box(arm,1,2.4,1,armor,dir*.13,-1.3,0);
   box(arm,1.08,.9,1.05,plating,dir*.17,-2.95,.1);
   const leg=new THREE.Group();titan.add(leg);leg.position.set(dir*.85,4,0);
   box(leg,1.05,2,1.25,armor,0,-1.1,0);orb(leg,.6,plating,0,-2,0);
   box(leg,1.06,1.9,1.25,armor,0,-2.8,-.2);
   box(leg,1.25,.42,1.9,plating,0,-3.7,.32);
   animated.push((t,walking)=>{arm.rotation.x=walking?Math.sin(t*6+dir*Math.PI)*.22:Math.sin(t*.6+dir)*.03;leg.rotation.x=walking?Math.sin(t*6+dir*Math.PI)*.19:0;});
 }
 for(let i=0;i<4;i++){const x=(i-1.5)*.62;box(titan,.35,.11,.07,led,x,5,.83);}
 light(titan,0x88e8ff,2,0,6,2,14);return titan;
}
function buildMech(g,state,animated){
 const support=mat(0x344451,.85,.3);
 for(let x of [-14,14]){
   for(let z of [-17,0,15]){
     box(g,.8,17,1.1,support,x,8,z);
     box(g,1.8,.45,1.2,emissive(0xd19463,.65),x,15.8,z);
   }
   box(g,1.2,1,65,support,x,16,0);
 }
 for(let i=0;i<13;i++){
   const z=-26+i*4.2;box(g,25,.11,.12,emissive(i%3===0?0xfcab6a:0x417688,.9),0,.02,z);
 }
 const platform=cylinder(g,6,6,.4,mat(0x53626b,.9,.3),0,.1,-7);
 ring(g,5.5,.12,emissive(0xf3ac74,1),0,.34,-7).rotation.x=Math.PI/2;
 const titan=makeMech(g,animated);titan.position.set(0,.4,-7);titan.name='ATLAS-09';
 light(g,0xfaab71,3,-7,12,-7,36);light(g,0x68def9,3,7,10,-11,38);
 sign(g,'ATLAS / 09',state.pilotTrained ? 'NEURAL LINK ACTIVE' : 'AWAITING A PILOT',0,12,-17,5.3);
 // Keep a small walkable street for driving; titan moves on the ground when deployed.
 if(state.mechDeployed) {
   const waves=[];for(let i=0;i<4;i++){const r=ring(g,1+i*.7,.03,emissive(0x62cce7,.4),0,.35,-7);r.rotation.x=Math.PI/2;waves.push(r);}
   animated.push(t=>waves.forEach((r,i)=>{r.material.opacity=.2+.2*Math.sin(t*1.8+i); }));
 }
 return titan;
}
/** Aimable enemy geometry: controller-ray and mouse users can fight in the world.
 * Hit validation, damage, heat and adaptive Warden rules stay in applyAction().
 */
function buildCombatTargets(g,state,animated,targets){
 if(state.world==='mech' && state.mechBattle?.active && state.mechBattle.enemies>0){
  for(let i=0;i<state.mechBattle.enemies;i++){
   const group=new THREE.Group();g.add(group);group.position.set((i-(state.mechBattle.enemies-1)/2)*4.4,5.1,-17.6);
   const body=orb(group,.58,emissive(0xff6578,1.8),0,0,0);
   box(group,1.75,.2,.42,mat(0x60717a,.8,.27),0,0,0);
   for(let d of [-1,1]){
    const blade=ring(group,.55,.035,emissive(0xffbd75,1.2),d*.84,0,0);blade.rotation.y=Math.PI/2;
    animated.push(t=>{blade.rotation.z=t*(d<0?2:-2);});
   }
   const zone=mesh(group,new THREE.SphereGeometry(.87,14,10),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,0,.15);
   zone.userData.action={type:'choice',id:'fire-pulse'};targets.push(zone);
   const sight=ring(group,1.03,.035,emissive(0xff7b8e,1.5),0,0,.12);
   animated.push(t=>{group.position.y=5.1+Math.sin(t*1.2+i)*.35;group.position.x+=(Math.sin(t*.7+i)*.001);sight.rotation.z=t*.3;body.material.emissiveIntensity=1.5+Math.sin(t*3+i)*.4;});
  }
  sign(g,'TARGET THE DRONES','AIM / CLICK / VR TRIGGER',0,10,-17,5);
 }
 if(state.world==='dungeon'&&state.wardenBattle?.active){
  const hit=mesh(g,new THREE.SphereGeometry(1.35,20,12),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,4,-10);
  hit.userData.action={type:'choice',id:'warden-strike'};targets.push(hit);
  const ring1=ring(g,1.6,.045,emissive(0xf2a1c7,1.7),0,4,-9.9);
  animated.push(t=>{ring1.rotation.z=Math.sin(t)*.22;ring1.scale.setScalar(1+Math.sin(t*2)*.07);});
  sign(g,'THE WARDEN LEARNS',`VITALITY ${state.wardenBattle.wardenHp}/100`,0,9,-13,4.8);
 }
}
function makePlayer(root){
 const group=new THREE.Group();root.add(group);
 const coat=mat(0x8b9ba8,.65,.28);const highlight=emissive(0xe5fbff,.5);
 mesh(group,new THREE.CapsuleGeometry(.31,.9,4,8),coat,0,1.15,0);
 orb(group,.28,mat(0xc6c3b5,.18,.6),0,2.02,0);
 const visor=box(group,.39,.09,.08,highlight,0,2.04,.27);
 for(let x of [-.23,.23])box(group,.21,.68,.23,mat(0x202d3b,.5,.5),x,.4,0);
 group.position.set(0,0,6);group.name='Traveler';return group;
}

/** Create a self-contained Three.js renderer with WebXR controller support. */
export function createExperience(container, onWorld, onAction){
 const scene=new THREE.Scene();const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,window.innerWidth<800?1.1:1.5));renderer.setSize(container.clientWidth||window.innerWidth,container.clientHeight||window.innerHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
 renderer.shadowMap.enabled=false;renderer.xr.enabled=true;
 renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none;';
 container.append(renderer.domElement);
 const rig=new THREE.Group();scene.add(rig);const camera=new THREE.PerspectiveCamera(63,1,.08,200);rig.add(camera);camera.position.set(0,5,17);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.055;controls.enablePan=false;controls.maxPolarAngle=Math.PI*.47;controls.minDistance=5;controls.maxDistance=28;controls.target.set(0,2,0);
 const raycaster=new THREE.Raycaster();const mouse=new THREE.Vector2();let state=null,world=new THREE.Group(),animated=[],targets=[],beacons=[],portalLocations=[],player=null,titan=null,moving=false;
 const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const hover=document.querySelector('#interaction-hint');let pointerDown=null;
 const clock=new THREE.Clock();let playerPos=new THREE.Vector3(0,0,6);const pressed=new Set();
 let previousGamepadButtons=new Set(),gamepadAxes={x:0,z:0};
 function desktopGamepad(){
   if(renderer.xr.isPresenting || !state || !document.querySelector('#vault-gate')?.hidden || document.querySelector('.modal-shade')){
     previousGamepadButtons.clear();gamepadAxes={x:0,z:0};return;
   }
   const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected);
   if(!pad){previousGamepadButtons.clear();gamepadAxes={x:0,z:0};return;}
   gamepadAxes=stickMovement(pad);
   const {current,edges}=buttonEdges(pad,previousGamepadButtons);
   previousGamepadButtons=current;
   for(const button of edges){
     const combat=state.world==='mech'?state.mechBattle:state.world==='dungeon'?state.wardenBattle:null;
     const command=gamepadCommand(state.world,combat,button);
     if(command==='interact')interact();else if(command)onAction(command);
   }
 }
 const vrButton=VRButton.createButton(renderer);
 vrButton.id='enter-vr-button';vrButton.setAttribute('aria-label','Enter VR headset mode');container.append(vrButton);
 const vrControllers=[renderer.xr.getController(0),renderer.xr.getController(1)];
 for(const vrController of vrControllers){
   scene.add(vrController);
   vrController.addEventListener('connected',event=>{vrController.userData.handedness=event.data?.handedness;});
   const gripLight=new THREE.Group();vrController.add(gripLight);
   orb(gripLight,.065,emissive(0xb1faff,.9),0,0,0);
   ring(gripLight,.11,.009,emissive(0x90dbf0,.9),0,0,-.03);
   const ray=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:0x7feeff}));
   ray.scale.z=10;vrController.add(ray);
   vrController.addEventListener('select',()=>{
     const origin=new THREE.Vector3(),quat=new THREE.Quaternion();vrController.getWorldPosition(origin);vrController.getWorldQuaternion(quat);
     const dir=new THREE.Vector3(0,0,-1).applyQuaternion(quat);const action=intersect(targets,origin,dir);
     if(action){trigger(action);pulseXR(vrController);return;}
     // In encounters the primary trigger means attack, never accidental teleport.
     if(state?.world==='mech'&&state.mechBattle.active&&state.mechBattle.enemies>0){onAction('fire-pulse');pulseXR(vrController);return;}
     if(state?.world==='dungeon'&&state.wardenBattle?.active){onAction('warden-strike');pulseXR(vrController);return;}
     // Comfortable controller teleportation to a walkable floor (rather than forced smooth movement).
     const point=new THREE.Vector3();const floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);
     const rayToFloor=new THREE.Ray(origin,dir);
     if(rayToFloor.intersectPlane(floor,point)&&point.distanceTo(origin)<15){
       const x=THREE.MathUtils.clamp(point.x,-18,18),z=THREE.MathUtils.clamp(point.z,-18,17);
       // XR locomotion shares the desktop collision proxies. Do not drop a player inside a wall.
       const blocked=collisionRects(state.world).some(([x0,x1,z0,z1])=>x>=x0-.5&&x<=x1+.5&&z>=z0-.5&&z<=z1+.5);
       if(!blocked && Number.isFinite(x) && Number.isFinite(z)){
         rig.position.x=x;rig.position.z=z;pulseXR(vrController,35);
       }
     }
   });
   vrController.addEventListener('squeeze',()=>{
     if(state?.world==='mech'&&state.mechBattle.active)onAction('raise-shield');
     else if(state?.world==='dungeon'&&state.wardenBattle?.active)onAction('warden-guard');
   });
 }
 function pulseXR(controller,duration=65){
   // Supported controller actuators only. No phone vibration and no sound required.
   const pad=[...(renderer.xr.getSession()?.inputSources||[])].find(s=>s.handedness===controller.userData.handedness)?.gamepad;
   const actuator=pad?.vibrationActuator || pad?.hapticActuators?.[0];
   try{const effect=actuator?.playEffect?.('dual-rumble',{duration,strongMagnitude:.15,weakMagnitude:.23}) ?? actuator?.pulse?.(.23,duration);effect?.catch?.(()=>{});}catch{}
 }
 const watchCanvas=document.createElement('canvas');watchCanvas.width=512;watchCanvas.height=160;
 const watchTexture=new THREE.CanvasTexture(watchCanvas);watchTexture.colorSpace=THREE.SRGBColorSpace;
 const xrWatch=new THREE.Mesh(new THREE.PlaneGeometry(.9,.28),new THREE.MeshBasicMaterial({map:watchTexture,transparent:true,depthTest:false}));
 xrWatch.position.set(-.34,-.33,-1.0);camera.add(xrWatch);xrWatch.visible=false;
 function updateXRWatch(){const c=watchCanvas.getContext('2d');c.clearRect(0,0,512,160);c.fillStyle='rgba(4,17,25,.88)';c.fillRect(0,0,512,160);c.strokeStyle='#91ece9';c.strokeRect(6,6,500,148);c.fillStyle='#c8f8f3';c.font='bold 32px Arial';c.fillText((state?.world||'WORLD').toUpperCase()+' / '+(state?.parallel?.active||'prime').toUpperCase(),24,58);c.font='26px Arial';c.fillText(`HOURS ${state?.chronal.hours||0} · STARS ${state?.stars||0} · ${state?.world==='mech'?'TRIGGER FIRE / GRIP SHIELD':state?.world==='dungeon'?'TRIGGER STRIKE / GRIP GUARD':'TRIGGER SELECT / TELEPORT'}`,24,115,465);watchTexture.needsUpdate=true;}
 function intersect(objects,origin,dir){raycaster.set(origin,dir);const hits=raycaster.intersectObjects(objects,false);return hits[0]?.object.userData.action || null;}
 function trigger(action){if(action.type==='world')onWorld(action.world);else if(action.type==='choice')onAction(action.id);}
 function click(event){if(renderer.xr.isPresenting)return;
   if(pointerDown && Math.hypot(event.clientX-pointerDown.x,event.clientY-pointerDown.y)>7)return;
   const rect=renderer.domElement.getBoundingClientRect();mouse.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
   raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(targets,false)[0];if(hit)trigger(hit.object.userData.action);
 }
 renderer.domElement.addEventListener('click',click);
 renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};});
 renderer.domElement.addEventListener('pointermove',e=>{
   if(!hover||renderer.xr.isPresenting)return;
   const rect=renderer.domElement.getBoundingClientRect();mouse.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
   raycaster.setFromCamera(mouse,camera);const h=raycaster.intersectObjects(targets,false)[0];
   renderer.domElement.style.cursor=h?'pointer':'grab';
   hover.textContent=h?.object.userData.action?.type==='choice'?'CLICK TO INTERACT':h?'STEP INTO ANOTHER WORLD':'';
   hover.classList.toggle('active',!!h);
   hover.style.left=`${e.clientX+12}px`;hover.style.top=`${e.clientY+12}px`;
 });
 renderer.domElement.addEventListener('pointerleave',()=>hover?.classList.remove('active'));
 function keydown(e){if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
   if(document.querySelector('.modal-shade'))return;
   if(!e.repeat && e.code==='KeyE'){if(state?.world==='dungeon'&&state.wardenBattle?.active)onAction('warden-parley');else interact();e.preventDefault();return;}
   if(!e.repeat && e.code==='Space' && state?.world==='mech' && state.mechBattle.active){onAction('fire-pulse');e.preventDefault();return;}
   if(!e.repeat && e.code==='Space' && state?.world==='dungeon'&&state.wardenBattle?.active){onAction('warden-strike');e.preventDefault();return;}
   if(!e.repeat && e.code==='KeyF' && state?.world==='dungeon'&&state.wardenBattle?.active){onAction('warden-power');e.preventDefault();return;}
   if(!e.repeat && e.code==='KeyR' && state?.world==='mech'&&state.mechBattle.active){onAction('vent-reactor');e.preventDefault();return;}
   if(!e.repeat && e.code==='KeyQ' && state?.world==='mech' && state.mechBattle.active){onAction('raise-shield');e.preventDefault();return;}
   if(!e.repeat && e.code==='KeyQ' && state?.world==='dungeon'&&state.wardenBattle?.active){onAction('warden-guard');e.preventDefault();return;}
   if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft'].includes(e.code)){pressed.add(e.code);e.preventDefault();}}
 function keyup(e){pressed.delete(e.code);}window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',()=>pressed.clear());
 function xrChoicePanels(worldId){
   const options = worldOptionsForXR(state).slice(0,4);
   if(!options.length)return;
   const panel=new THREE.Group();world.add(panel);panel.position.set(4.8,2.5,3.2);panel.rotation.y=-.3;
   options.forEach((o,i)=>{const plane=mesh(panel,new THREE.PlaneGeometry(2.55,.74),new THREE.MeshBasicMaterial({map:labelTexture(o.title.slice(0,25).toUpperCase(),worldId==='self'?'ASK YOURSELF':'MAKE YOUR CHOICE'),side:THREE.DoubleSide}),0,(1.5-i)*.97,0);plane.userData.action={type:'choice',id:o.id};targets.push(plane);});
 }
 function worldOptionsForXR(s){
   // Mirror enabled HUD choices as physical clickable panels for controller users.
   const choices = worldOptions(s);
   return choices.filter(c=>!c.disabled);
 }
 function mount(next){
   const sameWorld=state?.world===next.world;
   const lastPos=playerPos.clone();const lastCamera=camera.position.clone(),lastTarget=controls.target.clone();
   state=next;updateXRWatch();scene.remove(world);world.traverse(o=>{
     o.geometry?.dispose();
     const materials=Array.isArray(o.material)?o.material:o.material?[o.material]:[];
     for(const material of materials){material.map?.dispose();material.dispose();}
   });
   world=new THREE.Group();scene.add(world);scene.background=new THREE.Color(palettes[state.world].bg);
   scene.fog=new THREE.FogExp2(palettes[state.world].fog,state.world==='self'?.012:.008);
   targets=[];beacons=[];portalLocations=[];animated=[];titan=null;
   const p=palettes[state.world];world.add(new THREE.HemisphereLight(p.light,0x080d17,state.world==='self'?1.4:1.75));
   const sun=new THREE.DirectionalLight(p.light,2.8);sun.position.set(5,17,5);world.add(sun);
   ground(world,p);stars(world,state.world==='dungeon'?0xd5bcff:0xb1dce8,state.world==='self'?180:280);
   addAtmosphere(world,state.world,animated,atmosphereBudget({headset:renderer.xr.isPresenting,reducedMotion,smallScreen:window.innerWidth<900}));
   if(state.world==='future')buildFuture(world,state,animated);
   else if(state.world==='self')buildSelf(world,state,animated);
   else if(state.world==='past')buildPast(world,state,animated);
   else if(state.world==='dungeon')buildDungeon(world,state,animated);
   else if(state.world==='mech')titan=buildMech(world,state,animated);
   addScenery(world,state,animated);
   // Async, same-origin only: optional verified CC0 meshes enrich the existing procedural scene.
   void dressWithKenney(world,state.world?state:{world:'future'},animated).catch(()=>{});
   buildCombatTargets(world,state,animated,targets);
   buildChronalOrrey(world,state,animated);
   buildLivingCharacters(world,state,targets,animated);
   // Three interactive wormholes, placed at each world's far edge.
   const all=Object.keys(WORLDS).filter(w=>w!==state.world);
   for(let i=0;i<all.length;i++){
     const x=(i-1.5)*5.7;buildPortal(world,all[i],x,-20.5,targets,animated);
     portalLocations.push({x,z:-20.5,world:all[i]});
   }
   buildParallelGate(world,state,targets,animated);
   const active=worldOptions(state).filter(o=>!o.disabled && !o.id.startsWith('go-'));
   const priority={future:['talk-city','switch-parallel','fork-parallel','find-shard','buy-penthouse'],self:['confess','switch-parallel','fork-parallel','find-shard'],past:['invent-cell','patent','gift','find-shard'],dungeon:['warden-strike','warden-power','warden-guard','warden-parley','face-warden','rune-moon','rune-crown','rune-star','find-shard'],mech:['fire-pulse','raise-shield','vent-reactor','start-defense','defend-city','find-shard']};
   const physical=[...active].sort((a,b)=>{
     const aa=priority[state.world].indexOf(a.id),bb=priority[state.world].indexOf(b.id);
     return (aa===-1?100:aa)-(bb===-1?100:bb);
   }).slice(0,3);
   physical.forEach((o,i)=>buildActionBeacon(world,o,i,COLORS[state.world],animated,targets,beacons));
   xrChoicePanels(state.world);
   player=makePlayer(world);player.visible=!renderer.xr.isPresenting && !(state.world==='mech'&&state.mechDeployed);
   playerPos.copy(sameWorld?lastPos:new THREE.Vector3(0,0,6));
   if(!renderer.xr.isPresenting)rig.position.set(0,0,0);
   if(sameWorld){camera.position.copy(lastCamera);controls.target.copy(lastTarget);}
   else {camera.position.set(0,5.5,18);controls.target.set(0,2,0);}
   player.position.copy(playerPos);
   if(titan && state.mechDeployed){titan.position.x=playerPos.x;titan.position.z=playerPos.z-13;}
   controls.update();updateXRWatch();
   if(state.world==='self')light(world,0xf9c98c,2,4,8,-5,17);
 }
 function move(dt){
   if(!state || renderer.xr.isPresenting)return;
   const speed=(pressed.has('ShiftLeft')?10:5.5)*dt;
   const mx=(pressed.has('KeyD')||pressed.has('ArrowRight')?1:0)-(pressed.has('KeyA')||pressed.has('ArrowLeft')?1:0)+gamepadAxes.x;
   const mz=(pressed.has('KeyS')||pressed.has('ArrowDown')?1:0)-(pressed.has('KeyW')||pressed.has('ArrowUp')?1:0)+gamepadAxes.z;
   moving=Boolean(mx||mz);
   if(!moving)return;
   const norm=Math.max(1,Math.hypot(mx,mz));const dx=mx/norm*speed,dz=mz/norm*speed;
   const collisions=collisionRects(state.world);
   const tryX=THREE.MathUtils.clamp(playerPos.x+dx,-22,22),tryZ=THREE.MathUtils.clamp(playerPos.z+dz,-22,18);
   const blocked=(x,z)=>!(state.world==='mech'&&state.mechDeployed)&&collisions.some(([a,b,c,d])=>x>a-.45&&x<b+.45&&z>c-.45&&z<d+.45);
   if(!blocked(tryX,playerPos.z))playerPos.x=tryX;
   if(!blocked(playerPos.x,tryZ))playerPos.z=tryZ;
   if(state.world==='mech'&&state.mechDeployed&&titan){titan.position.x=playerPos.x;titan.position.z=playerPos.z-13;titan.rotation.y=Math.atan2(dx,dz)+Math.PI;}
   else {player.position.copy(playerPos);player.rotation.y=Math.atan2(dx,dz)+Math.PI;}
   const target=new THREE.Vector3(playerPos.x,state.world==='mech'&&state.mechDeployed?5:2,playerPos.z-3);
   const d=target.clone().sub(controls.target);controls.target.add(d);camera.position.add(d);
 }
 let snapReady=true;
 function tick(){const dt=Math.min(clock.getDelta(),.05);const t=reduceMotion?0:clock.elapsedTime;desktopGamepad();move(dt);
   if(renderer.xr.isPresenting){
     // Optional snap turn with right thumbstick. No forced smooth locomotion.
     const source=[...(renderer.xr.getSession()?.inputSources||[])].find(s=>s.handedness==='right'&&s.gamepad);
     const axes=source?.gamepad?.axes||[];const horizontal=Math.abs(axes[2]||0)>Math.abs(axes[0]||0)?axes[2]||0:axes[0]||0;
     if(Math.abs(horizontal)<.35)snapReady=true;
     else if(snapReady&&Math.abs(horizontal)>.8){rig.rotation.y-=Math.sign(horizontal)*Math.PI/6;snapReady=false;}
   }
   if(player && player.visible){player.position.y=Math.sin(t*(moving?9:1))*(moving?.08:.03);}
   for(const fn of animated)fn(t,moving,reduceMotion?0:dt);controls.enabled=!renderer.xr.isPresenting;if(!renderer.xr.isPresenting)controls.update();renderer.render(scene,camera);
 }
 renderer.setAnimationLoop(tick);
 renderer.xr.addEventListener('sessionstart',()=>{controls.enabled=false;rig.position.set(0,0,5);camera.position.set(0,0,0);xrWatch.visible=true;updateXRWatch();if(player)player.visible=false;});
 renderer.xr.addEventListener('sessionend',()=>{controls.enabled=true;rig.position.set(0,0,0);rig.rotation.y=0;xrWatch.visible=false;camera.position.set(0,5.5,18);if(player)player.visible=!(state.world==='mech'&&state.mechDeployed);});
 function resize(){const w=container.clientWidth||window.innerWidth;const h=container.clientHeight||window.innerHeight;camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();renderer.setSize(w,h);}
 window.addEventListener('resize',resize);
 resize();
 function interact(){
   if(!state)return;
   const choices=[...beacons.map(b=>({d:b.position.distanceTo(playerPos),type:'action',id:b.action})),
      ...portalLocations.map(p=>({d:Math.hypot(p.x-playerPos.x,p.z-playerPos.z),type:'world',id:p.world}))];
   const closest=choices.sort((a,b)=>a.d-b.d)[0];
   if(!closest||closest.d>4.4)return;
   if(closest.type==='world')onWorld(closest.id);else onAction(closest.id);
 }
 function effect(current,event){
   if(!event||!world)return;
   const pulse=state.world==='mech'&&/Threat|pulse|final/i.test(event.title);
   if(reduceMotion||(!pulse && !/Memory|Warden|cipher|Ending/i.test(event.title)))return;
   const ringMaterial=new THREE.MeshBasicMaterial({color:pulse?0xffae83:COLORS[state.world],transparent:true,opacity:.78,depthWrite:false,side:THREE.DoubleSide});
   const burst=new THREE.Mesh(new THREE.TorusGeometry(.8,.055,8,44),ringMaterial);burst.position.set(0,pulse?8:3,pulse?-19:-2);world.add(burst);
   const born=clock.elapsedTime;
   animated.push(t=>{const age=t-born;if(age<0)return;burst.scale.setScalar(1+Math.min(age*4,8));ringMaterial.opacity=Math.max(0,.78-age*.84);if(age>1)burst.visible=false;});
 }
 return {mount,resize,effect,interact,setMove(code,on){if(on)pressed.add(code);else pressed.delete(code);},vrSupported:()=>Boolean(navigator.xr),
   enterVR(){vrButton.click();},
   dispose(){renderer.setAnimationLoop(null);renderer.domElement.removeEventListener('click',click);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('resize',resize);controls.dispose();renderer.dispose();container.replaceChildren();}
 };
}
