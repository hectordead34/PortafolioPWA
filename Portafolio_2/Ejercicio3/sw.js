// Service Worker para el Ejercicio 3

self.addEventListener('install', (event) => {
  console.log('[SW] Instalado correctamente');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activado y listo');
  return self.clients.claim();
});

// Listener para interacciones con la Notificación
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  console.log('[SW] Evento NotificationClick detectado:', action);

  if (action === 'close') {
    notification.close();
  } else {
    // Abrir o enfocar la pestaña activa del navegador
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./index.html');
        }
      })
    );
    notification.close();
  }
});