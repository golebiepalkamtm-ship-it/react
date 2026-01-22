import express, { type Router } from 'express';
import { prisma } from '../lib/db.js';
import { createClient } from '@supabase/supabase-js';

const router: Router = express.Router();

// Initialize Supabase Admin Client if credentials exist
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Middleware: ensure authenticated user is admin
 */
async function ensureAdmin(req: any, res: any, next: any) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const user = await prisma!.user.findUnique({
      where: { id: userId },
      select: { role: true } as any
    });

    if (!user || (user as any).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('ensureAdmin error:', err);
    res.status(500).json({ error: 'Server error during admin verification' });
  }
}

/**
 * Pobiera statystyki systemowe
 */
router.get('/stats', ensureAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma!.user.count();
    const activeAuctions = await prisma!.auction.count({ where: { status: 'ACTIVE' } });
    const totalAuctions = await prisma!.auction.count();
    
    // Suma najwyższych ofert (uproszczone statystyki finansowe)
    const auctions = await prisma!.auction.findMany({
      select: { currentPrice: true }
    });
    const totalVolume = auctions.reduce((sum, a) => sum + Number(a.currentPrice), 0);

    res.json({
      totalUsers,
      activeAuctions,
      totalAuctions,
      totalVolume
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Lista użytkowników z paginacją
 */
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const skip = (page - 1) * limit;

    const users = await prisma!.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        first_name: true,
        last_name: true,
        role: true,
        createdAt: true
      } as any
    });

    const total = await prisma!.user.count();

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Zarządzanie aukcjami (lista wszystkich)
 */
router.get('/auctions', ensureAdmin, async (req, res) => {
  try {
    const auctions = await prisma!.auction.findMany({
      include: {
        seller: {
          select: { 
            first_name: true, 
            last_name: true, 
            email: true,
            name: true
          }
        },
        bids: {
          include: {
            bidder: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            bids: true,
            watchlist: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(auctions);
  } catch (error: any) {
    console.error('Admin auctions error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Zmiana roli użytkownika
 */
router.put('/users/:id/role', ensureAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const updated = await prisma!.user.update({
      where: { id },
      data: { role: role } as any
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Akcje na aukcjach (np. zakończenie przed czasem)
 */
router.post('/auctions/:id/:action', ensureAdmin, async (req, res) => {
  try {
    const { id, action } = req.params;

    if (action === 'end') {
      const updated = await prisma!.auction.update({
        where: { id },
        data: { status: 'ENDED' }
      });
      return res.json(updated);
    }

    if (action === 'delete') {
      await prisma!.auction.delete({ where: { id } });
      return res.json({ success: true });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user details (Full Admin Access)
 */
router.patch('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, role, isBlocked, isBanned } = req.body;

    // Optional: Add validation logic here

    const updated = await prisma!.user.update({
      where: { id },
      data: {
        email,
        first_name,
        last_name,
        role,
        isBlocked,
        isBanned
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete user (Full Admin Access)
 */
router.delete('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma!.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update auction (Full Admin Access)
 */
router.patch('/auctions/:id', ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startingPrice, buyNowPrice, reservePrice, status, endTime } = req.body;

    const updated = await prisma!.auction.update({
      where: { id },
      data: {
        title,
        description,
        startingPrice,
        buyNowPrice: buyNowPrice || null,
        reservePrice,
        status,
        endTime
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete auction (Standard DELETE)
 */
router.delete('/auctions/:id', ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma!.auction.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new user
 */
router.post('/users', ensureAdmin, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase Admin not configured on server' });
    }
    const { email, password, first_name, last_name, role, phone } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Create in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name }
    });

    if (authError || !authUser.user) {
        throw new Error(`Auth creation failed: ${authError?.message}`);
    }

    // 2. Create/Update in Public Schema
    const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 8);
    const newUser = await prisma!.user.upsert({
        where: { id: authUser.user.id },
        update: {
            email,
            first_name,
            last_name,
            role: role || 'USER_REGISTERED',
            phone,
            name: `${first_name} ${last_name}`.trim(),
            username
        },
        create: {
            id: authUser.user.id,
            email,
            first_name,
            last_name,
            role: role || 'USER_REGISTERED',
            phone,
            trustScore: 0,
            name: `${first_name} ${last_name}`.trim(),
            username
        }
    });

    res.json(newUser);

  } catch (error: any) {
    console.error('Create User Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create new auction
 */
router.post('/auctions', ensureAdmin, async (req, res) => {
  try {
    const { title, description, startingPrice, buyNowPrice, reservePrice, status, endTime, sellerId, category, sex, minBidIncrement } = req.body;
    
    // Validate seller exists
    let finalSellerId = sellerId;
    if (finalSellerId) {
       const userExists = await prisma!.user.findUnique({ where: { id: finalSellerId } });
       if (!userExists) return res.status(400).json({ error: 'Provided sellerId does not exist' });
    } else {
       finalSellerId = (req as any).user?.id;
    }

    const newAuction = await prisma!.auction.create({
        data: {
            title,
            description,
            startingPrice: startingPrice || 0,
            currentPrice: startingPrice || 0,
            buyNowPrice: buyNowPrice || null,
            reservePrice,
            status: status || 'ACTIVE',
            endTime: endTime ? new Date(endTime) : null,
            category: category || 'RACING',
            sex: sex || 'MALE',
            sellerId: finalSellerId,
            minBidIncrement: minBidIncrement || 100
        }
    });
    res.json(newAuction);
  } catch (error: any) {
    console.error('Create Auction Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
