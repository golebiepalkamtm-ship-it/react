import { prisma } from '../lib/db.js';

export interface ReviewData {
  auctionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
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
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
}

export class ReviewService {
  /**
   * Tworzy nową recenzję
   * Waliduje czy użytkownik może wystawić recenzję (tylko zwycięzca zakończonej aukcji)
   */
  static async createReview(data: ReviewData): Promise<ReviewResponse> {
    try {
      // Defensive programming - walidacja inputów
      if (!data.auctionId || !data.reviewerId || !data.revieweeId || !data.rating) {
        throw new Error('Missing required review fields');
      }

      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      if (!prisma) {
        throw new Error('Database not available');
      }

      // Sprawdzenie czy aukcja istnieje i jest zakończona
      const auction = await prisma.auction.findUnique({
        where: { id: data.auctionId },
        include: {
          seller: true,
          winner: true,
        },
      });

      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.status !== 'ENDED') {
        throw new Error('Can only review ended auctions');
      }

      // Sprawdzenie czy recenzent jest zwycięzcą aukcji
      if (auction.winnerId !== data.reviewerId) {
        throw new Error('Only auction winner can leave a review');
      }

      // Sprawdzenie czy recenzowany jest sprzedającym
      if (auction.sellerId !== data.revieweeId) {
        throw new Error('Can only review the seller');
      }

      // Sprawdzenie czy recenzja już istnieje
      const existingReview = await prisma.review.findUnique({
        where: {
          auctionId_reviewerId: {
            auctionId: data.auctionId,
            reviewerId: data.reviewerId,
          },
        },
      });

      if (existingReview) {
        throw new Error('Review already exists for this auction');
      }

      // Tworzenie recenzji
      const review = await prisma.review.create({
        data: {
          auctionId: data.auctionId,
          reviewerId: data.reviewerId,
          revieweeId: data.revieweeId,
          rating: data.rating,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Aktualizacja trust score sprzedającego
      await this.updateTrustScore(data.revieweeId);

      return {
        id: review.id,
        auctionId: review.auctionId,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        rating: review.rating,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        reviewer: {
          id: review.reviewer.id,
          firstName: review.reviewer.first_name,
          lastName: review.reviewer.last_name,
          avatarUrl: review.reviewer.avatarUrl ?? null,
        },
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Pobiera recenzje dla danego użytkownika (jako sprzedający)
   */
  static async getSellerReviews(userId: string, page = 1, limit = 10): Promise<{
    reviews: ReviewResponse[];
    total: number;
    averageRating: number;
  }> {
    try {
      if (!userId) throw new Error('User ID is required');

      if (!prisma) {
        return { reviews: [], total: 0, averageRating: 0 };
      }

      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { revieweeId: userId },
          include: {
            reviewer: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                avatarUrl: true,
              },
            },
            auction: {
              select: {
                id: true,
                title: true,
                currentPrice: true,
                endTime: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.review.count({
          where: { revieweeId: userId },
        }),
      ]);

      // Obliczanie średniej oceny
      const ratingResult = await prisma.review.aggregate({
        where: { revieweeId: userId },
        _avg: { rating: true },
      });

      const averageRating = ratingResult._avg.rating || 0;

      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        auctionId: review.auctionId,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        rating: review.rating,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        reviewer: {
          id: review.reviewer.id,
          firstName: review.reviewer.first_name,
          lastName: review.reviewer.last_name,
          avatarUrl: review.reviewer.avatarUrl ?? null,
        },
      }));

      return {
        reviews: formattedReviews,
        total,
        averageRating: Number(averageRating.toFixed(2)),
      };
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
      return { reviews: [], total: 0, averageRating: 0 };
    }
  }

  /**
   * Aktualizuje trust score użytkownika
   */
  private static async updateTrustScore(userId: string): Promise<void> {
    try {
      if (!userId || !prisma) return;

      // Obliczanie średniej oceny
      const ratingResult = await prisma.review.aggregate({
        where: { revieweeId: userId },
        _avg: { rating: true },
      });

      const averageRating = ratingResult._avg.rating || 0;

      // Aktualizacja trust score
      await prisma.user.update({
        where: { id: userId },
        data: { trustScore: Number(averageRating.toFixed(2)) },
      });

      console.log(`Updated trust score for user ${userId}: ${averageRating.toFixed(2)}`);
    } catch (error) {
      console.error('Error updating trust score:', error);
    }
  }

  /**
   * Sprawdza czy użytkownik może wystawić recenzję dla aukcji
   */
  static async canReview(auctionId: string, userId: string): Promise<{
    canReview: boolean;
    reason?: string;
  }> {
    try {
      if (!auctionId || !userId) {
        return { canReview: false, reason: 'Invalid input' };
      }

      if (!prisma) {
        return { canReview: false, reason: 'Database not available' };
      }

      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        select: {
          status: true,
          winnerId: true,
          sellerId: true,
        },
      });

      if (!auction) {
        return { canReview: false, reason: 'Auction not found' };
      }

      if (auction.status !== 'ENDED') {
        return { canReview: false, reason: 'Auction has not ended yet' };
      }

      if (auction.winnerId !== userId) {
        return { canReview: false, reason: 'Only auction winner can leave a review' };
      }

      // Sprawdzenie czy recenzja już istnieje
      const existingReview = await prisma.review.findUnique({
        where: {
          auctionId_reviewerId: {
            auctionId,
            reviewerId: userId,
          },
        },
      });

      if (existingReview) {
        return { canReview: false, reason: 'Review already exists' };
      }

      return { canReview: true };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return { canReview: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Pobiera trust score użytkownika
   */
  static async getTrustScore(userId: string): Promise<number> {
    try {
      if (!userId || !prisma) return 0;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true },
      });

      return Number(user?.trustScore || 0);
    } catch (error) {
      console.error('Error fetching trust score:', error);
      return 0;
    }
  }
}

export default ReviewService;
