import { useMemo } from 'react';
import type { Auction } from '@/types/auction';

interface AuctionFilters {
  searchTerm?: string;
  priceMin?: number;
  priceMax?: number;
  category?: string;
  gender?: string;
}

export function useAuctionFilters(auctions: Auction[], filters: AuctionFilters) {
  return useMemo(() => {
    return auctions.filter(auction => {
      const matchesSearch = !filters.searchTerm ||
        auction.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        auction.pigeon?.ringNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesPrice =
        (!filters.priceMin || auction.currentPrice >= filters.priceMin) &&
        (!filters.priceMax || auction.currentPrice <= filters.priceMax);

      const matchesCategory =
        !filters.category || filters.category === "all" || auction.category === filters.category;

      const matchesGender =
        !filters.gender || filters.gender === "all" || auction.pigeon?.gender === filters.gender;

      return matchesSearch && matchesPrice && matchesCategory && matchesGender;
    });
  }, [auctions, filters]);
}
