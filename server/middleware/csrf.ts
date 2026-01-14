import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { validatedEnv } from '../lib/env.js';
import { AuthenticatedRequest } from './unifiedAuth.js';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for specific paths (webhooks, health checks, etc.)
  const skipCSRFPaths = [
    '/api/webhooks/stripe',
    '/api/health',
    '/api/breeder-meetings',
    '/api/upload', // File uploads handled by multer with different security
    '/socket.io/'
  ];
  
  if (skipCSRFPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Get allowed origins from environment
  const allowedOrigins = [
    validatedEnv.CLIENT_URL,
    'https://champion-pigeon-web.onrender.com',
    'https://palkamtm.pl',
    'https://www.palkamtm.pl',
    ...(validatedEnv.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [])
  ].filter(Boolean);

  // Enhanced Origin/Referer validation
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // For API requests, Origin is required
  if (!origin && req.get('Content-Type')?.includes('application/json')) {
    return res.status(403).json({ error: 'CSRF: Missing Origin header for API request' });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`CSRF: Invalid origin ${origin} from IP ${req.ip}`);
    return res.status(403).json({ error: 'CSRF: Invalid origin' });
  }

  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
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
  
  // Set secure CSRF cookie
  res.cookie('csrf-token', token, {
    httpOnly: false, // Frontend needs to read this for X-CSRF-Token header
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
  const allowedOrigins = [
    validatedEnv.CLIENT_URL,
    'https://champion-pigeon-web.onrender.com',
    'https://palkamtm.pl',
    'https://www.palkamtm.pl',
    ...(validatedEnv.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [])
  ].filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) {
    return next(new Error('WebSocket origin not allowed'));
  }

  next();
};
