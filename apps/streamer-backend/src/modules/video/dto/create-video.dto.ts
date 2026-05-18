import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    description: 'The title of the video',
    example: 'NestJS Advanced Patterns',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the video',
    example: 'Learn about advanced dependency injection and custom decorators in NestJS.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The S3 bucket URL or path of the uploaded raw video file',
    example: 'videos/xyz-123.mp4',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'The S3 bucket URL or path of the uploaded video thumbnail',
    example: 'thumbnails/xyz-123.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'The ID of the category this video belongs to',
    example: 'category-id-12345',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Whether the video is accessible only to premium subscribers',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
