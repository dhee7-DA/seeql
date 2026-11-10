import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function resolveDbFilePath(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith("file:") && !envUrl.includes("/home/z/")) {
    const rawFile = envUrl.slice(5);
    const resolved = path.isAbsolute(rawFile) ? rawFile : path.resolve(process.cwd(), rawFile);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  const candidates = [
    path.resolve(process.cwd(), "db/custom.db"),
    path.resolve(process.cwd(), "../db/custom.db"),
    path.resolve(process.cwd(), "../../db/custom.db"),
  ];
  const existing = candidates.find((p) => fs.existsSync(p));
  const chosenPath = existing ?? candidates[0];
  const dir = path.dirname(chosenPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return chosenPath;
}

function resolveDbUrl(): string {
  return `file:${resolveDbFilePath().replace(/\\/g, "/")}`;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDbUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
