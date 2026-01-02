import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Auction, Bid } from '@/types/auction';

interface UseRealtimeAuctionResult {
  auction: Auction | null;
  bids: Bid[];
  loading: boolean;
  error: string | null;
  // When in development and using example auctions, allow injecting local bids for simulation
  addLocalBid?: (amount: number) => void;
}

export function useRealtimeAuction(auctionId: string): UseRealtimeAuctionResult {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if component is mounted (for cleanup)
  const isMountedRef = useRef(true);
  // Ref to store channel reference
  const channelRef = useRef<any>(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // If Supabase client is not configured (common in local dev), use example auctions fallback
      if (!supabase) {
        if (import.meta.env.MODE === 'development') {
          try {
            const { default: exampleAuctions } = await import('../data/exampleAuctions');
            const idx = auctionId.startsWith('dev-') ? parseInt(auctionId.split('-')[1], 10) - 1 : -1;
            const ex = idx >= 0 ? exampleAuctions[idx] : exampleAuctions.find((a: any) => `dev-${exampleAuctions.indexOf(a) + 1}` === auctionId);
            if (ex) {
              const devAuction: any = {
                id: auctionId,
                title: ex.title,
                description: ex.description,
                current_price: ex.startingPrice,
                starting_price: ex.startingPrice,
                images: ex.images || [],
                end_time: ex.endTime,
                category: ex.category,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pigeon: ex.pigeon,
              };
              if (isMountedRef.current) {
                setAuction(devAuction);
                setBids([]);
              }
              return;
            }
          } catch (e) {
            // ignore fallback errors
          }
        }

        throw new Error('Supabase client not configured');
      }

      // Fetch auction data
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      // Fetch bids history (sorted descending by created_at)
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false });

      if (auctionError && import.meta.env.MODE === 'development') {
        // Fallback to example auctions in development
        try {
          const { default: exampleAuctions } = await import('../data/exampleAuctions');
          const idx = auctionId.startsWith('dev-') ? parseInt(auctionId.split('-')[1], 10) - 1 : -1;
          const ex = idx >= 0 ? exampleAuctions[idx] : exampleAuctions.find((a: any) => `dev-${exampleAuctions.indexOf(a) + 1}` === auctionId);
          if (ex) {
            const devAuction: any = {
              id: auctionId,
              title: ex.title,
              description: ex.description,
              current_price: ex.startingPrice,
              starting_price: ex.startingPrice,
              images: ex.images || [],
              end_time: ex.endTime,
              category: ex.category,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              pigeon: ex.pigeon,
            };
            if (isMountedRef.current) {
              setAuction(devAuction);
              setBids([]);
            }
            return;
          }
        } catch (e) {
          // ignore fallback errors
        }
        throw new Error(`Failed to fetch auction: ${auctionError.message}`);
      }

      if (auctionError) {
        throw new Error(`Failed to fetch auction: ${auctionError.message}`);
      }

      if (bidsError && import.meta.env.MODE === 'development') {
        // ignore bids fetch errors in dev, start with empty bids
        if (isMountedRef.current) setBids([]);
      } else if (bidsError) {
        throw new Error(`Failed to fetch bids: ${bidsError.message}`);
      }

      if (isMountedRef.current) {
        setAuction(auctionData);
        setBids(bidsData || []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [auctionId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!auctionId) return;

    // Fetch initial data
    fetchInitialData();

    // Create channel for this auction (only if supabase available)
    if (!supabase) return;
    const channelName = `auction-${auctionId}`;
    const channel = supabase.channel(channelName);

    // Subscribe to bids INSERT events
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          if (isMountedRef.current && payload.new) {
            const newBid = payload.new as Bid;
            setBids(prevBids => [newBid, ...prevBids]); // Add to top (newest first)
          }
        }
      )
      // Subscribe to auctions UPDATE events
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          if (isMountedRef.current && payload.new) {
            const updatedAuction = payload.new as Auction;
            setAuction(prevAuction => {
              if (!prevAuction) return updatedAuction;
              // Update only end_time and current_price to avoid overwriting other fields
              return {
                ...prevAuction,
                end_time: updatedAuction.end_time,
                current_price: updatedAuction.current_price,
                updated_at: updatedAuction.updated_at,
              };
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to realtime updates for auction ${auctionId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Failed to subscribe to auction ${auctionId}`);
          if (isMountedRef.current) {
            setError('Failed to connect to realtime updates');
          }
        }
      });

    // Store channel reference
    channelRef.current = channel;

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [auctionId, fetchInitialData]);

  // Allow adding local bids in development for simulated auctions
  const addLocalBid = (amount: number) => {
    if (!import.meta.env.MODE || import.meta.env.MODE !== 'development') return;
    const newBid: any = {
      id: `dev-bid-${Date.now()}`,
      auction_id: auctionId,
      user_id: 'dev',
      amount,
      created_at: new Date().toISOString(),
    };
    setBids(prev => [newBid, ...prev]);
    setAuction(prev => prev ? { ...prev, current_price: amount } : prev);
  };

  return { auction, bids, loading, error, addLocalBid };
}