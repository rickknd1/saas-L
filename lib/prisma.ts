import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

// Note: Prisma Optimize extension désactivée car incompatible avec Edge Runtime (middleware)
// Pour l'activer en production (non-edge), importer withOptimize et utiliser .$extends()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as any
}
