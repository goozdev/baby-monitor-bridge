/* ============================================================
   Baby Monitor Bridge – Service Worker
   Handles Web Push notifications when the app is backgrounded
   ============================================================ */

const CACHE_NAME = 'bmb-v1';

// Install: activate immediately
self.addEventListener('install', () => self.skipWaiting());

// Activate: claim all clients right away
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push: show a notification whenever the push service wakes us up
self.addEventListener('push', (event) => {
  let body = 'Noise detected near the baby!';
  if (event.data) {
    try { body = event.data.json().body || body; } catch (_) {
      try { body = event.data.text() || body; } catch (__) { /* ignore */ }
    }
  }

  const options = {
    body,
    icon: './icon-192.png',
    badge: './icon-96.png',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
    tag: 'baby-alert',
    renotify: true,
    data: { url: self.registration.scope },
  };

  event.waitUntil(
    self.registration.showNotification('👶 Baby Alert!', options)
  );
});

// Notification click: focus or open the app tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : self.registration.scope;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      return clients.openWindow(target);
    })
  );
});
