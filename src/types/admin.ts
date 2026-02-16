export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username?: string;
  createdAt: string;
  phone?: string;
  isBlocked?: boolean;
  isBanned?: boolean;
  password?: string;
}

export interface AuctionData {
  id: string;
  title: string;
  description?: string;
  currentPrice: number;
  startingPrice?: number;
  buyNowPrice?: number;
  status: string;
  createdAt: string;
  endTime?: string;
  minBidIncrement?: number;
  category?: string;
  sex?: string;
  seller: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeAuctions: number;
  totalAuctions: number;
  totalVolume: number;
  averagePrice?: number;
  usersByRole?: Record<string, number>;
  auctionsByStatus?: Record<string, number>;
  auctionsByCategory?: Record<string, number>;
  topSellers?: any[];
  topBidders?: any[];
  payments?: {
    total: number;
    count: number;
  };
}

export interface HistoricalStats {
  usersByDay: Record<string, number>;
  auctionsByDay: Record<string, number>;
  bidsByDay: Record<string, number>;
  bidVolumeByDay: Record<string, number>;
}
