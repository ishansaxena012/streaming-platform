import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,

        subscriptionPlan: true,
        subscriptionExpiresAt: true,

        createdAt: true,
      },
    });
  }

  createUser(data: {
    name: string;
    email: string;
    password?: string;
    role?: Role;
    googleId?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? Role.USER,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        avatarUrl: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true,
      },
    });
  }

  async requestAdmin(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (existingUser?.adminRequestStatus === 'PENDING') {
      throw new BadRequestException('Admin request already pending');
    }

    if (
      existingUser?.role === 'ADMIN' ||
      existingUser?.role === 'SUPER_ADMIN'
    ) {
      throw new BadRequestException('User is already an admin');
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        adminRequestStatus: 'PENDING',
        adminRequestedAt: new Date(),
      },

      select: {
        id: true,
        adminRequestStatus: true,
      },
    });
  }

  upgradeToPremium(userId: string) {
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
}
