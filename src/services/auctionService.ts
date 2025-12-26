import apiClient from './api';
import type {
  Auction,
  AuctionsResponse,
  AuctionFilters,
  BidRequest,
  BidResponse,
  CreateAuctionRequest,
} from '@/types/auction';

export const auctionService = {
  /**
   * Pobierz listę aukcji z filtrami
   */
  async getAuctions(filters: AuctionFilters = {}): Promise<Auction[]> {
    const params: Record<string, string | number | undefined> = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.limit) params.limit = filters.limit;
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.gender) params.gender = filters.gender;
    if (filters.priceMin) params.priceMin = filters.priceMin;
    if (filters.priceMax) params.priceMax = filters.priceMax;
    
    const response = await apiClient.get<AuctionsResponse>('/auctions', params);
    let auctions = response.auctions;

    // Filtrowanie po stronie klienta
    if (filters.search) {
      const term = filters.search.toLowerCase();
      auctions = auctions.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.pigeon?.bloodline?.toLowerCase().includes(term)
      );
    }
    if (filters.category && filters.category !== 'all') {
      auctions = auctions.filter(a => a.category === filters.category);
    }
    if (filters.gender && filters.gender !== 'all') {
      auctions = auctions.filter(a => a.pigeon?.gender === filters.gender);
    }
    if (filters.priceMin) {
      auctions = auctions.filter(a => a.currentPrice >= filters.priceMin!);
    }
    if (filters.priceMax) {
      auctions = auctions.filter(a => a.currentPrice <= filters.priceMax!);
    }

    return auctions;
  },

  /**
   * Pobierz pojedynczą aukcję po ID
   */
  async getAuctionById(id: string): Promise<Auction> {
    return apiClient.get<Auction>(`/auctions/${id}`);
  },

  /**
   * Złóż ofertę na aukcji
   */
  async placeBid(auctionId: string, bidData: BidRequest, token: string | null): Promise<BidResponse> {
    if (!token) throw new Error('Authentication required');
    return apiClient.post<BidResponse>(`/auctions/${auctionId}/bids`, bidData, token);
  },

  /**
   * Utwórz nową aukcję
   */
  async createAuction(data: CreateAuctionRequest, token: string | null): Promise<Auction> {
    if (!token) throw new Error('Authentication required');
    return apiClient.post<Auction>('/auctions', data, token);
  },

  /**
   * Pobierz aukcje użytkownika
   */
  async getUserAuctions(token: string | null): Promise<Auction[]> {
    if (!token) throw new Error('Authentication required');
    return apiClient.get<Auction[]>('/auctions/my');
  },

  /**
   * Usuń aukcję
   */
  async deleteAuction(id: string, token: string | null): Promise<void> {
    if (!token) throw new Error('Authentication required');
    await apiClient.delete(`/auctions/${id}`, token);
  },

  /**
   * Oblicz pozostały czas aukcji
   */
  calculateTimeLeft(endTime: string): string {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Zakończona';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  /**
   * Sprawdź czy aukcja jest aktywna
   */
  isAuctionActive(auction: Auction): boolean {
    if (auction.status !== 'active') return false;
    return new Date(auction.endTime).getTime() > Date.now();
  },

  /**
   * Oblicz minimalną następną ofertę
   */
  getMinimumBid(auction: Auction): number {
    const increment = auction.minBidIncrement || 100;
    return auction.currentPrice + increment;
  },

  /**
   * Wyodrębnij liczbę wygranych z achievements
   */
  extractWins(achievements?: string): number | undefined {
    if (!achievements) return undefined;
    const match = achievements.match(/(\d+)\s*(wygranych|wins)/i);
    return match ? parseInt(match[1]) : undefined;
  },

  /**
   * Sprawdź czy jest blisko końca (snipe protection)
   */
  isNearEnd(auction: Auction): boolean {
    const threshold = (auction.snipeThresholdMinutes || 5) * 60 * 1000;
    const timeLeft = new Date(auction.endTime).getTime() - Date.now();
    return timeLeft > 0 && timeLeft <= threshold;
  },
};

export default auctionService;
