import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour récupérer le plan de l'utilisateur depuis la base de données
 */


export async function GET(request: Request) {
  try {
    // Utiliser le userId du JWT vérifié par le middleware (SÉCURITÉ)
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${userId}`)
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    console.log(`📊 Plan de l'utilisateur ${userId}: ${user.plan}`)

    return NextResponse.json({
      success: true,
      plan: user.plan.toLowerCase(),
    })
  } catch (error) {
    console.error("Erreur récupération plan:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du plan" },
      { status: 500 }
    )
  }
}
