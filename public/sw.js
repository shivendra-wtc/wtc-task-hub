// WTC Management Hub — Service Worker
// FILE LOCATION: public/sw.js (registered from index.html as '/sw.js').
//
// Handles Web Push. Two jobs on every push:
//   1. Show a system notification (works even if the app is closed / phone locked).
//   2. Hand the push straight to any OPEN copy of the app (postMessage), so an open app
//      reacts instantly — e.g. starts ringing for a call — with no server round-trip.

// Same backend URL as the app (used to answer a call straight from the notification).
const API_URL = 'https://script.google.com/macros/s/AKfycbxhrBrgG4x5U6v7YzYYbREaptULHIKprzL5ZAdCUySbdQBrqTkib2mEdujKYensAhkR-A/exec';

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

  const extra = data.data || {};
  const isCall = extra.kind === 'call';
  const isReminder = extra.type === 'task_reminder';
  const title = data.title || 'WTC Management Hub';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Distinct vibration per kind, so a call / a reminder feel different in your pocket.
    vibrate: isCall ? [400, 150, 400, 150, 400, 150, 400, 150, 400]
      : isReminder ? [90, 60, 90, 300, 90, 60, 90] : [200, 100, 200],
    tag: isCall && extra.callId ? 'wtc-call-' + extra.callId : (data.tag || 'wtc-notify'),
    renotify: true,
    requireInteraction: isCall || isReminder,
    silent: false,
    data: { url: data.url || '/', push: data }
  };
  if (isCall) options.actions = [{ action: 'accept', title: '✓ Coming' }, { action: 'decline', title: '✕ Busy' }];

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
  const extra = push.data || {};

  // "✓ Coming" / "✕ Busy" pressed right on the call notification — answer without
  // opening the app, and tell any open copy of the app to stop ringing.
  if ((event.action === 'accept' || event.action === 'decline') && extra.kind === 'call' && extra.callId && extra.to) {
    const response = event.action === 'accept' ? 'Accepted' : 'Declined';
    event.waitUntil((async () => {
      try {
        await fetch(API_URL, {
          method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'respondToCall', callId: extra.callId, userName: extra.to, response })
        });
      } catch (e) {}
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clientList.forEach((client) => {
        try { client.postMessage({ type: 'wtc-call-answered', callId: extra.callId, response }); } catch (e) {}
      });
    })());
    return;
  }

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
