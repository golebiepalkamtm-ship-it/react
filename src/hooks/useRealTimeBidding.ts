import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocketService';

interface Bid {
  id: string;
  amount: number;
  userId: string;
  user: { name: string };
  createdAt: string;
}

export const useRealTimeBidding = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleBidPlaced = useCallback((data: { bid: Bid; newPrice: number }) => {
    setBids(prev => [data.bid, ...prev]);
    setCurrentPrice(data.newPrice);
  }, []);

  const handleBidError = useCallback((error: any) => {
    console.error('Bid error:', error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await websocketService.connect();
        if (cancelled) return;
        websocketService.joinAuction(auctionId);
        // Avoid synchronous setState inside effect — schedule async.
        setTimeout(() => {
          if (!cancelled) setIsConnected(true);
        }, 0);
      } catch (err) {
        console.error('Failed to connect websocket:', err);
      }
    })();

    websocketService.onBidPlaced(handleBidPlaced);
    websocketService.onBidError(handleBidError);

    return () => {
      cancelled = true;
      websocketService.offBidPlaced(handleBidPlaced);
      websocketService.offBidError(handleBidError);
      websocketService.leaveAuction();
      setIsConnected(false);
    };
  }, [auctionId, handleBidPlaced, handleBidError]);

  const placeBid = async (amount: number) => {
    try {
      websocketService.placeBid(auctionId, amount);
    } catch (error) {
      console.error('Failed to place bid:', error);
    }
  };

  return {
    currentPrice,
    bids,
    isConnected,
    placeBid
  };
};