import {
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoQueryDto } from './dto/video-query.dto';
import { Query } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';
import { CloudFrontService } from '../cloudfront/cloudfront.service';
import { CacheService } from '../cache/cache.service';
import { VideoProgressService } from './video-progress.service';
import {
  PaginationDto,
  createPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class VideoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly queueService: QueueService,
    private readonly cloudFrontService: CloudFrontService,
    private readonly cacheService: CacheService,
    @InjectQueue('video-processing')
    private readonly videoQueue: Queue,
  ) {}

  async createVideo(dto: CreateVideoDto, userId: string) {
    const video = await this.prisma.video.create({
      data: {
        ...dto,
        uploadedById: userId,
      },
    });

    await this.videoQueue.add('process-video', {
      videoId: video.id,
      fileKey: video.videoUrl,
    });

    await this.cacheService.del('videos:homepage');

    return video;
  }

  async findMyVideos(userId: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where: {
          uploadedById: userId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({
        where: {
          uploadedById: userId,
        },
      }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async findPendingVideos(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where: {
          status: 'PENDING',
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  private async invalidateVideoCaches(
    videoId: string,
    categoryId?: string | null,
  ) {
    await this.cacheService.del('videos:homepage');
    await this.cacheService.del('videos:trending');
    await this.cacheService.del('admin:platform-stats');
    await this.cacheService.del(`video:${videoId}:metadata`);

    let catId = categoryId;
    if (!catId) {
      const v = await this.prisma.video.findUnique({
        where: { id: videoId },
        select: { categoryId: true },
      });
      catId = v?.categoryId;
    }

    if (catId) {
      const cat = await this.prisma.category.findUnique({
        where: { id: catId },
        select: { slug: true },
      });
      if (cat?.slug) {
        await this.cacheService.del(`videos:category:${cat.slug}`);
      }
    }
  }

  async approveVideo(videoId: string, adminId: string) {
    const video = await this.prisma.video.update({
      where: {
        id: videoId,
      },

      data: {
        status: 'PUBLISHED',
        approvedById: adminId,
      },
    });

    await this.invalidateVideoCaches(videoId, video.categoryId);

    return video;
  }

  async rejectVideo(videoId: string, adminId: string) {
    const video = await this.prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        status: 'REJECTED',
        approvedById: adminId,
      },
    });

    await this.invalidateVideoCaches(videoId, video.categoryId);

    return video;
  }

  updateWatchProgress(
    videoId: string,
    userId: string,
    progress: number,
    completed = false,
  ) {
    return this.prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        watchedSeconds: progress,
        completed,
      },
      create: {
        userId,
        videoId,
        watchedSeconds: progress,
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
        lastWatchedAt: 'desc',
      },
    });
  }

  async findPublishedVideos(query: VideoQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: query.status ?? ('PUBLISHED' as const),
      ...(query.search
        ? {
            OR: [
              {
                title: { contains: query.search, mode: 'insensitive' as const },
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
      ...(query.category
        ? {
            category: {
              slug: query.category,
            },
          }
        : {}),
      ...(query.isPremium !== undefined
        ? {
            isPremium: query.isPremium,
          }
        : {}),
    };

    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (query.sortBy === 'alphabetical') {
      orderBy = { title: 'asc' };
    } else if (query.sortBy === 'popular') {
      orderBy = { videoViews: { _count: 'desc' } };
    }

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy,
      }),
      this.prisma.video.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async getAdminVideos(adminId: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where: {
          uploadedById: adminId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({
        where: {
          uploadedById: adminId,
        },
      }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
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

      this.prisma.videoProgress.aggregate({
        where: {
          videoId: {
            in: videoIds,
          },
        },
        _sum: {
          watchedSeconds: true,
        },
      }),
    ]);

    return {
      totalVideos: videoIds.length,
      totalViews,
      completedViews,
      totalWatchProgress: totalWatchProgress._sum?.watchedSeconds ?? 0,
    };
  }

  async findOneVideo(id: string) {
    return this.cacheService.getOrSet(
      `video:${id}:metadata`,
      () =>
        this.prisma.video.findFirst({
          where: {
            id,
            status: 'PUBLISHED',
          },
        }),
      CacheService.TTL_VIDEO_METADATA,
    );
  }

  async retryVideoProcessing(videoId: string) {
    const existingVideo = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      throw new NotFoundException('Video not found');
    }

    const video = await this.prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'PROCESSING',
        processingError: null,
        processingStartedAt: new Date(),
        processedAt: null,
        hlsManifestUrl: null,
      },
    });

    await this.queueService.addVideoProcessingJob({
      videoId: video.id,
      fileKey: video.videoUrl,
    });

    await this.invalidateVideoCaches(videoId, video.categoryId);

    return video;
  }

  async getTrendingVideos(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const cacheKey = `videos:trending:page:${page}:limit:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const trending = await this.prisma.watchHistory.groupBy({
          by: ['videoId'],
          _count: {
            videoId: true,
          },
          orderBy: {
            _count: {
              videoId: 'desc',
            },
          },
        });

        const total = trending.length;
        const paginatedGroups = trending.slice(skip, skip + limit);
        const videoIds = paginatedGroups.map((item) => item.videoId);

        if (videoIds.length === 0) {
          return createPaginatedResponse([], total, page, limit);
        }

        const videos = await this.prisma.video.findMany({
          where: {
            id: {
              in: videoIds,
            },
            status: 'PUBLISHED',
          },
          include: {
            category: true,
          },
        });

        const items = paginatedGroups
          .map((group) => {
            const video = videos.find((v) => v.id === group.videoId);
            if (!video) return null;
            return {
              ...video,
              views: group._count.videoId,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        return createPaginatedResponse(items, total, page, limit);
      },
      CacheService.TTL_TRENDING,
    );
  }

  private canAccessVideo(user: any, video: any) {
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    if (!video.isPremium) {
      return true;
    }

    if (
      user.subscriptionPlan === 'PREMIUM' &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date()
    ) {
      return true;
    }

    return false;
  }

  async getPlaybackVideo(videoId: string, user: any) {
    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        hlsManifestUrl: true,
        duration: true,
        isPremium: true,
      },
    });

    if (!video) {
      throw new NotFoundException('Published video not found');
    }

    if (!this.canAccessVideo(user, video)) {
      throw new ForbiddenException('Premium subscription required');
    }

    return {
      playbackUrl: this.cloudFrontService.generateSignedUrl(
        video.hlsManifestUrl!,
      ),
    };
  }

  async registerPlayback(userId: string, videoId: string) {
    return this.prisma.videoView.create({
      data: {
        userId,
        videoId,
      },
    });
  }

  async getContinueWatching(userId: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      completed: false,
    };

    const [items, total] = await Promise.all([
      this.prisma.videoProgress.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          video: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              hlsManifestUrl: true,
              duration: true,
            },
          },
        },
      }),
      this.prisma.videoProgress.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async addToWatchlist(userId: string, videoId: string) {
    const result = await this.prisma.watchlist.upsert({
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

    await this.cacheService.del('videos:homepage');

    return result;
  }

  async removeFromWatchlist(userId: string, videoId: string) {
    return this.prisma.watchlist.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });
  }

  async getUserWatchlist(userId: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [items, total] = await Promise.all([
      this.prisma.watchlist.findMany({
        where,
        skip,
        take: limit,
        include: {
          video: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              hlsManifestUrl: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.watchlist.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async searchVideos(queryStr: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED' as const,
      OR: [
        {
          title: {
            contains: queryStr,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: queryStr,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          hlsManifestUrl: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async getVideosByCategory(slug: string, query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const cacheKey = `videos:category:${slug}:page:${page}:limit:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        const where = {
          status: 'PUBLISHED' as const,
          category: {
            slug,
          },
        };

        const [items, total] = await Promise.all([
          this.prisma.video.findMany({
            where,
            skip,
            take: limit,
            include: {
              category: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          }),
          this.prisma.video.count({ where }),
        ]);

        return createPaginatedResponse(items, total, page, limit);
      },
      CacheService.TTL_CATEGORIES,
    );
  }

  async getHomeFeed(userId?: string) {
    const cachedFeed = await this.cacheService.get<any>('videos:homepage');
    if (cachedFeed) {
      if (userId) {
        const continueWatching = await this.prisma.watchHistory.findMany({
          where: {
            userId,
            completed: false,
          },
          include: {
            video: true,
          },
          orderBy: {
            lastWatchedAt: 'desc',
          },
          take: 10,
        });
        return {
          ...cachedFeed,
          continueWatching,
        };
      }
      return cachedFeed;
    }

    const trending = await this.prisma.video.findMany({
      where: {
        status: 'PUBLISHED',
        hlsManifestUrl: {
          not: null,
        },
      },

      include: {
        _count: {
          select: {
            videoViews: true,
          },
        },
      },

      orderBy: {
        videoViews: {
          _count: 'desc',
        },
      },

      take: 10,
    });

    const latest = await this.prisma.video.findMany({
      where: {
        status: 'PUBLISHED',
        hlsManifestUrl: {
          not: null,
        },
      },

      take: 10,

      orderBy: {
        createdAt: 'desc',
      },
    });

    const categories = await this.prisma.category.findMany({
      include: {
        videos: {
          where: {
            status: 'PUBLISHED',
          },

          take: 10,
        },
      },
    });

    const baseFeed = {
      trending,
      latest,
      categories,
      continueWatching: [],
    };

    await this.cacheService.set(
      'videos:homepage',
      baseFeed,
      CacheService.TTL_HOMEPAGE,
    );

    if (userId) {
      const continueWatching = await this.prisma.watchHistory.findMany({
        where: {
          userId,
          completed: false,
        },

        include: {
          video: true,
        },

        orderBy: {
          lastWatchedAt: 'desc',
        },

        take: 10,
      });

      return {
        ...baseFeed,
        continueWatching,
      };
    }

    return baseFeed;
  }

  async trackVideoView(userId: string | undefined, videoId: string) {
    await this.prisma.videoView.create({
      data: {
        userId: userId ?? null,
        videoId,
      },
    });

    await this.cacheService.del('videos:homepage');
    await this.cacheService.del('videos:trending');

    return {
      success: true,
    };
  }

  async getVideoProcessingStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: {
        id: videoId,
      },

      select: {
        id: true,
        status: true,
        processingProgress: true,
        processingError: true,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }
}
