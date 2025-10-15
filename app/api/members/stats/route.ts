import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"



/**
 * API pour récupérer les statistiques des membres
 * Retourne le nombre total, actifs, etc.
 *
 * Cahier des charges: Module B - Collaboration
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

    // Récupérer le nombre total de membres uniques (uniquement ceux qui ont accepté) sur les projets de l'utilisateur
    const projectMembersRaw = await prisma.projectMember.findMany({
      where: {
        acceptedAt: {
          not: null,  // Uniquement les membres qui ont accepté
        },
        project: {
          ownerId: userId,  // Uniquement les projets dont l'utilisateur est propriétaire
        },
      },
      select: {
        userId: true,
      },
    })

    // Compter les utilisateurs uniques
    const uniqueUserIds = [...new Set(projectMembersRaw.map(m => m.userId))]
    const totalMembers = uniqueUserIds.length

    // Récupérer le nombre de membres actifs (connectés dans les dernières 24h)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const activeMembers = await prisma.user.count({
      where: {
        id: {
          in: uniqueUserIds,  // Uniquement les membres de l'organisation
        },
        lastLoginAt: {
          gte: oneDayAgo,
        },
      },
    })

    // Récupérer le nombre total de projets dont l'utilisateur est propriétaire
    const totalProjects = await prisma.project.count({
      where: {
        ownerId: userId,
      },
    })

    // Récupérer le nombre d'invitations en attente (ProjectMembers sans acceptedAt) sur les projets de l'utilisateur
    const pendingInvitations = await prisma.projectMember.count({
      where: {
        project: {
          ownerId: userId,
        },
        acceptedAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: totalMembers,
        active: activeMembers,
        totalProjects,
        pendingInvitations,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des stats membres:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
