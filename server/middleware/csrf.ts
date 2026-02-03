import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { validatedEnv } from '../lib/env.js';
import { AuthenticatedRequest } from './unifiedAuth.js';
import { getCsrfSkipPaths, getCsrfAllowedOrigins, isAllowedOrigin, isAllowedReferer } from '../lib/originUtils.js';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for specific paths (webhooks, health checks, etc.)
  const skipCSRFPaths = getCsrfSkipPaths();
  const fullPath = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
  
  if (skipCSRFPaths.some(path => fullPath.startsWith(path))) {
    // Even for skipped paths, validate Origin/Referer and X-Requested-With for multipart/form-data
    if (req.get('Content-Type')?.includes('multipart/form-data')) {
      const origin = req.get('Origin');
      const referer = req.get('Referer');
      const xRequestedWith = req.get('X-Requested-With');

      if (!origin && !referer) {
        return res.status(403).json({ error: 'CSRF: Missing Origin or Referer for multipart upload' });
      }

      if (origin && !isAllowedOrigin(origin)) {
        console.warn(`CSRF: Invalid origin ${origin} for multipart`);
        return res.status(403).json({ error: 'CSRF: Invalid origin' });
      }

      if (referer && !isAllowedReferer(referer)) {
        console.warn(`CSRF: Invalid referer ${referer} for multipart`);
        return res.status(403).json({ error: 'CSRF: Invalid referer' });
      }

      // Require X-Requested-With for multipart uploads
      if (xRequestedWith !== 'XMLHttpRequest') {
        return res.status(403).json({ error: 'CSRF: Missing X-Requested-With header for multipart upload' });
      }
    }
    return next();
  }

  // Get allowed origins from originUtils
  const allowedOrigins = getCsrfAllowedOrigins();

  // Enhanced Origin/Referer validation
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // For API requests, Origin is required
  if (!origin && req.get('Content-Type')?.includes('application/json')) {
    return res.status(403).json({ error: 'CSRF: Missing Origin header for API request' });
  }

  if (origin && !isAllowedOrigin(origin)) {
    console.warn(`CSRF: Invalid origin ${origin} from IP ${req.ip}`);
    return res.status(403).json({ error: 'CSRF: Invalid origin' });
  }

  if (referer && !isAllowedReferer(referer)) {
    console.warn(`CSRF: Invalid referer ${referer} from IP ${req.ip}`);
    return res.status(403).json({ error: 'CSRF: Invalid referer' });
  }

  // Check X-Requested-With header (traditional CSRF protection)
  const xRequestedWith = req.get('X-Requested-With');
  if (req.get('Content-Type')?.includes('application/json') && xRequestedWith !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'CSRF: Missing X-Requested-With header' });
  }

  // Origin + X-Requested-With validation is sufficient for cross-origin API protection
  // Double-submit cookie pattern disabled for cross-origin Render deployment
  // (different subdomains can't share cookies reliably)
  
  next();
}

export function setCSRFToken(req: Request, res: Response): string {
  const token = generateCSRFToken();
  
  // Set CSRF cookie.
  // NOTE: for cross-origin SPAs the frontend must be able to read the token to
  // implement the double-submit-cookie pattern — that requires httpOnly=false
  // in development/tests. In production we set httpOnly=true and rely on the
  // frontend obtaining the token via a protected endpoint or via a short-lived
  // header response to avoid exposing secrets to JS long-term.
  res.cookie('csrf-token', token, {
    httpOnly: validatedEnv.NODE_ENV === 'production', // dev/test: readable by client for double-submit
    secure: validatedEnv.NODE_ENV === 'production',
    sameSite: validatedEnv.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
    path: '/'
  });

  return token;
}

// Middleware to set CSRF token for authenticated users
export const csrfTokenMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Only set CSRF token for authenticated users or on specific routes
  if (req.user || req.path.startsWith('/api/')) {
    const token = setCSRFToken(req, res);
    res.set('X-CSRF-Token', token);
  }
  next();
};

// Enhanced validation for state-changing operations
export const validateStateChange = (req: Request, res: Response, next: NextFunction) => {
  // Additional validation for POST/PUT/DELETE/PATCH
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    
    // Check Content-Type for API requests
    const contentType = req.get('Content-Type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Invalid Content-Type for state change' });
    }

    // Validate request size
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB for most requests
    
    if (contentLength > maxSize) {
      return res.status(413).json({ error: 'Request entity too large' });
    }
  }
  
  next();
};

// CSRF protection for WebSocket connections
export const validateWebSocketCSRF = (handshake: any, next: (err?: Error) => void) => {
  const origin = handshake.headers.origin;

  if (!origin || !isAllowedOrigin(origin)) {
    return next(new Error('WebSocket origin not allowed'));
  }

  next();
};
