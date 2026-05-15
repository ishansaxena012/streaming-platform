import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestController } from './modules/test/test.controller';
import { VideoModule } from './modules/video/video.module';
import { StorageModule } from './modules/storage/storage.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    CommonModule,
    PrismaModule,
    VideoModule,
    StorageModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    QueueModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
