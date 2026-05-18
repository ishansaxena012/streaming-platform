import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guards';
import { Role } from '@prisma/client';

@ApiTags('Test')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
@Controller('test')
export class TestController {
  @ApiOperation({ summary: 'Admin test route' })
  @ApiOkResponse({ description: 'Authorized access successful.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  adminRoute() {
    return {
      message: 'Welcome Admin',
    };
  }

  @ApiOperation({ summary: 'Super Admin test route' })
  @ApiOkResponse({ description: 'Authorized access successful.' })
  @ApiForbiddenResponse({ description: 'Forbidden access - Super Admin only.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('super-admin')
  superAdminRoute() {
    return {
      message: 'Welcome Super Admin',
    };
  }
}
