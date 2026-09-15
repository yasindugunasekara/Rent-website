import { PrismaClient } from "@prisma/client";

// Singleton guarded against Next.js dev-mode HMR creating a fresh PrismaClient
// (and therefore a fresh connection pool) on every module reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
