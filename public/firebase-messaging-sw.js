/* Service worker til push-beskeder (Firebase Cloud Messaging). Viser beskeden, når siden
   ikke er åben, og åbner spillet, når der trykkes på den. Offline-cachen ligger i sw.js. */
self.window = self;   // firebase-config.js skriver til window, som ikke findes i en service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
importScripts('firebase-config.js');

firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  const url = (payload.data && payload.data.url) || (payload.fcmOptions && payload.fcmOptions.link) || '/spil.html';
  return self.registration.showNotification(n.title || 'Terningspil', {body: n.body || '', icon: n.icon || '/ikoner/10000-192.png', data: {url}});
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/spil.html';
  e.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(list => {
    for(const c of list){ if(c.url === url && 'focus' in c) return c.focus(); }
    return clients.openWindow(url);
  }));
});
