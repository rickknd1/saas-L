import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Utilitaire pour récupérer la session utilisateur dans les API routes
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
  const session = await auth()
  return session
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
  const session = await auth()

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
