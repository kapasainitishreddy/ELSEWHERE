/** Opt-in diagnostic frame counter. No telemetry, cookies, IDs, storage or network. */
export function createFrameSampler(max=120){
 const samples=[];
 return {
  add(seconds){if(!Number.isFinite(seconds)||seconds<=0||seconds>.5)return;if(samples.length>=max)samples.shift();samples.push(seconds);},
  snapshot(){if(!samples.length)return {fps:0,averageMs:0,p95Ms:0,frames:0};
   const ordered=[...samples].sort((a,b)=>a-b),total=samples.reduce((a,b)=>a+b,0);
   const average=total/samples.length;
   return {fps:Math.round(1/average),averageMs:Math.round(average*10000)/10,p95Ms:Math.round(ordered[Math.min(ordered.length-1,Math.ceil(ordered.length*.95)-1)]*10000)/10,frames:samples.length};
  },
  clear(){samples.length=0;},
 };
}
export function describeFrame(s,{xr=false,calls=0,triangles=0}={}){
 const mode=xr?'XR':'DESKTOP';
 return `${mode} · ${s.fps} FPS · ${s.p95Ms}ms P95 · ${Math.max(0,calls|0)} DRAWS · ${Math.max(0,triangles|0)} TRIS`;
}
