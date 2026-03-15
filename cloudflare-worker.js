export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Check if it's a JSON API response (you can customize this condition)
    if (request.method === 'GET' && url.pathname.startsWith('/api/') && url.pathname.endsWith('.json')) {
      const cache = caches.default;
      const cacheKey = new Request(request.url, request);
      const cacheResponse = await cache.match(cacheKey);

      if (cacheResponse) {
        console.log('Cache hit for:', request.url);
        return cacheResponse;
      }

      console.log('Cache miss for:', request.url);
      const response = await fetch(request);
      
      // Clone the response to cache it
      const responseToCache = response.clone();
      
      // Set cache headers for 5 minutes (300 seconds)
      const cacheControl = 'public, max-age=300';
      responseToCache.headers.set('Cache-Control', cacheControl);
      
      // Store in cache
      ctx.waitUntil(cache.put(cacheKey, responseToCache));
      
      return response;
    }

    // For non-API requests, pass through
    return fetch(request);
  },
};
