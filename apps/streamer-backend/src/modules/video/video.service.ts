import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoQueryDto } from './dto/video-query.dto';
import { Query } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class VideoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly queueService: QueueService,
  ) {}

  createVideo(dto: CreateVideoDto, userId: string) {
    return this.prisma.video.create({
      data: {
        ...dto,
        uploadedById: userId,
      },
    });
  }

  findMyVideos(userId: string) {
    return this.prisma.video.findMany({
      where: {
        uploadedById: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findPendingVideos() {
    return this.prisma.video.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveVideo(videoId: string, adminId: string) {
    const video = await this.prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        status: 'PROCESSING',
        approvedById: adminId,
      },
    });

    await this.queueService.addVideoProcessingJob(video.id);

    return video;
  }

  rejectVideo(videoId: string, adminId: string) {
    return this.prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        status: 'REJECTED',
        approvedById: adminId,
      },
    });
  }

  updateWatchProgress(
    videoId: string,
    userId: string,
    progress: number,
    completed = false,
  ) {
    return this.prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        progress,
        completed,
      },
      create: {
        userId,
        videoId,
        progress,
        completed,
      },
    });
  }

  getMyWatchHistory(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: {
        userId,
      },
      include: {
        video: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findPublishedVideos(query: VideoQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED' as const,
      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  getAdminVideos(adminId: string) {
    return this.prisma.video.findMany({
      where: {
        uploadedById: adminId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAdminStats(adminId: string) {
    const [total, pending, published, rejected] = await Promise.all([
      this.prisma.video.count({
        where: { uploadedById: adminId },
      }),
      this.prisma.video.count({
        where: { uploadedById: adminId, status: 'PENDING' },
      }),
      this.prisma.video.count({
        where: { uploadedById: adminId, status: 'PUBLISHED' },
      }),
      this.prisma.video.count({
        where: { uploadedById: adminId, status: 'REJECTED' },
      }),
    ]);

    return {
      total,
      pending,
      published,
      rejected,
    };
  }

  generateUploadUrl(
    userId: string,
    fileName: string,
    fileType: string,
    folder: 'videos' | 'thumbnails',
  ) {
    return this.storageService.generateUploadUrl({
      userId,
      fileName,
      fileType,
      folder,
    });
  }

  async getAdminAnalytics(adminId: string) {
    const videos = await this.prisma.video.findMany({
      where: {
        uploadedById: adminId,
      },
      select: {
        id: true,
      },
    });

    const videoIds = videos.map((video) => video.id);

    const [totalViews, completedViews, totalWatchProgress] = await Promise.all([
      this.prisma.watchHistory.count({
        where: {
          videoId: {
            in: videoIds,
          },
        },
      }),

      this.prisma.watchHistory.count({
        where: {
          videoId: {
            in: videoIds,
          },
          completed: true,
        },
      }),

      this.prisma.watchHistory.aggregate({
        where: {
          videoId: {
            in: videoIds,
          },
        },
        _sum: {
          progress: true,
        },
      }),
    ]);

    return {
      totalVideos: videoIds.length,
      totalViews,
      completedViews,
      totalWatchProgress: totalWatchProgress._sum.progress ?? 0,
    };
  }
}
