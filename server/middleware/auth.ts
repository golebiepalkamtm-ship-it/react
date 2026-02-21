import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/db.js";
import {
  TokenVerifier,
  initializeTokenVerifier,
  getTokenVerifier as getGlobalTokenVerifier,
} from "../utils/tokenVerifier.js";
import { calculateRole, UserWithVerifications } from "../types/roles.js";
import { validatedEnv } from "../lib/env.js";
import jwt from "jsonwebtoken";

let tokenVerifier: TokenVerifier | null = null;

export const initializeAuth = () => {
  const supabaseUrl = validatedEnv.SUPABASE_URL;
  const supabaseAnonKey = validatedEnv.SUPABASE_ANON_KEY;
  const supabaseServiceKey = validatedEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
    console.error("Supabase environment variables missing");
    throw new Error("Auth service not configured");
  }

  initializeTokenVerifier({
    supabaseUrl: validatedEnv.SUPABASE_URL,
    supabaseKey: validatedEnv.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey: validatedEnv.SUPABASE_ANON_KEY,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
  tokenVerifier = getGlobalTokenVerifier();
};

export const getTokenVerifier = () => {
  if (!tokenVerifier) {
    throw new Error("TokenVerifier not initialized");
  }
  return tokenVerifier;
};

export interface AuthenticatedRequest extends Request {
  user?: { id: string; uid?: string; email?: string; role?: string };
  authToken?: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("🔐 [Auth Middleware] Request to:", req.path);

    if (
      validatedEnv.NODE_ENV !== "production" &&
      req.headers["x-test-bypass-auth"] === "true"
    ) {
      console.log("⚠️  [Auth Middleware] Test bypass enabled");
      req.user = {
        id: "test-user",
        role: "admin",
        email: "test@local.dev",
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    console.log(
      "📝 [Auth Middleware] Authorization header:",
      authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : "MISSING",
    );

    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      console.error("❌ [Auth Middleware] No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    req.authToken = token;

    // Use shared token verifier with rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";
    const rateLimitKey = `auth:${clientIP}`;

    console.log("🔍 [Auth Middleware] Verifying token for IP:", clientIP);

    // In non-production, allow local JWT verification using test secret to avoid Supabase dependency during tests
    if (validatedEnv.NODE_ENV !== "production") {
      try {
        const decoded = jwt.verify(token, validatedEnv.JWT_SECRET) as jwt.JwtPayload;
        req.user = {
          id: (decoded.sub as string) || (decoded.id as string) || "test-user",
          email: (decoded.email as string) || "test@local.dev",
          role: ((decoded.role as string) || "USER").toUpperCase(),
        };
        console.log("✅ [Auth Middleware] Test token verified locally");
        return next();
      } catch (err) {
        console.error("❌ [Auth Middleware] Local test token verification failed:", err);
      }
    }

    const tokenVerifier = getTokenVerifier();
    const verificationResult = await tokenVerifier.verifyTokenWithRole(
      token,
      rateLimitKey,
    );

    // Force superadmin role for specific email
    const finalRole =
      verificationResult.email === "superadmin@palkamtm.pl"
        ? "ADMIN"
        : verificationResult.role;

    console.log("✅ [Auth Middleware] Token verified:", {
      userId: verificationResult.userId,
      email: verificationResult.email,
      role: finalRole,
    });

    req.user = {
      id: verificationResult.userId,
      email: verificationResult.email,
      role: finalRole,
    };

    next();
  } catch (error) {
    console.error("❌ [Auth Middleware] Error:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : error,
    );
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return res.status(429).json({ error: "Too many requests" });
    }
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
