import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'The role to assign to the user',
    enum: Role,
    example: Role.ADMIN,
  })
  @IsEnum(Role)
  role: Role;
}
