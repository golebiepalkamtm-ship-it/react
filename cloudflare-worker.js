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
      
      // Clone response and attach cache headers safely via new Response
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'public, max-age=300');
      const responseToCache = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
      
      // Store in cache
      ctx.waitUntil(cache.put(cacheKey, responseToCache));
      
      return response;
    }

    // For non-API requests, pass through
    return fetch(request);
  },
};
