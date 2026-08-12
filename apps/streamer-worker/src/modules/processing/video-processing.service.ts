import { Injectable } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStaticPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import * as crypto from "crypto";

export type HlsGenerationResult = {
  outputDir: string;
  manifestPath: string;
};

@Injectable()
export class VideoProcessingService {
  constructor() {
    const isWin = process.platform === "win32";
    const ffmpegBinName = isWin ? "ffmpeg.exe" : "ffmpeg";
    const ffprobeBinName = isWin ? "ffprobe.exe" : "ffprobe";

    // Set Ffmpeg path: explicit env var > bundled ffmpeg-static binary (local dev,
    // no manual setup needed) > bin/ folder override > fluent-ffmpeg's own PATH
    // lookup (what the Docker image relies on, via the system-installed ffmpeg)
    if (process.env.FFMPEG_PATH) {
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    } else if (ffmpegStaticPath && fs.existsSync(ffmpegStaticPath)) {
      ffmpeg.setFfmpegPath(ffmpegStaticPath);
    } else {
      const searchPaths = [
        path.join(process.cwd(), "bin", ffmpegBinName),
        path.join(process.cwd(), "apps", "streamer-worker", "bin", ffmpegBinName),
        path.join(__dirname, "..", "..", "..", "..", "bin", ffmpegBinName),
        path.join(__dirname, "..", "..", "..", "..", "..", "bin", ffmpegBinName),
      ];

      for (const p of searchPaths) {
        if (fs.existsSync(p)) {
          ffmpeg.setFfmpegPath(p);
          console.log(`[FFMPEG] Auto-configured local path: ${p}`);
          break;
        }
      }
    }

    // Same fallback order for ffprobe
    if (process.env.FFPROBE_PATH) {
      ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
    } else if (ffprobeStatic?.path && fs.existsSync(ffprobeStatic.path)) {
      ffmpeg.setFfprobePath(ffprobeStatic.path);
    } else {
      const searchPaths = [
        path.join(process.cwd(), "bin", ffprobeBinName),
        path.join(process.cwd(), "apps", "streamer-worker", "bin", ffprobeBinName),
        path.join(__dirname, "..", "..", "..", "..", "bin", ffprobeBinName),
        path.join(__dirname, "..", "..", "..", "..", "..", "bin", ffprobeBinName),
      ];

      for (const p of searchPaths) {
        if (fs.existsSync(p)) {
          ffmpeg.setFfprobePath(p);
          console.log(`[FFPROBE] Auto-configured local path: ${p}`);
          break;
        }
      }
    }
  }

  async generateHls(
    localVideoPath: string,
    onProgress?: (progress: number) => Promise<void>,
  ): Promise<HlsGenerationResult> {
    const outputId = crypto.randomBytes(16).toString("hex");
    const outputDir = path.join(process.cwd(), "hls", outputId);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const masterPath = path.join(outputDir, "master.m3u8");

    return new Promise<HlsGenerationResult>((resolve, reject) => {
      ffmpeg(localVideoPath)
        .outputOptions([
          "-preset veryfast",

          "-filter_complex",
          "[0:v]split=3[v240src][v480src][v720src];" +
            "[v240src]scale=w=426:h=240:force_original_aspect_ratio=decrease,pad=426:240:(ow-iw)/2:(oh-ih)/2[v240];" +
            "[v480src]scale=w=854:h=480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2[v480];" +
            "[v720src]scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v720]",

          "-map [v240]",
          "-map 0:a:0",
          "-c:v:0 libx264",
          "-b:v:0 400k",
          "-maxrate:v:0 500k",
          "-bufsize:v:0 800k",

          "-map [v480]",
          "-map 0:a:0",
          "-c:v:1 libx264",
          "-b:v:1 1000k",
          "-maxrate:v:1 1200k",
          "-bufsize:v:1 2000k",

          "-map [v720]",
          "-map 0:a:0",
          "-c:v:2 libx264",
          "-b:v:2 2500k",
          "-maxrate:v:2 3000k",
          "-bufsize:v:2 5000k",

          "-c:a aac",
          "-b:a 128k",
          "-ac 2",
          "-ar 44100",

          "-g 48",
          "-keyint_min 48",
          "-sc_threshold 0",

          "-f hls",
          "-hls_time 6",
          "-hls_playlist_type vod",

          "-hls_segment_filename",
          path.join(outputDir, "%v_segment_%03d.ts"),

          "-master_pl_name",
          "master.m3u8",

          "-var_stream_map",
          "v:0,a:0 v:1,a:1 v:2,a:2",
        ])
        .output(path.join(outputDir, "%v.m3u8"))
        .on("start", (cmd) => {
          console.log("FFmpeg started:", cmd);
        })
        .on("progress", async (progress) => {
          const percent = Math.min(Math.floor(progress.percent || 0), 100);

          console.log(`Processing: ${percent}%`);

          if (onProgress) {
            await onProgress(percent);
          }
        })
        .on("end", () => {
          console.log("Adaptive HLS generation completed");

          resolve({
            outputDir,
            manifestPath: masterPath,
          });
        })
        .on("error", (err, _stdout, stderr) => {
          console.error("FFmpeg error:", err.message);
          if (stderr) {
            console.error("FFmpeg stderr:\n", stderr);
          }
          reject(err);
        })
        .run();
    });
  }

  async getVideoMetadata(localVideoPath: string): Promise<{
    duration: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(localVideoPath, (err, metadata) => {
        if (err) {
          return reject(err);
        }

        resolve({
          duration: Math.floor(metadata.format.duration || 0),
        });
      });
    });
  }

  async generateThumbnail(
    localVideoPath: string,
    outputDir: string,
  ): Promise<string> {
    const thumbnailPath = path.join(outputDir, "thumbnail.jpg");

    return new Promise((resolve, reject) => {
      ffmpeg(localVideoPath)
        .screenshots({
          timestamps: ["10%"],
          filename: "thumbnail.jpg",
          folder: outputDir,
          size: "1280x720",
        })
        .on("end", () => {
          console.log("Thumbnail generated");

          resolve(thumbnailPath);
        })
        .on("error", (err, _stdout, stderr) => {
          console.error("Thumbnail generation failed:", err.message);
          if (stderr) {
            console.error("FFmpeg stderr:\n", stderr);
          }
          reject(err);
        });
    });
  }
}
