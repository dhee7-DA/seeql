import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDbUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:") && !envUrl.includes("..") && !envUrl.includes("/home/z/")) {
    return envUrl;
  }

  const directPath = path.resolve(process.cwd(), "db/custom.db");
  const parentPath = path.resolve(process.cwd(), "../db/custom.db");
  const chosenPath = fs.existsSync(directPath) ? directPath : parentPath;
  return `file:${chosenPath.replace(/\\/g, "/")}`;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDbUrl(),
      },
    },
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;