import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async upgradeToPremium(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    const expiryDate = new Date();

    expiryDate.setMonth(expiryDate.getMonth() + 1);

    return this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        subscriptionPlan: 'PREMIUM',
        subscriptionExpiresAt: expiryDate,
      },

      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true,
      },
    });
  }

  async getMySubscription(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true,
      },
    });
  }
}
