import { Injectable } from "@nestjs/common";

import * as fs from "fs";
import * as path from "path";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async downloadFile(key: string, outputPath: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    const body = response.Body as any;

    await new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);

      body.pipe(writer);

      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    return outputPath;
  }

  async uploadFile(localPath: string, key: string, contentType: string) {
    const fileStream = fs.createReadStream(localPath);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async uploadDirectory(localDir: string, s3Prefix: string) {
    const files = fs.readdirSync(localDir);

    const uploadedKeys: string[] = [];

    for (const file of files) {
      const localPath = path.join(localDir, file);
      const key = `${s3Prefix}/${file}`;

      const contentType = file.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/MP2T";

      await this.uploadFile(localPath, key, contentType);

      uploadedKeys.push(key);
    }

    return uploadedKeys;
  }

  getPublicUrl(key: string) {
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
