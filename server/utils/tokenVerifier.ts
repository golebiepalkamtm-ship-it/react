import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TokenVerificationResult {
  userId: string;
  email?: string;
  role?: string;
  aud?: string;
  iss?: string;
  exp?: number;
}

export interface TokenVerifierOptions {
  supabaseUrl: string;
  supabaseKey: string;
  supabaseAnonKey?: string;
  cacheTTL?: number;
  rateLimitWindow?: number;
  rateLimitMax?: number;
}

export class TokenVerifier {
  private supabaseUrl: string;
  private supabaseKey: string;
  private cache: Map<string, { data: TokenVerificationResult; expiresAt: number }>;
  private rateLimitMap: Map<string, number[]>;
  private cacheTTL: number;
  private rateLimitWindow: number;
  private rateLimitMax: number;
  private supabaseClient: SupabaseClient;
  private supabaseAnonClient: SupabaseClient | null;

  constructor(options: TokenVerifierOptions) {
    this.supabaseUrl = options.supabaseUrl;
    this.supabaseKey = options.supabaseKey;
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes
    this.rateLimitWindow = options.rateLimitWindow || 60 * 1000; // 1 minute
    this.rateLimitMax = options.rateLimitMax || 100; // 100 requests per minute
    
    this.cache = new Map();
    this.rateLimitMap = new Map();
    
    // Initialize Supabase client
    this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    this.supabaseAnonClient = options.supabaseAnonKey && options.supabaseAnonKey !== this.supabaseKey
      ? createClient(this.supabaseUrl, options.supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      : null;

    // Cleanup expired entries
    const interval = setInterval(() => this.cleanup(), 60000);
    interval.unref?.();
  }

  private cleanup(): void {
    const now = Date.now();
    
    // Clean cache
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    
    // Clean rate limit
    for (const [key, timestamps] of this.rateLimitMap.entries()) {
      const validTimestamps = timestamps.filter(timestamp => now - timestamp < this.rateLimitWindow);
      if (validTimestamps.length === 0) {
        this.rateLimitMap.delete(key);
      } else {
        this.rateLimitMap.set(key, validTimestamps);
      }
    }
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.rateLimitMap.get(identifier) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < this.rateLimitWindow);
    
    if (validTimestamps.length >= this.rateLimitMax) {
      return false;
    }
    
    validTimestamps.push(now);
    this.rateLimitMap.set(identifier, validTimestamps);
    return true;
  }

  private extractTokenInfo(token: string): { aud?: string; iss?: string; exp?: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // base64url decode with padding normalization
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=');
      const payload = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
      return {
        aud: payload.aud,
        iss: payload.iss,
        exp: payload.exp
      };
    } catch {
      return null;
    }
  }

  async verifyToken(token: string, rateLimitKey?: string): Promise<TokenVerificationResult> {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      throw new Error('Invalid token format');
    }

    // Check rate limiting
    if (rateLimitKey && !this.checkRateLimit(rateLimitKey)) {
      throw new Error('Rate limit exceeded');
    }

    // Check cache first
    const cacheKey = `token:${token}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // Extract and validate token claims
    const tokenInfo = this.extractTokenInfo(token);
    if (!tokenInfo) {
      throw new Error('Invalid token format');
    }

    // Check expiration
    if (tokenInfo.exp && Date.now() / 1000 > tokenInfo.exp) {
      throw new Error('Token expired');
    }

    // Validate audience and issuer (must be present)
    const expectedAud = 'authenticated';
    const expectedIss = `${this.supabaseUrl}/auth/v1`;

    if (tokenInfo.aud !== expectedAud) {
      throw new Error('Invalid token audience');
    }

    if (tokenInfo.iss !== expectedIss) {
      throw new Error('Invalid token issuer');
    }

    try {
      const primaryResult = await this.supabaseClient.auth.getUser(token);
      let user = primaryResult.data.user;
      let error = primaryResult.error;
      
      if ((error || !user) && this.supabaseAnonClient) {
        const fallbackResult = await this.supabaseAnonClient.auth.getUser(token);
        user = fallbackResult.data.user;
        error = fallbackResult.error;
      }
      
      if (error || !user) {
        throw new Error('Invalid or expired token');
      }

      const result: TokenVerificationResult = {
        userId: user.id,
        email: user.email,
        aud: tokenInfo.aud,
        iss: tokenInfo.iss,
        exp: tokenInfo.exp
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + this.cacheTTL
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Token verification failed');
    }
  }

  async verifyTokenWithRole(token: string, rateLimitKey?: string): Promise<TokenVerificationResult> {
    const result = await this.verifyToken(token, rateLimitKey);
    
    // Fetch role from database using service key if available
    try {
      const { data: roleData, error } = await this.supabaseClient
        .from('users')
        .select('role')
        .eq('id', result.userId)
        .single();

      if (!error && roleData) {
        result.role = roleData.role;
        // FIX: Persist role in cache so subsequent calls don't lose authorization context
        const cacheKey = `token:${token}`;
        this.cache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + this.cacheTTL
        });
      }
    } catch (error) {
      // Role fetch error shouldn't block authentication
      console.warn('Failed to fetch user role:', error);
    }

    return result;
  }

  invalidateCache(token: string): void {
    const cacheKey = `token:${token}`;
    this.cache.delete(cacheKey);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; rateLimitEntries: number } {
    return {
      size: this.cache.size,
      rateLimitEntries: this.rateLimitMap.size
    };
  }
}

// Global instance
let tokenVerifier: TokenVerifier | null = null;

export function initializeTokenVerifier(options: TokenVerifierOptions): void {
  tokenVerifier = new TokenVerifier(options);
}

export function getTokenVerifier(): TokenVerifier {
  if (!tokenVerifier) {
    throw new Error('TokenVerifier not initialized. Call initializeTokenVerifier first.');
  }
  return tokenVerifier;
}

export async function verifyJWTToken(token: string, rateLimitKey?: string): Promise<TokenVerificationResult> {
  return getTokenVerifier().verifyToken(token, rateLimitKey);
}

export async function verifyJWTTokenWithRole(token: string, rateLimitKey?: string): Promise<TokenVerificationResult> {
  return getTokenVerifier().verifyTokenWithRole(token, rateLimitKey);
}
