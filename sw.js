const CACHE='timeflight-quiz-year-2e4b4760d4f7';
const BASE=new URL('./',self.location.href);
const PRECACHE=["./", "./index.html", "./manifest.webmanifest", "./pwa-register.js", "./icons/apple-touch-icon.feb7b9084a14.png", "./icons/icon-192.97e070d7f51f.png", "./icons/icon-512.c5198fd7e703.png", "./assets/image.b882a72aff23.png", "./assets/loader.f2f1bd06ad7c.js", "./assets/app.2e4b4760d4f7.js"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE.map(url=>new Request(new URL(url,BASE),{cache:'reload'}))))));
// Activate on the next normal launch; don't interrupt an open reader.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('timeflight-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==BASE.origin||!u.pathname.startsWith(BASE.pathname))return;
 if(!(/\/(assets|data|icons)\//.test(u.pathname)||u.pathname===BASE.pathname||/\/(index.html|manifest.webmanifest|pwa-register.js)$/.test(u.pathname)||r.mode==='navigate'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const fresh=async()=>{const res=await fetch(new Request(r,{cache:'no-store'}));if(res.ok&&res.type!=='opaque')await cache.put(r,res.clone());return res;};
  if(r.mode==='navigate'||u.pathname.endsWith('/data/manifest.json')||u.pathname.endsWith('/manifest.webmanifest')){try{return await fresh();}catch(error){return await cache.match(r)||((r.mode==='navigate')&&await cache.match(new URL('./index.html',BASE)))||Promise.reject(error);}}
  return await cache.match(r)||fresh();
 })());
});
