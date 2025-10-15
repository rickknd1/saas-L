import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour marquer toutes les notifications comme lues
 * POST /api/notifications/mark-all-read
 */
export async function POST(request: Request) {
  try {
    // Récupérer l'userId depuis le header ajouté par le middleware JWT
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Marquer toutes les notifications non lues comme lues
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Toutes les notifications ont été marquées comme lues",
    })
  } catch (error) {
    console.error("[API] Erreur mise à jour notifications:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des notifications" },
      { status: 500 }
    )
  }
}
