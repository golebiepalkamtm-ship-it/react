export interface Bidder {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface Bid {
  id: string;
  amount: number;
  bidder: Bidder;
  createdAt: string;
}

export interface Seller {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image: string | null;
  rating: number;
  salesCount: number;
}

export interface Pigeon {
  ringNumber: string;
  eyeColor: string;
  pigeonColor: string;
  construction: string;
  pedigreeUrl?: string;
  vitality: string;
  length: string;
  endurance: string;
  forkStrength: string;
  forkAlignment: string;
  muscles: string;
  shoulders: string;
  balance: string;
  back: string;
  feathers: string;
  purpose: string;
  gender: "MALE" | "FEMALE";
  dnaCertificate?: boolean;
  colorTraits?: string[];
  eyeTraits?: string[];
  bodyStructureTraits?: string[];
  breastboneTraits?: string[];
  forkTraits?: string[];
  musculatureTraits?: string[];
  backTraits?: string[];
  wingTraits?: string[];
  wingBehaviorTraits?: string[];
  breedingValueTraits?: string[];
  distanceTraits?: string[];
}

export interface AuctionCount {
  watchlist: number;
  bids: number;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice?: number;
  currentPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  endTime: string;
  snipeThresholdMinutes?: number;
  snipeExtensionMinutes?: number;
  minBidIncrement?: number;
  status: "active" | "ended" | "cancelled";
  reserveMet: boolean;
  category: string;
  pigeon: Pigeon;
  sex: "MALE" | "FEMALE";
  location: string;
  seller?: Seller;
  images: string[];
  videos: string[];
  documents: string[];
  bids: Bid[];
  _count: AuctionCount;
  views: number;
}

export interface AuctionListItem {
  id: string;
  title: string;
  currentPrice: number;
  images: string[];
  endTime: string;
  category?: string;
  pigeon?: {
    ringNumber?: string;
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
  startingPrice?: number;
  buyNowPrice?: number;
  reservePrice?: number;
  durationDays?: number;
  durationHours?: number;
  endTime: string;
  category: string;
  pigeon: Partial<Pigeon>;
  sex: "MALE" | "FEMALE";
  location: string;
  images: string[];
  videos: string[];
  documents?: string[];
  pedigreeUrl?: string;
}

export type AuctionSortBy =
  | "newest"
  | "ending-soon"
  | "price-high"
  | "price-low";
export type AuctionStatus = "active" | "ended" | "cancelled";

export interface AuctionFilters {
  status?: AuctionStatus;
  sortBy?: AuctionSortBy;
  limit?: number;
  category?: string;
  gender?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sellerId?: string;
}
