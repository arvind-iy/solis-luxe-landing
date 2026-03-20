const CACHE = 'solis-kalpesh-2026-v1';

const ASSETS = [
  '/singapore/kalpesh2026/',
  '/singapore/kalpesh2026/index.html',
  '/singapore/kalpesh2026/manifest.json',
  'https://solis.luxe/logos/SOLIS%20email%20signature.png',
  'https://solis.luxe/logos/Full%20Logo%20Flat.png',
  'https://solis.luxe/logos/solis%20main%20logo%20only%20motif.png'
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache any new successful GET requests
        if (event.request.method === 'GET' && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
