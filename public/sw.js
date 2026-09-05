// WTC Management Hub — service worker
// Deliberately minimal and network-first: this app changes frequently (new features
// ship often), so aggressively caching pages/assets risks people getting stuck on a
// stale old version after an update. This just satisfies the browser's requirement
// for a registered service worker (needed for "Install App" to be offered) without
// introducing any staleness risk — it always tries the network first, and only falls
// back to cache if genuinely offline (which will usually just fail gracefully, since
// nothing is proactively cached).

const CACHE_NAME = 'wtc-hub-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
