import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import prismaPkg from '@prisma/client';

const prismaGlobal = globalThis;
const { PrismaClient } = prismaPkg;

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/mock_marketplace';
const adapter = new PrismaMariaDb(databaseUrl);

export const prisma = prismaGlobal.__prismaClient || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.__prismaClient = prisma;
}