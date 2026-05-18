import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWatchProgressDto {
  @ApiProperty({
    description: 'The number of seconds watched so far',
    example: 120,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  progressSeconds: number;

  @ApiPropertyOptional({
    description: 'Whether the user has completed watching the video',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
