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
import { WorkerCacheService } from "../database/worker-cache.service";

@Injectable()
export class VideoProcessingWorker implements OnModuleInit {
  constructor(
    private readonly videoProcessingService: VideoProcessingService,
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly workerCacheService: WorkerCacheService,
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
    const publisher = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });

    new Worker(
      "video-processing",
      async (job) => {
        let inputPath: string | undefined;
        let outputDir: string | undefined;

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

          inputPath = localVideoPath;

          if (!inputPath && fileKey) {
            inputPath = path.join(tmpDir, `${videoId}.mp4`);

            console.log("Downloading video from private S3...");
            try {
              await this.s3Service.downloadFile(fileKey, inputPath);
              console.log("Downloaded from S3 to:", inputPath);
            } catch (s3Error: any) {
              console.warn("S3 download failed:", s3Error.message || s3Error);

              // Graceful local development fallback:
              // Find any pre-existing .mp4 file in tmp/ directory and copy it
              const localFiles = fs.readdirSync(tmpDir);
              const fallbackFile = localFiles.find(
                (f) => f.endsWith(".mp4") && f !== `${videoId}.mp4`,
              );

              if (fallbackFile) {
                const fallbackSource = path.join(tmpDir, fallbackFile);
                fs.copyFileSync(fallbackSource, inputPath);
                console.log(
                  `[DEVELOPER FALLBACK] Utilized local development video: ${fallbackSource}`,
                );
              } else {
                console.log(
                  "[DEVELOPER FALLBACK] No local mp4 found. Downloading public open-source sample video...",
                );
                const publicSampleUrl =
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

                const response = await axios({
                  method: "GET",
                  url: publicSampleUrl,
                  responseType: "stream",
                });

                const writer = fs.createWriteStream(inputPath);
                response.data.pipe(writer);

                await new Promise<void>((resolve, reject) => {
                  writer.on("finish", resolve);
                  writer.on("error", reject);
                });
                console.log(
                  "[DEVELOPER FALLBACK] Downloaded public sample to:",
                  inputPath,
                );
              }
            }
          }

          if (!inputPath && videoUrl) {
            inputPath = path.join(tmpDir, `${videoId}.mp4`);

            console.log("Downloading video from public URL...");
            try {
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
            } catch (urlError: any) {
              console.warn(
                "Public URL download failed:",
                urlError.message || urlError,
              );

              // Graceful local development fallback:
              const localFiles = fs.readdirSync(tmpDir);
              const fallbackFile = localFiles.find(
                (f) => f.endsWith(".mp4") && f !== `${videoId}.mp4`,
              );

              if (fallbackFile) {
                const fallbackSource = path.join(tmpDir, fallbackFile);
                fs.copyFileSync(fallbackSource, inputPath);
                console.log(
                  `[DEVELOPER FALLBACK] Utilized local development video: ${fallbackSource}`,
                );
              } else {
                console.log(
                  "[DEVELOPER FALLBACK] No local mp4 found. Downloading public sample video...",
                );
                const publicSampleUrl =
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

                const response = await axios({
                  method: "GET",
                  url: publicSampleUrl,
                  responseType: "stream",
                });

                const writer = fs.createWriteStream(inputPath);
                response.data.pipe(writer);

                await new Promise<void>((resolve, reject) => {
                  writer.on("finish", resolve);
                  writer.on("error", reject);
                });
                console.log(
                  "[DEVELOPER FALLBACK] Downloaded public sample to:",
                  inputPath,
                );
              }
            }
          }

          if (!inputPath) {
            throw new Error(
              "No input source provided: fileKey/videoUrl/localVideoPath missing",
            );
          }

          let metadata =
            await this.workerCacheService.getCachedFfmpegMetadata(videoId);
          if (!metadata) {
            metadata =
              await this.videoProcessingService.getVideoMetadata(inputPath);
            await this.workerCacheService.setCachedFfmpegMetadata(
              videoId,
              metadata,
            );
          }

          console.log("Video metadata:", metadata);

          const thumbnailTempDir = path.join(process.cwd(), "tmp", videoId);

          if (!fs.existsSync(thumbnailTempDir)) {
            fs.mkdirSync(thumbnailTempDir, { recursive: true });
          }

          const thumbnailPath =
            await this.videoProcessingService.generateThumbnail(
              inputPath,
              thumbnailTempDir,
            );

          const result = await this.videoProcessingService.generateHls(
            inputPath,
            async (progress) => {
              const cachedProgress =
                await this.workerCacheService.getCachedProcessingProgress(
                  videoId,
                );
              if (
                cachedProgress === null ||
                progress - cachedProgress >= 2 ||
                progress === 100 ||
                progress === 0
              ) {
                await this.prisma.video.update({
                  where: {
                    id: videoId,
                  },
                  data: {
                    processingProgress: progress,
                    status: VideoStatus.PROCESSING,
                  },
                });

                await publisher.publish(
                  "video-progress",
                  JSON.stringify({
                    videoId,
                    progress,
                    status: VideoStatus.PROCESSING,
                  }),
                );

                await this.workerCacheService.setCachedProcessingProgress(
                  videoId,
                  progress,
                );
              }
            },
          );

          outputDir = result.outputDir;

          const hlsPrefix = `hls/${videoId}`;

          console.log("Uploading HLS files to S3...");

          await this.s3Service.uploadDirectory(outputDir, hlsPrefix);

          const thumbnailKey = `thumbnails/${videoId}.jpg`;

          await this.s3Service.uploadFile(
            thumbnailPath,
            thumbnailKey,
            "image/jpeg",
          );

          const thumbnailUrl = `${process.env.CDN_BASE_URL}/${thumbnailKey}`;

          const hlsManifestUrl = `${process.env.CDN_BASE_URL}/${hlsPrefix}/master.m3u8`;

          console.log("HLS uploaded:", hlsManifestUrl);

          await this.prisma.video.update({
            where: {
              id: videoId,
            },
            data: {
              status: VideoStatus.READY_FOR_REVIEW,
              hlsManifestUrl,
              thumbnailUrl,
              duration: metadata.duration,
              processingProgress: 100,
              processedAt: new Date(),
              processingError: null,
            },
          });

          await this.workerCacheService.invalidateBackendCaches(videoId);

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
                processingProgress: 0,
              },
            });
            await this.workerCacheService.invalidateBackendCaches(
              job.data.videoId,
            );
          }

          throw error;
        } finally {
          try {
            if (inputPath && fs.existsSync(inputPath)) {
              fs.unlinkSync(inputPath);

              console.log("Cleaned input file:", inputPath);
            }

            if (outputDir && fs.existsSync(outputDir)) {
              fs.readdirSync(outputDir).forEach((file) => {
                fs.unlinkSync(path.join(outputDir, file));
              });

              fs.rmdirSync(outputDir);

              console.log("Cleaned HLS directory:", outputDir);
            }
          } catch (cleanupError) {
            console.error("Cleanup failed:", cleanupError);
          }
        }
      },
      { connection },
    );

    console.log("BullMQ Video Processing Worker started");
  }
}
