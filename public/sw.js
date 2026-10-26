/* Offline shell. Only first-party static GET responses are cached; never API, secrets or saves. */
const CACHE='elsewhere-static-v3';
const SHELL=['/','/index.html'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([caches.keys().then(names=>Promise.all(names.filter(n=>n!==CACHE).map(n=>caches.delete(n)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/private/'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const stored=await cache.match(request);
  if(stored)return stored;
  try{
   const response=await fetch(request);
   if(response.ok&&response.type==='basic'&&/^(text\/|application\/javascript|image\/|font\/|application\/wasm)/.test(response.headers.get('content-type')||'')){
    await cache.put(request,response.clone());
   }
   return response;
  }catch{return caches.match('/index.html')||Response.error();}
 })());
});
