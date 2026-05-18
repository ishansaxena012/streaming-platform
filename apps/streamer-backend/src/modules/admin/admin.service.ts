import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Role, AdminRequestStatus } from '@prisma/client';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getPlatformStats() {
    return this.cacheService.getOrSet(
      'admin:platform-stats',
      async () => {
        const [
          totalUsers,
          totalAdmins,
          totalSuperAdmins,
          totalVideos,
          publishedVideos,
          pendingVideos,
          processingVideos,
          rejectedVideos,
          totalCategories,
          totalWatchlistItems,
          totalWatchHistoryItems,
        ] = await Promise.all([
          this.prisma.user.count(),
          this.prisma.user.count({ where: { role: 'ADMIN' } }),
          this.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
          this.prisma.video.count(),
          this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
          this.prisma.video.count({ where: { status: 'PENDING' } }),
          this.prisma.video.count({ where: { status: 'PROCESSING' } }),
          this.prisma.video.count({ where: { status: 'REJECTED' } }),
          this.prisma.category.count(),
          this.prisma.watchlist.count(),
          this.prisma.watchHistory.count(),
        ]);

        return {
          users: {
            total: totalUsers,
            admins: totalAdmins,
            superAdmins: totalSuperAdmins,
          },
          videos: {
            total: totalVideos,
            published: publishedVideos,
            pending: pendingVideos,
            processing: processingVideos,
            rejected: rejectedVideos,
          },
          categories: {
            total: totalCategories,
          },
          engagement: {
            watchlistItems: totalWatchlistItems,
            watchHistoryItems: totalWatchHistoryItems,
          },
        };
      },
      CacheService.TTL_ADMIN_STATS,
    );
  }

  async getAllUsers(query: AdminUserQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (query.sortBy === 'alphabetical') {
      orderBy = { name: 'asc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async getAdmins(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      role: {
        in: [Role.ADMIN, Role.SUPER_ADMIN],
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async getPendingAdminRequests(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      adminRequestStatus: AdminRequestStatus.PENDING,
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          adminRequestStatus: true,
          adminRequestedAt: true,
          createdAt: true,
        },
        orderBy: {
          adminRequestedAt: 'asc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async rejectAdminRequest(userId: string) {
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: {
        adminRequestStatus: AdminRequestStatus.REJECTED,
      },
      select: {
        id: true,
        adminRequestStatus: true,
      },
    });

    await this.cacheService.del('admin:platform-stats');

    return result;
  }

  async updateUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot assign SUPER_ADMIN role');
    }

    const data: any = { role };
    if (role === 'ADMIN') {
      data.adminRequestStatus = AdminRequestStatus.APPROVED;
    } else if (role === 'USER') {
      data.adminRequestStatus = AdminRequestStatus.NONE;
      data.adminRequestedAt = null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRequestStatus: true,
        createdAt: true,
      } as any,
    });

    await this.cacheService.del('admin:platform-stats');

    return updatedUser;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot delete SUPER_ADMIN');
    }

    const deleted = await this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await this.cacheService.del('admin:platform-stats');

    return deleted;
  }
}
