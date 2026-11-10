import { Request, Response, NextFunction } from "express";
import {
  TokenVerifier,
  initializeTokenVerifier,
  getTokenVerifier as getGlobalTokenVerifier,
} from "../utils/tokenVerifier.js";
import { validatedEnv } from "../lib/env.js";
import { ACCOUNT_SUSPENDED_ERROR } from "../utils/accountStatus.js";
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

type AuthOutcome =
  | { ok: true }
  | { ok: false; status: number; error: string; code?: string };

/**
 * Resolves the caller from the Authorization header and fills req.user.
 * Shared by the strict middleware and the optional one.
 */
async function authenticate(
  req: AuthenticatedRequest,
  options: { verbose: boolean },
): Promise<AuthOutcome> {
  const log: (...args: unknown[]) => void = options.verbose
    ? console.log
    : () => {};
  const logError: (...args: unknown[]) => void = options.verbose
    ? console.error
    : () => {};

  try {
    log("🔐 [Auth Middleware] Request to:", req.path);

    // Automated tests only. Deliberately not "anything but production": a
    // deployment that forgets NODE_ENV must not accept a header as an admin login.
    if (
      validatedEnv.NODE_ENV === "test" &&
      req.headers["x-test-bypass-auth"] === "true"
    ) {
      log("⚠️  [Auth Middleware] Test bypass enabled");
      req.user = {
        id: "test-user",
        role: "admin",
        email: "test@local.dev",
      };
      return { ok: true };
    }

    // Logs here carry the user id only: no token fragments, no e-mail addresses.
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      logError("❌ [Auth Middleware] No token provided");
      return { ok: false, status: 401, error: "No token provided" };
    }

    req.authToken = token;

    // Use shared token verifier with rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";
    const rateLimitKey = `auth:${clientIP}`;

    log("🔍 [Auth Middleware] Verifying token for IP:", clientIP);

    // In non-production, allow local JWT verification using test secret to avoid Supabase dependency during tests
    if (validatedEnv.NODE_ENV !== "production") {
      try {
        const decoded = jwt.verify(token, validatedEnv.JWT_SECRET) as jwt.JwtPayload;
        req.user = {
          id: (decoded.sub as string) || (decoded.id as string) || "test-user",
          email: (decoded.email as string) || "test@local.dev",
          role: ((decoded.role as string) || "USER").toUpperCase(),
        };
        log("✅ [Auth Middleware] Test token verified locally");
        return { ok: true };
      } catch (err) {
        logError("❌ [Auth Middleware] Local test token verification failed:", err);
      }
    }

    const verificationResult = await getTokenVerifier().verifyTokenWithRole(
      token,
      rateLimitKey,
    );

    // A ban or block set by an admin closes the whole authenticated API
    if (verificationResult.suspended) {
      logError(
        "❌ [Auth Middleware] Suspended account rejected:",
        verificationResult.userId,
      );
      return {
        ok: false,
        status: 403,
        error: ACCOUNT_SUSPENDED_ERROR,
        code: "ACCOUNT_SUSPENDED",
      };
    }

    // The role comes from the users table only — no account is an admin by
    // virtue of its e-mail address.
    log("✅ [Auth Middleware] Token verified:", {
      userId: verificationResult.userId,
      role: verificationResult.role,
    });

    req.user = {
      id: verificationResult.userId,
      email: verificationResult.email,
      role: verificationResult.role,
    };

    return { ok: true };
  } catch (error) {
    logError("❌ [Auth Middleware] Error:", error);
    logError(
      "Error details:",
      error instanceof Error ? error.message : error,
    );
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return { ok: false, status: 429, error: "Too many requests" };
    }
    return { ok: false, status: 401, error: "Invalid or expired token" };
  }
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const outcome = await authenticate(req, { verbose: true });
  if (outcome.ok) return next();
  return res.status(outcome.status).json({
    error: outcome.error,
    ...(outcome.code ? { code: outcome.code } : {}),
  });
};

/**
 * For public routes that show more to a signed-in viewer. A missing, expired or
 * otherwise unusable token never fails the request — the caller is simply
 * treated as anonymous.
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  if (req.headers.authorization) {
    const outcome = await authenticate(req, { verbose: false });
    if (!outcome.ok) {
      delete req.user;
      delete req.authToken;
    }
  }
  next();
};
