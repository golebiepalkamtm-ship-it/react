import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { API_URL } from '../config/api';

interface TimeContextType {
  serverTime: number; // Estimated server time in ms
  offset: number; // Difference between server time and local time (server - local)
  isSynced: boolean;
}

const TimeContext = createContext<TimeContextType>({
  serverTime: Date.now(),
  offset: 0,
  isSynced: false,
});

export const useServerTime = () => useContext(TimeContext);

/**
 * Provider that synchronizes local clock with server time.
 * It fetches /api/time and calculates the offset.
 */
export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offset, setOffset] = useState<number>(0);
  const [isSynced, setIsSynced] = useState(false);
  const frameRef = useRef<number>();
  // We keep a ref to the current server time to avoid re-renders on every tick
  // But for hooks, we might need a state if they depend on updates.
  // Ideally, components should use the offset and calculate Date.now() + offset themselves
  // to avoid performance bottlenecks of 1000Hz updates in context.
  
  useEffect(() => {
    const syncTime = async () => {
      try {
        const start = Date.now();
        const response = await fetch(`${API_URL}/time/server-time`);
        if (!response.ok) throw new Error('Time sync failed');
        
        const data = await response.json();
        const end = Date.now();
        const latency = (end - start) / 2;
        
        const serverTs = data.timestamp;
        // Server time when we received it is roughly 'serverTs' + 'latency'
        // Offset = (ServerTime) - (LocalTime at receive)
        // Offset = (serverTs + latency) - end
        //        = serverTs - (end - latency)
        //        = serverTs - (start + latency)
        
        const calculatedOffset = serverTs - (end - latency);
        
        setOffset(calculatedOffset);
        setIsSynced(true);
        console.log('⏱️ Time synchronized. Offset:', calculatedOffset, 'ms');
      } catch (err) {
        console.warn('⚠️ Server time sync failed, using local time.', err);
      }
    };

    syncTime();
    // Resync every 10 minutes
    const interval = setInterval(syncTime, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get current server time (estimated)
  const serverTime = Date.now() + offset;

  return (
    <TimeContext.Provider value={{ serverTime, offset, isSynced }}>
      {children}
    </TimeContext.Provider>
  );
};
