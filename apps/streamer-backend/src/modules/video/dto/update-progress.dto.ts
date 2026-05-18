import { IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'The number of seconds the video has been watched',
    example: 320,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty({
    description: 'Whether the video progress is completed',
    example: false,
  })
  @IsBoolean()
  completed: boolean;
}
