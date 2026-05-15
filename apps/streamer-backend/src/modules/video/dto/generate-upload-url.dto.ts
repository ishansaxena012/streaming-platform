import { IsEnum, IsString } from 'class-validator';

export class GenerateUploadUrlDto {
  @IsString()
  fileName: string;

  @IsString()
  fileType: string;

  @IsEnum(['videos', 'thumbnails'])
  folder: 'videos' | 'thumbnails';
}
