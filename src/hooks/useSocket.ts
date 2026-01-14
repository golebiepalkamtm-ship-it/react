import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '@/services/websocketService';
import { useAuth } from '@/contexts/AuthContext';
import type { Bid } from '@/types/auction';

interface UseSocketOptions {
  auctionId?: string;
  onBidPlaced?: (data: any) => void;
  onBidUpdated?: (data: any) => void;
  onAuctionUpdate?: (data: any) => void;
  onReconnect?: () => void;
  onDisconnect?: (reason: string) => void;
}

export const useSocket = ({ 
  auctionId, 
  onBidPlaced, 
  onBidUpdated,
  onAuctionUpdate, 
  onReconnect,
  onDisconnect 
}: UseSocketOptions) => {
  const { session } = useAuth();
  const [isConnected, setIsConnected] = useState(() => websocketService.socket?.connected ?? false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionState, setConnectionState] = useState(websocketService.getConnectionState());

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionState(websocketService.getConnectionState());
    onReconnect?.();
  }, [onReconnect]);

  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    setConnectionState(websocketService.getConnectionState());
    onDisconnect?.(reason);
  }, [onDisconnect]);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;

    websocketService.connect(token);
    
    const socket = websocketService.socket;
    if (!socket) return;

    websocketService.onReconnect(handleConnect);
    websocketService.onDisconnect(handleDisconnect);
    
    if (auctionId) {
      websocketService.joinAuction(auctionId);
    }

    const bidHandler = (data: any) => {
      if (!auctionId || data.auctionId === auctionId) {
        onBidPlaced?.(data);
      }
    };

    const bidUpdatedHandler = (data: any) => {
      if (!auctionId || data.auctionId === auctionId) {
        onBidUpdated?.(data);
      }
    };

    const auctionStatusHandler = (data: any) => {
      if (!auctionId || data.auctionId === auctionId) {
        onAuctionUpdate?.(data);
      }
    };

    websocketService.onBidPlaced(bidHandler);
    websocketService.onBidUpdated(bidUpdatedHandler);
    websocketService.onAuctionStatusChanged(auctionStatusHandler);

    const updateConnectionState = () => {
      setConnectionState(websocketService.getConnectionState());
      setReconnectAttempts(websocketService.getConnectionState().reconnectAttempts);
    };

    const stateInterval = setInterval(updateConnectionState, 1000);

    return () => {
      clearInterval(stateInterval);
      
      websocketService.offBidPlaced(bidHandler);
      websocketService.offBidUpdated(bidUpdatedHandler);
      websocketService.offAuctionStatusChanged(auctionStatusHandler);
      
      if (auctionId) {
        websocketService.leaveAuction(auctionId);
      }
      
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [auctionId, session, onBidPlaced, onBidUpdated, onAuctionUpdate, handleConnect, handleDisconnect]);

  return {
    isConnected,
    reconnectAttempts,
    connectionState,
    emit: (event: string, data: any) => websocketService.socket?.emit(event, data),
    disconnect: () => websocketService.disconnect(),
    reconnect: () => {
      if (session?.access_token) {
        websocketService.connect(session.access_token);
      }
    }
  };
};
