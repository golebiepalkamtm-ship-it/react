import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auctionService } from '@/services/auctionService';

interface WinnerInfo {
  seller: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
    createdAt: string;
  };
  auction: {
    id: string;
    title: string;
    finalPrice: number;
    endedAt: string;
  };
}

export const useWinnerInfo = (auctionId: string) => {
  const { user, session } = useAuth();
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWinnerInfo = useCallback(async () => {
    if (!user || !session?.access_token || !auctionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auctions/${auctionId}/winner-info`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Dostęp tylko dla zwycięzcy aukcji');
        } else if (response.status === 400) {
          setError('Aukcja nie została jeszcze zakończona');
        } else {
          setError('Nie udało się pobrać danych sprzedającego');
        }
        return;
      }

      const data = await response.json();
      setWinnerInfo(data);
    } catch (err: any) {
      setError('Nie udało się pobrać danych sprzedającego');
    } finally {
      setLoading(false);
    }
  }, [user, session, auctionId]);

  useEffect(() => {
    fetchWinnerInfo();
  }, [fetchWinnerInfo]);

  return {
    winnerInfo,
    loading,
    error,
    refetch: fetchWinnerInfo
  };
};
