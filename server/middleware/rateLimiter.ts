import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../lib/logger.js';

// Redis store (optional - uncomment if you have Redis)
// import RedisStore from 'rate-limit-redis';
// import redis from '../lib/redis.js';

// Global rate limiter - 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
  legacyHeaders: false,
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

// Auction bidding limiter - 30 requests per minute per user
export const biddingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 bids per minute
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
  // store: new RedisStore({
  //   sendCommand: (...args: string[]) => redis.sendCommand(args),
  // }),
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
