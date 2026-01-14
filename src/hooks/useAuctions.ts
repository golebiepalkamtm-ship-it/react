import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionService } from '@/services/auctionService';
import { useSocket } from '@/hooks/useSocket';
import { useOptimizedToast } from '@/hooks/use-optimized-toast';
import { type Auction, type Bid, type AuctionFilters as ApiAuctionFilters, type AuctionStatus, type AuctionSortBy } from '@/types/auction';
import { useAuth } from '@/contexts/AuthContext';

type AuctionFilters = Pick<ApiAuctionFilters,
  'status' | 'sortBy' | 'category' | 'gender' | 'priceMin' | 'priceMax'
> & {
  searchTerm?: string;
};

interface UseAuctionsResult {
  auctions: Auction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAuctions(filters: AuctionFilters = {}): UseAuctionsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auctions', filters],
    queryFn: () => auctionService.getAuctions(filters),
    staleTime: 30000,
    retry: false, // brak aukcji == szybka odpowiedź; 500 nie blokuje UI retry'ami
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: [],
  });

  return {
    auctions: data || [],
    isLoading,
    error: error as Error | null,
    refetch: () => refetch(),
  };
}

interface UseAuctionOptions {
  auctionId: string;
}

export const useAuction = ({ auctionId }: UseAuctionOptions) => {
  const queryClient = useQueryClient();
  const { success: showSuccess, info: showInfo } = useOptimizedToast();

  const { data: auction, isLoading, error } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: () => auctionService.getAuctionById(auctionId),
    staleTime: 30000,
    enabled: !!auctionId,
  });

  useSocket({
    auctionId,
    onBidPlaced: (data: { auctionId: string; bid: Bid; currentPrice: number; newEndTime?: string; meta?: any }) => {
      if (data.auctionId === auctionId) {
        queryClient.setQueryData(['auction', auctionId], (old: Auction | undefined) => {
          if (!old) return old;
          return {
            ...old,
            currentPrice: data.currentPrice,
            endTime: data.newEndTime || data.meta?.newEndTime || old.endTime,
            bids: [data.bid, ...old.bids],
            _count: {
              ...old._count,
              bids: (old._count?.bids || 0) + 1,
            },
          };
        });
        showSuccess({ message: `Nowa oferta: ${data.currentPrice.toLocaleString('pl-PL')} zł` });
      }
    },
  });

  return { auction, isLoading, error: error as Error | null };
};

export function useBid(auctionId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError, info: showInfo } = useOptimizedToast();

  const placeBidMutation = useMutation({
    mutationFn: (amount: number) => 
      auctionService.placeBid(auctionId, { amount }, session?.access_token || null),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
      if (data.meta?.wasExtended) {
        showInfo({ message: 'Czas aukcji został przedłużony!' });
      }
      showSuccess({ message: 'Oferta została złożona pomyślnie' });
    },
    onError: (error: Error) => {
      showError({ message: error.message });
    },
  });

  return {
    placeBid: placeBidMutation.mutate,
    isLoading: placeBidMutation.isPending,
    error: placeBidMutation.error as Error | null,
    success: placeBidMutation.isSuccess,
  };
}

export function useAuctionTimer(endTime: string | undefined) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const left = auctionService.calculateTimeLeft(endTime);
      setTimeLeft(left);
      setIsEnded(left === 'Zakończona');
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return { timeLeft, isEnded };
}
