/**
 * Auth Routes
 * 
 * Endpointy obsługujące synchronizację użytkowników Supabase Auth
 * z lokalną bazą danych (Prisma).
 * 
 * Auth flow:
 * 1. Frontend → Supabase Auth SDK (signIn/signUp/OAuth)
 * 2. Supabase wydaje JWT
 * 3. Frontend wysyła JWT do backendu w nagłówku Authorization
 * 4. authMiddleware weryfikuje JWT i ustawia req.user
 * 5. Te endpointy synchronizują profil użytkownika z bazą
 */

import express, { type Router, type Response } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/db.js';

const router: Router = express.Router();

/**
 * POST /api/auth/sync
 * Synchronizuje użytkownika Supabase z bazą Prisma.
 * Wywoływany po zalogowaniu, aby upewnić się, że profil istnieje.
 */
router.post('/sync', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji.' });
    }

    if (!prisma) {
      return res.status(500).json({ error: 'Baza danych niedostępna.' });
    }

    // Upsert — tworzy profil jeśli nie istnieje, aktualizuje email jeśli się zmienił
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: email || undefined,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email: email || '',
        username: email?.split('@')[0] || `user_${userId.slice(0, 8)}`,
        role: 'USER_REGISTERED',
        trustScore: 0,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas synchronizacji profilu.' });
  }
});

/**
 * GET /api/auth/me
 * Zwraca dane aktualnie zalogowanego użytkownika.
 */
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji.' });
    }

    if (!prisma) {
      return res.status(500).json({ error: 'Baza danych niedostępna.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
        trustScore: true,
        createdAt: true,
        street: true,
        city: true,
        postal_code: true,
        country: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Profil użytkownika nie został znaleziony.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania profilu.' });
  }
});

/**
 * DELETE /api/auth/account
 * Pozwala użytkownikowi usunąć swoje konto.
 */
router.delete('/account', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Brak autoryzacji.' });
    }

    if (!prisma) {
      return res.status(500).json({ error: 'Baza danych niedostępna.' });
    }

    // Sprawdź czy użytkownik nie ma aktywnych aukcji
    const activeAuctions = await prisma.auction.count({
      where: {
        sellerId: userId,
        status: 'ACTIVE',
      },
    });

    if (activeAuctions > 0) {
      return res.status(400).json({
        error: 'Nie można usunąć konta z aktywnymi aukcjami. Najpierw zakończ wszystkie aukcje.',
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.json({ success: true, message: 'Konto zostało usunięte.' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas usuwania konta.' });
  }
});

export default router;
