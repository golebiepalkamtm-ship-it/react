import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; uid?: string; email?: string; role?: string };
  authToken?: string;
}

function getJwtSecret(): string | null {
  return process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || null;
}

function getBearerToken(req: Request): string | null {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  return token ? token : null;
}

function verifySupabaseJwt(token: string) {
  const secret = getJwtSecret();
  if (!secret) return null;
  const payload = jwt.verify(token, secret) as any;
  const id = String(payload?.sub || payload?.user_id || payload?.id || '');
  if (!id) return null;
  return {
    id,
    uid: id,
    email: payload?.email ? String(payload.email) : undefined,
    role: payload?.role ? String(payload.role) : undefined,
    raw: payload,
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    req.authToken = token;

    const local = verifySupabaseJwt(token);
    if (local) {
      req.user = { id: local.id, uid: local.uid, email: local.email, role: local.role };
      return next();
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const apiKey = supabaseAnonKey || supabaseServiceKey;
    if (!supabaseUrl || !apiKey) {
      console.error('Supabase environment variables missing');
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apiKey,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await response.json();
    req.user = user;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('jwt expired') || message.includes('invalid signature') || message.includes('jwt malformed')) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
