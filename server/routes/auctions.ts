import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Lazily import Prisma client and provide a mock fallback so the dev
// server can run without running `prisma generate` / connecting a DB.
let prisma: any = null;
function createPrismaMock() {
  return {
    auction: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async ({ data }: any) => ({ id: 'mock-auction', ...data }),
      update: async () => ({}),
      delete: async () => ({}),
    },
    bid: {
      create: async ({ data }: any) => ({ id: 'mock-bid', ...data }),
    },
  };
}

Promise.all([
  import('@prisma/client'),
  import('@prisma/adapter-pg')
])
  .then(([mod, adapterMod]) => {
    try {
      const PrismaPg = adapterMod.PrismaPg;
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
      prisma = new mod.PrismaClient({ adapter });
    } catch (err) {
      console.warn('Prisma client failed to initialize:', err);
      prisma = createPrismaMock();
    }
  })
  .catch((err) => {
    console.warn('Could not import @prisma/client or adapter. DB operations will be mocked:', err);
    prisma = createPrismaMock();
  });

// (createPrismaMock moved above)

// Get all auctions with filtering
router.get('/', async (req, res) => {
  try {
    const { status, sortBy, limit, search, category, gender, priceMin, priceMax } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (search) where.title = { contains: search as string, mode: 'insensitive' };
    if (category && category !== 'all') where.category = category;
    if (priceMin || priceMax) {
      where.currentPrice = {};
      if (priceMin) where.currentPrice.gte = parseFloat(priceMin as string);
      if (priceMax) where.currentPrice.lte = parseFloat(priceMax as string);
    }
    
    const orderBy: any = {};
    if (sortBy === 'price') orderBy.currentPrice = 'desc';
    else orderBy.endTime = 'asc';
    
    const auctions = await prisma.auction.findMany({
      where,
      include: { 
        pigeon: true, 
        bids: { 
          orderBy: { amount: 'desc' }, 
          take: 1,
          include: { user: { select: { name: true } } }
        } 
      },
      orderBy,
      take: limit ? parseInt(limit as string) : undefined
    });
    
    res.json({ auctions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: { 
        pigeon: true, 
        bids: { 
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        },
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// Create new auction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, startingPrice, endTime, pigeon, category } = req.body;
    const userId = req.user!.uid;
    
    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        startingPrice,
        currentPrice: startingPrice,
        endTime: new Date(endTime),
        category,
        status: 'pending',
        userId,
        pigeon: {
          create: pigeon
        }
      },
      include: { pigeon: true }
    });
    
    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// Place bid
router.post('/:id/bids', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user!.uid;
    const auctionId = req.params.id;
    
    // Validate auction exists and is active
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId }
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    if (auction.status !== 'active' || new Date(auction.endTime) < new Date()) {
      return res.status(400).json({ error: 'Auction is not active' });
    }
    
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ error: 'Bid must be higher than current price' });
    }
    
    const bid = await prisma.bid.create({
      data: {
        amount,
        userId,
        auctionId
      },
      include: { user: { select: { name: true } } }
    });
    
    await prisma.auction.update({
      where: { id: auctionId },
      data: { currentPrice: amount }
    });
    
    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

// Get user's auctions
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.uid;
    
    const auctions = await prisma.auction.findMany({
      where: { userId },
      include: { 
        pigeon: true,
        bids: { 
          orderBy: { amount: 'desc' },
          take: 1,
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user auctions' });
  }
});

// Delete auction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const auctionId = req.params.id;
    
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId }
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    if (auction.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await prisma.auction.delete({
      where: { id: auctionId }
    });
    
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete auction' });
  }
});

export default router;