import rateLimit from 'express-rate-limit';
import { validatedEnv } from '../lib/env.js';
import { cache } from '../lib/cache.js';

// Enhanced rate limiting with Redis fallback to memory
const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: options.message,
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => req.ip || 'unknown'),
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    // Custom store using our cache for consistency
    store: {
      async increment(key: string) {
        const current = cache.get<number>(key) || 0;
        const newValue = current + 1;
        cache.set(key, newValue, options.windowMs);
        
        return {
          totalHits: newValue,
          resetTime: new Date(Date.now() + options.windowMs)
        };
      },
      
      async decrement(key: string) {
        const current = cache.get<number>(key) || 0;
        if (current > 0) {
          cache.set(key, current - 1, options.windowMs);
        }
      },
      
      async resetKey(key: string) {
        cache.delete(key);
      },
      
      async resetAll() {
        cache.clear();
      }
    }
  });
};

// Global rate limit for all requests
export const globalRateLimit = createRateLimit({
  windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
  max: validatedEnv.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  skipSuccessfulRequests: false,
  skipFailedRequests: true // Don't count failed requests against rate limit
});

// Strict rate limit for authentication endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  keyGenerator: (req) => {
    const ip = req.ip || 'unknown';
    const email = req.body?.email || 'no-email';
    return `auth:${ip}:${email}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Rate limit for sensitive operations (bidding, payments, uploads)
export const sensitiveRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 sensitive operations per minute
  message: 'Too many sensitive operations, please slow down',
  keyGenerator: (req) => {
    const userId = req.user?.userId || req.ip || 'unknown';
    return `sensitive:${userId}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Rate limit for API endpoints that require authentication
export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per authenticated user
  message: 'API rate limit exceeded, please try again later',
  keyGenerator: (req) => {
    const userId = req.user?.userId || req.ip || 'unknown';
    return `api:${userId}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

// Rate limit for WebSocket connections
export const wsConnectionRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 connections per minute per IP
  message: 'Too many WebSocket connections, please try again later',
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    return `ws:${ip}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Rate limit for file uploads
export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute per user
  message: 'Upload rate limit exceeded, please try again later',
  keyGenerator: (req) => {
    const userId = req.user?.userId || req.ip || 'unknown';
    return `upload:${userId}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Rate limit for bid operations
export const bidRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 bids per minute per user per auction
  message: 'Too many bids, please wait before placing another bid',
  keyGenerator: (req) => {
    const userId = req.user?.userId || req.ip || 'unknown';
    const auctionId = req.body?.auctionId || req.params?.auctionId || 'unknown';
    return `bid:${userId}:${auctionId}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Rate limit for payment operations
export const paymentRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 payment attempts per 5 minutes
  message: 'Too many payment attempts, please try again later',
  keyGenerator: (req) => {
    const userId = req.user?.userId || req.ip || 'unknown';
    return `payment:${userId}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Middleware to apply appropriate rate limiting based on route
export const applyRateLimit = (type: 'global' | 'auth' | 'sensitive' | 'api' | 'upload' | 'bid' | 'payment') => {
  switch (type) {
    case 'global':
      return globalRateLimit;
    case 'auth':
      return authRateLimit;
    case 'sensitive':
      return sensitiveRateLimit;
    case 'api':
      return apiRateLimit;
    case 'upload':
      return uploadRateLimit;
    case 'bid':
      return bidRateLimit;
    case 'payment':
      return paymentRateLimit;
    default:
      return globalRateLimit;
  }
};

// Rate limit status checker middleware
export const rateLimitStatus = (req: any, res: any, next: any) => {
  const ip = req.ip || 'unknown';
  const userId = req.user?.userId;
  
  // Get rate limit info from cache
  const globalKey = `rl:global:${ip}`;
  const authKey = `rl:auth:${ip}`;
  const apiKey = userId ? `rl:api:${userId}` : null;
  
  const status = {
    global: {
      used: cache.get<number>(globalKey) || 0,
      limit: validatedEnv.RATE_LIMIT_MAX_REQUESTS,
      windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS
    },
    auth: {
      used: cache.get<number>(authKey) || 0,
      limit: 5,
      windowMs: 15 * 60 * 1000
    },
    api: apiKey ? {
      used: cache.get<number>(apiKey) || 0,
      limit: 100,
      windowMs: 60 * 1000
    } : null
  };
  
  res.set({
    'X-RateLimit-Limit': status.global.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, status.global.limit - status.global.used).toString(),
    'X-RateLimit-Reset': new Date(Date.now() + validatedEnv.RATE_LIMIT_WINDOW_MS).toISOString()
  });
  
  req.rateLimitStatus = status;
  next();
};

export default {
  globalRateLimit,
  authRateLimit,
  sensitiveRateLimit,
  apiRateLimit,
  wsConnectionRateLimit,
  uploadRateLimit,
  bidRateLimit,
  paymentRateLimit,
  applyRateLimit,
  rateLimitStatus
};
