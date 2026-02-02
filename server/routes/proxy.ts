
import { Router, Request } from 'express';
import logger from '../lib/logger.js';

const router: Router = Router();

// Proxy for net-pocket API to avoid CORS
// Usage: /api/proxy/net-pocket/api/clients/details -> https://api.net-pocket.com/api/clients/details
router.all('/net-pocket/*', async (req: Request, res) => {
  try {
    const path = (req.params as any)[0];
    const targetUrl = `https://api.net-pocket.com/${path}`;
    
    logger.info(`Proxying request to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    logger.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

export default router;
