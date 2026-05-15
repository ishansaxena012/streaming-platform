import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import Redis from "ioredis";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

import { VideoProcessingService } from "../processing/video-processing.service";

@Injectable()
export class VideoProcessingWorker implements OnModuleInit {
  constructor(
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  async onModuleInit() {
    console.log("VideoProcessingWorker onModuleInit starting...");
    console.log(
      "Using REDIS_URL:",
      process.env.REDIS_URL ? "FOUND" : "MISSING",
    );

    const connection = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });

    new Worker(
      "video-processing",
      async (job) => {
        try {
          console.log("Worker processing:", job.name, job.data);

          const { videoId, videoUrl, localVideoPath } = job.data;

          console.log("Video ID:", videoId);
          console.log("Video URL:", videoUrl);

          let inputPath = localVideoPath;

          if (!inputPath && videoUrl) {
            const tmpDir = path.join(process.cwd(), "tmp");

            if (!fs.existsSync(tmpDir)) {
              fs.mkdirSync(tmpDir, { recursive: true });
            }

            inputPath = path.join(tmpDir, `${videoId}.mp4`);

            console.log("Downloading video...");

            const response = await axios({
              method: "GET",
              url: videoUrl,
              responseType: "stream",
            });

            const writer = fs.createWriteStream(inputPath);

            response.data.pipe(writer);

            await new Promise<void>((resolve, reject) => {
              writer.on("finish", resolve);
              writer.on("error", reject);
            });

            console.log("Downloaded video to:", inputPath);
          }

          if (!inputPath) {
            throw new Error("No input video path or video URL provided");
          }

          const result =
            await this.videoProcessingService.generateHls(inputPath);

          console.log("HLS output:", result);

          return {
            success: true,
            videoId,
            ...result,
          };
        } catch (error) {
          console.error("Worker processing failed:", error);
          throw error;
        }
      },
      {
        connection,
      },
    );

    console.log("BullMQ Video Processing Worker started");
  }
}
