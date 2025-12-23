export interface Bidder {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Bid {
  id: string;
  amount: number;
  bidder: Bidder;
  createdAt: string;
}

export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image: string | null;
  rating: number;
  salesCount: number;
}

export interface Pigeon {
  bloodline: string;
  achievements: string;
  eyeColor: string;
  featherColor: string;
  vitality: string;
  length: string;
  endurance: string;
  forkStrength: string;
  forkAlignment: string;
  muscles: string;
  balance: string;
  back: string;
  purpose: string;
  gender: 'male' | 'female';
}

export interface AuctionCount {
  watchlist: number;
  bids: number;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  endTime: string;
  snipeThresholdMinutes?: number;
  snipeExtensionMinutes?: number;
  minBidIncrement?: number;
  status: 'active' | 'ended' | 'cancelled';
  reserveMet: boolean;
  category: 'racing' | 'breeding' | 'show';
  pigeon: Pigeon;
  age: number;
  sex: 'male' | 'female';
  location: string;
  seller: Seller;
  images: string[];
  videos: string[];
  documents: string[];
  bids: Bid[];
  _count: AuctionCount;
}

export interface AuctionListItem {
  id: string;
  title: string;
  currentPrice: number;
  images: string[];
  endTime: string;
  category?: string;
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
  category: 'racing' | 'breeding' | 'show';
  pigeon: Partial<Pigeon>;
  age: number;
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
