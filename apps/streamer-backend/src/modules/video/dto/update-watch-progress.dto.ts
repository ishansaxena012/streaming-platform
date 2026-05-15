import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateWatchProgressDto {
  @IsInt()
  @Min(0)
  progress: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
