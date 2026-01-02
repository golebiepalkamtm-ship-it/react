import type { Auction, AuctionCategory, Bid, Pigeon } from '@shared/contracts/auction';
export type { Auction, AuctionCategory, Bid, Bidder, Pigeon, Seller } from '@shared/contracts/auction';

export interface AuctionCount {
  watchlist: number;
  bids: number;
}

export interface AuctionListItem {
  id: string;
  title: string;
  currentPrice: number;
  images: string[];
  endTime: string;
  category?: AuctionCategory | string;
  pigeon?: {
    bloodline?: string;
    achievements?: string;
    gender?: string;
  };
}

export interface AuctionsResponse {
  auctions: Auction[];
}

export interface BidRequest {
  amount: number;
  maxBid?: number;
  displayName?: string;
}

export interface BidResponse {
  success: boolean;
  bid: Bid;
  meta: {
    wasExtended: boolean;
    newEndTime: string | null;
    autoBidTriggered: boolean;
  };
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startingPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  endTime: string;
  snipeThresholdMinutes?: number;
  snipeExtensionMinutes?: number;
  minBidIncrement?: number;
  category: AuctionCategory;
  pigeon: Partial<Pigeon>;
  sex: 'male' | 'female';
  location: string;
  images: string[];
  videos?: string[];
  documents?: string[];
}

export type AuctionSortBy = 'newest' | 'ending-soon' | 'price-high' | 'price-low';
export type AuctionStatus = 'active' | 'ended' | 'cancelled';

export interface AuctionFilters {
  status?: AuctionStatus;
  sortBy?: AuctionSortBy;
  limit?: number;
  category?: string;
  gender?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}
