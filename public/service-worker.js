/**
 * Service worker mínimo para AguaDiaria como PWA.
 *
 * No precachea una lista fija de archivos (los nombres de los paquetes de
 * Metro cambian en cada build), sino que guarda en caché, sobre la marcha,
 * todo lo que la app pide con éxito. Así, si el usuario abre la app sin
 * conexión, puede seguir viendo la última versión que cargó.
 */
const CACHE_NAME = 'aguadiaria-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
