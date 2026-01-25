import React, { useState } from 'react';
import { reviewService, type Review, type CreateReviewRequest } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/hooks/useUI';

interface ReviewFormProps {
  auctionId: string;
  sellerId: string;
  auctionTitle: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  auctionId,
  sellerId,
  auctionTitle,
  onReviewSubmitted,
}) => {
  const { session } = useAuth();
  const { info, success: toastSuccess, error: toastError } = useUI();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      const msg = 'Musisz być zalogowany, aby dodać recenzję.';
      setError(msg);
      info(msg, 'Zaloguj się i spróbuj ponownie.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData: CreateReviewRequest = {
        auctionId,
        rating,
        comment: comment.trim() || undefined,
      };

      await reviewService.createReview(reviewData, session.access_token);
      setSuccess(true);
      toastSuccess('Dziękujemy!', 'Twoja recenzja została dodana.');
      onReviewSubmitted();
      
      // Reset form
      setRating(5);
      setComment('');
    } catch (error: any) {
      const msg = error?.message || 'Wystąpił błąd';
      setError(msg);
      toastError('Nie udało się dodać recenzji', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-green-600 text-2xl mr-3">✓</div>
          <div>
            <h4 className="text-green-800 font-semibold">Dziękujemy za recenzję!</h4>
            <p className="text-green-600 text-sm">Twoja opinia została dodana</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Oceń sprzedającego</h3>
      <p className="text-gray-600 text-sm mb-4">Aukcja: {auctionTitle}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ocena
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${
                  star <= rating ? 'text-gold' : 'text-gray-300'
                } hover:text-gold focus:outline-none`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Komentarz (opcjonalnie)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Podziel się swoją opinią o transakcji..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Wysyłanie...' : 'Wyślij recenzję'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
