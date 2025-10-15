import { headers } from "next/headers"
import { NextResponse } from "next/server"

/**
 * Utilitaire pour récupérer la session utilisateur dans les API routes
 * Utilise les headers x-user-id et x-user-email ajoutés par le middleware
 *
 * Usage:
 * ```ts
 * const session = await getAuthSession()
 * if (!session) {
 *   return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
 * }
 * const userId = session.user.id
 * ```
 */

export async function getAuthSession() {
  const headersList = await headers()
  const userId = headersList.get("x-user-id")
  const userEmail = headersList.get("x-user-email")

  if (!userId || !userEmail) {
    return null
  }

  return {
    user: {
      id: userId,
      email: userEmail,
    },
  }
}

/**
 * Utilitaire pour récupérer la session OU retourner une erreur 401
 *
 * Usage:
 * ```ts
 * const { session, error } = await requireAuth()
 * if (error) return error
 *
 * const userId = session.user.id
 * ```
 */

export async function requireAuth() {
  const session = await getAuthSession()

  if (!session || !session.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Non authentifié. Veuillez vous connecter." },
        { status: 401 }
      ),
    }
  }

  return {
    session,
    error: null,
  }
}
