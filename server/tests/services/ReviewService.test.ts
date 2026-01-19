import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db.js', () => ({
  prisma: {
    review: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    auction: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../../lib/db.js';
import ReviewService from '../../services/ReviewService.js';

describe('ReviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canReview', () => {
    it('should return false if auction does not exist', async () => {
      (prisma!.auction.findUnique as any).mockResolvedValue(null);

      const result = await ReviewService.canReview('auction-123', 'user-456');

      expect(result.canReview).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('should return false if auction is not ended', async () => {
      (prisma!.auction.findUnique as any).mockResolvedValue({
        id: 'auction-123',
        status: 'ACTIVE',
        winnerId: 'user-456',
        sellerId: 'seller-789',
      });

      const result = await ReviewService.canReview('auction-123', 'user-456');

      expect(result.canReview).toBe(false);
      expect(result.reason).toContain('ended');
    });

    it('should return false if user is not winner', async () => {
      (prisma!.auction.findUnique as any).mockResolvedValue({
        id: 'auction-123',
        status: 'ENDED',
        winnerId: 'winner-111',
        sellerId: 'seller-222',
      });

      const result = await ReviewService.canReview('auction-123', 'random-user');

      expect(result.canReview).toBe(false);
      expect(result.reason).toContain('winner');
    });

    it('should return false if review already exists', async () => {
      (prisma!.auction.findUnique as any).mockResolvedValue({
        id: 'auction-123',
        status: 'ENDED',
        winnerId: 'user-456',
        sellerId: 'seller-789',
      });
      (prisma!.review.findUnique as any).mockResolvedValue({ id: 'existing-review' });

      const result = await ReviewService.canReview('auction-123', 'user-456');

      expect(result.canReview).toBe(false);
      expect(result.reason).toContain('already');
    });

    it('should return true if user can review', async () => {
      (prisma!.auction.findUnique as any).mockResolvedValue({
        id: 'auction-123',
        status: 'ENDED',
        winnerId: 'user-456',
        sellerId: 'seller-789',
      });
      (prisma!.review.findUnique as any).mockResolvedValue(null);

      const result = await ReviewService.canReview('auction-123', 'user-456');

      expect(result.canReview).toBe(true);
    });
  });

  describe('getSellerReviews', () => {
    it('should return paginated reviews for seller', async () => {
      const mockReviews = [
        { id: 'review-1', rating: 5, reviewerId: 'user-1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'review-2', rating: 4, reviewerId: 'user-2', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma!.review.findMany as any).mockResolvedValue(mockReviews);
      (prisma!.review.count as any).mockResolvedValue(2);
      (prisma!.review.aggregate as any).mockResolvedValue({ _avg: { rating: 4.5 } });

      const result = await ReviewService.getSellerReviews('seller-123', 1, 10);

      expect(prisma!.review.findMany).toHaveBeenCalled();
    });
  });

  describe('getTrustScore', () => {
    it('should return trust score from user', async () => {
      (prisma!.user.findUnique as any).mockResolvedValue({
        id: 'user-123',
        trustScore: 4.5,
      });

      const result = await ReviewService.getTrustScore('user-123');

      expect(result).toBe(4.5);
    });

    it('should return 0 if user not found', async () => {
      (prisma!.user.findUnique as any).mockResolvedValue(null);

      const result = await ReviewService.getTrustScore('non-existent');

      expect(result).toBe(0);
    });
  });
});
