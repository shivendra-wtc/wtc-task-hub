// WTC Management Hub — Service Worker
// FILE LOCATION: save this as  public/sw.js  (same place the old one lived — it's
// registered from index.html as '/sw.js', which Vite serves straight from /public).
//
// FIX — added real Web Push handling. This is what lets a call/task/meeting alert wake
// the app even when the tab is closed or the phone is locked: the browser itself runs
// this file in the background and shows a system notification the instant a push
// arrives, without needing the page to be open or polling anything.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Bare network passthrough — this app doesn't do offline caching, so the service
// worker's only real job is enabling installability + push. Not defining a fetch
// handler at all is also fine, but this keeps behavior explicit.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {
    data = { title: 'WTC Hub', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'WTC Management Hub';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Distinct vibration pattern for calls vs everything else, so even with the
    // screen off, a call feels different in your pocket from a task ping.
    vibrate: data.tag === 'wtc-call' ? [300, 150, 300, 150, 300, 150, 300] : [200, 100, 200],
    tag: data.tag || 'wtc-notify',
    // A call notification stays on screen until acted on instead of auto-dismissing.
    requireInteraction: data.tag === 'wtc-call',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
