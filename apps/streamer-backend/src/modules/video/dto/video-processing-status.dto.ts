import { VideoStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class VideoProcessingStatusDto {
  @ApiProperty({
    description: 'The unique identifier of the video',
    example: 'cmp82wr2000001gkf0xyuxph2',
  })
  id: string;

  @ApiProperty({
    description: 'The processing status of the video',
    enum: VideoStatus,
    example: VideoStatus.PROCESSING,
  })
  status: VideoStatus;

  @ApiProperty({
    description: 'The progress percentage of video processing',
    example: 45,
    minimum: 0,
    maximum: 100,
  })
  processingProgress: number;

  @ApiProperty({
    description: 'Error message if video processing failed, otherwise null',
    example: null,
    nullable: true,
  })
  processingError: string | null;
}
