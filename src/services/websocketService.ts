import { io, Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

class WebSocketService {
  private socket: Socket | null = null;
  private auctionId: string | null = null;

  async connect() {
    if (!supabase) throw new Error('Supabase not configured');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Authentication required');

    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      logger.info('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      logger.info('WebSocket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId: string) {
    if (!this.socket) void this.connect();
    this.auctionId = auctionId;
    this.socket?.emit('join-auction', auctionId);
  }

  leaveAuction() {
    if (this.auctionId && this.socket) {
      this.socket.emit('leave-auction', this.auctionId);
      this.auctionId = null;
    }
  }

  placeBid(auctionId: string, amount: number) {
    this.socket?.emit('place-bid', { auctionId, amount });
  }

  onBidPlaced(callback: (data: { bid: any; newPrice: number; auctionId: string }) => void) {
    this.socket?.on('bid-placed', callback);
  }

  onBidError(callback: (error: { message: string }) => void) {
    this.socket?.on('bid-error', callback);
  }

  offBidPlaced(callback: (data: { bid: any; newPrice: number; auctionId: string }) => void) {
    this.socket?.off('bid-placed', callback);
  }

  offBidError(callback: (error: { message: string }) => void) {
    this.socket?.off('bid-error', callback);
  }
}

export const websocketService = new WebSocketService();