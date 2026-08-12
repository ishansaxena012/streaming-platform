import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppCacheModule } from './modules/cache/cache.module';
import { CategoryModule } from './modules/category/category.module';
import { QueueModule } from './modules/queue/queue.module';
import { StorageModule } from './modules/storage/storage.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TestController } from './modules/test/test.controller';
import { UsersModule } from './modules/users/users.module';
import { VideoModule } from './modules/video/video.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/streamer-backend/.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
    PrismaModule,
    VideoModule,
    StorageModule,
    BullModule.forRootAsync({
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
    }),
    QueueModule,
    CategoryModule,
    WatchlistModule,
    AdminModule,
    AppCacheModule,
    SubscriptionsModule,
    HealthModule,
  ],
  controllers: [AppController, TestController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
