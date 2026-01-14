/**
 * Event Throttler - Leading + Trailing Edge Strategy
 * 
 * Grupuje high-frequency events i emituje je w kontrolowanych interwałach.
 * - Leading edge: Pierwszy event jest emitowany natychmiast
 * - Trailing edge: Ostatni event jest zawsze emitowany po zakończeniu throttle window
 * 
 * Użycie: Zapobiega przeciążeniu sieci podczas intensywnego bidding
 */

interface ThrottledEvent<T = any> {
  data: T;
  timestamp: number;
}

interface ThrottleConfig {
  interval: number; // ms
  maxBatchSize?: number;
}

export class EventThrottler<T = any> {
  private pendingEvents: Map<string, ThrottledEvent<T>> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private lastEmitTime: Map<string, number> = new Map();
  private config: Required<ThrottleConfig>;

  constructor(config: ThrottleConfig) {
    this.config = {
      interval: config.interval,
      maxBatchSize: config.maxBatchSize ?? 50
    };
  }

  /**
   * Throttle event z leading+trailing edge
   * @param key - Unikalny klucz dla grupy eventów (np. `auction-${auctionId}`)
   * @param data - Dane eventu
   * @param emitFn - Funkcja do wywołania przy emisji
   */
  throttle(key: string, data: T, emitFn: (data: T) => void): void {
    const now = Date.now();
    const lastEmit = this.lastEmitTime.get(key) ?? 0;
    const timeSinceLastEmit = now - lastEmit;

    // LEADING EDGE: Jeśli minął interval, emituj natychmiast
    if (timeSinceLastEmit >= this.config.interval) {
      this.lastEmitTime.set(key, now);
      emitFn(data);
      
      // Wyczyść pending event jeśli istnieje
      this.pendingEvents.delete(key);
      this.clearTimer(key);
      return;
    }

    // TRAILING EDGE: Zapisz event i zaplanuj emisję
    this.pendingEvents.set(key, { data, timestamp: now });

    // Jeśli timer już istnieje, nie twórz nowego
    if (this.timers.has(key)) {
      return;
    }

    // Ustaw timer na trailing edge
    const remainingTime = this.config.interval - timeSinceLastEmit;
    const timer = setTimeout(() => {
      const pending = this.pendingEvents.get(key);
      if (pending) {
        this.lastEmitTime.set(key, Date.now());
        emitFn(pending.data);
        this.pendingEvents.delete(key);
      }
      this.timers.delete(key);
    }, remainingTime);

    this.timers.set(key, timer);
  }

  /**
   * Flush wszystkie pending events natychmiast
   */
  flush(emitFn: (key: string, data: T) => void): void {
    this.pendingEvents.forEach((event, key) => {
      this.clearTimer(key);
      emitFn(key, event.data);
      this.lastEmitTime.set(key, Date.now());
    });
    this.pendingEvents.clear();
  }

  /**
   * Flush konkretny klucz
   */
  flushKey(key: string, emitFn: (data: T) => void): void {
    const pending = this.pendingEvents.get(key);
    if (pending) {
      this.clearTimer(key);
      emitFn(pending.data);
      this.lastEmitTime.set(key, Date.now());
      this.pendingEvents.delete(key);
    }
  }

  private clearTimer(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * Cleanup - wywołaj przy shutdown
   */
  destroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.pendingEvents.clear();
    this.lastEmitTime.clear();
  }

  /**
   * Statystyki dla monitoringu
   */
  getStats(): { pendingCount: number; activeTimers: number } {
    return {
      pendingCount: this.pendingEvents.size,
      activeTimers: this.timers.size
    };
  }
}
