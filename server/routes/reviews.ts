import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import ReviewService from '../services/ReviewService.js';
import { prisma } from '../lib/db.js';

const router = express.Router();

// Wystaw recenzję
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const { auctionId, rating, comment } = req.body;

    // Sprawdzenie czy użytkownik może wystawić recenzję
    const eligibilityCheck = await ReviewService.canReview(auctionId, userId);
    if (!eligibilityCheck.canReview) {
      return res.status(400).json({ error: eligibilityCheck.reason });
    }

    // Pobranie ID sprzedającego
    if (!prisma) {
      console.error('❌ Database connection (Prisma) is not initialized in reviews route');
      return res.status(500).json({ 
        error: 'Database not available',
        details: 'Prisma client is not initialized. Check server logs.'
      });
    }

    const auction = await (prisma as any).auction.findUnique({
      where: { id: auctionId },
      select: { sellerId: true },
    });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const review = await ReviewService.createReview({
      auctionId,
      reviewerId: userId,
      revieweeId: auction.sellerId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    const message = error.message || 'Failed to create review';
    const statusCode = message.includes('not found') ? 404 : 
                      message.includes('already exists') ? 409 : 
                      message.includes('can only') ? 400 : 500;
    res.status(statusCode).json({ error: message });
  }
});

// Pobierz recenzje sprzedającego
router.get('/seller/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await ReviewService.getSellerReviews(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Sprawdź czy można wystawić recenzję
router.get('/can-review/:auctionId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const { auctionId } = req.params;

    const eligibilityCheck = await ReviewService.canReview(auctionId, userId);
    res.json(eligibilityCheck);
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Pobierz trust score użytkownika
router.get('/trust-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const trustScore = await ReviewService.getTrustScore(userId);
    res.json({ trustScore });
  } catch (error) {
    console.error('Error fetching trust score:', error);
    res.status(500).json({ error: 'Failed to fetch trust score' });
  }
});

export default router;
