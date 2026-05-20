import { Module } from '@nestjs/common';

import { VideoController } from './video.controller';
import { VideoService } from './video.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

import { QueueModule } from '../queue/queue.module';
import { CloudFrontService } from '../cloudfront/cloudfront.service';
import { VideoProgressService } from './video-progress.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    QueueModule,
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
  controllers: [VideoController],
  providers: [VideoService, CloudFrontService, VideoProgressService],
})
export class VideoModule {}
