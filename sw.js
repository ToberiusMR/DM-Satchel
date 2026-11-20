const VERSION="dm-satchel-v1";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png",
 "tools/mysterybox.html","tools/turns.html","tools/encounter.html","tools/token.html","tools/funnel.html"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=="dm-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  // Google Fonts: keep a copy so the app looks right offline
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open("dm-fonts").then(async c=>{const hit=await c.match(e.request);if(hit)return hit;
      try{const r=await fetch(e.request);if(r.ok||r.type==="opaque")c.put(e.request,r.clone());return r}catch(err){return new Response("",{status:504})}}));return}
  if(u.origin!==location.origin)return;
  // app files: cached copy first, refresh in the background
  e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
    return hit||(await net)||c.match("index.html")}));
});
