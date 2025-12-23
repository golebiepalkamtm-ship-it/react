import { useState, useEffect, useCallback } from 'react';
import { auctionService } from '@/services/auctionService';
import type { Auction, AuctionFilters } from '@/types/auction';

interface UseAuctionsResult {
  auctions: Auction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAuctions(filters: AuctionFilters = {}): UseAuctionsResult {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);
  
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auctionService.getAuctions(filters);
      setAuctions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd pobierania aukcji');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return { auctions, loading, error, refetch: fetchAuctions };
}

interface UseAuctionResult {
  auction: Auction | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAuction(id: string | undefined): UseAuctionResult {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuction = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await auctionService.getAuctionById(id);
      setAuction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd pobierania aukcji');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  return { auction, loading, error, refetch: fetchAuction };
}

interface UseBidResult {
  placeBid: (amount: number) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  meta: {
    wasExtended: boolean;
    newEndTime: string | null;
  } | null;
}

export function useBid(auctionId: string, token: string | null): UseBidResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [meta, setMeta] = useState<{ wasExtended: boolean; newEndTime: string | null } | null>(null);

  const placeBid = useCallback(async (amount: number) => {
    if (!token) {
      setError('Musisz być zalogowany, aby licytować');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await auctionService.placeBid(auctionId, { amount }, token);
      setSuccess(response.success);
      setMeta({
        wasExtended: response.meta.wasExtended,
        newEndTime: response.meta.newEndTime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd składania oferty');
    } finally {
      setLoading(false);
    }
  }, [auctionId, token]);

  return { placeBid, loading, error, success, meta };
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
