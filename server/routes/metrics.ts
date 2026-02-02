import express, { type Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { globalLimiter } from '../middleware/rateLimiter.js';

const router: Router = express.Router();

const trackSchema = z.object({
  scope: z.enum(['SITE', 'AUCTION', 'GALLERY_IMAGE']),
  targetId: z.string().trim().min(1).optional().nullable(),
});

/**
 * Inkrementacja metryk (bez auth, z rate limitingiem)
 */
router.post('/track', globalLimiter, async (req, res) => {
  try {
    const parsed = trackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const { scope, targetId } = parsed.data;

    // Use correct unique constraint for upsert
    const result = await prisma.metric.upsert({
      where: {
        metrics_scope_target_id_key: {
          scope,
          targetId: (targetId ?? null) as string,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        scope,
        targetId: targetId ?? null,
        count: 1,
      },
    });

    return res.json({ ok: true, count: result.count });
  } catch (error) {
    console.error('❌ Metrics track error:', error);
    return res.status(500).json({ error: 'Metrics tracking failed' });
  }
});

export default router;
