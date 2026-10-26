import * as THREE from 'three';

/* Original, procedural scenery. No third-party meshes, textures or unlicensed characters. */
const palettes={
  future:{dust:0x7bddf0,window:0x80edfd},self:{dust:0xffbd97,window:0xf3b884},
  past:{dust:0xffbf7e,window:0xffc58a},dungeon:{dust:0xc1a5ff,window:0xe4b5ff},
  mech:{dust:0xffb17e,window:0x89e6f3}
};
const material=(color,opacity=1,emission=0)=>new THREE.MeshStandardMaterial({color,metalness:.38,roughness:.42,emissive:color,emissiveIntensity:emission,transparent:opacity<1,opacity,depthWrite:opacity>=1});
const glow=(color,opacity=.6)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const box=(g,x,y,z,w,h,d,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
const sphere=(g,x,y,z,r,m,detail=1)=>{const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,detail),m);o.position.set(x,y,z);g.add(o);return o};
const torus=(g,x,y,z,r,m,t=.04)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,7,38),m);o.position.set(x,y,z);g.add(o);return o};
function rand(i,seed=0){let x=Math.sin(i*93.7101+seed*17.2349)*43758.5453;return x-Math.floor(x);}

function driftingParticles(group,state,animated){
  const world=state.world, count=world==='future'?480:world==='self'?230:world==='past'?330:world==='dungeon'?270:300;
  const pos=new Float32Array(count*3);const speeds=new Float32Array(count);
  for(let i=0;i<count;i++){
    pos[i*3]=(rand(i,3)-.5)*74;pos[i*3+1]=rand(i,4)*22+.4;pos[i*3+2]=(rand(i,5)-.5)*78-11;
    speeds[i]=world==='future'?4+rand(i,8)*7:world==='mech'?1.5+rand(i,8)*2.3:.23+rand(i,8)*.5;
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pointMaterial=new THREE.PointsMaterial({color:palettes[world].dust,size:world==='future'?.065:world==='past'?.12:.1,transparent:true,opacity:world==='future'?.4:.5,depthWrite:false,blending:THREE.AdditiveBlending});
  const pointCloud=new THREE.Points(geo,pointMaterial);group.add(pointCloud);
  animated.push((_,walking,dt=.016)=>{
    const a=geo.attributes.position.array;
    for(let i=0;i<count;i++){
      const y=i*3+1;
      a[y]+= (world==='future'?-1:world==='dungeon'?.7:-.12)*speeds[i]*dt;
      if(a[y]<0)a[y]=22;
      if(a[y]>24)a[y]=0;
    }
    geo.attributes.position.needsUpdate=true;
  });
}

function aetherGarden(g,state,animated){
  const stem=material(0x355c66),glass=material(state.fate==='gift'?0x88efbb:0x6cb6d7,.67,.6);
  for(let i=0;i<13;i++){
    const side=i%2?-1:1, x=side*(7+(i%4)*2.4),z=11-Math.floor(i/2)*4;
    const tree=new THREE.Group();tree.position.set(x,0,z);g.add(tree);
    box(tree,0,1.7,0,.12,3.4,.12,stem);
    for(let j=0;j<4;j++){
      const petal=new THREE.Mesh(new THREE.OctahedronGeometry(.37+(j%2)*.15),glass);
      petal.position.set((j-1.5)*.18,3.5+Math.sin(j)*.3,(j%2?-.23:.23));tree.add(petal);
    }
    animated.push(t=>tree.rotation.z=Math.sin(t*.45+i)*.035);
  }
  const archive=new THREE.Group();g.add(archive);archive.position.set(13,3,-3);
  const glasswall=box(archive,0,0,0,4.5,5,.12,material(0x3e90b4,.31,.7));
  const ring=torus(archive,0,0,.18,1.45,glow(0x8adbf9,.65),.032);
  animated.push(t=>ring.rotation.z=t*.17);
  if(state.fate){
    const banner=torus(g,0,8,-8,4,glow(state.fate==='gift'?0x70ffc1:state.fate==='patent'?0xffd28d:0xe5a2fa,.42),.07);
    animated.push(t=>{banner.rotation.y=t*.11;banner.rotation.z=Math.sin(t*.5)*.16;});
  }
}
function memoryApartment(g,state,animated){
  // A room full of things that become meaningful when the player changes the past.
  const wood=material(0x795f52),ink=material(0x1f3644),paper=material(0xf4dfc4,.86);
  for(let i=0;i<5;i++){
    const frame=box(g,-7.4+i*3.7,3.7,-11.4,2.5,1.6,.12,wood);
    const photo=box(g,frame.position.x,3.7,-11.27,2.15,1.28,.02,i===0&&state.fate==='patent'?material(0xdac58d):paper);
    const sky=box(g,photo.position.x,3.35,-11.22,1.94,.35,.015,i===1&&state.flags['defend-city']?material(0x7ec5df):ink);
  }
  // Five polished glass objects reflect collected fragments, a visual memory shelf.
  for(let i=0;i<5;i++){
    const x=-5+i*2.5;
    box(g,x,.7,1.6,.9,.1,.74,wood);
    const orb=sphere(g,x,1.12,1.6,.28,material(state.echoShards.length>i?0xffe0ac:0x3b555d,.74,state.echoShards.length>i?.8:.1));
    animated.push(t=>{orb.position.y=1.1+Math.sin(t*.62+i)*.05;orb.rotation.y=t*.22;});
  }
  // A small clock runs backward in the apartment when history has been changed.
  const clock=new THREE.Group();g.add(clock);clock.position.set(5.7,3,-9.4);
  torus(clock,0,0,0,1,glow(0xf5d4aa,.48),.075);
  const hand=box(clock,0,.39,.08,.045,.78,.07,material(0xd9b98b));hand.position.y=.39;
  animated.push(t=>clock.rotation.z=state.fate?-t*.13:t*.08);
}
function steamQuarter(g,state,animated){
  const wood=material(0x4a3330),copper=material(0xba865d,.96,.08);
  for(let i=0;i<8;i++){
    const side=i%2?-1:1,x=side*(18+rand(i)*4),z=6-Math.floor(i/2)*13;
    box(g,x,3,z,1.35,6,1.35,material(0x4f3538));
    const puff=sphere(g,x,7,z,.8,material(0xc8b3aa,.18));
    animated.push(t=>{puff.position.y=6+((t*(.4+rand(i))+(i*2))%8);puff.scale.setScalar(.6+puff.position.y*.12);});
  }
  const zeppelin=new THREE.Group();g.add(zeppelin);zeppelin.position.set(-11,13,-29);
  const hull=new THREE.Mesh(new THREE.SphereGeometry(3,14,10),material(0x9a7760));hull.scale.set(2.6,.85,.65);zeppelin.add(hull);
  box(zeppelin,0,-1.7,0,2.7,.8,1,copper);
  for(let z of [-1,1])box(zeppelin,0,-1.2,z*1.25,.04,.98,.06,wood);
  animated.push(t=>{zeppelin.position.x=-11+Math.sin(t*.12)*4;zeppelin.position.y=13+Math.sin(t*.21)*.3;zeppelin.rotation.z=Math.sin(t*.1)*.035;});
  // Rotating brass clock constellation, the metaphoric heart of the alternate 19th century.
  for(let i=0;i<3;i++){
    const ring=torus(g,-8+i*8,7,-16-i*2,2+i*.3,glow(0xf5b670,.22),.09);
    animated.push(t=>ring.rotation.z=t*.12*(i%2?-1:1));
  }
  if(state.invention){
    const light=sphere(g,0,4,-6.2,.65,glow(state.fate==='gift'?0x87ffc7:state.fate==='auction'?0xffc58e:0x8eecff,.5));
    animated.push(t=>light.scale.setScalar(.8+Math.sin(t*2)*.08));
  }
}
function forbiddenKingdom(g,state,animated){
  const stone=material(0x2a263a),lilac=glow(0xb79bff,.46),pink=glow(0xfdb5e6,.37);
  for(let i=0;i<9;i++){
    const a=(i/9)*Math.PI*2;
    const x=Math.cos(a)*24,z=-11+Math.sin(a)*23;
    const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(1.2+rand(i)*1.6),material(i%2?0x8c6ecd:0xd6a5e4,.6,.55));
    crystal.position.set(x,6+rand(i)*10,z);g.add(crystal);
    animated.push(t=>{crystal.rotation.y=t*.24+i;crystal.position.y=8+rand(i)*6+Math.sin(t*.48+i)*.55;});
  }
  // Three runes physically brighten as the cipher is solved.
  for(let i=0;i<3;i++){
    const x=(i-1)*3.5;
    const pedestal=box(g,x,.8,-4.4,2,1.65,1.6,stone);
    const rune=torus(g,x,2.45,-4.4,.6,i<state.runeProgress?pink:lilac,.105);
    rune.rotation.x=Math.PI/2;
    animated.push(t=>rune.rotation.z=t*.32*(i%2?-1:1));
  }
  const moon=torus(g,-12,15,-34,7,lilac,.33);moon.rotation.y=.24;
  animated.push(t=>moon.rotation.z=Math.sin(t*.1)*.05);
}
function titanHangar(g,state,animated){
  // Reactive mechanical scenery: enemies are visual reflections of the battle state.
  const enemyMat=material(0xed6a60,.87,1.1);
  const n=state.mechBattle.active?state.mechBattle.enemies:state.flags['defend-city']?0:3;
  for(let i=0;i<n;i++){
    const enemy=new THREE.Group();g.add(enemy);enemy.position.set(-9+i*9,9,-26);
    sphere(enemy,0,0,0,.58,enemyMat);torus(enemy,0,0,.05,1.3,glow(0xff797d,.73),.09);
    for(let j=-1;j<=1;j+=2)box(enemy,j*1.2,0,-.1,.85,.13,.4,material(0x5a4550));
    animated.push(t=>{enemy.position.y=8+Math.sin(t*.7+i)*.7;enemy.rotation.y=t*.35;});
  }
  for(let i=0;i<22;i++){
    const x=(i%2?-1:1)*(7+rand(i)*4),z=17-Math.floor(i/2)*5;
    const beacon=box(g,x,4,z,.1,8,.1,material(0x435561));
    const diode=sphere(g,x,8,z,.2,glow(i%4===0?0xffb37c:0x96eaf5,.67));
    animated.push(t=>diode.scale.setScalar(.6+Math.sin(t*1.1+i)*.15));
  }
  // Reactor status visibly transitions from cold cyan to emergency orange.
  const reactor=torus(g,0,9,-7,3.6,glow(state.mechBattle.heat>65?0xff765c:0x74ecff,.27),.2);
  animated.push(t=>reactor.rotation.y=t*.2);
  if(state.mechDeployed){
    for(let i=0;i<3;i++){
      const reticle=torus(g,0,4.2,-22-i*2,.8+i*.4,glow(0x8de9f4,.28),.035);
      animated.push(t=>{reticle.rotation.z=t*(i%2?-.22:.22);reticle.scale.setScalar(1+Math.sin(t*1.3+i)*.07);});
    }
  }
}

/** Supplement existing, playable scenes. The assets are procedural and adapt to state. */
export function addScenery(group,state,animated){
  driftingParticles(group,state,animated);
  if(state.world==='future')aetherGarden(group,state,animated);
  if(state.world==='self')memoryApartment(group,state,animated);
  if(state.world==='past')steamQuarter(group,state,animated);
  if(state.world==='dungeon')forbiddenKingdom(group,state,animated);
  if(state.world==='mech')titanHangar(group,state,animated);
  const shardCount=state.echoShards.length;
  if(shardCount && state.world!=='self'){
    const crown=new THREE.Group();group.add(crown);crown.position.set(-5,3,1);
    for(let i=0;i<Math.min(5,shardCount);i++){
      const a=i*Math.PI*2/Math.min(5,shardCount);
      sphere(crown,Math.cos(a)*1.1,Math.sin(a)*1.1,0,.19,glow(palettes[state.world].dust,.6));
    }
    animated.push(t=>{crown.rotation.z=t*.15;crown.position.y=3+Math.sin(t*.6)*.16;});
  }
}

/** Deliberate coarse collision proxies; no heavy physics dependency is needed for walking. */
export function collisionRects(world){
  return ({future:[[-3.7,3.7,-11.7,-4]],self:[[-3.1,3.1,-8,-5]],past:[[-4.1,4.1,-9,-5]],dungeon:[[-3.7,3.7,-13,-8]],mech:[]})[world]||[];
}
