import { useEffect, useMemo, useState } from 'react';
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

const createMockAuctions = (now: number): Auction[] => {
  const pigeonImages = [
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1200&q=80',
  ];

  const pedigreeImages = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504203700686-0f51ae03eda8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
  ];

  const baseAmounts = [320, 450, 580, 760, 910, 1250, 1490, 1750, 1990, 2400];

  return Array.from({ length: 12 }, (_, idx) => {
    // Rozsiew czasów zakończeń: 20 min – 36 h
    const endOffsetMinutes = 20 + idx * 25; // deterministic
    const end = new Date(now + endOffsetMinutes * 60 * 1000).toISOString();
    const pigeonImg = pigeonImages[idx % pigeonImages.length];
    const pedigreeImg = pedigreeImages[idx % pedigreeImages.length];
    const startingPrice = baseAmounts[idx % baseAmounts.length];
    const bid1 = startingPrice + 50;
    const bid2 = bid1 + 40;
    const bid3 = bid2 + 60;
    const bids = [
      { id: `b-${idx}-1`, amount: bid1, createdAt: new Date(now - 40 * 60 * 1000).toISOString(), bidderId: 'demo_bidder_1' } as unknown as Bid,
      { id: `b-${idx}-2`, amount: bid2, createdAt: new Date(now - 20 * 60 * 1000).toISOString(), bidderId: 'demo_bidder_2' } as unknown as Bid,
      { id: `b-${idx}-3`, amount: bid3, createdAt: new Date(now - 5 * 60 * 1000).toISOString(), bidderId: 'demo_bidder_3' } as unknown as Bid,
    ];
    const currentPrice = bids[bids.length - 1].amount;

    return {
      id: `mock-${idx + 1}`,
      title: `Testowa aukcja #${(idx + 1).toString().padStart(2, '0')}`,
      description: 'Aukcja testowa z przykładowym gołębiem i rodowodem (dane podglądowe).',
      startingPrice,
      currentPrice,
      buyNowPrice: currentPrice + 650 + idx * 10,
      reservePrice: 0,
      endTime: end,
      snipeThresholdMinutes: 5,
      snipeExtensionMinutes: 3,
      minBidIncrement: 30,
      status: 'active',
      reserveMet: true,
      category: 'pigeons',
      pigeon: {
        ringNumber: `PL-2024-${(1000 + idx).toString()}`,
        eyeColor: 'czerwone',
        pigeonColor: 'niebieski',
        construction: 'mocna',
        pedigreeUrl: pedigreeImg,
        vitality: 'wysoka',
        length: 'średnia',
        endurance: 'wysoka',
        forkStrength: 'mocna',
        forkAlignment: 'równa',
        muscles: 'sprężyste',
        shoulders: 'szerokie',
        balance: 'stabilna',
        back: 'prosty',
        feathers: 'gładkie',
        purpose: 'loty dalekodystansowe',
        gender: idx % 2 === 0 ? 'male' : 'female',
      },
      sex: idx % 2 === 0 ? 'male' : 'female',
      location: 'Test City',
      seller: {
        id: 'seller-mock',
        username: 'demo_seller',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'demo@example.com',
        phoneNumber: '+48123123123',
        image: null,
        rating: 4.8,
        salesCount: 42,
      },
      images: [pigeonImg, pedigreeImg],
      videos: [],
      documents: [pedigreeImg],
      bids,
      _count: { watchlist: 12 + idx * 2, bids: bids.length },
    };
  });
};

export function useAuctions(filters: AuctionFilters = {}): UseAuctionsResult {
  const [initialNow] = useState(() => Date.now());
  const [mockAuctions] = useState<Auction[]>(() => createMockAuctions(initialNow));

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auctions', filters],
    queryFn: async () => {
      try {
        const apiData = await auctionService.getAuctions(filters);
        if (Array.isArray(apiData) && apiData.length > 0) return apiData;
        return mockAuctions;
      } catch {
        return mockAuctions;
      }
    },
    staleTime: 30000,
    retry: false, // brak aukcji == szybka odpowiedź; 500 nie blokuje UI retry'ami
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: mockAuctions,
    initialData: mockAuctions,
  });

  const auctionsWithFallback = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data;
    return mockAuctions;
  }, [data, mockAuctions]);

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
