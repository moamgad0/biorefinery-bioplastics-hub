const VERSION = 'bbh-v1';
const BASE = '/biorefinery-bioplastics-hub/';
const LOCAL = [BASE, BASE + 'index.html', BASE + 'manifest.webmanifest', BASE + 'icon-192.png', BASE + 'icon-512.png', BASE + 'icon-maskable-512.png', BASE + 'apple-touch-icon.png'];
const CDN = [
  'https://cdn.tailwindcss.com/3.4.17',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(LOCAL);
    for (const u of CDN) { try { await c.put(u, await fetch(new Request(u, {mode: 'no-cors'}))); } catch (_) {} }
    try {
      const r = await fetch(FONT_CSS, {mode: 'cors'});
      const css = await r.clone().text();
      await c.put(FONT_CSS, r);
      const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
      for (const u of urls) { try { await c.put(u, await fetch(new Request(u, {mode: 'no-cors'}))); } catch (_) {} }
    } catch (_) {}
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
  if (req.mode === 'navigate' && url.origin === location.origin) {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const c = await caches.open(VERSION); c.put(BASE, net.clone());
        return net;
      } catch (_) {
        return (await caches.match(BASE)) || (await caches.match(BASE + 'index.html'));
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const hit = await caches.match(req, {ignoreSearch: false});
    if (hit) return hit;
    try {
      const net = await fetch(req);
      if (net && (net.ok || net.type === 'opaque')) { const c = await caches.open(VERSION); c.put(req, net.clone()); }
      return net;
    } catch (err) {
      return hit || Response.error();
    }
  })());
});
