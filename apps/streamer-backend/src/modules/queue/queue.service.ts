import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('video-processing')
    private readonly videoProcessingQueue: Queue,
  ) {}

  addVideoProcessingJob(payload: {
    videoId: string;
    videoUrl?: string | null;
    fileKey?: string | null;
  }) {
    return this.videoProcessingQueue.add('process-video', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  getVideoQueueStats() {
    return this.videoProcessingQueue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    );
  }
}
