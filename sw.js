const VERSION = 'bbh-v3';
const BASE = '/biorefinery-bioplastics-hub/';
const FILES = ['/biorefinery-bioplastics-hub/', '/biorefinery-bioplastics-hub/index.html', '/biorefinery-bioplastics-hub/manifest.webmanifest', '/biorefinery-bioplastics-hub/icon-192.png', '/biorefinery-bioplastics-hub/icon-512.png', '/biorefinery-bioplastics-hub/icon-maskable-512.png', '/biorefinery-bioplastics-hub/apple-touch-icon.png', '/biorefinery-bioplastics-hub/vendor/tailwind.js', '/biorefinery-bioplastics-hub/vendor/chart.umd.min.js', '/biorefinery-bioplastics-hub/vendor/fonts.css', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2', '/biorefinery-bioplastics-hub/vendor/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(FILES.map((u) => new Request(u, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(req, {ignoreSearch: true});
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const page = await caches.match(BASE);
      if (page) return page;
    }
    try { return await fetch(req); } catch (_) { return Response.error(); }
  })());
});
