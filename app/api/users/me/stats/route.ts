import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


/**
 * API pour récupérer les statistiques réelles de l'utilisateur
 * Retourne le nombre de projets, documents, collaborateurs depuis la base de données
 *
 * Cahier des charges: Module C - Gestion de Compte
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

    // Récupérer les statistiques réelles depuis la base de données
    const [projectCount, documentCount, collaboratorCount, timeSaved] = await Promise.all([
      // Nombre de projets de l'utilisateur (propriétaire ou membre)
      prisma.project.count({
        where: {
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
      }),

      // Nombre de documents de l'utilisateur
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

      // Nombre de collaborateurs uniques sur les projets de l'utilisateur
      // Note: count() ne supporte pas distinct, on utilise findMany + length
      prisma.projectMember.findMany({
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
        select: {
          userId: true,
        },
        distinct: ["userId"],
      }).then(members => members.length),

      // Temps gagné estimé (basé sur le nombre d'actions dans les logs d'audit)
      prisma.auditLog.count({
        where: {
          userId: userId,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Dernier mois
          },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        projects: projectCount,
        documents: documentCount,
        collaborators: collaboratorCount,
        timeSaved: Math.floor(timeSaved * 0.5), // Estimation: 0.5h par action
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
}
