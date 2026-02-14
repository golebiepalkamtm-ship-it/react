import express, {
  type Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { prisma } from "../lib/db.js";
import { createClient } from "@supabase/supabase-js";
import { cache } from "../lib/cache.js";
import { validatedEnv } from "../lib/env.js";
import { rateLimit } from "express-rate-limit";
import { auctionService } from "../services/AuctionService.js";
import { userService } from "../services/UserService.js";
import { auditService } from "../services/AuditService.js";
import {
  UserRoleUpdateBodySchema,
  UserUpdateSchema,
  AuctionCreateSchema,
  AuctionUpdateSchema,
  UserCreateSchema,
} from "../validations/adminSchemas.js";
import { z } from "zod";

const router: Router = express.Router();

// Initialize Supabase Admin Client if credentials exist
const supabaseAdmin =
  validatedEnv.SUPABASE_URL && validatedEnv.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        validatedEnv.SUPABASE_URL,
        validatedEnv.SUPABASE_SERVICE_ROLE_KEY,
      )
    : null;

// Standard limiter for read operations
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many read requests, please try again later." },
  keyGenerator: (req) => (req as any).user?.id || req.ip || "unknown", // Limit by User ID if available
});

// Stricter limiter for mutations (write operations)
const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Stricter limit for critical actions
  message: { error: "Too many modification requests, please try again later." },
  keyGenerator: (req) => (req as any).user?.id || req.ip || "unknown",
});

// Apply read limiter globally to router, override for mutations
router.use(readLimiter);

// Custom Request type to include user information
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

/**
 * Middleware: ensure authenticated user is admin
 */
async function ensureAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    // Use specific select for efficiency and security
    const user = await prisma!.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (err) {
    console.error("ensureAdmin error:", err);
    res.status(500).json({ error: "Server error during admin verification" });
  }
}

/**
 * Helper to log mutations
 */
async function logAdminAction(
  req: AuthenticatedRequest,
  action: string,
  targetType: "USER" | "AUCTION" | "SYSTEM",
  targetId?: string,
  details?: any,
) {
  const actorId = req.user?.id;
  if (!actorId) return;

  await auditService.log({
    action,
    actorId,
    targetId,
    targetType,
    details,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  });
}

/**
 * Pobiera statystyki systemowe
 */
router.get("/stats", ensureAdmin, async (req: Request, res: Response) => {
  try {
    if (!prisma) throw new Error("Database not initialized");

    const totalUsers = await prisma.user.count();
    const activeAuctions = await prisma.auction.count({
      where: { status: "ACTIVE" },
    });
    const totalAuctions = await prisma.auction.count();

    const volumeAggregate = await prisma.auction.aggregate({
      _sum: {
        currentPrice: true,
      },
    });

    const totalVolume = Number(volumeAggregate._sum.currentPrice || 0);

    res.json({
      totalUsers,
      activeAuctions,
      totalAuctions,
      totalVolume,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Lista użytkowników z paginacją - Optimized selection
 */
router.get("/users", ensureAdmin, async (req: Request, res: Response) => {
  try {
    if (!prisma) throw new Error("Database not initialized");

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) || "20")),
    ); // Strictly clamped 1-100
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        first_name: true,
        last_name: true,
        role: true,
        username: true,
        createdAt: true,
        isBlocked: true,
        isBanned: true,
        trustScore: true,
        // PII minimization: removed phone, address etc. unless needed.
      },
    });

    const total = await prisma.user.count();

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Zarządzanie aukcjami (lista wszystkich) - Optimized selection
 */
router.get("/auctions", ensureAdmin, async (req: Request, res: Response) => {
  try {
    if (!prisma) throw new Error("Database not initialized");

    // Also paginate auctions if not already
    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) || "20")),
    );
    const skip = (page - 1) * limit;

    const auctions = await prisma.auction.findMany({
      skip,
      take: limit,
      include: {
        seller: {
          select: {
            // Minimal seller info
            id: true,
            username: true,
            email: true, // Admin needs email usually
            first_name: true,
            last_name: true,
          },
        },
        bids: {
          orderBy: { createdAt: "desc" },
          take: 1, // Only top bid
          select: {
            amount: true,
            createdAt: true,
            bidder: {
              select: {
                id: true,
                username: true,
                email: true, // Admin might need checking who is winning
              },
            },
          },
        },
        _count: {
          select: {
            bids: true,
            watchlist: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.auction.count();

    res.json({
      data: auctions,
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Admin auctions error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Zmiana roli użytkownika
 */
router.put(
  "/users/:id/role",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");

      const { id } = req.params;

      const validation = UserRoleUpdateBodySchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ error: "Invalid role", details: validation.error.errors });
      }
      const { role } = validation.data;

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
      });

      await logAdminAction(req, "UPDATE_ROLE", "USER", id, { newRole: role });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Akcje na aukcjach
 */
router.post(
  "/auctions/:id/:action",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, action } = req.params;

      // Validate Action Enum
      const validActions = ["end", "delete", "cancel"];
      if (!validActions.includes(action)) {
        return res
          .status(400)
          .json({
            error: `Invalid action. Must be one of: ${validActions.join(", ")}`,
          });
      }

      if (action === "end") {
        const updated = await auctionService.adminEndAuction(id);
        await logAdminAction(req, "END_AUCTION", "AUCTION", id);
        return res.json(updated);
      }

      if (action === "delete") {
        await auctionService.adminDeleteAuction(id);
        await logAdminAction(req, "DELETE_AUCTION", "AUCTION", id);
        return res.json({ success: true });
      }

      if (action === "cancel") {
        const updated = await auctionService.adminCancelAuction(id);
        await logAdminAction(req, "CANCEL_AUCTION", "AUCTION", id);
        return res.json(updated);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Update user details
 */
router.patch(
  "/users/:id",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const validation = UserUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({
            error: "Invalid user data",
            details: validation.error.errors,
          });
      }

      const updated = await userService.updateUser(id, validation.data);

      await logAdminAction(req, "UPDATE_USER", "USER", id, validation.data);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Delete user
 */
router.delete(
  "/users/:id",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      await logAdminAction(req, "DELETE_USER", "USER", id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Update auction
 */
router.patch(
  "/auctions/:id",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const validation = AuctionUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({
            error: "Invalid auction data",
            details: validation.error.errors,
          });
      }

      const {
        title,
        description,
        startingPrice,
        buyNowPrice,
        reservePrice,
        status,
        endTime,
      } = validation.data;

      // Direct update via Prisma with manual cache invalidation
      if (!prisma) throw new Error("Database not initialized");

      const result = await prisma.auction.update({
        where: { id },
        data: {
          title,
          description,
          startingPrice,
          buyNowPrice: buyNowPrice || null,
          reservePrice,
          status,
          endTime: endTime ? new Date(endTime) : undefined,
        },
      });

      cache.invalidateAuctionCache(id);

      await logAdminAction(
        req,
        "UPDATE_AUCTION",
        "AUCTION",
        id,
        validation.data,
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Delete auction
 */
router.delete(
  "/auctions/:id",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await auctionService.adminDeleteAuction(id);
      await logAdminAction(req, "DELETE_AUCTION", "AUCTION", id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Create new user
 */
router.post(
  "/users",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");
      if (!supabaseAdmin) {
        return res
          .status(500)
          .json({ error: "Supabase Admin not configured on server" });
      }

      const validation = UserCreateSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({
            error: "Validation Error",
            details: validation.error.errors,
          });
      }

      const { email, password, first_name, last_name, role, phone, username } =
        validation.data;

      // Saga / Compensation Logic
      let authUser: any = null;

      // 1. Create in Supabase Auth
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { first_name, last_name },
        });
        if (error) throw error;
        authUser = data.user;
      } catch (authError: any) {
        const alreadyExists = authError?.message
          ?.toLowerCase()
          .includes("already been registered");
        const statusCode = alreadyExists ? 409 : (authError?.status ?? 500);
        return res.status(statusCode).json({ error: authError.message });
      }

      if (!authUser) {
        return res.status(500).json({ error: "Failed to create auth user" });
      }

      // 2. Create/Update in Public Schema with Compensation
      try {
        const newUser = await prisma.user.upsert({
          where: { id: authUser.id },
          update: {
            email,
            first_name,
            last_name,
            role: role || "USER_REGISTERED",
            phone,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            username,
          },
          create: {
            id: authUser.id,
            email,
            first_name,
            last_name,
            role: role || "USER_REGISTERED",
            phone,
            trustScore: 0,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            username,
          },
        });

        await logAdminAction(req, "CREATE_USER", "USER", newUser.id, {
          email,
          role,
        });
        return res.json(newUser);
      } catch (dbError: any) {
        console.error(
          "Prisma Create User Error. Compensating by deleting Supabase user...",
          dbError,
        );
        // Compensation: Delete the user from Supabase to maintain consistency
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
          console.log("Compensation successful: Supabase user deleted.");
        } catch (compError) {
          console.error(
            "CRITICAL: Compensation failed. Orphaned Supabase user:",
            authUser.id,
            compError,
          );
          // In a real system, we might push this to a dead-letter queue
        }

        return res
          .status(500)
          .json({ error: "Database creation failed, rolled back auth user." });
      }
    } catch (error: any) {
      console.error("Create User Error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Create new auction
 */
router.post(
  "/auctions",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");

      const validation = AuctionCreateSchema.safeParse(req.body);
      if (!validation.success) {
        return res
          .status(400)
          .json({
            error: "Validation Error",
            details: validation.error.errors,
          });
      }

      const {
        title,
        description,
        startingPrice,
        buyNowPrice,
        reservePrice,
        status,
        endTime,
        sellerId,
        category,
        sex,
        minBidIncrement,
      } = validation.data;

      let finalSellerId = sellerId;
      if (finalSellerId) {
        const userExists = await prisma.user.findUnique({
          where: { id: finalSellerId },
        });
        if (!userExists)
          return res
            .status(400)
            .json({ error: "Provided sellerId does not exist" });
      } else {
        finalSellerId = req.user?.id;
      }

      if (!finalSellerId) {
        return res.status(400).json({ error: "Seller ID is required" });
      }

      const newAuction = await prisma.auction.create({
        data: {
          title,
          description,
          startingPrice: startingPrice || 0,
          currentPrice: startingPrice || 0,
          buyNowPrice: buyNowPrice || null,
          reservePrice,
          status: status || "ACTIVE",
          endTime: endTime ? new Date(endTime) : null,
          category: category || "RACING",
          sellerId: finalSellerId,
          minBidIncrement: minBidIncrement || 100,
          gender: sex || "MALE",
        },
      });

      cache.invalidateAuctionCache(newAuction.id); // Invalidate new auction related lists
      // Actually we should invalidate lists generally.
      cache.invalidateResource("auctions"); // Invalidate all auctions lists

      await logAdminAction(req, "CREATE_AUCTION", "AUCTION", newAuction.id, {
        title,
        status,
      });

      res.json(newAuction);
    } catch (error: any) {
      console.error("Create Auction Error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
