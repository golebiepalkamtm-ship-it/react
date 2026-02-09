import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { auctionService } from '@/services/auctionService';
import { useSocket } from '@/hooks/useSocket';
import { useOptimizedToast } from '@/hooks/use-optimized-toast';
import { useAuth } from '@/contexts/AuthContext';
import { type Auction, type Bid, type AuctionFilters as ApiAuctionFilters } from '@/types/auction';

type AuctionFilters = Pick<ApiAuctionFilters,
  'status' | 'sortBy' | 'category' | 'gender' | 'priceMin' | 'priceMax' | 'sellerId'
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
    queryFn: async () => {
      const apiData = await auctionService.getAuctions(filters);
      return Array.isArray(apiData) ? apiData : [];
    },
    staleTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: undefined,
    placeholderData: undefined,
  });

  const auctionsWithFallback = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data;
    return [];
  }, [data]);

  return {
    auctions: auctionsWithFallback,
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

  const { data: auction, isLoading, error, refetch } = useQuery({
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

  return { auction, isLoading, error: error as Error | null, refetch };
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

export function usePreciseAuctionTimer(endTime: string | undefined) {
  const [timeComponents, setTimeComponents] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    centiseconds: '00',
    isEnded: false
  });

  useEffect(() => {
    if (!endTime) return;

    const target = new Date(endTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeComponents({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          centiseconds: '00',
          isEnded: true
        });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      const cs = Math.floor((diff % 1000) / 10);

      setTimeComponents({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
        centiseconds: cs.toString().padStart(2, '0'),
        isEnded: false
      });
    };

    update();
    const intervalId = setInterval(update, 10); // Update every 10ms for centiseconds
    return () => clearInterval(intervalId);
  }, [endTime]);

  return timeComponents;
}
