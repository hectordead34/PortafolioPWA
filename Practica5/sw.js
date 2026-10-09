const CACHE_NAME = 'practica5-v1';

// Recursos estáticos del App Shell e inclusión de offline.html
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/logo.svg',
  '/offline.html' // Plantilla alternativa
];

// 1. Evento install: Almacena en caché todo el App Shell y la página offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW P5] Precargando App Shell y vista Offline');
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Evento activate: Elimina cachés de prácticas o versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW P5] Limpiando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Evento fetch: Cache-First + Interceptor con respuesta de Fallback
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (
          event.request.mode === 'navigate' ||
          (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))
        ) {
          console.log('[SW P5] Red no disponible. Serviendo plantilla offline.html');
          return caches.match('/offline.html');
        }
      });
    })
  );
});