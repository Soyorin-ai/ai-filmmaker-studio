import path from 'node:path';
import process from 'node:process';
import {config} from 'dotenv';
import {PrismaClient, UserRole, PlanType} from '@prisma/client';
import {hashSync} from 'bcrypt';

config({
  path: path.resolve(process.cwd(), '../../.env'),
});

const prisma = new PrismaClient();
const saltRounds = 12;

async function main(): Promise<void> {
  // 创建管理员用户
  const admin = await prisma.user.upsert({
    where: {email: 'admin@example.com'},
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashSync('Admin@12345', saltRounds),
      nickname: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  // 为管理员创建默认额度
  await prisma.quota.upsert({
    where: {userId: admin.id},
    update: {},
    create: {
      userId: admin.id,
      planType: PlanType.ENTERPRISE,
      imageCount: 10000,
      imageTotal: 10000,
      videoSeconds: 6000,
      videoTotal: 6000,
      storageBytes: BigInt(214748364800), // 200GB
      storageTotal: BigInt(214748364800),
      maxConcurrent: 10,
    },
  });

  // 创建测试用户
  const testUser = await prisma.user.upsert({
    where: {email: 'test@example.com'},
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: hashSync('Test@12345', saltRounds),
      nickname: 'Test User',
      role: UserRole.USER,
    },
  });

  // 为测试用户创建免费额度
  await prisma.quota.upsert({
    where: {userId: testUser.id},
    update: {},
    create: {
      userId: testUser.id,
      planType: PlanType.FREE,
      imageCount: 10,
      imageTotal: 10,
      videoSeconds: 30,
      videoTotal: 30,
      storageBytes: BigInt(1073741824), // 1GB
      storageTotal: BigInt(1073741824),
      maxConcurrent: 1,
    },
  });

  console.log('Seed completed.');
  console.log('Admin user: admin@example.com / Admin@12345');
  console.log('Test user: test@example.com / Test@12345');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect();
  });
