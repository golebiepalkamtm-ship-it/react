// Enhanced in-memory cache with TTL and fine-grained invalidation
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags?: string[];
  dependencies?: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> keys
  private dependencyIndex: Map<string, Set<string>> = new Map(); // dependency -> keys
  private readonly defaultTTL: number;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  constructor(defaultTTL: number = 60000) { // 60 seconds default
    this.defaultTTL = defaultTTL;
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, data: T, ttl?: number, options?: { tags?: string[], dependencies?: string[] }): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    const entry: CacheEntry<T> = {
      data,
      expiresAt,
      tags: options?.tags,
      dependencies: options?.dependencies
    };
    
    this.cache.set(key, entry);
    
    // Update tag index
    if (options?.tags) {
      for (const tag of options.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }
    
    // Update dependency index
    if (options?.dependencies) {
      for (const dependency of options.dependencies) {
        if (!this.dependencyIndex.has(dependency)) {
          this.dependencyIndex.set(dependency, new Set());
        }
        this.dependencyIndex.get(dependency)!.add(key);
      }
    }
    
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.data as T;
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      // Remove from tag index
      if (entry.tags) {
        for (const tag of entry.tags) {
          this.tagIndex.get(tag)?.delete(key);
        }
      }
      
      // Remove from dependency index
      if (entry.dependencies) {
        for (const dependency of entry.dependencies) {
          this.dependencyIndex.get(dependency)?.delete(key);
        }
      }
      
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  // Tag-based invalidation
  invalidateByTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (keys) {
      for (const key of keys) {
        this.delete(key);
      }
      this.tagIndex.delete(tag);
    }
  }

  // Dependency-based invalidation
  invalidateByDependency(dependency: string): void {
    const keys = this.dependencyIndex.get(dependency);
    if (keys) {
      for (const key of keys) {
        this.delete(key);
      }
      this.dependencyIndex.delete(dependency);
    }
  }

  // Multi-tag invalidation
  invalidateByTags(tags: string[]): void {
    for (const tag of tags) {
      this.invalidateByTag(tag);
    }
  }

  // Smart invalidation based on resource type and ID
  invalidateResource(resourceType: string, resourceId?: string): void {
    if (resourceId) {
      // Invalidate specific resource
      this.delete(`${resourceType}:${resourceId}`);
      this.deletePattern(`${resourceType}:${resourceId}:*`);
      this.invalidateByDependency(`${resourceType}:${resourceId}`);
    } else {
      // Invalidate all resources of this type
      this.deletePattern(`${resourceType}:*`);
      this.invalidateByTag(resourceType);
    }
  }

  // User-specific cache invalidation
  invalidateUserCache(userId: string): void {
    this.deletePattern(`user:${userId}:*`);
    this.invalidateByTag(`user:${userId}`);
    this.invalidateByDependency(`user:${userId}`);
  }

  // Auction-specific cache invalidation
  invalidateAuctionCache(auctionId: string): void {
    // Core auction data
    this.delete(`auction:${auctionId}`);
    this.deletePattern(`auction:${auctionId}:*`);
    
    // Related data
    this.deletePattern(`auctions:*:${auctionId}`);
    this.deletePattern(`bids:auction:${auctionId}:*`);
    
    // Tag-based invalidation
    this.invalidateByTag(`auction:${auctionId}`);
    this.invalidateByDependency(`auction:${auctionId}`);
    
    // User caches that might reference this auction
    this.deletePattern(`user:*:auctions`);
    this.deletePattern(`user:*:bids`);
  }

  // Bid-specific cache invalidation
  invalidateBidCache(auctionId: string, userId?: string): void {
    this.deletePattern(`auction:${auctionId}:bids:*`);
    this.deletePattern(`user:${userId}:bids:*`);
    this.invalidateByTag(`bids:${auctionId}`);
    this.invalidateByDependency(`auction:${auctionId}`);
    
    // Invalidate auction listing caches
    this.deletePattern(`auctions:list:*`);
  }

  // Search cache invalidation
  invalidateSearchCache(): void {
    this.deletePattern('search:*');
    this.invalidateByTag('search');
  }

  // Admin operations cache invalidation
  invalidateAdminCache(): void {
    this.deletePattern('admin:*');
    this.deletePattern('stats:*');
    this.invalidateByTag('admin');
  }

  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
    this.dependencyIndex.clear();
    this.stats.size = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  // Cache statistics and monitoring
  getStats(): CacheStats {
    return { ...this.stats };
  }

  getCacheInfo(): {
    size: number;
    entries: Array<{ key: string; expiresAt: number; tags?: string[]; dependencies?: string[] }>;
    tagIndexSize: number;
    dependencyIndexSize: number;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresAt: entry.expiresAt,
      tags: entry.tags,
      dependencies: entry.dependencies
    }));
    
    return {
      size: this.cache.size,
      entries,
      tagIndexSize: this.tagIndex.size,
      dependencyIndexSize: this.dependencyIndex.size
    };
  }

  // Health check for cache
  healthCheck(): {
    healthy: boolean;
    size: number;
    hitRate: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    let oldestEntry: number | undefined;
    let newestEntry: number | undefined;
    
    if (this.cache.size > 0) {
      const timestamps = Array.from(this.cache.values()).map(entry => entry.expiresAt);
      oldestEntry = Math.min(...timestamps);
      newestEntry = Math.max(...timestamps);
    }
    
    return {
      healthy: this.cache.size < 10000 && hitRate > 0.5, // Arbitrary thresholds
      size: this.cache.size,
      hitRate,
      oldestEntry,
      newestEntry
    };
  }
}

export const cache = new SimpleCache(600000); // 10 minutes TTL

