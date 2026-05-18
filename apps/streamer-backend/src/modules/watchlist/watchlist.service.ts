import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  addToWatchlist(userId: string, videoId: string) {
    return this.prisma.watchlist.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {},
      create: {
        userId,
        videoId,
      },
    });
  }

  async getMyWatchlist(userId: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.watchlist.findMany({
        where: {
          userId,
        },
        skip,
        take: limit,
        include: {
          video: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.watchlist.count({
        where: {
          userId,
        },
      }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  removeFromWatchlist(userId: string, videoId: string) {
    return this.prisma.watchlist.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });
  }
}
