import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

  getMyWatchlist(userId: string) {
    return this.prisma.watchlist.findMany({
      where: {
        userId,
      },
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
    });
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
