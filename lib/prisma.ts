import { PrismaClient } from '@prisma/client';

declare global {
  // -- prevents multiple instances in dev with hot-reload
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
