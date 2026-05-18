import { IsEnum, IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { VideoStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class VideoQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query to filter videos by title or description',
    example: 'nature',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Category slug to filter videos by category',
    example: 'anime',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter videos by status',
    enum: VideoStatus,
    example: VideoStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @ApiPropertyOptional({
    description: 'Filter premium videos',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({
    description: 'Field/order to sort videos by',
    enum: ['latest', 'oldest', 'popular', 'alphabetical'],
    default: 'latest',
    example: 'latest',
  })
  @IsOptional()
  @IsIn(['latest', 'oldest', 'popular', 'alphabetical'])
  sortBy?: 'latest' | 'oldest' | 'popular' | 'alphabetical' = 'latest';
}
