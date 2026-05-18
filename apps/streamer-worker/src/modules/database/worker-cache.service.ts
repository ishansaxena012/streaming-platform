import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { PrismaService } from "./prisma.service";

@Injectable()
export class WorkerCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("WorkerCacheService");
  private redis: Redis | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.warn("REDIS_URL is missing in worker environment");
      return;
    }
    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
      });
      this.logger.log("WorkerCacheService Redis connection established");
    } catch (error) {
      this.logger.error("Failed to initialize Redis in WorkerCacheService", error);
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        this.logger.warn("Error disconnecting Redis during destroy", error);
      }
    }
  }

  /**
   * Safe getter with error handling for FFmpeg metadata duration caching.
   */
  async getCachedFfmpegMetadata(videoId: string): Promise<{ duration: number } | null> {
    if (!this.redis) return null;
    const key = `video:${videoId}:ffmpeg-metadata`;
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.log(`[WORKER CACHE HIT] FfmpegMetadata: videoId="${videoId}"`);
        return JSON.parse(cached);
      }
      this.logger.log(`[WORKER CACHE MISS] FfmpegMetadata: videoId="${videoId}"`);
      return null;
    } catch (error) {
      this.logger.warn(`Redis error in getCachedFfmpegMetadata for video "${videoId}": ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Safe setter with error handling for FFmpeg metadata duration caching.
   */
  async setCachedFfmpegMetadata(videoId: string, metadata: { duration: number }): Promise<void> {
    if (!this.redis) return;
    const key = `video:${videoId}:ffmpeg-metadata`;
    try {
      await this.redis.set(key, JSON.stringify(metadata), "EX", 3600); // 1 hour cache
      this.logger.log(`[WORKER CACHE SET] FfmpegMetadata: videoId="${videoId}"`);
    } catch (error) {
      this.logger.warn(`Redis error in setCachedFfmpegMetadata for video "${videoId}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Safe progress cache getter
   */
  async getCachedProcessingProgress(videoId: string): Promise<number | null> {
    if (!this.redis) return null;
    const key = `video:${videoId}:processing-progress`;
    try {
      const cached = await this.redis.get(key);
      return cached ? parseInt(cached, 10) : null;
    } catch (error) {
      this.logger.warn(`Redis error in getCachedProcessingProgress: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Safe progress cache setter
   */
  async setCachedProcessingProgress(videoId: string, progress: number): Promise<void> {
    if (!this.redis) return;
    const key = `video:${videoId}:processing-progress`;
    try {
      await this.redis.set(key, progress.toString(), "EX", 3600);
    } catch (error) {
      this.logger.warn(`Redis error in setCachedProcessingProgress: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Worker-side backend cache invalidator
   * Deletes homepage, trending, admin platform stats, specific video metadata, and category feeds.
   */
  async invalidateBackendCaches(videoId: string, categoryId?: string | null): Promise<void> {
    if (!this.redis) return;
    try {
      this.logger.log(`[WORKER CACHE INVALIDATING] videoId="${videoId}"`);
      await this.redis.del("videos:homepage");
      await this.redis.del("videos:trending");
      await this.redis.del("admin:platform-stats");
      await this.redis.del(`video:${videoId}:metadata`);

      let catId = categoryId;
      if (!catId) {
        const video = await this.prisma.video.findUnique({
          where: { id: videoId },
          select: { categoryId: true },
        });
        catId = video?.categoryId;
      }

      if (catId) {
        const category = await this.prisma.category.findUnique({
          where: { id: catId },
          select: { slug: true },
        });
        if (category?.slug) {
          await this.redis.del(`videos:category:${category.slug}`);
          this.logger.log(`[WORKER CACHE INVALIDATED] categoryKey="videos:category:${category.slug}"`);
        }
      }
      this.logger.log(`[WORKER CACHE INVALIDATED ALL] videoId="${videoId}"`);
    } catch (error) {
      this.logger.warn(`Redis error on invalidateBackendCaches: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
