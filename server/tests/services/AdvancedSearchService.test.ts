import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db.js', () => ({
  prisma: {
    $queryRawUnsafe: vi.fn(),
    savedSearch: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from '../../lib/db.js';
import AdvancedSearchService from '../../services/AdvancedSearchService.js';

describe('AdvancedSearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchAuctions', () => {
    it('should return auctions with pagination', async () => {
      const mockResults = [
        {
          id: 'auction-1',
          title: 'Test Pigeon',
          current_price: 100,
          starting_price: 50,
          total_count: BigInt(1),
        },
      ];
      (prisma!.$queryRawUnsafe as any).mockResolvedValue(mockResults);

      const result = await AdvancedSearchService.searchAuctions({}, 1, 20);

      expect(result.auctions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply status filter', async () => {
      (prisma!.$queryRawUnsafe as any).mockResolvedValue([]);

      await AdvancedSearchService.searchAuctions({ status: 'active' }, 1, 20);

      expect(prisma!.$queryRawUnsafe).toHaveBeenCalled();
      const query = (prisma!.$queryRawUnsafe as any).mock.calls[0][0];
      expect(query).toContain('status = ');
    });

    it('should apply category filter', async () => {
      (prisma!.$queryRawUnsafe as any).mockResolvedValue([]);

      await AdvancedSearchService.searchAuctions({ category: 'racing' }, 1, 20);

      expect(prisma!.$queryRawUnsafe).toHaveBeenCalled();
      const query = (prisma!.$queryRawUnsafe as any).mock.calls[0][0];
      expect(query).toContain('category = ');
    });

    it('should apply price range filter', async () => {
      (prisma!.$queryRawUnsafe as any).mockResolvedValue([]);

      await AdvancedSearchService.searchAuctions({ 
        priceRange: { min: 100, max: 500 } 
      }, 1, 20);

      expect(prisma!.$queryRawUnsafe).toHaveBeenCalled();
      const query = (prisma!.$queryRawUnsafe as any).mock.calls[0][0];
      expect(query).toContain('current_price BETWEEN');
    });

    it('should handle empty results', async () => {
      (prisma!.$queryRawUnsafe as any).mockResolvedValue([]);

      const result = await AdvancedSearchService.searchAuctions({}, 1, 20);

      expect(result.auctions).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should sort by price-high', async () => {
      (prisma!.$queryRawUnsafe as any).mockResolvedValue([]);

      await AdvancedSearchService.searchAuctions({ sortBy: 'price-high' }, 1, 20);

      const query = (prisma!.$queryRawUnsafe as any).mock.calls[0][0];
      expect(query).toContain('ORDER BY current_price DESC');
    });

    it('should sort by ending-soon', async () => {
      (prisma!.$queryRawUnsafe as any).mockResolvedValue([]);

      await AdvancedSearchService.searchAuctions({ sortBy: 'ending-soon' }, 1, 20);

      const query = (prisma!.$queryRawUnsafe as any).mock.calls[0][0];
      expect(query).toContain('ORDER BY ends_at ASC');
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array for short query', async () => {
      const result = await AdvancedSearchService.getSearchSuggestions('a');

      expect(result).toEqual([]);
      expect(prisma!.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it('should return suggestions for valid query', async () => {
      const mockSuggestions = [
        { title: 'Champion Pigeon', ringnumber: 'PL-123' },
        { title: 'Racing Bird', ringnumber: null },
      ];
      (prisma!.$queryRawUnsafe as any).mockResolvedValue(mockSuggestions);

      const result = await AdvancedSearchService.getSearchSuggestions('champion');

      expect(result).toContain('Champion Pigeon');
      expect(result).toContain('PL-123');
    });
  });

  describe('saveSearch', () => {
    it('should create saved search', async () => {
      const mockSavedSearch = {
        id: 'search-1',
        userId: 'user-1',
        name: 'My Search',
        filters: { status: 'active' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma!.savedSearch.create as any).mockResolvedValue(mockSavedSearch);

      const result = await AdvancedSearchService.saveSearch('user-1', {
        name: 'My Search',
        filters: { status: 'active' },
        isActive: true,
      });

      expect(result.name).toBe('My Search');
      expect(result.isActive).toBe(true);
    });
  });

  describe('getSavedSearches', () => {
    it('should return user saved searches', async () => {
      const mockSearches = [
        { id: 'search-1', name: 'Search 1', filters: {}, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma!.savedSearch.findMany as any).mockResolvedValue(mockSearches);

      const result = await AdvancedSearchService.getSavedSearches('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Search 1');
    });
  });

  describe('deleteSavedSearch', () => {
    it('should delete saved search and return true', async () => {
      (prisma!.savedSearch.deleteMany as any).mockResolvedValue({ count: 1 });

      const result = await AdvancedSearchService.deleteSavedSearch('user-1', 'search-1');

      expect(result).toBe(true);
    });

    it('should return false if search not found', async () => {
      (prisma!.savedSearch.deleteMany as any).mockResolvedValue({ count: 0 });

      const result = await AdvancedSearchService.deleteSavedSearch('user-1', 'non-existent');

      expect(result).toBe(false);
    });
  });
});
