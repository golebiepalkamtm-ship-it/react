import { Request, Response } from 'express';

export function testCSRFEndpoint(req: Request, res: Response) {
  // Test endpoint do weryfikacji CSRF protection
  res.json({ 
    message: 'CSRF test endpoint',
    method: req.method,
    headers: {
      'x-requested-with': req.get('X-Requested-With'),
      'x-csrf-token': req.get('X-CSRF-Token') ? 'present' : 'missing',
      'origin': req.get('Origin'),
      'referer': req.get('Referer'),
    },
    cookies: {
      'csrf-token': req.cookies?.['csrf-token'] ? 'present' : 'missing'
    }
  });
}
