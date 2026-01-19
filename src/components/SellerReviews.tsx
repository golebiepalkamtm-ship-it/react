import React, { useState, useEffect } from 'react';
import { reviewService, type Review, type SellerReviewsResponse } from '@/services/reviewService';

interface SellerReviewsProps {
  sellerId: string;
  sellerName?: string;
}

export const SellerReviews: React.FC<SellerReviewsProps> = ({ sellerId, sellerName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response: SellerReviewsResponse = await reviewService.getSellerReviews(
        sellerId,
        pageNum,
        10
      );

      if (append) {
        setReviews(prev => [...prev, ...response.reviews]);
      } else {
        setReviews(response.reviews);
      }

      setAverageRating(response.averageRating);
      setTotal(response.total);
      setHasMore(response.reviews.length === 10 && response.reviews.length * pageNum < response.total);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sellerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className={`text-lg ${reviewService.getRatingColor(rating)}`}>
          {reviewService.renderStars(rating)}
        </span>
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={`review-skeleton-${i}`} className="border-b border-gray-100 pb-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Recenzje {sellerName ? `dla ${sellerName}` : ''}
        </h3>
        
        {total > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {renderStars(averageRating)}
              <span className="text-sm text-gray-600">
                {total} {total === 1 ? 'recenzja' : total < 5 ? 'recenzje' : 'recenzji'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Brak recenzji</p>
        )}
      </div>

      {reviews.length === 0 && !loading ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <p className="text-gray-500">Ten sprzedający nie ma jeszcze recenzji</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.reviewer.avatarUrl ? (
                      <img
                        src={review.reviewer.avatarUrl}
                        alt={review.reviewer.firstName || 'Użytkownik'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">
                        {(review.reviewer.firstName || 'U')[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewer.firstName || 'Użytkownik'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reviewService.formatReviewTime(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm ${reviewService.getRatingColor(review.rating)}`}>
                    {reviewService.renderStars(review.rating)}
                  </span>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Ładowanie...' : 'Załaduj więcej'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
