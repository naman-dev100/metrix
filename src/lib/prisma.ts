import { PrismaClient } from "@prisma/client";

console.log("[Prisma] DATABASE_URL:", process.env.DATABASE_URL ? "set" : "missing");
console.log("[Prisma] DATABASE_URL first 50 chars:", process.env.DATABASE_URL?.substring(0, 50));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const client = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

client.$connect().then(() => {
  console.log("[Prisma] Connected to database successfully");
}).catch((err: any) => {
  console.error("[Prisma] Connection error:", err.message);
});

export const prisma = globalForPrisma.prisma || client;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
