import { NextResponse } from "next/server"

/**
 * API de déconnexion
 * Supprime le cookie auth-token pour déconnecter l'utilisateur
 */
export async function POST(request: Request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Déconnexion réussie",
    })

    // Supprimer le cookie auth-token
    response.cookies.delete("auth-token")

    return response
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error)
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    )
  }
}
