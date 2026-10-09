const CACHE_NAME = 'app-shell-v1';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Guardando recursos en caché');
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Limpiando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Evento fetch: Estrategia Cache-First
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Sirve el archivo guardado en caché
      if (cachedResponse) {
        console.log('[SW] Servido desde caché:', event.request.url);
        return cachedResponse;
      }
      // Si no existe en caché, va a la red
      console.log('[SW] Descargando de la red:', event.request.url);
      return fetch(event.request);
    })
  );
});