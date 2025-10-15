import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour récupérer les invitations en attente d'un utilisateur
 * GET /api/invitations
 */

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer les invitations en attente
    const invitations = await prisma.projectMember.findMany({
      where: {
        userId,
        acceptedAt: null, // Seulement les invitations en attente
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                documents: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        invitedAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      invitations,
      count: invitations.length,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 }
    )
  }
}
