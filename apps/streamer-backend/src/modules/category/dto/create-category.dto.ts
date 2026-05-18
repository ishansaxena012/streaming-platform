import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Action & Adventure',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The slug representation of the category',
    example: 'action-adventure',
  })
  @IsString()
  slug: string;
}
