import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../lib/logger.js';
import { validatedEnv } from '../lib/env.js';

// Redis store (optional - uncomment if you have Redis)
// import RedisStore from 'rate-limit-redis';
// import redis from '../lib/redis.js';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS, 
  max: validatedEnv.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(validatedEnv.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Also include legacy headers for compatibility
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60
    });
  },
  // store: new RedisStore({
  //   sendCommand: (...args: string[]) => redis.sendCommand(args),
  // }),
});

// Auth endpoints limiter - 5 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip} on ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60
    });
  },
  // store: new RedisStore({
  //   sendCommand: (...args: string[]) => redis.sendCommand(args),
  // }),
});

// Auction bidding limiter - 10 requests per minute per user (tightened for security)
export const biddingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 bids per minute
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return (req as any).user?.id || req.ip;
  },
  message: {
    error: 'Too many bidding attempts, please slow down.',
    retryAfter: 60 // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(`Bidding rate limit exceeded for: ${identifier} on ${req.path}`, {
      identifier,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Too many bidding attempts, please slow down.',
      retryAfter: 60
    });
  },
  // store: new RedisStore({
  //   sendCommand: (...args: string[]) => redis.sendCommand(args),
  // }),
});

// Upload limiter - 10 requests per hour per user
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 uploads per hour
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return (req as any).user?.id || req.ip;
  },
  message: {
    error: 'Too many upload attempts, please try again later.',
    retryAfter: 60 * 60 // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(`Upload rate limit exceeded for: ${identifier} on ${req.path}`, {
      identifier,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Too many upload attempts, please try again later.',
      retryAfter: 60 * 60
    });
  },
  // }),
});

// Webhook limiter - 60 requests per minute per IP (allowing for high volume if needed but preventing flood)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 60, 
  message: {
    error: 'Too many webhook requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Webhook rate limit exceeded for IP: ${req.ip} on ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      error: 'Too many webhook requests, please try again later.',
      retryAfter: 60
    });
  },
});

// Trusted IPs whitelist (optional)
const TRUSTED_IPS = [
  '127.0.0.1',
  '::1',
  // Add your trusted IPs here
];

// Middleware to skip rate limiting for trusted IPs
export const skipTrustedIPs = (req: Request): boolean => {
  const clientIP = req.ip || req.connection.remoteAddress;
  return TRUSTED_IPS.includes(clientIP as string);
};

// Global limiter with trusted IP skip
export const globalLimiterWithSkip = rateLimit({
  ...globalLimiter,
  skip: skipTrustedIPs,
});

// Simple in-memory rate limiter for WebSocket/Stateful limits
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Rate limiter for bids: 10 bids per 60 seconds per user per auction (synchronized with HTTP endpoint)
export const bidRateLimiterInstance = new RateLimiter(60 * 1000, 10);

// Rate limiter for general WebSocket: 100 messages per 60 seconds per user
export const wsRateLimiter = new RateLimiter(60 * 1000, 100);
