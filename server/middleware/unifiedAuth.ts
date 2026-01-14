import { Request, Response, NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import { verifyJWTTokenWithRole, getTokenVerifier, TokenVerificationResult } from '../utils/tokenVerifier.js';
import { cache } from '../lib/cache.js';
import { validatedEnv } from '../lib/env.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenVerificationResult;
  authToken?: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    user: TokenVerificationResult;
  };
}

// Cache keys
const CACHE_KEYS = {
  USER_SESSION: (userId: string) => `session:${userId}`,
  USER_ROLE: (userId: string) => `role:${userId}`,
  AUTH_RATE_LIMIT: (identifier: string) => `auth_rate:${identifier}`,
};

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  SESSION: 5 * 60 * 1000, // 5 minutes
  ROLE: 10 * 60 * 1000, // 10 minutes
  RATE_LIMIT: 60 * 1000, // 1 minute
};

class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private readonly maxAuthAttempts: number;
  private readonly authLockoutDuration: number;

  private constructor() {
    this.maxAuthAttempts = validatedEnv.RATE_LIMIT_MAX_REQUESTS;
    this.authLockoutDuration = validatedEnv.RATE_LIMIT_WINDOW_MS;
  }

  static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  // Rate limiting with progressive backoff
  private checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const rateLimitKey = CACHE_KEYS.AUTH_RATE_LIMIT(identifier);
    const attempts = cache.get<number[]>(rateLimitKey) || [];
    const now = Date.now();

    // Clean old attempts
    const validAttempts = attempts.filter(timestamp => now - timestamp < this.authLockoutDuration);
    
    if (validAttempts.length >= this.maxAuthAttempts) {
      const oldestAttempt = validAttempts[0];
      const retryAfter = Math.ceil((oldestAttempt + this.authLockoutDuration - now) / 1000);
      return { allowed: false, retryAfter };
    }

    validAttempts.push(now);
    cache.set(rateLimitKey, validAttempts, this.authLockoutDuration);
    return { allowed: true };
  }

  // Enhanced token verification with caching
  async verifyToken(token: string, clientIP: string): Promise<TokenVerificationResult> {
    // Rate limiting check
    const rateLimitResult = this.checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds`);
    }

    // Check cache first
    const cacheKey = `token:${Buffer.from(token).toString('base64').substring(0, 32)}`;
    const cached = cache.get<TokenVerificationResult>(cacheKey);
    if (cached) {
      // Update user role cache if needed
      await this.updateUserRoleCache(cached.userId);
      return cached;
    }

    // Verify token with shared service
    const result = await verifyJWTTokenWithRole(token, `auth_verify:${clientIP}`);
    
    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.SESSION);
    
    // Cache user session
    cache.set(CACHE_KEYS.USER_SESSION(result.userId), result, CACHE_TTL.SESSION);
    cache.set(CACHE_KEYS.USER_ROLE(result.userId), result.role, CACHE_TTL.ROLE);

    return result;
  }

  // Update role cache if needed
  private async updateUserRoleCache(userId: string): Promise<void> {
    try {
      const cachedRole = cache.get<string>(CACHE_KEYS.USER_ROLE(userId));
      const verifier = getTokenVerifier();
      
      // Only refresh if cache is old or missing
      if (!cachedRole) {
        const tokenVerifier = verifier as any;
        if (tokenVerifier.verifyTokenWithRole) {
          const result = await tokenVerifier.verifyTokenWithRole('dummy', `role_refresh:${userId}`);
          if (result.userId === userId && result.role) {
            cache.set(CACHE_KEYS.USER_ROLE(userId), result.role, CACHE_TTL.ROLE);
          }
        }
      }
    } catch (error) {
      // Don't let role refresh errors block authentication
      console.warn('Failed to refresh user role:', error);
    }
  }

  // Invalidate user cache (for logout/role changes)
  invalidateUserCache(userId: string): void {
    cache.delete(CACHE_KEYS.USER_SESSION(userId));
    cache.delete(CACHE_KEYS.USER_ROLE(userId));
    
    // Invalidate token cache by pattern (simplified)
    const tokenPattern = new RegExp(`token:[a-zA-Z0-9+/=]{32}`);
    // Note: In a production environment, you'd want to maintain a reverse index
    // of userId -> token keys for efficient invalidation
  }

  // Get user from cache or database
  async getUserFromCache(userId: string): Promise<TokenVerificationResult | null> {
    const cached = cache.get<TokenVerificationResult>(CACHE_KEYS.USER_SESSION(userId));
    if (cached) {
      return cached;
    }
    return null;
  }

  // Check if user has required role
  async hasRole(userId: string, requiredRoles: string[]): Promise<boolean> {
    const user = await this.getUserFromCache(userId);
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  }
}

// Express middleware
export const unifiedAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const auth = UnifiedAuthService.getInstance();
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const user = await auth.verifyToken(token, clientIP);
    
    req.user = user;
    req.authToken = token;
    
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({ 
        error: error.message,
        retryAfter: error.message.match(/(\d+) seconds/)?.[1] || '60'
      });
    }
    
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Socket.IO middleware
export const unifiedSocketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const auth = UnifiedAuthService.getInstance();
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('No token provided'));
    }

    const clientIP = (socket.handshake.address as string) || (socket.handshake.headers['x-forwarded-for'] as string) || 'unknown';
    const user = await auth.verifyToken(token, `ws_auth:${clientIP}`);
    
    (socket as AuthenticatedSocket).data = {
      userId: user.userId,
      user
    };
    
    next();
  } catch (error: any) {
    console.error('Socket auth error:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      return next(new Error('Connection rate limit exceeded'));
    }
    
    next(new Error('Invalid or expired token'));
  }
};

// Role-based access control middleware
export const requireRole = (requiredRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const auth = UnifiedAuthService.getInstance();
      const hasRequiredRole = await auth.hasRole(req.user.userId, requiredRoles);
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredRoles,
          current: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// Rate limiting middleware for sensitive operations
export const sensitiveOperationRateLimit = (maxRequests: number = 5, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const auth = UnifiedAuthService.getInstance();
    const rateLimitKey = `sensitive:${req.user.userId}`;
    const rateLimitResult = (auth as any).checkRateLimit(rateLimitKey);
    
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ 
        error: 'Too many sensitive operations',
        retryAfter: rateLimitResult.retryAfter
      });
    }
    
    next();
  };
};

export default UnifiedAuthService;
