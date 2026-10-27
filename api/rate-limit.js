/**
 * Best-effort in-process cost controls for anonymous demo inference.
 * This is NOT a durable distributed limit across Vercel function replicas:
 * require an upstream provider spend limit and edge rate limit before public launch.
 */
export function createInferenceLimiter({calls=12,windowMs=300_000,concurrent=2,clock=Date.now}={}){
 const clients=new Map();let active=0;
 return {
  begin(client='anonymous'){
   const t=clock();
   if(clients.size>512)for(const [k,v] of clients)if(t-v.since>windowMs)clients.delete(k);
   const key=String(client).slice(0,96);
   let item=clients.get(key);
   if(!item || t-item.since>windowMs)item={since:t,calls:0};
   if(item.calls>=calls||active>=concurrent)return null;
   item.calls++;clients.set(key,item);active++;
   let used=false;
   return ()=>{if(used)return;used=true;active=Math.max(0,active-1)};
  },
  current(){return {active,clientCount:clients.size}}
 };
}
