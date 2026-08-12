const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);
  
  // 1. Create/Update user1@example.com (USER)
  await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: { role: 'USER' },
    create: {
      name: 'Standard User',
      email: 'user1@example.com',
      password: passwordHash,
      role: 'USER'
    }
  });
  console.log('✅ Created/Updated user1@example.com (USER)');

  // 2. Create/Update admin1@example.com (ADMIN)
  await prisma.user.upsert({
    where: { email: 'admin1@example.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Admin User',
      email: 'admin1@example.com',
      password: passwordHash,
      role: 'ADMIN'
    }
  });
  console.log('✅ Created/Updated admin1@example.com (ADMIN)');

  // 3. Create/Update superadmin1@example.com (SUPER_ADMIN)
  await prisma.user.upsert({
    where: { email: 'superadmin1@example.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      name: 'Super Admin User',
      email: 'superadmin1@example.com',
      password: passwordHash,
      role: 'SUPER_ADMIN'
    }
  });
  console.log('✅ Created/Updated superadmin1@example.com (SUPER_ADMIN)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
