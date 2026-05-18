import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';

import { RolesGuard } from '../../common/guards/roles.guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
@ApiForbiddenResponse({ description: 'Forbidden access - Super Admin only.' })
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get global platform statistics' })
  @ApiOkResponse({ description: 'Platform statistics retrieved successfully.' })
  @Get('platform-stats')
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @ApiOperation({ summary: 'Get all registered users with pagination, filtering, and sorting' })
  @ApiOkResponse({ description: 'List of all users retrieved successfully.' })
  @Get('users')
  getAllUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @ApiOperation({ summary: 'Get all administrators with pagination' })
  @ApiOkResponse({ description: 'List of admins retrieved successfully.' })
  @Get('admins')
  getAdmins(@Query() query: PaginationDto) {
    return this.adminService.getAdmins(query);
  }

  @ApiOperation({ summary: "Update a user's role" })
  @ApiOkResponse({ description: 'User role updated successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request payload or role assignment.' })
  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @ApiOperation({ summary: 'Get all pending admin privilege requests with pagination' })
  @ApiOkResponse({ description: 'Pending requests retrieved successfully.' })
  @Get('pending-requests')
  getPendingAdminRequests(@Query() query: PaginationDto) {
    return this.adminService.getPendingAdminRequests(query);
  }

  @ApiOperation({ summary: 'Reject a pending admin request' })
  @ApiOkResponse({ description: 'Admin request successfully rejected.' })
  @ApiNotFoundResponse({ description: 'User or request not found.' })
  @Patch('users/:id/reject-request')
  rejectAdminRequest(@Param('id') id: string) {
    return this.adminService.rejectAdminRequest(id);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiOkResponse({ description: 'User successfully deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
