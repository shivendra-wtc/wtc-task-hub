// WTC Management Hub — Service Worker
// FILE LOCATION: public/sw.js (registered from index.html as '/sw.js').
//
// Handles Web Push. Two jobs on every push:
//   1. Show a system notification (works even if the app is closed / phone locked).
//   2. Hand the push straight to any OPEN copy of the app (postMessage), so an open app
//      reacts instantly — e.g. starts ringing for a call — with no server round-trip.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No offline caching in this app — the service worker exists for installability + push.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {
    data = { title: 'WTC Hub', body: event.data ? event.data.text() : '' };
  }

  const isCall = data.tag === 'wtc-call';
  const title = data.title || 'WTC Management Hub';
  const extra = data.data || {};
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Distinct vibration for calls vs everything else, so a call feels different in
    // your pocket even with the screen off.
    vibrate: isCall ? [400, 150, 400, 150, 400, 150, 400, 150, 400] : [200, 100, 200],
    // Each call gets its own tag so two calls never silently replace each other;
    // renotify makes the phone buzz/sound again even if a similar alert is showing.
    tag: isCall && extra.callId ? 'wtc-call-' + extra.callId : (data.tag || 'wtc-notify'),
    renotify: true,
    requireInteraction: isCall,
    silent: false,
    data: { url: data.url || '/', push: data }
  };

  event.waitUntil((async () => {
    // Tell every open copy of the app right away (this is what makes an open app ring
    // within a second instead of waiting for its next check).
    try {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clientList.forEach((client) => {
        try { client.postMessage({ type: 'wtc-push', push: data }); } catch (e) {}
      });
    } catch (e) {}
    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const info = event.notification.data || {};
  const targetUrl = info.url || '/';
  const push = info.push || {};

  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      if ('focus' in client) {
        try { await client.focus(); } catch (e) {}
        // Already-open app: tell it what was tapped (open the task / show the call).
        try { client.postMessage({ type: 'wtc-notification-click', push: push }); } catch (e) {}
        return;
      }
    }
    // App not open: launch it straight onto the right place (?task=ID opens that task).
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});
