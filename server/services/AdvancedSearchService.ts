import { prisma } from '../lib/db.js';
import type { AdvancedSearchFilters, SavedSearchData } from '../schemas/searchSchemas.js';

export interface SearchResult {
  auctions: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: AdvancedSearchFilters;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AdvancedSearchService {
  /**
   * Zaawansowane wyszukiwanie aukcji z optymalizacją SQL
   */
  static async searchAuctions(filters: AdvancedSearchFilters, page = 1, limit = 20): Promise<SearchResult> {
    try {
      if (!prisma) {
        return { auctions: [], total: 0, page, totalPages: 0 };
      }

      const offset = (page - 1) * limit;
      
      // Budowanie warunków WHERE dla optymalizacji
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Status filter
      if (filters.status && filters.status !== 'all') {
        whereConditions.push(`status = $${paramIndex++}`);
        queryParams.push(filters.status.toUpperCase());
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        whereConditions.push(`category = $${paramIndex++}`);
        queryParams.push(filters.category.toUpperCase());
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'all') {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM pigeon_profiles pp 
          WHERE pp.auction_id = auctions.id 
          AND pp.gender = $${paramIndex++}
        )`);
        queryParams.push(filters.gender.toUpperCase());
      }

      // Price range filter
      if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) {
        if (filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
          whereConditions.push(`current_price BETWEEN $${paramIndex++} AND $${paramIndex++}`);
          queryParams.push(filters.priceRange.min, filters.priceRange.max);
        } else if (filters.priceRange.min !== undefined) {
          whereConditions.push(`current_price >= $${paramIndex++}`);
          queryParams.push(filters.priceRange.min);
        } else if (filters.priceRange.max !== undefined) {
          whereConditions.push(`current_price <= $${paramIndex++}`);
          queryParams.push(filters.priceRange.max);
        }
      }

      // Text search (zaawansowane)
      if (filters.search) {
        whereConditions.push(`(
          to_tsvector('english', title) @@ plainto_tsquery('english', $${paramIndex++}) OR
          to_tsvector('english', description) @@ plainto_tsquery('english', $${paramIndex++}) OR
          title ILIKE $${paramIndex++} OR
          description ILIKE $${paramIndex++} OR
          EXISTS (
            SELECT 1 FROM pigeon_profiles pp 
            WHERE pp.auction_id = auctions.id 
            AND (pp.ring_number ILIKE $${paramIndex} OR pp.pigeon_color ILIKE $${paramIndex})
          )
        )`);
        const searchTerm = `%${filters.search}%`;
        queryParams.push(filters.search, filters.search, searchTerm, searchTerm, searchTerm);
        paramIndex++;
      }

      // Ring number filter
      if (filters.ringNumber) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM pigeon_profiles pp 
          WHERE pp.auction_id = auctions.id 
          AND pp.ring_number ILIKE $${paramIndex++}
        )`);
        queryParams.push(`%${filters.ringNumber}%`);
      }

      // Eye color filter
      if (filters.eyeColor) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM pigeon_profiles pp 
          WHERE pp.auction_id = auctions.id 
          AND pp.eye_color ILIKE $${paramIndex++}
        )`);
        queryParams.push(`%${filters.eyeColor}%`);
      }

      // Pigeon color filter
      if (filters.pigeonColor) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM pigeon_profiles pp 
          WHERE pp.auction_id = auctions.id 
          AND pp.pigeon_color ILIKE $${paramIndex++}
        )`);
        queryParams.push(`%${filters.pigeonColor}%`);
      }

      // Breeder filter
      if (filters.breeder) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auctions.seller_id 
          AND (
            u.first_name ILIKE $${paramIndex++} OR
            u.last_name ILIKE $${paramIndex++} OR
            u.name ILIKE $${paramIndex++}
          )
        )`);
        const breederTerm = `%${filters.breeder}%`;
        queryParams.push(breederTerm, breederTerm, breederTerm);
      }

      // Sortowanie
      let orderClause = 'ORDER BY ';
      switch (filters.sortBy) {
        case 'price-high':
          orderClause += 'current_price DESC';
          break;
        case 'price-low':
          orderClause += 'current_price ASC';
          break;
        case 'ending-soon':
          orderClause += 'ends_at ASC';
          break;
        case 'newest':
        default:
          orderClause += 'created_at DESC';
          break;
      }

      // Główne zapytanie
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const query = `
        SELECT 
          a.*,
          COUNT(*) OVER() as total_count
        FROM auctions a
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(limit, offset);

      // Wykonanie zapytania
      const result = await (prisma as any).$queryRawUnsafe(query, ...queryParams);
      
      const auctions = result.map((row: any) => ({
        ...row,
        startingPrice: Number(row.starting_price),
        currentPrice: Number(row.current_price),
        buyNowPrice: row.buy_now_price ? Number(row.buy_now_price) : null,
        reservePrice: row.reserve_price ? Number(row.reserve_price) : null,
      }));

      const total = result.length > 0 ? Number(result[0].total_count) : 0;
      const totalPages = Math.ceil(total / limit);

      return {
        auctions,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error in advanced search:', error);
      return { auctions: [], total: 0, page, totalPages: 0 };
    }
  }

  /**
   * Zapisanie wyszukiwania
   */
  static async saveSearch(userId: string, searchData: SavedSearchData): Promise<SavedSearch> {
    try {
      if (!prisma) {
        throw new Error('Database not available');
      }

      const savedSearch = await (prisma as any).savedSearch.create({
        data: {
          userId,
          name: searchData.name,
          filters: searchData.filters,
          isActive: searchData.isActive,
        },
      });

      return {
        id: savedSearch.id,
        userId: savedSearch.userId,
        name: savedSearch.name,
        filters: savedSearch.filters,
        isActive: savedSearch.isActive,
        createdAt: savedSearch.createdAt.toISOString(),
        updatedAt: savedSearch.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  /**
   * Pobranie zapisanych wyszukiwań użytkownika
   */
  static async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      if (!prisma) {
        return [];
      }

      const savedSearches = await (prisma as any).savedSearch.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return savedSearches.map((search: any) => ({
        id: search.id,
        userId: search.userId,
        name: search.name,
        filters: search.filters,
        isActive: search.isActive,
        createdAt: search.createdAt.toISOString(),
        updatedAt: search.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      return [];
    }
  }

  /**
   * Usunięcie zapisanego wyszukiwania
   */
  static async deleteSavedSearch(userId: string, searchId: string): Promise<boolean> {
    try {
      if (!prisma) {
        return false;
      }

      const result = await (prisma as any).savedSearch.deleteMany({
        where: { 
          id: searchId,
          userId: userId,
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return false;
    }
  }

  /**
   * Sprawdzanie nowych aukcji pasujących do zapisanych wyszukiwań
   */
  static async checkForNewAuctions(): Promise<void> {
    try {
      if (!prisma) return;

      // Pobierz aktywne zapisane wyszukiwania
      const activeSearches = await (prisma as any).savedSearch.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, email: true }
          }
        },
      });

      for (const savedSearch of activeSearches) {
        const filters = savedSearch.filters as AdvancedSearchFilters;
        
        // Sprawdź czy są nowe aukcje pasujące do filtrów
        const result = await this.searchAuctions(filters, 1, 5);
        
        if (result.auctions.length > 0) {
          // Wyślij powiadomienie do użytkownika
          await this.sendSearchNotification(savedSearch.user.id, savedSearch.name, result.auctions.length);
        }
      }
    } catch (error) {
      console.error('Error checking for new auctions:', error);
    }
  }

  /**
   * Wysyłanie powiadomienia o nowych aukcjach
   */
  private static async sendSearchNotification(userId: string, searchName: string, count: number): Promise<void> {
    try {
      const NotificationManager = (await import('../services/NotificationManager.js')).default;
      
      await NotificationManager.createNotification({
        userId,
        type: 'SAVED_SEARCH_MATCH' as any,
        title: 'Nowe aukcje pasujące do Twojego wyszukiwania',
        message: `Znaleziono ${count} nowych aukcji pasujących do "${searchName}"`,
        auctionId: undefined,
      });
    } catch (error) {
      console.error('Error sending search notification:', error);
    }
  }

  /**
   * Sugestie wyszukiwania (AI-powered)
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!prisma || !query || query.length < 2) {
        return [];
      }

      const suggestions = await (prisma as any).$queryRawUnsafe(`
        SELECT DISTINCT 
          title,
          description,
          (SELECT ring_number FROM pigeon_profiles pp WHERE pp.auction_id = auctions.id LIMIT 1) as ring_number
        FROM auctions 
        WHERE 
          title ILIKE $1 OR 
          description ILIKE $1 OR
          EXISTS (
            SELECT 1 FROM pigeon_profiles pp 
            WHERE pp.auction_id = auctions.id 
            AND pp.ring_number ILIKE $1
          )
        LIMIT 10
      `, `%${query}%`);

      return suggestions
        .map((row: any) => [
          row.title,
          row.ring_number,
        ])
        .flat()
        .filter(Boolean)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
}

export default AdvancedSearchService;
