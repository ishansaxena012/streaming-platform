import { ApiProperty } from '@nestjs/swagger';

export class PlaybackResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the video',
    example: 'cmp82wr2000001gkf0xyuxph2',
  })
  id: string;

  @ApiProperty({
    description: 'The title of the video',
    example: 'Introduction to NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the video',
    example: 'A comprehensive guide to learning NestJS.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'The secure URL of the video thumbnail',
    example: 'https://cloudfront.net/thumbnails/intro.jpg',
    nullable: true,
  })
  thumbnailUrl: string | null;

  @ApiProperty({
    description: 'The secure, signed URL of the HLS manifest (.m3u8)',
    example: 'https://cloudfront.net/hls/intro/manifest.m3u8?Expires=...',
  })
  hlsManifestUrl: string;

  @ApiProperty({
    description: 'The duration of the video in seconds',
    example: 620,
    nullable: true,
  })
  duration: number | null;
}
