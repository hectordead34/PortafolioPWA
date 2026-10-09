const CACHE_STATIC = 'static-v1';
const CACHE_DYNAMIC = 'dynamic-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './estilos.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. FASE DE INSTALACIÓN
self.addEventListener('install', (e) => {
  console.log('[SW] Evento: install (Instalando Service Worker y precargando App Shell)');
  e.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. FASE DE ACTIVACIÓN
self.addEventListener('activate', (e) => {
  console.log('[SW] Evento: activate (Limpiando cachés antiguas)');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. RECUPERACIÓN DE PETICIONES (FETCH)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 1. Si está en caché, lo devuelve
      if (cachedResponse) {
        return cachedResponse;
      }
      // 2. Si no está en caché, va a la red y lo guarda en caché dinámica
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        return caches.open(CACHE_DYNAMIC).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      console.log('[SW] Sin conexión a red y recurso no disponible:', e.request.url);
      return new Response('Recurso no disponible en modo offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
      });
    })
  );
});