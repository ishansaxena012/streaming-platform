import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { QueueService } from './queue.service';
import { VideoProcessingProcessor } from './video-processing.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'video-processing',
    }),
  ],
  providers: [QueueService, VideoProcessingProcessor],
  exports: [QueueService],
})
export class QueueModule {}
