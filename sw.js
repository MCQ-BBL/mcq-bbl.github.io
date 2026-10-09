// MCQ BBL offline cache. Bump VERSION whenever question files change.
const VERSION='mcqbbl-v1';
const SHELL=['./','index.html','meta.json','manifest.json','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.endsWith('supabase.co'))return; // never cache API calls
  const isData=/\/d\d+\.json$/.test(u.pathname)||/\.png$/.test(u.pathname)||u.hostname==='cdn.jsdelivr.net'||u.hostname.includes('gstatic');
  if(isData){ // cache first: question files never change within a VERSION
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})));
  }else{ // network first, fall back to cache when offline
    e.respondWith(fetch(r).then(res=>{if(res.ok&&u.origin===location.origin){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));
  }
});
