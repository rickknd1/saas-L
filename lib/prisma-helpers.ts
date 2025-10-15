import { prisma } from "./prisma"
import { headers } from 'next/headers'

/**
 * Récupère l'utilisateur depuis le header x-user-id ajouté par le middleware
 * Retourne null si l'utilisateur n'est pas authentifié
 */
export async function getUserFromCookie() {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error('[getUserFromCookie] Error:', error)
    return null
  }
}

/**
 * Wrapper pour les requêtes Prisma avec retry automatique
 * Résout les erreurs "Engine is not yet connected" en reconnectant automatiquement
 */
export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Vérifier si le moteur est connecté
      if (attempt > 1) {
        console.log(`🔄 Tentative ${attempt}/${maxRetries} de reconnexion Prisma...`)
        await prisma.$connect()
      }

      // Exécuter l'opération
      return await operation()
    } catch (error: unknown) {
      lastError = error as Error

      // Vérifier si c'est une erreur de connexion
      const hasMessage = error && typeof error === 'object' && 'message' in error
      const hasCode = error && typeof error === 'object' && 'code' in error
      const message = hasMessage && typeof error.message === 'string' ? error.message : ''
      const code = hasCode && typeof error.code === 'string' ? error.code : ''

      const isConnectionError =
        message.includes("Engine is not yet connected") ||
        message.includes("Response from the Engine was empty") ||
        code === "P1001" || // Can't reach database server
        code === "P1002" || // Database server timed out
        code === "P1017" // Server has closed the connection

      if (!isConnectionError || attempt === maxRetries) {
        // Si ce n'est pas une erreur de connexion OU si on a épuisé les tentatives, throw
        throw error
      }

      // Attendre un peu avant de réessayer (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      console.log(`⏳ Erreur de connexion Prisma, nouvelle tentative dans ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Forcer la reconnexion
      try {
        await prisma.$disconnect()
      } catch {
        // Ignorer les erreurs de déconnexion
      }
    }
  }

  // Si on arrive ici, toutes les tentatives ont échoué
  console.error(`❌ Échec après ${maxRetries} tentatives`)
  throw lastError!
}
