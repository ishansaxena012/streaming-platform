import { IsEnum, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Role } from '@prisma/client';

export class AdminUserQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search string to match user name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter users by role',
    enum: Role,
    example: Role.ADMIN,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Order in which to sort users',
    enum: ['latest', 'oldest', 'alphabetical'],
    default: 'latest',
    example: 'latest',
  })
  @IsOptional()
  @IsIn(['latest', 'oldest', 'alphabetical'])
  sortBy?: 'latest' | 'oldest' | 'alphabetical' = 'latest';
}
