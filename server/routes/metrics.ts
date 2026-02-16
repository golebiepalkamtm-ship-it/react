import express, { type Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { globalLimiter } from "../middleware/rateLimiter.js";

const router: Router = express.Router();

const trackSchema = z.object({
  scope: z.enum(["SITE", "AUCTION", "GALLERY_IMAGE"]),
  targetId: z.string().trim().min(1).optional(),
});

/**
 * Inkrementacja metryk (bez auth, z rate limitingiem)
 */
router.post("/track", globalLimiter, async (req, res) => {
  try {
    const parsed = trackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const { scope, targetId } = parsed.data;
    const effectiveTargetId = targetId ?? "global";

    // Use correct unique constraint for upsert
    // Note: targetId is TEXT in DB (altered from UUID) to support 'global'
    const result = await prisma.metric.upsert({
      where: {
        metrics_scope_target_id_key: {
          scope,
          targetId: effectiveTargetId,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        scope,
        targetId: effectiveTargetId,
        count: 1,
      },
    });

    // Also increment views counter in the Auction table for direct display
    if (scope === "AUCTION" && targetId) {
      try {
        await prisma.auction.update({
          where: { id: targetId },
          data: { views: { increment: 1 } },
        });
      } catch (err) {
        // Silently fail if auction not found or UUID mismatch
        console.warn(
          `[Metrics] Could not increment views for auction ${targetId}`,
        );
      }
    }

    return res.json({ ok: true, count: result.count });
  } catch (error) {
    console.error("❌ Metrics track error:", error);
    // Return more details in dev, generic error in prod
    const message =
      process.env.NODE_ENV === "development"
        ? `Metrics tracking failed: ${(error as Error).message}`
        : "Metrics tracking failed";

    return res.status(500).json({ error: message });
  }
});

export default router;
