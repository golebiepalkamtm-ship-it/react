// Simple in-memory rate limiter for WebSocket
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Rate limiter for bids: 10 bids per 60 seconds per user per auction
export const bidRateLimiter = new RateLimiter(60 * 1000, 10);

// Rate limiter for general WebSocket: 100 messages per 60 seconds per user
export const wsRateLimiter = new RateLimiter(60 * 1000, 100);

