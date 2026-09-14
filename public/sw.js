/* Service worker for terningspillene Mexico og 10.000.
   Gemmer de to spilsider (og deres manifester og ikoner) på telefonen, så de kan
   åbnes uden net. Alt andet på sitet – golf-scorekortet og dets synk – rører den ikke.
   Strategi: net først (så en ny udgave slår igennem med det samme), ellers cachen. */
const VERSION = 'v2';
const CACHE = 'terninger-' + VERSION;
const ASSETS = [
  'mexico.html', '10000.html',
  'online.js', 'firebase-config.js',            // så spilsiderne også indlæser rent uden net (online-tilstand kræver stadig net)
  'mexico.webmanifest', '10000.webmanifest',
  'ikoner/mexico-192.png', 'ikoner/mexico-512.png', 'ikoner/mexico-180.png',
  'ikoner/10000-192.png', 'ikoner/10000-512.png', 'ikoner/10000-180.png',
];
const NET_TIMEOUT = 4000;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('terninger-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin || e.request.method !== 'GET') return;
  const path = url.pathname.replace(/^\//, '');
  if(!ASSETS.includes(path)) return;
  e.respondWith(networkFirst(path));
});

async function networkFirst(path){
  const cache = await caches.open(CACHE);
  try{
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), NET_TIMEOUT);
    const res = await fetch(path, {cache: 'no-cache', signal: ctrl.signal});
    clearTimeout(timer);
    if(res && res.ok) cache.put(path, res.clone());
    return res;
  }catch(err){
    const hit = await cache.match(path, {ignoreSearch: true});
    if(hit) return hit;
    throw err;
  }
}
