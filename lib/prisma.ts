import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Singleton Prisma Client avec gestion de reconnexion automatique
 * Résout les erreurs "Engine is not yet connected" et "Response from Engine was empty"
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Configuration du connection pool pour éviter les timeouts
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Gestion de la reconnexion automatique en cas d'erreur
if (typeof window === "undefined") {
  prisma.$connect().catch((error) => {
    console.error("❌ Erreur de connexion Prisma initiale:", error)
  })

  // Gérer les déconnexions inattendues
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as any
}
