import { useEffect, useState, useCallback } from "react";
import { websocketService } from "@/services/websocketService";
import { useAuth } from "@/contexts/AuthContext";
import type { Bid } from "@/types/auction";

interface UseSocketOptions {
  auctionId?: string;
  onBidPlaced?: (data: any) => void;
  onBidUpdated?: (data: any) => void;
  onAuctionUpdate?: (data: any) => void;
  onViewersCount?: (data: { auctionId: string; count: number }) => void;
  onReconnect?: () => void;
  onDisconnect?: (reason: string) => void;
}

export const useSocket = ({
  auctionId,
  onBidPlaced,
  onBidUpdated,
  onAuctionUpdate,
  onViewersCount,
  onReconnect,
  onDisconnect,
}: UseSocketOptions) => {
  const { session } = useAuth();
  const [isConnected, setIsConnected] = useState(
    () => websocketService.socket?.connected ?? false,
  );
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionState, setConnectionState] = useState(
    websocketService.getConnectionState(),
  );

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionState(websocketService.getConnectionState());
    onReconnect?.();
  }, [onReconnect]);

  const handleDisconnect = useCallback(
    (reason: string) => {
      setIsConnected(false);
      setConnectionState(websocketService.getConnectionState());
      onDisconnect?.(reason);
    },
    [onDisconnect],
  );

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;

    websocketService.connect(token);

    const socket = websocketService.socket;
    if (!socket) return;

    // Event-driven state updates zamiast polling
    const handleConnectionStateChange = () => {
      setConnectionState(websocketService.getConnectionState());
      setReconnectAttempts(
        websocketService.getConnectionState().reconnectAttempts,
      );
    };

    // Nasłuchuj na zmiany stanu połączenia
    socket.on("connect", handleConnectionStateChange);
    socket.on("disconnect", handleConnectionStateChange);
    socket.on("connect_error", handleConnectionStateChange);

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

    const viewersCountHandler = (data: {
      auctionId: string;
      count: number;
    }) => {
      if (!auctionId || data.auctionId === auctionId) {
        onViewersCount?.(data);
      }
    };

    websocketService.onBidPlaced(bidHandler);
    websocketService.onBidUpdated(bidUpdatedHandler);
    websocketService.onAuctionStatusChanged(auctionStatusHandler);
    websocketService.onViewersCount(viewersCountHandler);

    return () => {
      // Cleanup wszystkich listenerów
      websocketService.offBidPlaced(bidHandler);
      websocketService.offBidUpdated(bidUpdatedHandler);
      websocketService.offAuctionStatusChanged(auctionStatusHandler);
      websocketService.offViewersCount(viewersCountHandler);

      if (auctionId) {
        websocketService.leaveAuction(auctionId);
      }

      websocketService.offReconnect(handleConnect);
      websocketService.offDisconnect(handleDisconnect);
      socket.off("connect", handleConnectionStateChange);
      socket.off("disconnect", handleConnectionStateChange);
      socket.off("connect_error", handleConnectionStateChange);
    };
  }, [
    auctionId,
    session,
    onBidPlaced,
    onBidUpdated,
    onAuctionUpdate,
    onViewersCount,
    handleConnect,
    handleDisconnect,
  ]);

  return {
    isConnected,
    reconnectAttempts,
    connectionState,
    emit: (event: string, data: any) =>
      websocketService.socket?.emit(event, data),
    disconnect: () => websocketService.disconnect(),
    reconnect: () => {
      if (session?.access_token) {
        websocketService.connect(session.access_token);
      }
    },
  };
};
