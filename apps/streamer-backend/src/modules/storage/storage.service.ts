import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET');
    this.publicBaseUrl =
      this.configService.get<string>('S3_PUBLIC_BASE_URL') ?? '';

    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION') ?? 'ap-south-1',

      endpoint: this.configService.get<string>('S3_ENDPOINT') || undefined,

      forcePathStyle: !!this.configService.get<string>('S3_ENDPOINT'),

      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),

        secretAccessKey: this.configService.getOrThrow<string>(
          'S3_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async generateUploadUrl(params: {
    userId: string;
    fileName: string;
    fileType: string;
    folder: 'videos' | 'thumbnails';
  }): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
    if (!this.isValidFileType(params.fileType)) {
      throw new BadRequestException('Unsupported file type');
    }

    const safeFileName = params.fileName.replace(/\s+/g, '-').toLowerCase();

    const fileKey = `uploads/${params.userId}/${params.folder}/${randomUUID()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: params.fileType,
      CacheControl: 'max-age=31536000',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 5,
    });

    return {
      uploadUrl,
      fileKey,
      publicUrl: `${this.publicBaseUrl}/${fileKey}`,
    };
  }

  private isValidFileType(fileType: string): boolean {
    return [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
      'image/jpeg',
      'image/png',
      'image/webp',
    ].includes(fileType);
  }
}
