import express, { type Router } from 'express';
import { biddingLimiter } from '../middleware/rateLimiter.js';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validation.js';
import { createAuctionSchema, placeBidSchema, queryParamsSchema, auctionIdParamSchema, buyNowSchema, paginationSchema, adminUpdateAuctionSchema } from '../schemas/auctionSchemas.js';
import { cache } from '../lib/cache.js';
import { prisma, supabase } from '../lib/db.js';
import { validatedEnv } from '../lib/env.js';
import { auctionService } from '../services/AuctionService.js';
import { Prisma } from '@prisma/client';
import {
  AuctionErrorCodes,
  createAuctionError
} from '../utils/auctionErrors.js';
import { serializeAuction, serializePrivateAuction, serializePublicAuction, baseAuctionInclude, detailAuctionInclude, listAuctionInclude, serializeBid } from '../utils/auctionSerializer.js';

const router: Router = express.Router();

const auctionIdSchema = z.string().uuid('Invalid auction id');

const ALLOWED_CATEGORIES = new Set(['RACING', 'BREEDING', 'SHOW']);
const normalizeCategory = (input?: string) => {
  const up = (input || '').toUpperCase();
  return ALLOWED_CATEGORIES.has(up) ? up : 'SHOW';
};

// Get all auctions
router.get('/', async (req, res) => {
  try {
    const validationResult = queryParamsSchema.safeParse(req.query);
    const normalizedQuery = validationResult.success ? validationResult.data : {};
    if (!validationResult.success) {
       console.warn('⚠️ Invalid query params:', validationResult.error.format());
    }

    const { status, sortBy, limit, search, category, gender, priceMin, priceMax } = normalizedQuery;

    const cacheKey = `auctions:${JSON.stringify(normalizedQuery)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const where: Prisma.AuctionWhereInput = {};
    if (status && status !== 'all') where.status = status.toUpperCase() as any;
    if (category && category !== 'all') where.category = normalizeCategory(category) as any;
    if (priceMin || priceMax) {
      where.currentPrice = {};
      if (priceMin) where.currentPrice.gte = new Prisma.Decimal(priceMin);
      if (priceMax) where.currentPrice.lte = new Prisma.Decimal(priceMax);
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (!prisma) {
      console.error('❌ Database connection (Prisma) is not initialized');
      return res.status(500).json({
        error: 'Baza danych niedostępna',
        details: 'Prisma client is not initialized. Check server logs.'
      });
    }

    const normalizedSortBy = typeof sortBy === 'string' ? sortBy.split(':')[0] : undefined;
    const orderBy: Prisma.AuctionOrderByWithRelationInput = {};
    if (normalizedSortBy === 'price-high') orderBy.currentPrice = 'desc';
    else if (normalizedSortBy === 'price-low') orderBy.currentPrice = 'asc';
    else if (normalizedSortBy === 'newest') orderBy.createdAt = 'desc';
    else orderBy.endTime = 'asc';

    const take = limit ? parseInt(String(limit)) : undefined;

    console.log('🔍 Fetching auctions with params:', { where, orderBy, take });
    const auctions = await prisma.auction.findMany({
      where,
      orderBy,
      take,
      include: listAuctionInclude,
    });
    console.log('✅ Fetched auctions count:', auctions.length);

    const serialized = auctions.map(a => serializePublicAuction(a));
    const result = { auctions: serialized };
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('❌ Prisma Error fetching auctions:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });
      res.status(500).json({ error: 'Failed to fetch auctions', code: error.code });
      return;
    }
    console.error('❌ Error fetching auctions:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get user's auctions
router.get('/my', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!prisma) {
      console.error('❌ Database connection (Prisma) is not initialized');
      return res.status(500).json({
        error: 'Baza danych niedostępna',
        details: 'Prisma client is not initialized. Check server logs.'
      });
    }

    const auctions = await prisma.auction.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      include: detailAuctionInclude,
    });

    const serialized = auctions.map(a => serializePrivateAuction(a, userId));
    res.json(serialized);
  } catch (error) {
    console.error('Error fetching my auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get auction by ID
router.get('/:id', async (req, res) => {
  try {
    const idValidation = auctionIdSchema.safeParse(req.params.id);
    if (!idValidation.success) return res.status(400).json({ error: 'Invalid auction id' });

    if (!prisma) {
      console.error('❌ Database connection (Prisma) is not initialized');
      return res.status(500).json({
        error: 'Baza danych niedostępna',
        details: 'Prisma client is not initialized. Check server logs.'
      });
    }

    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: detailAuctionInclude,
    });

    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(serializeAuction(auction));
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// Shared create logic for both dev and prod
async function performAuctionCreate(req: any, userId: string | null) {
  const {
    title, description, startingPrice, buyNowPrice, reservePrice,
    endTime, pigeon, category, location, images, videos, documents, pedigreeUrl
  } = req.body;

  const imagesCreate = Array.isArray(images)
    ? images.filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
        .map((url: string, idx: number) => ({ url, ordering: idx }))
    : undefined;

  const videosCreate = Array.isArray(videos)
    ? videos.filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
        .map((url: string) => ({ url }))
    : undefined;

  let documentsCreate = Array.isArray(documents)
    ? documents.filter((url: unknown): url is string => typeof url === 'string' && url.length > 0)
        .map((url: string) => ({ url }))
    : undefined;
  
  if (typeof pedigreeUrl === 'string' && pedigreeUrl.trim().length > 0) {
    documentsCreate = [
      ...(documentsCreate || []),
      { url: pedigreeUrl.trim() }
    ];
  }

  // Handle traits extraction
  const traits: Record<string, string[]> = {};
  if (pigeon && typeof pigeon === 'object') {
    const traitFields = [
      'colorTraits', 'eyeTraits', 'bodyStructureTraits', 'breastboneTraits',
      'forkTraits', 'musculatureTraits', 'backTraits', 'wingTraits',
      'wingBehaviorTraits', 'breedingValueTraits', 'distanceTraits'
    ];
    for (const field of traitFields) {
      if (Array.isArray(pigeon[field])) {
        traits[field] = pigeon[field];
      }
    }
  }

  const rawPigeonPayload = pigeon && typeof pigeon === 'object'
    ? {
        ringNumber: typeof pigeon.ringNumber === 'string' ? pigeon.ringNumber.trim() : undefined,
        eyeColor: typeof pigeon.eyeColor === 'string' ? pigeon.eyeColor : undefined,
        featherColor: typeof pigeon.pigeonColor === 'string' ? pigeon.pigeonColor : undefined,
        construction: typeof pigeon.construction === 'string' ? pigeon.construction : undefined,
        vitality: typeof pigeon.vitality === 'string' ? pigeon.vitality : undefined,
        length: typeof pigeon.length === 'string' ? pigeon.length : undefined,
        endurance: typeof pigeon.endurance === 'string' ? pigeon.endurance : undefined,
        forkStrength: typeof pigeon.forkStrength === 'string' ? pigeon.forkStrength : undefined,
        forkAlignment: typeof pigeon.forkAlignment === 'string' ? pigeon.forkAlignment : undefined,
        muscles: typeof pigeon.muscles === 'string' ? pigeon.muscles : undefined,
        balance: typeof pigeon.balance === 'string' ? pigeon.balance : undefined,
        back: typeof pigeon.back === 'string' ? pigeon.back : undefined,
        purpose: typeof pigeon.purpose === 'string' ? pigeon.purpose : undefined,
        shoulders: typeof pigeon.shoulders === 'string' ? pigeon.shoulders : undefined,
        feathers: typeof pigeon.feathers === 'string' ? pigeon.feathers : undefined,
        traits: traits as any,
        pedigreeUrl: (typeof pedigreeUrl === 'string' && pedigreeUrl.trim().length > 0) ? pedigreeUrl.trim() : undefined,
        imageUrl: (Array.isArray(images) && images.length > 0) ? images[0] : undefined,
      }
    : null;

  const pigeonHasTraits = rawPigeonPayload ? Object.values(rawPigeonPayload).some(v => v !== undefined && v !== null && v !== '') : false;

  const pigeonPayload = pigeonHasTraits
    ? {
        ...rawPigeonPayload!,
        gender: typeof pigeon?.gender === 'string' ? (pigeon.gender || 'MALE').toUpperCase() : 'MALE',
      }
    : null;

  // Build description with traits for search/legacy display
  let finalDescription = description;
  if (Object.keys(traits).length > 0) {
    const lines: string[] = [];
    const traitLabels: Record<string, string> = {
      colorTraits: 'Cechy koloru',
      eyeTraits: 'Cechy oka',
      bodyStructureTraits: 'Budowa ciała',
      breastboneTraits: 'Mostek',
      forkTraits: 'Widełki',
      musculatureTraits: 'Musculatura',
      backTraits: 'Plecy',
      wingTraits: 'Skrzydła',
      wingBehaviorTraits: 'Zachowanie skrzydeł',
      breedingValueTraits: 'Wartość hodowlana',
      distanceTraits: 'Przeznaczenie dystansowe'
    };
    for (const [key, values] of Object.entries(traits)) {
      if (values.length > 0) {
        lines.push(`${traitLabels[key] || key}: ${values.join(', ')}`);
      }
    }
    if (lines.length > 0) {
      finalDescription = `${description || ''}\n\nCharakterystyka:\n- ${lines.join('\n- ')}`.trim();
    }
  }

  return await prisma.auction.create({
    data: {
      title,
      description: finalDescription,
      startingPrice: startingPrice ? new Prisma.Decimal(startingPrice) : undefined,
      currentPrice: startingPrice ? new Prisma.Decimal(startingPrice) : (buyNowPrice ? new Prisma.Decimal(buyNowPrice) : 0),
      buyNowPrice: buyNowPrice ? new Prisma.Decimal(buyNowPrice) : undefined,
      reservePrice: reservePrice ? new Prisma.Decimal(reservePrice) : undefined,
      endTime: new Date(endTime),
      status: 'ACTIVE',
      category: normalizeCategory(category || 'RACING') as any,
      location: location || 'Lubań, Polska',
      sellerId: userId,
      pigeon: pigeonPayload ? { create: pigeonPayload as any } : undefined,
      images: imagesCreate ? { create: imagesCreate } : undefined,
      videos: videosCreate ? { create: videosCreate } : undefined,
      documents: documentsCreate ? { create: documentsCreate } : undefined,
    },
    include: detailAuctionInclude,
  });
}

// Create auction
if (validatedEnv.NODE_ENV === 'development') {
  router.post('/', validate(createAuctionSchema), async (req, res) => {
    try {
      if (!prisma) return res.status(500).json({ error: 'Database not available' });
      const created = await performAuctionCreate(req, null);
      cache.invalidateResource('auction'); // Invalidate auction lists
      res.status(201).json(serializeAuction(created as any));
    } catch (error) {
      console.error('Error creating auction (dev):', error);
      res.status(500).json({ error: 'Failed to create auction' });
    }
  });
} else {
  router.post('/', authMiddleware, validate(createAuctionSchema), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const role = req.user?.role;
      if (role !== 'USER_FULL_VERIFIED' && role !== 'ADMIN') {
        return res.status(403).json({ error: 'Account not fully verified' });
      }
      if (!prisma) return res.status(500).json({ error: 'Database not available' });

      const created = await performAuctionCreate(req, userId);
      cache.invalidateResource('auction');
      res.status(201).json(serializeAuction(created as any));
    } catch (error) {
      console.error('Error creating auction:', error);
      res.status(500).json({ error: 'Failed to create auction' });
    }
  });
}

// Place bid
router.post('/:id/bids', authMiddleware, biddingLimiter, validate(placeBidSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const idValidation = auctionIdSchema.safeParse(req.params.id);
    if (!idValidation.success) return res.status(400).json({ error: 'Invalid auction id' });

    const { amount, isProxy, maxBid } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const role = req.user?.role;
    if (role !== 'USER_FULL_VERIFIED' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Account not fully verified' });
    }

    const result = await auctionService.placeBid(
      req.params.id,
      userId,
      Number(amount),
      Boolean(isProxy),
      maxBid ? Number(maxBid) : null
    );

    res.json({
      success: true,
      bid: serializeBid(result.bid as any),
      meta: {
        wasExtended: result.wasExtended,
        newEndTime: result.newEndTime,
        autoBidTriggered: false
      }
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Błąd składania oferty',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Buy Now
router.post('/:id/buy-now', authMiddleware, biddingLimiter, validate(buyNowSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const role = req.user?.role;
    if (role !== 'USER_FULL_VERIFIED' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Account not fully verified' });
    }
    if (!prisma) return res.status(500).json({ error: 'Database not available' });

    const { auctionId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({ 
        where: { id: auctionId }, 
        include: detailAuctionInclude 
      });
      
      if (!auction) throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_FOUND, 'Auction not found');

      // Check if user is trying to buy their own auction
      if (auction.sellerId === userId) {
        throw createAuctionError(AuctionErrorCodes.INVALID_BID_AMOUNT, 'Cannot buy your own auction');
      }

      const now = Date.now();
      const endsAt = auction.endTime ? new Date(auction.endTime).getTime() : 0;
      if (auction.status !== 'ACTIVE' || endsAt <= now) {
        throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_ACTIVE, 'Aukcja nie jest aktywna');
      }

      if (!auction.buyNowPrice) throw createAuctionError(AuctionErrorCodes.INVALID_BID_AMOUNT, 'Brak ceny Kup teraz');
      const amount = Number(auction.buyNowPrice);

      const bid = await tx.bid.create({
        data: { auctionId: auction.id, bidderId: userId, amount }
      });

      await tx.auction.update({
        where: { id: auction.id },
        data: { currentPrice: amount, reserveMet: true, status: 'ENDED', winnerId: userId }
      });

      return { amount, bid };
    });

    // Invalidate relevant cache entries
    // Invalidate relevant cache entries
    cache.invalidateAuctionCache(auctionId);
    cache.invalidateResource('auction'); // Refresh lists as status changed
    res.json({ success: true, finalPrice: result.amount, auctionId });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Błąd Kup teraz',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Admin update auction
router.put('/:id/admin', authMiddleware, validate(adminUpdateAuctionSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const idValidation = auctionIdParamSchema.safeParse(req.params);
    if (!idValidation.success) return res.status(400).json({ error: 'Invalid auction id' });

    const role = req.user?.role;
    if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden: Admins only' });

    const { id } = req.params;
    const data = req.body;
    
    // Manual update mirroring removed service method
    const updateData: any = {};
    if (data.currentPrice) updateData.currentPrice = new Prisma.Decimal(data.currentPrice);
    if (data.buyNowPrice) updateData.buyNowPrice = new Prisma.Decimal(data.buyNowPrice);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    
    const updatedAuction = await prisma.auction.update({
        where: { id },
        data: updateData
    });
    
    cache.invalidateAuctionCache(id);

    res.json(serializeAuction(updatedAuction as any));

  } catch (error: any) {
    console.error('Error updating auction (admin):', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Błąd aktualizacji aukcji',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

router.delete('/:id/admin', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const idValidation = auctionIdParamSchema.safeParse(req.params);
    if (!idValidation.success) return res.status(400).json({ error: 'Invalid auction id' });

    const role = req.user?.role;
    if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden: Admins only' });

    const cancelledAuction = await auctionService.adminCancelAuction(req.params.id);

    res.json(serializeAuction(cancelledAuction as any));

  } catch (error: any) {
    console.error('Error cancelling auction (admin):', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Błąd anulowania aukcji',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Watchlist
router.get('/:id/watchlist', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !prisma) return res.json({ watched: false });
    const w = await prisma.watchlist.findUnique({
      where: { userId_auctionId: { userId, auctionId: req.params.id } }
    });
    res.json({ watched: !!w });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/:id/watchlist', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !prisma) return res.status(401).json({ error: 'Unauthorized' });
    await prisma.watchlist.upsert({
      where: { userId_auctionId: { userId, auctionId: req.params.id } },
      update: {},
      create: { userId, auctionId: req.params.id }
    });
    res.json({ watched: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

router.delete('/:id/watchlist', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !prisma) return res.status(401).json({ error: 'Unauthorized' });
    await prisma.watchlist.delete({
      where: { userId_auctionId: { userId, auctionId: req.params.id } }
    });
    res.json({ watched: false });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// Delete
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !prisma) return res.status(401).json({ error: 'Unauthorized' });
    const auction = await prisma.auction.findUnique({ where: { id: req.params.id } });
    if (!auction) return res.status(404).json({ error: 'Not found' });
    if (auction.sellerId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.auction.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
