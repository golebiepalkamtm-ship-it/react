import express, {
  type Application,
  Request,
  Response,
  NextFunction,
  type RequestHandler,
} from "express";
import type {
  Request as CoreRequest,
  RequestHandler as CoreRequestHandler,
} from "express-serve-static-core";
import { HealthController } from "./controllers/HealthController.js";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import {
  globalLimiter,
  authLimiter,
  biddingLimiter,
  uploadLimiter,
  webhookLimiter,
} from "./middleware/rateLimiter.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import auctionRoutes from "./routes/auctions.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/upload.js";
import messageRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import notificationRoutes from "./routes/notifications.js";
import reviewRoutes from "./routes/reviews.js";
import paymentRoutes, { stripeWebhookHandler } from "./routes/payments.js";
import proxyRoutes from "./routes/proxy.js";
import { testCSRFEndpoint } from "./routes/testCSRF.js";
import metricsRoutes from "./routes/metrics.js";
import timeRoutes from "./routes/time.js"; // Added time sync route
import { csrfSync } from "csrf-sync";
import session from "express-session";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/auth.js";
import { cspMiddleware } from "./middleware/csp.js";
import { validatedEnv } from "./lib/env.js";
import { getCorsOptions, getAllowedOrigins } from "./lib/originUtils.js";
import AuctionCronService from "./services/AuctionCronService.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { prisma } from "./lib/db.js";

import { RedisStore } from "connect-redis";
import redisClient from "./lib/redis.js";

let sessionStore;
if (redisClient) {
  sessionStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
  });
} else {
  // Only warn in production if Redis is missing
  if (validatedEnv.NODE_ENV === "production") {
    console.warn(
      "⚠️  Redis not configured. Using MemoryStore for sessions (not recommended for production).",
    );
  }
}

const sessionMiddleware = session({
  store: sessionStore,
  secret: validatedEnv.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Recommended false for RedisStore to reduce storage usage for empty sessions
  cookie: {
    secure: validatedEnv.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

const { generateToken, csrfSynchronisedProtection } = csrfSync({
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

const hasBodyProperty = (value: unknown): value is { body: unknown } => {
  return typeof value === "object" && value !== null && "body" in value;
};

const app: Application = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  ...getCorsOptions(),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Request-ID",
  ],
  // Ensure preflight responses use 200 (tests expect 200, not default 204)
  optionsSuccessStatus: 200,
};

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
app.use(requestIdMiddleware);
app.use(compression());
app.use(
  express.json({
    limit: "10mb",
  }),
);
app.use(cspMiddleware);

// Explicit preflight handler for health so tests get 200 (and CORS headers when allowed)
app.options("/api/health", cors(corsOptions), (req, res) => {
  return res.status(200).send("OK");
});

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.post(
  "/api/webhooks/stripe",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      return stripeWebhookHandler(req, res);
    } catch (error) {
      console.error("Stripe webhook handler error:", error);
      return res.status(500).json({ error: "Webhook handler error" });
    }
  },
);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && hasBodyProperty(err)) {
    console.error("Malformed JSON payload:", err);
    return res.status(400).json({ error: "Malformed JSON payload" });
  }
  next(err);
});
app.use(cookieParser());
app.set("trust proxy", 1); // Fix X-Forwarded-For warning
app.use(globalLimiter);

app.use(
  express.static(path.join(__dirname, "../public"), {
    maxAge: "1y", // Cache static assets for 1 year
    setHeaders: (res, filePath) => {
      // No-cache for sourcemaps in production
      if (validatedEnv.NODE_ENV === "production" && filePath.endsWith(".map")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.endsWith(".html")) {
        // HTML files should verify with server
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      } else {
        // Other static assets (images, fonts, scripts) get long cache
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.get("/health", HealthController.liveness);
app.get("/api/health", HealthController.readiness);

app.get("/api", (req, res) => {
  res.json({
    status: "OK",
    name: "champion-pigeon-api",
    timestamp: new Date().toISOString(),
    health: "/api/health",
  });
});

// Endpoint CSRF token
app.use(sessionMiddleware);

app.get("/api/csrf-token", (req, res) => {
  const token = generateToken(req as any);
  res.json({ csrfToken: token });
});

const csrfProtection =
  csrfSynchronisedProtection as unknown as CoreRequestHandler;
const maybeCsrf: RequestHandler = (req, res, next) => {
  // Skip CSRF if Authorization header (Bearer token) is present.
  // Header-based authentication is not vulnerable to CSRF.
  if (req.headers.authorization) {
    return next();
  }

  // Skip CSRF for specific problematic routes or webhooks
  if (
    req.originalUrl.includes("/api/upload") ||
    req.originalUrl.includes("/api/webhooks") ||
    req.originalUrl.includes("/api/admin") ||
    req.originalUrl.includes("/api/users") ||
    req.originalUrl.includes("/api/breeder-meetings") ||
    (req.method === "POST" && req.originalUrl.includes("/api/auctions"))
  ) {
    return next();
  }

  if (validatedEnv.NODE_ENV === "production") {
    return (csrfProtection as any)(req, res, next);
  }
  next();
};

// Public metrics endpoint should not require CSRF; mount before CSRF
app.use("/api/metrics", metricsRoutes);
app.use("/api/time", timeRoutes); // Public time sync endpoint

// Apply CSRF protection for state-changing routes (prod only)
app.use("/api/upload", uploadLimiter, authMiddleware, uploadRoutes);
app.use(maybeCsrf);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/proxy", proxyRoutes);

// Test CSRF endpoint
app.post("/api/test-csrf", testCSRFEndpoint);
app.get("/api/test-csrf", testCSRFEndpoint);

const getLocalDataPath = (filename: string): string => {
  const possiblePaths = [
    path.join(process.cwd(), "server/data", filename),
    path.join(process.cwd(), "data", filename),
    path.join(__dirname, "data", filename),
    path.join(__dirname, "../data", filename),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // Default fallback for error message
  return possiblePaths[0];
};

// API: Breeder Meetings (Get All)
app.get("/api/breeder-meetings", async (req: Request, res: Response) => {
  try {
    // 1. Try DB
    if (prisma) {
      try {
        const dbMeetings = await prisma.meeting.findMany({
          orderBy: { createdAt: "desc" },
        });
        if (dbMeetings.length > 0) {
          return res.json(dbMeetings);
        }
      } catch (dbErr) {
        console.warn(
          "DB fetch for meetings failed, falling back into file",
          dbErr,
        );
      }
    }

    // 2. Fallback to File
    const meetingsPath = getLocalDataPath("meetings.json");
    if (!fs.existsSync(meetingsPath)) {
      // If no DB and no File, return empty array instead of 500
      return res.json([]);
    }

    const meetingsData = await fs.promises.readFile(meetingsPath, "utf-8");
    const meetings = JSON.parse(meetingsData);
    res.json(meetings.meetings || []);
  } catch (error: any) {
    console.error("Error reading meetings data:", error);
    res
      .status(500)
      .json({ error: `Failed to load meetings data: ${error.message}` });
  }
});

// API: Breeder Meetings (Add New)
app.post(
  "/api/breeder-meetings",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!prisma) {
        return res.status(503).json({
          error: "Baza danych jest niedostępna.",
        });
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Brak autoryzacji (brak ID użytkownika)." });
      }

      const { name, location, date, description, images } = req.body;

      if (!name || !location) {
        return res
          .status(400)
          .json({ error: "Nazwa i lokalizacja są wymagane." });
      }

      let parsedDate: Date | null = null;
      if (date) {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: "Nieprawidłowy format daty." });
        }
      }

      // Check if user exists in our DB first (Supabase Auth != Prisma User automatically)
      console.log(`🔍 [Meetings API] Verifying author existence: ${userId}`);
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        console.error(
          `❌ User ${userId} not found in database for meeting creation.`,
        );
        return res.status(403).json({
          error:
            "Twój profil nie został jeszcze zsynchronizowany z bazą danych. Spróbuj się przelogować.",
          details: `User record with ID ${userId} missing in 'users' table.`,
        });
      }
      console.log(`✅ Author verified: ${userExists.email}`);

      console.log("🚀 Creating meeting in database...");
      const newMeeting = await prisma.meeting.create({
        data: {
          name,
          location,
          date: parsedDate,
          description,
          images: Array.isArray(images) ? images : [],
          authorId: userId,
        },
      });
      console.log(`✅ Meeting created successfully: ${newMeeting.id}`);

      res.status(201).json(newMeeting);
    } catch (error: any) {
      console.error("❌ CRITICAL error adding breeder meeting:", error);

      // Detailed error for client
      const details = error?.message || "Unknown error";
      const code = error?.code || "NO_CODE";

      res.status(500).json({
        error: "Nie udało się dodać spotkania.",
        details,
        code,
        message: error.message,
        suggestion:
          code === "P2021"
            ? "Table 'meetings' missing - run migrations."
            : "Sprawdź logi serwera.",
      });
    }
  },
);

// API: References (Get All)
app.get("/api/references", async (req: Request, res: Response) => {
  try {
    // 1. Try DB
    if (prisma) {
      try {
        const dbReferences = await prisma.reference.findMany({
          where: { isApproved: true }, // Filter only approved by default
          orderBy: { createdAt: "desc" },
        });
        if (dbReferences.length > 0) {
          return res.json(dbReferences);
        }
      } catch (dbErr) {
        console.warn(
          "DB fetch for references failed, falling back into file",
          dbErr,
        );
      }
    }

    // 2. Fallback to File
    const referencesPath = getLocalDataPath("references.json");

    if (!fs.existsSync(referencesPath)) {
      return res.json([]);
    }

    const referencesData = await fs.promises.readFile(referencesPath, "utf-8");
    const references = JSON.parse(referencesData);
    // Many versions of references.json use different structures, normalize to array
    const data = Array.isArray(references)
      ? references
      : references.references || [];
    res.json(data);
  } catch (error: any) {
    console.error("Error reading references data:", error);
    res
      .status(500)
      .json({ error: `Failed to load references data: ${error.message}` });
  }
});

app.use(notFound);
app.use(errorHandler);

const auctionCronService = AuctionCronService.getInstance();
// Only start cron in non-test environments to prevent DB errors during tests
if (process.env.NODE_ENV !== "test") {
  try {
    auctionCronService.start();
  } catch (err: any) {
    console.error("Failed to start auction cron:", err);
  }
}

export { getAllowedOrigins as allowedOrigins };
export default app;
