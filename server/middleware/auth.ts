import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db.js';
import { TokenVerifier } from '../utils/tokenVerifier.js';
import { calculateRole, UserWithVerifications } from '../types/roles.js';
import { validatedEnv } from '../lib/env.js';

let tokenVerifier: TokenVerifier | null = null;

export const initializeAuth = () => {
  const supabaseUrl = validatedEnv.SUPABASE_URL;
  const supabaseAnonKey = validatedEnv.SUPABASE_ANON_KEY;
  const supabaseServiceKey = validatedEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
    console.error('Supabase environment variables missing');
    throw new Error('Auth service not configured');
  }

  tokenVerifier = new TokenVerifier({
    supabaseUrl: validatedEnv.SUPABASE_URL,
    supabaseKey: validatedEnv.SUPABASE_SERVICE_ROLE_KEY,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
};

export const getTokenVerifier = () => {
  if (!tokenVerifier) {
    throw new Error('TokenVerifier not initialized');
  }
  return tokenVerifier;
};

export interface AuthenticatedRequest extends Request {
  user?: { id: string; uid?: string; email?: string; role?: string };
  authToken?: string;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    req.authToken = token;

    // Use shared token verifier with rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `auth:${clientIP}`;
    
    const tokenVerifier = getTokenVerifier();
    const verificationResult = await tokenVerifier.verifyTokenWithRole(token, rateLimitKey);
    
    req.user = {
      id: verificationResult.userId,
      email: verificationResult.email,
      role: verificationResult.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return res.status(429).json({ error: 'Too many requests' });
    }
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};