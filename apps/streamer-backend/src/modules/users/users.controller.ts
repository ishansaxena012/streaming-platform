import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Request administrator privileges' })
  @ApiCreatedResponse({ description: 'Admin request successfully submitted.' })
  @ApiBadRequestResponse({ description: 'Admin request already pending or user is already admin.' })
  @UseGuards(JwtAuthGuard)
  @Post('request-admin')
  requestAdmin(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.requestAdmin(user.id);
  }
}
