import { PrismaClient, Role, VideoStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@test.com',
    },

    update: {},

    create: {
      email: 'admin@test.com',
      name: 'Admin',
      password,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: {
      email: 'user@test.com',
    },

    update: {},

    create: {
      email: 'user@test.com',
      name: 'Test User',
      password,
      role: Role.USER,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'action' },
      update: {},
      create: {
        name: 'Action',
        slug: 'action',
      },
    }),

    prisma.category.upsert({
      where: { slug: 'anime' },
      update: {},
      create: {
        name: 'Anime',
        slug: 'anime',
      },
    }),

    prisma.category.upsert({
      where: { slug: 'tech' },
      update: {},
      create: {
        name: 'Tech',
        slug: 'tech',
      },
    }),
  ]);

  const video1 = await prisma.video.create({
    data: {
      title: 'Action Demo Movie',
      description: 'Seeded action movie',
      status: VideoStatus.PUBLISHED,

      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',

      thumbnailUrl:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',

      hlsManifestUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',

      uploadedById: admin.id,
      approvedById: admin.id,
      categoryId: categories[0].id,
    },
  });

  const video2 = await prisma.video.create({
    data: {
      title: 'Anime Demo',
      description: 'Seeded anime video',
      status: VideoStatus.PUBLISHED,

      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',

      thumbnailUrl:
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',

      hlsManifestUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',

      uploadedById: admin.id,
      approvedById: admin.id,
      categoryId: categories[1].id,
    },
  });

  await prisma.videoView.createMany({
    data: [
      {
        videoId: video1.id,
        userId: user.id,
      },

      {
        videoId: video1.id,
        userId: admin.id,
      },

      {
        videoId: video2.id,
        userId: user.id,
      },
    ],
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
