import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import Redis from "ioredis";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

import { VideoProcessingService } from "../processing/video-processing.service";
import { S3Service } from "../storage/s3.service";
import { PrismaService } from "../database/prisma.service";
import { VideoStatus } from "@prisma/client";

@Injectable()
export class VideoProcessingWorker implements OnModuleInit {
  constructor(
    private readonly videoProcessingService: VideoProcessingService,
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
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

          const { videoId, fileKey, videoUrl, localVideoPath } = job.data;

          console.log("Video ID:", videoId);
          console.log("File Key:", fileKey);
          console.log("Video URL:", videoUrl);

          const tmpDir = path.join(process.cwd(), "tmp");

          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }

          let inputPath = localVideoPath;

          if (!inputPath && fileKey) {
            inputPath = path.join(tmpDir, `${videoId}.mp4`);

            console.log("Downloading video from private S3...");

            await this.s3Service.downloadFile(fileKey, inputPath);

            console.log("Downloaded from S3 to:", inputPath);
          }

          if (!inputPath && videoUrl) {
            inputPath = path.join(tmpDir, `${videoId}.mp4`);

            console.log("Downloading video from public URL...");

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

            console.log("Downloaded from URL to:", inputPath);
          }

          if (!inputPath) {
            throw new Error(
              "No input source provided: fileKey/videoUrl/localVideoPath missing",
            );
          }

          const result =
            await this.videoProcessingService.generateHls(inputPath);

          const hlsPrefix = `hls/${videoId}`;

          console.log("Uploading HLS files to S3...");

          await this.s3Service.uploadDirectory(result.outputDir, hlsPrefix);

          const hlsManifestUrl = `${process.env.CDN_BASE_URL}/${hlsPrefix}/master.m3u8`;

          console.log("HLS uploaded:", hlsManifestUrl);

          await this.prisma.video.update({
            where: {
              id: videoId,
            },
            data: {
              status: VideoStatus.PUBLISHED,
              hlsManifestUrl,
              processedAt: new Date(),
              processingError: null,
            },
          });

          console.log("Database updated successfully");

          return {
            success: true,
            videoId,
            ...result,
          };
        } catch (error) {
          console.error("Worker processing failed:", error);

          if (job?.data?.videoId) {
            await this.prisma.video.update({
              where: {
                id: job.data.videoId,
              },
              data: {
                status: VideoStatus.FAILED,
                processingError:
                  error instanceof Error
                    ? error.message
                    : "Unknown processing error",
              },
            });
          }

          throw error;
        }
      },
      { connection },
    );

    console.log("BullMQ Video Processing Worker started");
  }
}
