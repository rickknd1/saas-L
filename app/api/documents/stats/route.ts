import { NextResponse } from "next/server"
import { ProjectStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"



/**
 * API pour récupérer les statistiques des documents
 * Retourne le nombre total et par statut
 *
 * Cahier des charges: Module A - Projets & Documents
 */

export async function GET(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer les statistiques des documents
    const [total, inReview, validated, pending] = await Promise.all([
      prisma.document.count({
        where: {
          project: {
            OR: [
              { ownerId: userId },
              {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
        },
      }),
      prisma.document.count({
        where: {
          project: {
            OR: [
              { ownerId: userId },
              {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
            status: "IN_REVIEW" as ProjectStatus,
          },
        },
      }),
      prisma.document.count({
        where: {
          project: {
            OR: [
              { ownerId: userId },
              {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
            status: "COMPLETED" as ProjectStatus,
          },
        },
      }),
      prisma.document.count({
        where: {
          project: {
            OR: [
              { ownerId: userId },
              {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
            status: "PENDING" as ProjectStatus,
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total,
        inReview,
        validated,
        pending,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des stats documents:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
