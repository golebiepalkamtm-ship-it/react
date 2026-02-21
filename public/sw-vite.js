// Versioned cache name to force controlled rollouts
const CACHE_NAME = 'mtm-palka-cache-v3-20260221';
const CACHEABLE_PATHS = [/^\/assets\//, /^\/icons\//, /^\/images\//, /^\/manifest\.json$/];
const PROXY_HOST = 'api.net-pocket.com';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  try {
    const url = new URL(request.url);
    const isSameOrigin = url.origin === self.location.origin;

    // Allowlist: only proxy net-pocket GET/HEAD to backend; skip everything else to avoid caching auth APIs
    if (
      !isSameOrigin &&
      (request.method === 'GET' || request.method === 'HEAD') &&
      url.hostname === 'api.net-pocket.com'
    ) {
      const proxiedPath = `/api/proxy/net-pocket${url.pathname}${url.search}`;
      event.respondWith(
        fetch(proxiedPath, {
          method: request.method,
          headers: { Accept: 'application/json' }
        })
      );
      return;
    }

    // For same-origin requests, bypass SW for all API/auth and default network (no caching of private data)
    if (isSameOrigin && url.pathname.startsWith('/api')) {
      return;
    }

    // Cache-first for public static assets
    const isCacheable =
      isSameOrigin &&
      request.method === 'GET' &&
      CACHEABLE_PATHS.some((pattern) => pattern.test(url.pathname));

    if (isCacheable) {
      event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
          const cached = await cache.match(request);
          if (cached) return cached;
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
      );
    }
  } catch (_e) {
    // ignore
  }
});
