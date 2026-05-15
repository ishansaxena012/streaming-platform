import { Module } from "@nestjs/common";

import { VideoProcessingWorker } from "./video-processing.worker";
import { VideoProcessingService } from "../processing/video-processing.service";

@Module({
  providers: [VideoProcessingWorker, VideoProcessingService],
})
export class QueueModule {}
