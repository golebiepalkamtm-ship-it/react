import express from 'express';
import { prisma } from '../lib/db.js';

const router = express.Router();

/**
 * Middleware: ensure authenticated user is admin
 */
async function ensureAdmin(req: any, res: any, next: any) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const user = await prisma!.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
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
      }
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
      data: { role }
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

export default router;
