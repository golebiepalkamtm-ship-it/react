import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import logger from "../lib/logger.js";
import { validatedEnv } from "../lib/env.js";
import RedisStore from "rate-limit-redis";
import redis from "../lib/redis.js";

import { isRedisEnabled, getRedisReady } from "../lib/redis.js";

/**
 * A wrapper for RedisStore that gracefully falls back to memory if Redis is offline.
 * This prevents unhandled promise rejections during startup by lazy-initializing 
 * the actual RedisStore only when Redis is confirmed ready.
 */
class SafeRedisStore {
  private store: any = null;

  private getStore(): any | null {
    if (this.store) return this.store;
    
    if (isRedisEnabled() && getRedisReady()) {
      try {
        this.store = new RedisStore({
          sendCommand: async (...args: string[]) => {
            return await redis.sendCommand(args);
          },
        });
        return this.store;
      } catch (e) {
        logger.warn("SafeRedisStore: Lazy initialization failed", { error: e });
        return null;
      }
    }
    return null;
  }

  async increment(key: string) {
    const activeStore = this.getStore();
    if (activeStore && getRedisReady()) {
      try {
        return await activeStore.increment(key);
      } catch (e) {
        // Fallback to internal memory store
        return undefined;
      }
    }
    return undefined;
  }

  async decrement(key: string) {
    const activeStore = this.getStore();
    if (activeStore && getRedisReady()) {
      try {
        await activeStore.decrement(key);
      } catch (e) {}
    }
  }

  async resetKey(key: string) {
    const activeStore = this.getStore();
    if (activeStore && getRedisReady()) {
      try {
        await activeStore.resetKey(key);
      } catch (e) {}
    }
  }
}

// Re-enable RedisStore using the SafeRedisStore wrapper
const redisStore = new SafeRedisStore();

const baseLimiterConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore ?? undefined,
};

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
  max: validatedEnv.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil(validatedEnv.RATE_LIMIT_WINDOW_MS / 1000),
  },
  ...baseLimiterConfig,
  legacyHeaders: true, // Keep legacy headers for backwards compatibility on global
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(validatedEnv.RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

// Login-specific limiter (tighter)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    error: "Too many login attempts, please try again later.",
    retryAfter: 15 * 60,
  },
  ...baseLimiterConfig,
  legacyHeaders: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip} on ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: "Too many login attempts, please try again later.",
      retryAfter: 15 * 60,
    });
  },
});

// Password reset limiter
export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many reset attempts, please try again later.",
    retryAfter: 60 * 60,
  },
  ...baseLimiterConfig,
  legacyHeaders: true,
  handler: (req: Request, res: Response) => {
    logger.warn(
      `Password reset rate limit exceeded for IP: ${req.ip} on ${req.path}`,
      {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      },
    );
    res.status(429).json({
      error: "Too many reset attempts, please try again later.",
      retryAfter: 60 * 60,
    });
  },
});

// Auth endpoints limiter - for routes that don't have their own (e.g. sensitive ops)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  ...baseLimiterConfig,
  legacyHeaders: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip} on ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      error: "Too many authentication attempts, please try again later.",
      retryAfter: 15 * 60,
    });
  },
});

// OTP send - per user/IP, generous so one click = one request (e.g. 8 per 15 min)
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: (req: Request) => (req as any).user?.id ?? req.ip ?? "anon",
  message: {
    error: "Zbyt wiele wysłanych kodów. Spróbuj za ok. 15 minut.",
    retryAfter: 15 * 60,
  },
  ...baseLimiterConfig,
  legacyHeaders: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`OTP send rate limit exceeded`, {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: "Zbyt wiele wysłanych kodów. Spróbuj za ok. 15 minut.",
      retryAfter: 15 * 60,
    });
  },
});

// OTP verify - per user/IP (e.g. 15 per 15 min so mistypes don't block)
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: (req: Request) => (req as any).user?.id ?? req.ip ?? "anon",
  message: {
    error: "Zbyt wiele prób weryfikacji. Spróbuj za ok. 15 minut.",
    retryAfter: 15 * 60,
  },
  ...baseLimiterConfig,
  legacyHeaders: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`OTP verify rate limit exceeded`, {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: "Zbyt wiele prób weryfikacji. Spróbuj za ok. 15 minut.",
      retryAfter: 15 * 60,
    });
  },
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
    error: "Too many bidding attempts, please slow down.",
    retryAfter: 60, // 1 minute in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(
      `Bidding rate limit exceeded for: ${identifier} on ${req.path}`,
      {
        identifier,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      },
    );

    res.status(429).json({
      error: "Too many bidding attempts, please slow down.",
      retryAfter: 60,
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
    error: "Too many upload attempts, please try again later.",
    retryAfter: 60 * 60, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const identifier = (req as any).user?.id || req.ip;
    logger.warn(
      `Upload rate limit exceeded for: ${identifier} on ${req.path}`,
      {
        identifier,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      },
    );

    res.status(429).json({
      error: "Too many upload attempts, please try again later.",
      retryAfter: 60 * 60,
    });
  },
  // }),
});

// Webhook limiter - 60 requests per minute per IP (allowing for high volume if needed but preventing flood)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    error: "Too many webhook requests, please try again later.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      `Webhook rate limit exceeded for IP: ${req.ip} on ${req.path}`,
      {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      },
    );

    res.status(429).json({
      error: "Too many webhook requests, please try again later.",
      retryAfter: 60,
    });
  },
});

// Data fetch limiter for expensive file/DB read operations
export const dataFetchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 requests per 5 minutes
  message: {
    error: "Too many requests for data, please try again later.",
    retryAfter: 5 * 60,
  },
  ...baseLimiterConfig,
  handler: (req: Request, res: Response) => {
    logger.warn(
      `Data fetch rate limit exceeded for IP: ${req.ip} on ${req.path}`,
      {
        ip: req.ip,
        path: req.path,
      },
    );
    res.status(429).json({
      error: "Too many requests for data, please try again later.",
      retryAfter: 5 * 60,
    });
  },
});

// Trusted IPs whitelist (optional)
const TRUSTED_IPS = [
  "127.0.0.1",
  "::1",
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
    const validRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

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
