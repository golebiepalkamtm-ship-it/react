import express, {
  type Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { prisma, supabase } from "../lib/db.js";
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
import { getIO } from "../lib/socket.js";
import {
  serializeAuction,
  detailAuctionInclude,
} from "../utils/auctionSerializer.js";
import { validate } from "../middleware/validation.js";

const router: Router = express.Router();

// Supabase client is imported from ../lib/db.js

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
    email?: string;
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
    if (!userId) {
      console.warn("❌ [ensureAdmin] No userId in req.user");
      return res.status(401).json({ error: "Unauthenticated" });
    }

    // Use specific select for efficiency and security
    const user = await prisma!.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (!user) {
      console.warn(
        `❌ [ensureAdmin] User ${userId} not found in database (checked email: ${req.user?.email})`,
      );
      return res.status(403).json({ error: "Admin access required" });
    }

    if (user.role !== "ADMIN" && user.email !== "superadmin@palkamtm.pl") {
      console.warn(
        `❌ [ensureAdmin] User ${user.email} (${userId}) has role ${user.role}, not ADMIN`,
      );
      return res.status(403).json({ error: "Admin access required" });
    }

    console.log(`✅ [ensureAdmin] Admin verified: ${user.email}`);
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
  targetType: "USER" | "AUCTION" | "SYSTEM" | "PAYMENT" | "OTHER",
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
 * Lightweight metrics endpoint (alias for monitoring/health)
 */
router.get("/metrics", ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Keep minimal to avoid heavy DB usage; reuse cache stats if available
    res.json({
      status: "ok",
      cacheKeys: cache
        ? (Object.keys(await cache.keys?.())?.length ?? undefined)
        : undefined,
    });
  } catch (error: any) {
    console.error("Metrics fetch error:", error);
    res.status(500).json({ error: error.message || "Failed to load metrics" });
  }
});

/**
 * Pobiera statystyki systemowe
 */
router.get("/stats", ensureAdmin, async (req: Request, res: Response) => {
  try {
    if (!prisma) throw new Error("Database not initialized");

    console.log("📊 [Admin API] Fetching stats...");

    const [
      totalUsers,
      activeAuctions,
      totalAuctions,
      volumeAggregate,
      usersByRole,
      auctionsByStatus,
      auctionsByCategory,
      topSellers,
      topBidders,
      paymentsSummary,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.auction.count({ where: { status: "ACTIVE" } }),
      prisma.auction.count(),
      prisma.auction.aggregate({
        _sum: { currentPrice: true },
        _avg: { currentPrice: true },
      }),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.auction.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.auction.groupBy({ by: ["category"], _count: { id: true } }),
      // Top sellers by volume
      prisma.auction.groupBy({
        by: ["sellerId"],
        _sum: { currentPrice: true },
        _count: { id: true },
        orderBy: { _sum: { currentPrice: "desc" } },
        take: 5,
        where: { status: "ENDED" },
      }),
      // Top bidders by volume
      prisma.bid.groupBy({
        by: ["bidderId"],
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      // Payment summary
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "SUCCEEDED" },
      }),
    ]);

    // Fetch names for top sellers/bidders since groupBy doesn't support includes
    const sellerIds = topSellers
      .map((s) => s.sellerId)
      .filter(Boolean) as string[];
    const bidderIds = topBidders
      .map((b) => b.bidderId)
      .filter(Boolean) as string[];

    const [sellers, bidders] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, first_name: true, last_name: true, email: true },
      }),
      prisma.user.findMany({
        where: { id: { in: bidderIds } },
        select: { id: true, first_name: true, last_name: true, email: true },
      }),
    ]);

    const sellerMap = Object.fromEntries(sellers.map((s) => [s.id, s]));
    const bidderMap = Object.fromEntries(bidders.map((b) => [b.id, b]));

    const enrichedTopSellers = topSellers.map((s) => ({
      ...s,
      user: s.sellerId ? sellerMap[s.sellerId] : null,
    }));

    const enrichedTopBidders = topBidders.map((b) => ({
      ...b,
      user: b.bidderId ? bidderMap[b.bidderId] : null,
    }));

    let analytics = {
      totalPageViews: 0,
      visitsByPath: [] as { path: string; count: number }[],
      recentVisits: [] as unknown[],
    };
    try {
      const [totalPageViews, pageViewsByPath, recentVisits] = await Promise.all([
        prisma.pageView.count(),
        prisma.pageView.groupBy({
          by: ["path"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 20,
        }),
        prisma.pageView.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            path: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
        }),
      ]);
      analytics = {
        totalPageViews,
        visitsByPath: pageViewsByPath.map((p) => ({
          path: p.path,
          count: p._count.id,
        })),
        recentVisits,
      };
    } catch (pageViewError) {
      console.warn("Admin stats: page views unavailable", pageViewError);
    }

    res.json({
      totalUsers,
      activeAuctions,
      totalAuctions,
      totalVolume: Number(volumeAggregate._sum.currentPrice || 0),
      averagePrice: Number(volumeAggregate._avg.currentPrice || 0),
      usersByRole: Object.fromEntries(
        usersByRole.map((r) => [r.role, r._count.id]),
      ),
      auctionsByStatus: Object.fromEntries(
        auctionsByStatus.map((s) => [s.status, s._count.id]),
      ),
      auctionsByCategory: Object.fromEntries(
        auctionsByCategory.map((c) => [c.category, c._count.id]),
      ),
      topSellers: enrichedTopSellers,
      topBidders: enrichedTopBidders,
      payments: {
        total: Number(paymentsSummary._sum.amount || 0),
        count: paymentsSummary._count.id,
      },
      analytics,
    });
  } catch (error: any) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Historical statistics for charts
 */
router.get(
  "/stats/historical",
  ensureAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 1. New users per day
      const userStats = await prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      // 2. New auctions per day
      const auctionStats = await prisma.auction.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      // 3. New bids per day
      const bidStats = await prisma.bid.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, amount: true },
        orderBy: { createdAt: "asc" },
      });

      // Helper to aggregate by date (ignoring time)
      const groupByDate = (data: any[], countField = "id") => {
        const grouped: Record<string, number> = {};
        data.forEach((item) => {
          const date = item.createdAt.toISOString().split("T")[0];
          grouped[date] = (grouped[date] || 0) + 1;
        });
        return grouped;
      };

      // For bids, let's also sum the volume
      const bidVolumeByDay: Record<string, number> = {};
      bidStats.forEach((bid) => {
        const date = bid.createdAt.toISOString().split("T")[0];
        bidVolumeByDay[date] = (bidVolumeByDay[date] || 0) + Number(bid.amount);
      });

      const usersByDay = groupByDate(userStats);
      const auctionsByDay = groupByDate(auctionStats);
      const bidsByDay = groupByDate(bidStats);

      res.json({
        usersByDay,
        auctionsByDay,
        bidsByDay,
        bidVolumeByDay,
      });
    } catch (error: any) {
      console.error("Historical stats error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

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
        return res.status(400).json({
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
        return res.status(400).json({
          error: "Nieprawidłowe dane użytkownika",
          details: validation.error.errors,
        });
      }

      const { password, ...prismaData } = validation.data;

      // 1. If password provided, update in Supabase Auth
      if (password) {
        if (!supabase) {
          console.warn(
            "Supabase client not initialized, skipping password update",
          );
        } else {
          try {
            const { error: authError } =
              await supabase.auth.admin.updateUserById(id, {
                password: password,
              });
            if (authError) throw authError;
            console.log(`✅ Password updated for user ${id}`);
          } catch (authErr: any) {
            console.error("Error updating password in Supabase:", authErr);
            return res
              .status(400)
              .json({ error: `Błąd podczas zmiany hasła: ${authErr.message}` });
          }
        }
      }

      // 2. Update in Prisma
      try {
        const updated = await userService.updateUser(id, prismaData);
        await logAdminAction(req, "UPDATE_USER", "USER", id, prismaData);
        res.json(updated);
      } catch (dbError: any) {
        console.error("DB Update Error:", dbError);
        // Handle unique constraint violations
        if (dbError.code === "P2002") {
          const field = dbError.meta?.target?.[0] || "pole";
          return res.status(409).json({
            error: `Użytkownik z takimi danymi już istnieje (${field}).`,
            field,
          });
        }
        throw dbError;
      }
    } catch (error: any) {
      console.error("Admin PATCH User Error:", error);
      res.status(500).json({
        error: error.message || "Wystąpił nieoczekiwany błąd serwera",
      });
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
 * Ban user
 */
router.post(
  "/users/:id/ban",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");
      const { id } = req.params;
      const updated = await prisma.user.update({
        where: { id },
        data: { isBanned: true, isBlocked: true },
      });
      await logAdminAction(req, "BAN_USER", "USER", id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Unban user
 */
router.post(
  "/users/:id/unban",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");
      const { id } = req.params;
      const updated = await prisma.user.update({
        where: { id },
        data: { isBanned: false, isBlocked: false, blockedUntil: null },
      });
      await logAdminAction(req, "UNBAN_USER", "USER", id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * Admin verify user (full verification override)
 */
router.post(
  "/users/:id/verify",
  mutationLimiter,
  ensureAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");
      const { id } = req.params;
      const updated = await prisma.user.update({
        where: { id },
        data: { role: "USER_FULL_VERIFIED" },
      });
      await logAdminAction(req, "VERIFY_USER", "USER", id);
      res.json(updated);
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
  updateAuctionHandler,
);
router.put("/auctions/:id", mutationLimiter, ensureAdmin, updateAuctionHandler);

async function updateAuctionHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const validation = AuctionUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      console.error(
        "❌ Admin Auction Update Validation Error:",
        JSON.stringify(validation.error.errors, null, 2),
      );
      return res.status(400).json({
        error: "Nieprawidłowe dane aukcji",
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
      category,
      sex,
      minBidIncrement,
    } = validation.data;

    // Build update object only with provided values
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startingPrice !== undefined) updateData.startingPrice = startingPrice;
    if (buyNowPrice !== undefined) updateData.buyNowPrice = buyNowPrice;
    if (reservePrice !== undefined) updateData.reservePrice = reservePrice;
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (sex !== undefined) updateData.gender = sex; // Map sex to gender in Prisma
    if (minBidIncrement !== undefined)
      updateData.minBidIncrement = minBidIncrement;
    if (endTime !== undefined) {
      updateData.endTime = endTime ? new Date(endTime) : null;
    }

    // Direct update via Prisma with manual cache invalidation
    if (!prisma) throw new Error("Database not initialized");

    const result = await prisma.auction.update({
      where: { id },
      data: updateData,
    });

    cache.invalidateAuctionCache(id);
    cache.invalidateResource("auctions");

    // Broadcast update via WebSocket to all connected clients
    try {
      const fullAuction = await prisma.auction.findUnique({
        where: { id },
        include: detailAuctionInclude,
      });

      if (fullAuction) {
        const io = getIO();
        const serialized = serializeAuction(fullAuction);
        const updatePayload = {
          auctionId: id,
          status: serialized.status,
          endTime: serialized.endTime,
          auction: serialized,
        };
        io.to(`auction-${id}`).emit("auction:status:changed", updatePayload);
        io.emit("auction:status:changed", updatePayload);
      }
    } catch (wsError) {
      console.error("❌ Failed to broadcast auction update:", wsError);
    }

    await logAdminAction(req, "UPDATE_AUCTION", "AUCTION", id, updateData);

    res.json(result);
  } catch (error: any) {
    console.error("❌ Admin Auction Update Error:", error);
    res.status(500).json({ error: error.message });
  }
}

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
      if (!supabase) {
        return res
          .status(500)
          .json({ error: "Supabase not configured on server" });
      }

      const validation = UserCreateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation Error",
          details: validation.error.errors,
        });
      }

      const {
        email,
        password,
        first_name,
        last_name,
        role,
        phone,
        username,
        isBlocked,
        isBanned,
      } = validation.data;

      const version = "2.0.1-robust-auth"; // Version marker for debugging
      console.log(
        `👤 [Admin API v${version}] Creating user: ${email} (Role: ${role})`,
      );

      if (!supabase) {
        return res.status(503).json({
          error: "Usługa Supabase nie jest zainicjalizowana.",
          version,
        });
      }

      // 0. Preliminary Check: Does username or email exist in DB?
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { username: username }],
        },
      });

      if (existingUser) {
        const field = existingUser.email === email ? "Email" : "Username";
        console.warn(`  ⚠️ User with this ${field} already exists in DB.`);
        return res.status(409).json({
          error: `Użytkownik z tym ${field === "Email" ? "adresem e-mail" : "identyfikatorem (username)"} już istnieje w bazie.`,
          field: field.toLowerCase(),
          version,
        });
      }

      // Saga / Compensation Logic
      let authUser: any = null;

      // 1. Create in Supabase Auth
      try {
        console.log("  Step 1: Creating Supabase Auth user...");
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: first_name || "",
            last_name: last_name || "",
          },
        });

        if (error) {
          console.error("  ❌ Supabase Auth Error:", error);
          const isConflict =
            error.message?.toLowerCase().includes("already") ||
            error.status === 409 ||
            error.status === 422;
          return res.status(isConflict ? 409 : error.status || 500).json({
            error: isConflict
              ? "Ten adres e-mail jest już zajęty w systemie Auth."
              : "Błąd serwera Auth.",
            details: error.message,
            code: error.code || "AUTH_ERROR",
            version,
          });
        }

        authUser = data.user;
        console.log(`  ✅ Auth user created with ID: ${authUser.id}`);
      } catch (authCatch: any) {
        console.error("  ❌ Unexpected Auth Exception:", authCatch);
        return res.status(500).json({
          error: "Nieoczekiwany błąd usługi Auth.",
          details: authCatch.message,
          version,
        });
      }

      if (!authUser) {
        return res.status(500).json({
          error: "Nie udało się utworzyć użytkownika w systemie Auth.",
          version,
        });
      }

      // 2. Create/Update in Public Schema with Compensation
      try {
        console.log("  Step 2: Syncing to public.users table...");
        const newUser = await prisma.user.upsert({
          where: { id: authUser.id },
          update: {
            email,
            first_name: first_name || "",
            last_name: last_name || "",
            role: (role as any) || "USER_REGISTERED",
            phone: phone || null,
            name:
              `${first_name || ""} ${last_name || ""}`.trim() ||
              email.split("@")[0],
            username,
            isBlocked: !!isBlocked,
            isBanned: !!isBanned,
          },
          create: {
            id: authUser.id,
            email,
            first_name: first_name || "",
            last_name: last_name || "",
            role: (role as any) || "USER_REGISTERED",
            phone: phone || null,
            trustScore: 0,
            name:
              `${first_name || ""} ${last_name || ""}`.trim() ||
              email.split("@")[0],
            username,
            isBlocked: !!isBlocked,
            isBanned: !!isBanned,
          },
        });
        console.log("  ✅ User synced to database.");

        console.log("  Step 3: Logging admin action...");
        await logAdminAction(req, "CREATE_USER", "USER", newUser.id, {
          email,
          username,
          role,
        });

        console.log("✨ User creation completed successfully.");
        return res.status(201).json(newUser);
      } catch (dbError: any) {
        console.error("  ❌ Prisma Sync Error:", dbError);
        console.log("  🔄 Compensating: Deleting Supabase user...");

        try {
          await supabase.auth.admin.deleteUser(authUser.id);
          console.log("  ✅ Compensation successful: Auth user deleted.");
        } catch (cleanupError) {
          console.error(
            "  ⚠️ Compensation failed: Could not delete Auth user.",
            cleanupError,
          );
        }

        // Return detailed DB error
        let message = "Błąd bazy danych podczas tworzenia profilu.";
        let status = 500;

        if (dbError.code === "P2002") {
          const field = dbError.meta?.target?.[0] || "użytkownik";
          message = `Użytkownik z takim ${field} już istnieje w bazie (konflikt danych).`;
          status = 409;
        }

        return res.status(status).json({
          error: message,
          details: dbError.message,
          code: dbError.code,
          version,
        });
      }
    } catch (error: any) {
      console.error("CRITICAL Create User Exception:", error);
      res.status(500).json({
        error: "Krytyczny błąd serwera podczas tworzenia użytkownika.",
        details: error.message,
        version: "2.0.1-robust-auth",
      });
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
        return res.status(400).json({
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
          listingFeePaid: true,
          endTime: endTime ? new Date(endTime) : null,
          category: category || "PIGEONS",
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

router.get("/payments", ensureAdmin, async (req: Request, res: Response) => {
  try {
    if (!prisma) throw new Error("Database not initialized");

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) || "20")),
    );
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (type) where.type = type.toUpperCase();

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          auction: { select: { id: true, title: true } },
          user: {
            select: { id: true, email: true, username: true, first_name: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      payments: payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        type: p.type,
        status: p.status,
        provider: p.provider,
        createdAt: p.createdAt,
        auctionId: p.auctionId,
        auctionTitle: p.auction?.title ?? null,
        userEmail: p.user?.email ?? null,
        username: p.user?.username ?? null,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch(
  "/payments/:id/status",
  ensureAdmin,
  mutationLimiter,
  validate(
    z.object({
      status: z.enum([
        "INITIATED",
        "PENDING",
        "SUCCEEDED",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
      ]),
    })
  ),
  async (req: Request, res: Response) => {
    try {
      if (!prisma) throw new Error("Database not initialized");
      const { id } = req.params;
      const { status } = req.body;

      const payment = await prisma.payment.findUnique({ where: { id } });
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id },
          data: { status },
        });

        // Trigger auction side-effects only if status changed to SUCCEEDED
        if (status === "SUCCEEDED" && payment.status !== "SUCCEEDED") {
          if (payment.type === "BUY_NOW") {
            await tx.auction.update({
              where: { id: payment.auctionId },
              data: {
                status: "ENDED",
                currentPrice: payment.amount,
                reserveMet: true,
                winnerId: payment.userId,
              },
            });
          } else if (payment.type === "COMMISSION") {
            await tx.auction.update({
              where: { id: payment.auctionId },
              data: {
                status: "COMPLETED",
              },
            });
          } else if (payment.type === "LISTING_FEE") {
            await tx.auction.update({
              where: { id: payment.auctionId },
              data: { listingFeePaid: true, status: "ACTIVE" },
            });
          }
        }
      });

      // Invalidate relevant cache entries
      cache.deletePattern("auctions:*");
      cache.delete(`auction:${payment.auctionId}`);
      cache.delete(`auction:${payment.auctionId}:bids`);
      if (payment.userId) {
        cache.delete(`user:${payment.userId}:auctions`);
      }

      await logAdminAction(req, "UPDATE_PAYMENT_STATUS", "PAYMENT", id, {
        oldStatus: payment.status,
        newStatus: status,
      });

      res.json({ success: true, message: "Payment status updated" });
    } catch (error: any) {
      console.error("Update payment status error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
