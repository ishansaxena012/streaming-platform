import { Injectable } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import * as crypto from "crypto";

@Injectable()
export class VideoProcessingService {
  constructor() {
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
    }
  }

  async generateHls(
    localVideoPath: string,
  ): Promise<{ outputDir: string; manifestPath: string }> {
    const outputId = crypto.randomBytes(16).toString("hex");

    const outputDir = path.join(process.cwd(), "hls", outputId);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "master.m3u8");

    return new Promise((resolve, reject) => {
      ffmpeg(localVideoPath)
        .outputOptions([
          "-preset veryfast",
          "-g 48",
          "-sc_threshold 0",
          "-map 0:v:0",
          "-map 0:a:0?",
          "-c:v libx264",
          "-c:a aac",
          "-ar 48000",
          "-b:a 128k",
          "-hls_time 6",
          "-hls_playlist_type vod",
          "-hls_segment_filename",
          path.join(outputDir, "segment_%03d.ts"),
        ])
        .output(outputPath)
        .on("start", (cmd) => {
          console.log("FFmpeg started:", cmd);
        })
        .on("end", () => {
          console.log("HLS generation completed");

          resolve({
            outputDir,
            manifestPath: outputPath,
          });
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);

          reject(err);
        })
        .run();
    });
  }
}
