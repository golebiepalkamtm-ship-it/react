import { io, type Socket } from 'socket.io-client';

const sanitizeEnvValue = (value: string | undefined) => {
  if (!value) return value;
  const trimmed = value.trim();
  const wrapped = (trimmed.startsWith('`') && trimmed.endsWith('`'))
    || (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return wrapped ? trimmed.slice(1, -1).trim() : trimmed;
};

class WebsocketService {
  public socket: Socket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor() {
    const base = sanitizeEnvValue(import.meta.env.VITE_WS_URL)
      || sanitizeEnvValue(import.meta.env.VITE_API_URL)
      || 'http://localhost:8001';
    // Remove www subdomain to match CSP configuration
    const normalizedBase = base.replace(/^https?:\/\/www\./, 'https://');
    this.url = normalizedBase.replace(/\/api$/, '').replace(/\/$/, '');
  }

  private getReconnectDelay(): number {
    const delays = [1000, 2000, 4000, 8000, 16000];
    return this.reconnectAttempts < delays.length ? delays[this.reconnectAttempts] : 30000;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || this.isManualDisconnect) {
      console.log('🔌 Max reconnect attempts reached or manual disconnect');
      return;
    }

    const delay = this.getReconnectDelay();
    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.currentToken!);
    }, delay);
  }

  private currentToken: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;
    
    this.isManualDisconnect = false;
    this.currentToken = token;
    
    this.socket = io(this.url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: false
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.socket?.emit('user:online');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.stopHeartbeat();
      
      if (!this.isManualDisconnect && reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket connection error:', error);
      const message = error instanceof Error ? error.message : String(error);
      const isAuthError = /invalid or expired token|no authentication credentials provided|origin not allowed/i.test(message);
      if (isAuthError) {
        this.disconnect();
        return;
      }
      if (!this.isManualDisconnect) this.scheduleReconnect();
    });

    this.socket.on('pong', () => {
      console.log('💓 Heartbeat response received');
    });
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.emit('user:offline');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.reconnectAttempts = 0;
    this.currentToken = null;
  }

  joinAuction(auctionId: string) {
    this.socket?.emit('join-auction', auctionId);
  }

  leaveAuction(auctionId: string) {
    this.socket?.emit('leave-auction', auctionId);
  }

  onBidPlaced(handler: (payload: { bid: any; newPrice: number; auctionId: string; meta?: { wasExtended?: boolean; newEndTime?: string | null } }) => void) {
    this.socket?.on('auction:bid:placed', handler);
  }

  offBidPlaced(handler: (payload: any) => void) {
    this.socket?.off('auction:bid:placed', handler);
  }

  onBidUpdated(handler: (payload: { bid: any; auctionId: string }) => void) {
    this.socket?.on('auction:bid:updated', handler);
  }

  offBidUpdated(handler: (payload: any) => void) {
    this.socket?.off('auction:bid:updated', handler);
  }

  onAuctionStatusChanged(handler: (payload: { auctionId: string; status: string; endTime?: string }) => void) {
    this.socket?.on('auction:status:changed', handler);
  }

  offAuctionStatusChanged(handler: (payload: any) => void) {
    this.socket?.off('auction:status:changed', handler);
  }

  onReconnect(handler: () => void) {
    this.socket?.on('connect', handler);
  }

  onDisconnect(handler: (reason: string) => void) {
    this.socket?.on('disconnect', handler);
  }

  getConnectionState(): {
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      isConnected: this.socket?.connected ?? false,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

export const websocketService = new WebsocketService();
export default websocketService;
