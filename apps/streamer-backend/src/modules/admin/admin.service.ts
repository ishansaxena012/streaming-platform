import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Role, AdminRequestStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats() {
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
  }

  getAllUsers() {
    return this.prisma.user.findMany({
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
    });
  }

  getAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      },
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
    });
  }

  getPendingAdminRequests() {
    return this.prisma.user.findMany({
      where: {
        adminRequestStatus: 'PENDING' as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRequestStatus: true,
        adminRequestedAt: true,
        createdAt: true,
      } as any,
      orderBy: {
        adminRequestedAt: 'asc',
      } as any,
    });
  }

  async rejectAdminRequest(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        adminRequestStatus: 'REJECTED' as any,
      },
      select: {
        id: true,
        adminRequestStatus: true,
      } as any,
    });
  }

  async updateUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = { role };
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      data.adminRequestStatus = 'APPROVED' as any;
    } else if (role === 'USER') {
      data.adminRequestStatus = 'NONE' as any;
      data.adminRequestedAt = null;
    }

    return this.prisma.user.update({
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
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }
}
