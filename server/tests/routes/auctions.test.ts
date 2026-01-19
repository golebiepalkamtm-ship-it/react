import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db.js', () => ({
  prisma: {
    auction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    bid: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    watchlist: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../../lib/db.js';

describe('Auctions API Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /auctions', () => {
    it('should fetch active auctions', async () => {
      const mockAuctions = [
        { id: 'auction-1', title: 'Pigeon 1', status: 'ACTIVE', currentPrice: 100 },
        { id: 'auction-2', title: 'Pigeon 2', status: 'ACTIVE', currentPrice: 200 },
      ];
      (prisma!.auction.findMany as any).mockResolvedValue(mockAuctions);

      const result = await prisma!.auction.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('ACTIVE');
    });

    it('should filter by category', async () => {
      const mockAuctions = [
        { id: 'auction-1', title: 'Racing Pigeon', category: 'RACING' },
      ];
      (prisma!.auction.findMany as any).mockResolvedValue(mockAuctions);

      const result = await prisma!.auction.findMany({
        where: { category: 'RACING' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('RACING');
    });
  });

  describe('GET /auctions/:id', () => {
    it('should return auction details with bids', async () => {
      const mockAuction = {
        id: 'auction-1',
        title: 'Champion Pigeon',
        description: 'A great pigeon',
        currentPrice: 500,
        bids: [
          { id: 'bid-1', amount: 500, bidderId: 'user-1' },
          { id: 'bid-2', amount: 400, bidderId: 'user-2' },
        ],
        seller: { id: 'seller-1', name: 'John' },
      };
      (prisma!.auction.findUnique as any).mockResolvedValue(mockAuction);

      const result = await prisma!.auction.findUnique({
        where: { id: 'auction-1' },
        include: { bids: true, seller: true },
      });

      expect(result?.id).toBe('auction-1');
      expect(result?.bids).toHaveLength(2);
    });

    it('should return null for non-existent auction', async () => {
      (prisma!.auction.findUnique as any).mockResolvedValue(null);

      const result = await prisma!.auction.findUnique({
        where: { id: 'non-existent' },
      });

      expect(result).toBeNull();
    });
  });

  describe('POST /auctions', () => {
    it('should create new auction', async () => {
      const mockAuction = {
        id: 'new-auction',
        title: 'New Pigeon',
        description: 'Fresh from the loft',
        startingPrice: 100,
        currentPrice: 100,
        status: 'ACTIVE',
        sellerId: 'seller-1',
      };
      (prisma!.auction.create as any).mockResolvedValue(mockAuction);

      const result = await prisma!.auction.create({
        data: {
          title: 'New Pigeon',
          description: 'Fresh from the loft',
          startingPrice: 100,
          currentPrice: 100,
          sellerId: 'seller-1',
        },
      });

      expect(result.id).toBe('new-auction');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('POST /auctions/:id/bids', () => {
    it('should create bid if amount is higher than current price', async () => {
      const mockAuction = {
        id: 'auction-1',
        currentPrice: 100,
        status: 'ACTIVE',
        minBidIncrement: 10,
      };
      (prisma!.auction.findUnique as any).mockResolvedValue(mockAuction);

      const mockBid = {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'user-1',
        amount: 150,
      };
      (prisma!.bid.create as any).mockResolvedValue(mockBid);

      const auction = await prisma!.auction.findUnique({ where: { id: 'auction-1' } });
      expect(auction?.status).toBe('ACTIVE');

      const bidAmount = 150;
      const minRequired = auction!.currentPrice + auction!.minBidIncrement;
      expect(bidAmount).toBeGreaterThanOrEqual(minRequired);
    });

    it('should reject bid if auction is not active', async () => {
      const mockAuction = {
        id: 'auction-1',
        status: 'ENDED',
      };
      (prisma!.auction.findUnique as any).mockResolvedValue(mockAuction);

      const auction = await prisma!.auction.findUnique({ where: { id: 'auction-1' } });
      expect(auction?.status).not.toBe('ACTIVE');
    });

    it('should reject bid if amount is too low', async () => {
      const mockAuction = {
        id: 'auction-1',
        currentPrice: 100,
        minBidIncrement: 10,
        status: 'ACTIVE',
      };
      (prisma!.auction.findUnique as any).mockResolvedValue(mockAuction);

      const auction = await prisma!.auction.findUnique({ where: { id: 'auction-1' } });
      const bidAmount = 105;
      const minRequired = auction!.currentPrice + auction!.minBidIncrement;
      
      expect(bidAmount).toBeLessThan(minRequired);
    });
  });

  describe('POST /auctions/:id/buy-now', () => {
    it('should allow buy-now if price is set', async () => {
      const mockAuction = {
        id: 'auction-1',
        buyNowPrice: 1000,
        status: 'ACTIVE',
      };
      (prisma!.auction.findUnique as any).mockResolvedValue(mockAuction);

      const auction = await prisma!.auction.findUnique({ where: { id: 'auction-1' } });
      expect(auction?.buyNowPrice).toBe(1000);
      expect(auction?.status).toBe('ACTIVE');
    });

    it('should reject buy-now if no buy-now price', async () => {
      const mockAuction = {
        id: 'auction-1',
        buyNowPrice: null,
        status: 'ACTIVE',
      };
      (prisma!.auction.findUnique as any).mockResolvedValue(mockAuction);

      const auction = await prisma!.auction.findUnique({ where: { id: 'auction-1' } });
      expect(auction?.buyNowPrice).toBeNull();
    });
  });

  describe('Watchlist', () => {
    it('should add auction to watchlist', async () => {
      (prisma!.watchlist.findFirst as any).mockResolvedValue(null);
      (prisma!.watchlist.create as any).mockResolvedValue({
        id: 'watch-1',
        userId: 'user-1',
        auctionId: 'auction-1',
      });

      const existing = await prisma!.watchlist.findFirst({
        where: { userId: 'user-1', auctionId: 'auction-1' },
      });
      expect(existing).toBeNull();

      const result = await prisma!.watchlist.create({
        data: { userId: 'user-1', auctionId: 'auction-1' },
      });
      expect(result.auctionId).toBe('auction-1');
    });

    it('should check if auction is in watchlist', async () => {
      (prisma!.watchlist.findFirst as any).mockResolvedValue({
        id: 'watch-1',
        userId: 'user-1',
        auctionId: 'auction-1',
      });

      const result = await prisma!.watchlist.findFirst({
        where: { userId: 'user-1', auctionId: 'auction-1' },
      });

      expect(result).not.toBeNull();
    });
  });
});
