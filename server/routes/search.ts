import express, { type Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { advancedSearchSchema, savedSearchSchema } from '../schemas/searchSchemas.js';
import AdvancedSearchService from '../services/AdvancedSearchService.js';

const router: Router = express.Router();

// Advanced search endpoint
router.get('/advanced', validate(advancedSearchSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const filters = req.query;
    const page = parseInt(filters.page as string) || 1;
    const limit = parseInt(filters.limit as string) || 20;

    const result = await AdvancedSearchService.searchAuctions(filters, page, limit);
    res.json(result);
  } catch (error: any) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search suggestions (AI-powered)
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const suggestions = await AdvancedSearchService.getSearchSuggestions(q);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.json([]);
  }
});

// Save search
router.post('/saved', authMiddleware, validate(savedSearchSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const { name, filters, isActive } = req.body;
    
    const savedSearch = await AdvancedSearchService.saveSearch(userId, {
      name,
      filters,
      isActive: isActive ?? true,
    });

    res.status(201).json(savedSearch);
  } catch (error: any) {
    console.error('Error saving search:', error);
    res.status(500).json({ error: 'Failed to save search' });
  }
});

// Get saved searches
router.get('/saved', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const savedSearches = await AdvancedSearchService.getSavedSearches(userId);
    res.json(savedSearches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.json([]);
  }
});

// Delete saved search
router.delete('/saved/:searchId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const { searchId } = req.params;
    
    const success = await AdvancedSearchService.deleteSavedSearch(userId, searchId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Saved search not found' });
    }
  } catch (error) {
    console.error('Error deleting saved search:', error);
    res.status(500).json({ error: 'Failed to delete saved search' });
  }
});

export default router;
