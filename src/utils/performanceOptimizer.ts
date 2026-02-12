/**
 * Performance Optimizer - Redukcja forced reflow violations
 */

/**
 * Batch DOM reads to avoid layout thrashing
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  read(callback: () => void) {
    this.readQueue.push(callback);
    this.schedule();
  }

  write(callback: () => void) {
    this.writeQueue.push(callback);
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      const reads = this.readQueue.splice(0);
      reads.forEach(fn => fn());

      // Then execute all writes
      const writes = this.writeQueue.splice(0);
      writes.forEach(fn => fn());

      this.scheduled = false;
    });
  }
}

/**
 * Throttle function for scroll handlers
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce function for resize handlers
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * RAF-based scroll listener (better performance)
 */
export class RAFScrollListener {
  private callbacks: Set<(scrollY: number) => void> = new Set();
  private ticking = false;
  private lastScrollY = 0;

  constructor() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private onScroll = () => {
    if (!this.ticking) {
      requestAnimationFrame(this.update);
      this.ticking = true;
    }
  };

  private update = () => {
    this.lastScrollY = window.scrollY;
    this.callbacks.forEach(cb => cb(this.lastScrollY));
    this.ticking = false;
  };

  add(callback: (scrollY: number) => void) {
    this.callbacks.add(callback);
  }

  remove(callback: (scrollY: number) => void) {
    this.callbacks.delete(callback);
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll);
    this.callbacks.clear();
  }
}

/**
 * Optimize GSAP ScrollTrigger setup
 */
export const optimizeScrollTrigger = () => {
  if (typeof window === 'undefined') return;
  
  const ScrollTrigger = (window as any).ScrollTrigger;
  if (!ScrollTrigger) return;

  // Batch ScrollTrigger refreshes
  ScrollTrigger.config({
    limitCallbacks: true, // Limit callbacks to improve performance
    syncInterval: 150, // Sync interval in ms
  });

  // Use RAF for scroll updates
  ScrollTrigger.defaults({
    toggleActions: 'play none none none',
    markers: false,
  });
};

// Auto-optimize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', optimizeScrollTrigger);
}
