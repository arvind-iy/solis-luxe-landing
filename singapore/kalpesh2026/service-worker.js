const VERSION = 'solis-kalpesh-v3';

const STATIC_ASSETS = [
  'https://solis.luxe/logos/SOLIS%20email%20signature.png',
  'https://solis.luxe/logos/Full%20Logo%20Flat.png',
  'https://solis.luxe/logos/solis%20main%20logo%20only%20motif.png'
];

// Install — pre-cache static assets only (not HTML)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — wipe all old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// HTML pages → Network first, fall back to cache
// Everything else → Cache first, fall back to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isHTML = event.request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // Network first for HTML — always get latest
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(VERSION).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for assets (logos, fonts etc)
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(VERSION).then(cache => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
});
