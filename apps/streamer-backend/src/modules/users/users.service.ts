import { Injectable } from '@nestjs/common';
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
      },
    });
  }

  requestAdmin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
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
}
