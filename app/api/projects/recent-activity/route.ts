import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"



/**
 * API pour récupérer l'activité récente sur les projets
 * Retourne les dernières actions (logs d'audit) de l'utilisateur
 *
 * Cahier des charges: Module C - Audit Logs
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

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"

    // Récupérer les dernières activités depuis les audit logs
    const activities = await prisma.auditLog.findMany({
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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        document: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit),
    })

    return NextResponse.json({
      success: true,
      activities,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'activité" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
