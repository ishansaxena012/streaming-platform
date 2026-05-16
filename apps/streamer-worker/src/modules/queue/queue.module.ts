import { Module } from "@nestjs/common";

import { VideoProcessingWorker } from "./video-processing.worker";
import { VideoProcessingService } from "../processing/video-processing.service";
import { S3Service } from "../storage/s3.service";
import { PrismaService } from "../database/prisma.service";

@Module({
  providers: [
    VideoProcessingWorker,
    VideoProcessingService,
    S3Service,
    PrismaService,
  ],
})
export class QueueModule {}
