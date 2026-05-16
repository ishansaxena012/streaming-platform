import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateWatchProgressDto {
  @IsInt()
  @Min(0)
  progressSeconds: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
