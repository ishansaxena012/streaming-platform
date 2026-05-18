import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PaginationDto, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: dto,
    });

    await this.cacheService.del('videos:homepage');
    for (let p = 1; p <= 5; p++) {
      await this.cacheService.del(`categories:all:page:${p}:limit:10`);
    }

    return category;
  }

  async getAllCategories(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const cacheKey = `categories:all:page:${page}:limit:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
          this.prisma.category.findMany({
            skip,
            take: limit,
            orderBy: {
              name: 'asc',
            },
          }),
          this.prisma.category.count(),
        ]);

        return createPaginatedResponse(items, total, page, limit);
      },
      CacheService.TTL_CATEGORIES,
    );
  }
}
