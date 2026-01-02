import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocketService';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { BidErrorPayload, BidErrorType } from '../../shared/contracts/bidding';

interface Bid {
  id: string;
  amount: number;
  userId?: string;
  user?: { name: string };
  bidder?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface PlaceBidResult {
  success: boolean;
  error?: string;
  errorType?: BidErrorType;
}

export const useAuctionWebSocket = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<BidErrorPayload | null>(null);

  const handleBidPlaced = useCallback((data: { bid: Bid; newPrice: number }) => {
    setBids(prev => {
      // Prevent duplicate bids
      if (prev.some(b => b.id === data.bid.id)) return prev;
      return [data.bid, ...prev];
    });
    setCurrentPrice(data.newPrice);
  }, []);

  const handleBidError = useCallback((error: any) => {
    logger.error('Bid error (socket):', error);
    // Map socket errors if any (mostly deprecated, but good for broadcasted errors)
    if (error && typeof error === 'object') {
       setLastError({
         type: error.type || 'UNKNOWN',
         message: error.message || 'Unknown error',
         auctionId
       });
    }
  }, [auctionId]);
  
  const handleAuctionClosed = useCallback((data: any) => {
     logger.info('Auction closed:', data);
     // Could update state to reflect closed status
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await websocketService.connect();
        if (cancelled) return;
        websocketService.joinAuction(auctionId);
      } catch (err) {
        logger.error('Failed to connect websocket:', err);
      }
    })();

    websocketService.onBidPlaced(handleBidPlaced);
    websocketService.onBidError(handleBidError);
    websocketService.onAuctionClosed(handleAuctionClosed);
    websocketService.onConnectionChange(handleConnectionChange);

    return () => {
      cancelled = true;
      websocketService.offBidPlaced(handleBidPlaced);
      websocketService.offBidError(handleBidError);
      websocketService.offAuctionClosed(handleAuctionClosed);
      websocketService.offConnectionChange(handleConnectionChange);
      websocketService.leaveAuction();
    };
  }, [auctionId, handleBidPlaced, handleBidError, handleAuctionClosed, handleConnectionChange]);

  const placeBid = async (amount: number, displayName?: string): Promise<PlaceBidResult> => {
    setLastError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        return { success: false, error: 'User not authenticated', errorType: 'AUTH' };
      }

      const response = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, displayName })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorType = (data.type as BidErrorType) || 'UNKNOWN';
        const errorMessage = data.error || 'Failed to place bid';
        setLastError({ type: errorType, message: errorMessage, auctionId });
        return { success: false, error: errorMessage, errorType };
      }

      // Successful bid will trigger websocket event for all clients including this one
      // We don't need to manually update state here as the socket event will do it
      return { success: true };
    } catch (error) {
      logger.error('Failed to place bid (http):', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setLastError({ type: 'UNKNOWN', message: errorMessage, auctionId });
      return { success: false, error: errorMessage, errorType: 'UNKNOWN' };
    }
  };

  return {
    currentPrice,
    bids,
    isConnected,
    placeBid,
    lastError
  };
};
