// Import the generated PrismaClient from the custom output path
import { PrismaClient } from '@/app/generated/prisma';

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
