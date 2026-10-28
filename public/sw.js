/* First-party offline assets. Navigations are network-first to avoid trapping
 * players on old versions; remote AI, private saves and dynamic APIs are never cached.
 */
const CACHE='elsewhere-static-v8';
const SHELL=['/','/index.html'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('elsewhere-static-')&&key!==CACHE).map(key=>caches.delete(key)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/private/'))return;
 if(request.mode==='navigate'||url.pathname==='/'||url.pathname==='/index.html'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try{
    const fresh=await fetch(request,{cache:'no-store'});
    if(fresh.ok&&fresh.type==='basic')await cache.put(url.pathname==='/'?'/index.html':url.pathname,fresh.clone());
    return fresh;
   }catch{return await cache.match(url.pathname==='/'?'/index.html':url.pathname)||Response.error();}
  })());
  return;
 }
 // Cache only known, static files. No private URLs, no arbitrary same-origin GET.
 if(!/^\/(assets\/|glasses\/|favicon\.ico$)/.test(url.pathname))return;
 const isManifest=/^\/assets\/(?:kenney|companions)\/index\.json$/.test(url.pathname);
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  if(cached&&!isManifest)return cached;
  try{
   const fresh=await fetch(request);
   if(fresh.ok&&fresh.type==='basic')await cache.put(request,fresh.clone());
   return fresh;
  }catch{return cached||Response.error();}
 })());
});
