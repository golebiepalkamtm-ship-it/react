import { io, Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

class WebSocketService {
  private socket: Socket | null = null;
  private auctionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;

  async connect() {
    if (!supabase) throw new Error('Supabase not configured');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Authentication required');

    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'], // Force websocket for better performance
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      logger.info('WebSocket connected');
      this.startHeartbeat();
      this.notifyConnectionChange(true);
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('WebSocket disconnected:', reason);
      this.stopHeartbeat();
      this.notifyConnectionChange(false);
    });
    
    this.socket.on('pong', () => {
      if (this.pingTimeout) {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = null;
      }
    });
  }

  private connectionListeners: ((isConnected: boolean) => void)[] = [];

  onConnectionChange(callback: (isConnected: boolean) => void) {
    this.connectionListeners.push(callback);
    // Immediately invoke with current status
    callback(this.socket?.connected ?? false);
  }

  offConnectionChange(callback: (isConnected: boolean) => void) {
    this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
  }

  private notifyConnectionChange(isConnected: boolean) {
    this.connectionListeners.forEach(cb => cb(isConnected));
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    // Send ping every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
        
        // If no pong within 2 seconds, consider it unstable/disconnected
        this.pingTimeout = setTimeout(() => {
          logger.warn('Heartbeat missed, reconnecting...');
          this.socket?.disconnect();
          this.socket?.connect();
        }, 2000);
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
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

  // Deprecated: Bidding is now done via HTTP POST
  // placeBid(auctionId: string, amount: number, displayName?: string) {
  //   this.socket?.emit('place-bid', { auctionId, amount, ...(displayName ? { displayName } : {}) });
  // }

  onBidPlaced(callback: (data: { bid: any; newPrice: number; auctionId: string }) => void) {
    this.socket?.on('bid-placed', callback);
  }

  onBidError(callback: (error: { message: string }) => void) {
    this.socket?.on('bid-error', callback);
  }
  
  onAuctionClosed(callback: (data: { auctionId: string; winnerId: string | null; winningAmount: number | null }) => void) {
    this.socket?.on('auction-closed', callback);
  }

  offBidPlaced(callback: (data: { bid: any; newPrice: number; auctionId: string }) => void) {
    this.socket?.off('bid-placed', callback);
  }

  offBidError(callback: (error: { message: string }) => void) {
    this.socket?.off('bid-error', callback);
  }
  
  offAuctionClosed(callback: (data: { auctionId: string; winnerId: string | null; winningAmount: number | null }) => void) {
    this.socket?.off('auction-closed', callback);
  }
}

export const websocketService = new WebSocketService();
