const CACHE_NAME = 'mtm-palka-cache-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Intercept cross-origin calls to api.net-pocket.com and route through our backend proxy
self.addEventListener('fetch', (event) => {
  try {
    const url = new URL(event.request.url);
    // Only handle simple GET/HEAD requests to net-pocket to avoid CORS
    if (
      (event.request.method === 'GET' || event.request.method === 'HEAD') &&
      url.hostname === 'api.net-pocket.com'
    ) {
      const proxiedPath = `/api/proxy/net-pocket${url.pathname}${url.search}`;
      event.respondWith(
        fetch(proxiedPath, {
          method: event.request.method,
          // Keep it simple; same-origin fetch will include cookies as needed
          headers: {
            'Accept': 'application/json'
          }
        })
      );
    }
  } catch (e) {
    // noop
  }
});
