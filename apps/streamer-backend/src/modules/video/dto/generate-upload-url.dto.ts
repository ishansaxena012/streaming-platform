import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateUploadUrlDto {
  @ApiProperty({
    description: 'The name of the file to be uploaded',
    example: 'my-awesome-video.mp4',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'The MIME type of the file',
    example: 'video/mp4',
  })
  @IsString()
  fileType: string;

  @ApiProperty({
    description: 'The target folder for the upload',
    enum: ['videos', 'thumbnails'],
    example: 'videos',
  })
  @IsEnum(['videos', 'thumbnails'])
  folder: 'videos' | 'thumbnails';
}
