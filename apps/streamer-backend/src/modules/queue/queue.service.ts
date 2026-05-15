import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('video-processing')
    private readonly videoProcessingQueue: Queue,
  ) {}

  addVideoProcessingJob(videoId: string) {
    return this.videoProcessingQueue.add('process-video', {
      videoId,
    });
  }
}
