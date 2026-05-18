import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { StorageService } from '../storage/storage.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deep system health check for all core services (Database, Redis, S3)' })
  @ApiResponse({ status: 200, description: 'All systems healthy' })
  @ApiResponse({ status: 503, description: 'One or more systems unhealthy' })
  async checkHealth(@Res({ passthrough: true }) res: any) {
    const timestamp = new Date().toISOString();
    
    // 1. Check Database (Prisma)
    const dbStart = performance.now();
    let dbStatus = 'up';
    let dbLatency: number | undefined;
    let dbError: string | undefined;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Math.round(performance.now() - dbStart);
    } catch (err) {
      dbStatus = 'down';
      dbError = err instanceof Error ? err.message : String(err);
    }

    // 2. Check Caching (Redis)
    const redisStart = performance.now();
    let redisStatus = 'up';
    let redisLatency: number | undefined;
    let redisError: string | undefined;
    try {
      await this.cacheService.checkHealth();
      redisLatency = Math.round(performance.now() - redisStart);
    } catch (err) {
      redisStatus = 'down';
      redisError = err instanceof Error ? err.message : String(err);
    }

    // 3. Check Object Storage (S3)
    const s3Start = performance.now();
    let s3Status = 'up';
    let s3Latency: number | undefined;
    let s3Error: string | undefined;
    try {
      await this.storageService.checkHealth();
      s3Latency = Math.round(performance.now() - s3Start);
    } catch (err) {
      s3Status = 'down';
      s3Error = err instanceof Error ? err.message : String(err);
    }

    const isHealthy = dbStatus === 'up' && redisStatus === 'up' && s3Status === 'up';

    const healthStatus = isHealthy ? 'healthy' : 'unhealthy';
    
    if (!isHealthy) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: healthStatus,
      timestamp,
      services: {
        database: {
          status: dbStatus,
          ...(dbLatency !== undefined ? { latencyMs: dbLatency } : {}),
          ...(dbError !== undefined ? { error: dbError } : {}),
        },
        redis: {
          status: redisStatus,
          ...(redisLatency !== undefined ? { latencyMs: redisLatency } : {}),
          ...(redisError !== undefined ? { error: redisError } : {}),
        },
        s3: {
          status: s3Status,
          ...(s3Latency !== undefined ? { latencyMs: s3Latency } : {}),
          ...(s3Error !== undefined ? { error: s3Error } : {}),
        },
      },
    };
  }
}
