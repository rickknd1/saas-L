import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour récupérer les notifications de l'utilisateur
 * GET /api/notifications
 */
export async function GET(request: Request) {
  try {
    // Récupérer l'userId depuis le header ajouté par le middleware JWT
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer toutes les notifications de l'utilisateur
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limiter à 50 notifications les plus récentes
    })

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("[API] Erreur récupération notifications:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    )
  }
}
