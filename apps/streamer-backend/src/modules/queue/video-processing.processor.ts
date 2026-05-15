import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { PrismaService } from '../../prisma/prisma.service';

@Processor('video-processing')
export class VideoProcessingProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ videoId: string }>) {
    const { videoId } = job.data;

    console.log('Processing video job:', job.name, job.data);

    await this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'PUBLISHED' },
    });

    console.log('Video processing completed:', videoId);

    return {
      success: true,
      videoId,
    };
  }
}
