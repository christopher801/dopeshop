/* DOPE SHOP — Service Worker
 * Estrategia segura para e-commerce:
 *  - Las páginas HTML SIEMPRE van a la red (precios y stock nunca quedan obsoletos). Si no hay red, se muestra /offline.html.
 *  - Nunca se intercepta /api, /admin, /account, /cart ni /checkout (datos privados / pedidos).
 *  - Solo se cachean activos estáticos inmutables (/_next/static, /icons).
 *  - Una nueva versión espera a que el usuario acepte actualizar (mensaje SKIP_WAITING).
 */
const VERSION = 'v1';
const STATIC_CACHE = `dope-shop-static-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png'];
const PRIVATE_PREFIXES = ['/api', '/admin', '/account', '/cart', '/checkout'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dope-shop-') && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'))) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
