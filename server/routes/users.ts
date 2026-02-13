import express, { type Router } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/db.js';

const router: Router = express.Router();

// Get current user profile
router.get('/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const userProfile = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userProfile) return res.status(404).json({ error: 'Profile not found' });

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.patch('/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure request body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Nieprawidłowy format danych. Wymagany format JSON.' });
    }

    const allowedFields = [
      'username', 
      'phone', 
      'name', 
      'first_name', 
      'last_name', 
      'street', 
      'postal_code', 
      'city', 
      'country'
    ];

    const updates = req.body || {};
    const filteredUpdates: Record<string, any> = {};

    Object.keys(updates).forEach(key => {
      // Basic type checking - prevent objects/arrays where strings/primitives are expected (except avatarUrl potentially, but simple string is best)
      if (allowedFields.includes(key) && updates[key] !== null) {
          const value = updates[key];
          // Simple safeguard against non-primitive types for text fields
          if (typeof value === 'object') {
             return; // Skip complex objects to avoid Prisma issues
          }
          filteredUpdates[key] = value;
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'Brak poprawnych pól do aktualizacji.' });
    }

    // Special validation for username if present
    if (filteredUpdates.username) {
        const existingUser = await prisma.user.findFirst({
            where: { 
                username: { equals: filteredUpdates.username, mode: 'insensitive' },
                NOT: { id: userId }
            }
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Ta nazwa użytkownika jest już zajęta. Wybierz inną.' });
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...filteredUpdates,
        updatedAt: new Date(),
      }
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Profil użytkownika nie został znaleziony. Skontaktuj się z pomocą techniczną.' });
    }
    if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target;
        if (Array.isArray(target) && target.includes('username')) {
             return res.status(409).json({ error: 'Ta nazwa użytkownika jest już zajęta. Wybierz inną.' });
        }
        if (Array.isArray(target) && target.includes('email')) {
             return res.status(409).json({ error: 'Ten adres email jest już powiązany z innym kontem.' });
        }
        return res.status(409).json({ error: 'Jedna z wprowadzonych wartości jest już zajęta. Sprawdź poprawność danych.' });
    }

    res.status(500).json({ 
        error: 'Wystąpił błąd podczas aktualizacji profilu. Spróbuj ponownie później.', 
        details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        trustScore: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
