import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Load auctions data from JSON file
function loadAuctionsData() {
  try {
    const auctionsPath = path.join(process.cwd(), 'data/auctions.json');
    const rawData = fs.readFileSync(auctionsPath, 'utf8');
    const data = JSON.parse(rawData);
    return data.auctions || [];
  } catch (error) {
    console.error('Error loading auctions data:', error);
    return [];
  }
}

// Save auctions data to JSON file
function saveAuctionsData(auctions: any[]) {
  try {
    const auctionsPath = path.join(process.cwd(), 'data/auctions.json');
    const data = { auctions };
    fs.writeFileSync(auctionsPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving auctions data:', error);
    throw error;
  }
}

async function fetchUserRoleFromSupabase(req: AuthenticatedRequest, userId: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!supabaseUrl || !supabaseAnonKey || !token) return null;

  try {
    // Try to get user profile from Supabase
    const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ role?: string }>;
    return data?.[0]?.role ?? null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

// Get all auctions with filtering
router.get('/', async (req, res) => {
  try {
    const { status, sortBy, limit, search, category, gender, priceMin, priceMax } = req.query;
    
    let auctions = loadAuctionsData();
    
    // Apply filters
    if (status && status !== 'all') {
      auctions = auctions.filter((auction: any) => auction.status === status);
    }
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      auctions = auctions.filter((auction: any) => 
        auction.title.toLowerCase().includes(searchLower) ||
        auction.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (category && category !== 'all') {
      auctions = auctions.filter((auction: any) => auction.category === category);
    }
    
    if (priceMin) {
      auctions = auctions.filter((auction: any) => auction.currentPrice >= parseFloat(priceMin as string));
    }
    
    if (priceMax) {
      auctions = auctions.filter((auction: any) => auction.currentPrice <= parseFloat(priceMax as string));
    }
    
    // Apply sorting
    if (sortBy === 'price') {
      auctions.sort((a: any, b: any) => b.currentPrice - a.currentPrice);
    } else {
      // Default: sort by end time ascending (ending soonest first)
      auctions.sort((a: any, b: any) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
    }
    
    // Apply limit
    if (limit) {
      auctions = auctions.slice(0, parseInt(limit as string));
    }
    
    res.json({ auctions });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get user's auctions
router.get('/my', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });
    
    const auctions = loadAuctionsData();
    const userAuctions = auctions.filter((auction: any) => 
      auction.seller?.id === userId || auction.userId === userId
    );
    
    // Sort by created date descending
    userAuctions.sort((a: any, b: any) => new Date(b.createdAt || b.endTime).getTime() - new Date(a.createdAt || a.endTime).getTime());
    
    res.json(userAuctions);
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    res.status(500).json({ error: 'Failed to fetch user auctions' });
  }
});

// Get auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auctions = loadAuctionsData();
    const auction = auctions.find((a: any) => a.id === req.params.id);
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    res.json(auction);
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// Create new auction
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, startingPrice, endTime, pigeon, category } = req.body;
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const role = await fetchUserRoleFromSupabase(req, userId);
    if (role !== 'USER_FULL_VERIFIED' && role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Account not fully verified',
        details: 'Only fully verified users (email + phone) can create auctions.',
      });
    }
    
    const auctions = loadAuctionsData();
    const newAuction = {
      id: Date.now().toString(),
      title,
      description,
      startingPrice,
      currentPrice: startingPrice,
      buyNowPrice: null,
      reservePrice: null,
      endTime: new Date(endTime).toISOString(),
      snipeThresholdMinutes: 5,
      snipeExtensionMinutes: 5,
      minBidIncrement: 100,
      status: 'pending',
      reserveMet: false,
      category: category || 'racing',
      pigeon,
      age: pigeon?.age || null,
      sex: pigeon?.gender || null,
      location: 'Lubań, Polska',
      seller: {
        id: userId,
        firstName: 'MTM',
        lastName: 'Pałka',
        email: 'kontakt@palkamtm.pl',
        phoneNumber: '75 722 47 29',
        image: null,
        rating: 5.0,
        salesCount: 150
      },
      images: [],
      videos: [],
      documents: [],
      bids: [],
      _count: {
        watchlist: 0,
        bids: 0
      }
    };
    
    auctions.push(newAuction);
    saveAuctionsData(auctions);
    
    res.status(201).json(newAuction);
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// Place bid
router.post('/:id/bids', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });
    const auctionId = req.params.id;
    
    const auctions = loadAuctionsData();
    const auctionIndex = auctions.findIndex((a: any) => a.id === auctionId);
    
    if (auctionIndex === -1) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    const auction = auctions[auctionIndex];
    
    if (auction.status !== 'active' || new Date(auction.endTime) < new Date()) {
      return res.status(400).json({ error: 'Auction is not active' });
    }
    
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ error: 'Bid must be higher than current price' });
    }
    
    const newBid = {
      id: `bid-${Date.now()}`,
      amount,
      bidder: {
        id: userId,
        firstName: 'Użytkownik',
        lastName: ''
      },
      createdAt: new Date().toISOString()
    };
    
    // Add bid to auction
    auction.bids.push(newBid);
    auction.currentPrice = amount;
    auction._count.bids = auction.bids.length;
    
    // Update auction in array
    auctions[auctionIndex] = auction;
    saveAuctionsData(auctions);
    
    res.status(201).json(newBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

// Delete auction
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });
    const auctionId = req.params.id;
    
    const auctions = loadAuctionsData();
    const auctionIndex = auctions.findIndex((a: any) => a.id === auctionId);
    
    if (auctionIndex === -1) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    const auction = auctions[auctionIndex];
    
    if (auction.seller?.id !== userId && auction.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Remove auction from array
    auctions.splice(auctionIndex, 1);
    saveAuctionsData(auctions);
    
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({ error: 'Failed to delete auction' });
  }
});

export default router;
