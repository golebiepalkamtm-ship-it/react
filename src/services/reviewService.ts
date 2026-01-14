import apiClient from './api';

export interface Review {
  id: string;
  auctionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface SellerReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
}

export interface ReviewEligibilityResponse {
  canReview: boolean;
  reason?: string;
}

export interface TrustScoreResponse {
  trustScore: number;
}

export interface CreateReviewRequest {
  auctionId: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  /**
   * Wystawia recenzję
   */
  async createReview(data: CreateReviewRequest, token: string | null): Promise<Review> {
    if (!token) throw new Error('Authentication required');
    return apiClient.post<Review>('/reviews', data, token);
  },

  /**
   * Pobiera recenzje sprzedającego
   */
  async getSellerReviews(userId: string, page = 1, limit = 10): Promise<SellerReviewsResponse> {
    return apiClient.get<SellerReviewsResponse>(`/reviews/seller/${userId}`, {
      page: page.toString(),
      limit: limit.toString(),
    });
  },

  /**
   * Sprawdza czy można wystawić recenzję
   */
  async canReview(auctionId: string, token: string | null): Promise<ReviewEligibilityResponse> {
    if (!token) throw new Error('Authentication required');
    return apiClient.getWithToken<ReviewEligibilityResponse>(`/reviews/can-review/${auctionId}`, undefined, token);
  },

  /**
   * Pobiera trust score użytkownika
   */
  async getTrustScore(userId: string): Promise<TrustScoreResponse> {
    return apiClient.get<TrustScoreResponse>(`/reviews/trust-score/${userId}`);
  },

  /**
   * Formatuje ocenę jako gwiazdki
   */
  renderStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return '★'.repeat(fullStars) + 
           (halfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  },

  /**
   * Formatuje czas recenzji
   */
  formatReviewTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL');
  },

  /**
   * Zwraca kolor oceny
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  }
};

export default reviewService;
