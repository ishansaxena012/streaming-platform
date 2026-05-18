import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger('CacheService');

  // TTL Constants in seconds
  public static readonly TTL_CATEGORIES = 3600;       // 1 hour
  public static readonly TTL_TRENDING = 600;         // 10 minutes
  public static readonly TTL_HOMEPAGE = 300;         // 5 minutes
  public static readonly TTL_ADMIN_STATS = 60;       // 1 minute
  public static readonly TTL_VIDEO_METADATA = 3600;    // 1 hour

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: any) {}

  /**
   * Retrieves data from the cache. Handles failures gracefully.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await (this.cacheManager as Cache).get<T>(key);
      if (cached !== undefined && cached !== null) {
        this.logger.log(`CACHE HIT: key="${key}"`);
        return cached;
      }
      this.logger.log(`CACHE MISS: key="${key}"`);
      return null;
    } catch (error) {
      this.logger.warn(
        `Redis unavailable on get: key="${key}". Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  /**
   * Sets data in the cache. Handles failures gracefully.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      // cache-manager v5 expects milliseconds or seconds depending on store.
      // Typically cache-manager-redis-store v3+ expects TTL in seconds.
      // We pass the TTL in a compatible configuration format.
      const options = ttlSeconds !== undefined ? { ttl: ttlSeconds } : undefined;
      await this.cacheManager.set(key, value, options as any);
      this.logger.log(`CACHE SET: key="${key}" ttl=${ttlSeconds ?? 'default'}`);
    } catch (error) {
      this.logger.warn(
        `Redis unavailable on set: key="${key}". Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Deletes data from the cache (invalidation). Handles failures gracefully.
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.log(`CACHE INVALIDATED: key="${key}"`);
    } catch (error) {
      this.logger.warn(
        `Redis unavailable on del: key="${key}". Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Cache-Aside helper strategy:
   * 1. Check Redis cache first.
   * 2. If present, return it (Cache Hit).
   * 3. If absent, execute fallback query (Cache Miss), save the result, and return it.
   * 4. If Redis fails, seamlessly fall back directly to DB and return the result.
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fallback();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async checkHealth(): Promise<void> {
    const key = 'health-check-temp-key';
    const value = 'ok';
    await (this.cacheManager as Cache).set(key, value, { ttl: 5 } as any);
    const result = await (this.cacheManager as Cache).get(key);
    if (result !== value) {
      throw new Error('Redis read/write validation failed');
    }
    await (this.cacheManager as Cache).del(key);
  }
}
