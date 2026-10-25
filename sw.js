const CACHE='timeflight-328d8558b25d';
const BASE=new URL('./',self.location.href);
const PRECACHE=["./", "./index.html", "./manifest.webmanifest", "./pwa-register.js", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./assets/image.b882a72aff23.png", "./assets/loader.f2f1bd06ad7c.js", "./assets/app.b7b03de9120f.js"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE))));
// Activate on the next normal launch; don't interrupt an open reader.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('timeflight-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==BASE.origin||!u.pathname.startsWith(BASE.pathname))return;
 if(!(/\/(assets|data|icons)\//.test(u.pathname)||u.pathname===BASE.pathname||/\/(index.html|manifest.webmanifest|pwa-register.js)$/.test(u.pathname)||r.mode==='navigate'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const fresh=async()=>{const res=await fetch(r);if(res.ok&&res.type!=='opaque')await cache.put(r,res.clone());return res;};
  if(r.mode==='navigate'||u.pathname.endsWith('/data/manifest.json')||u.pathname.endsWith('/manifest.webmanifest')){try{return await fresh();}catch(error){return await cache.match(r)||((r.mode==='navigate')&&await cache.match(new URL('./index.html',BASE)))||Promise.reject(error);}}
  return await cache.match(r)||fresh();
 })());
});
