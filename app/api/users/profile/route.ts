import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"



/**
 * API pour récupérer le profil complet de l'utilisateur
 * Retourne toutes les informations de profil
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

    // Récupérer le profil utilisateur complet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        bio: true,
        avatar: true,
        organization: true,
        organizationSiret: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer les statistiques d'activité de l'utilisateur
    const [projectsCount, documentsCount, collaborationsCount] = await Promise.all([
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
      prisma.document.count({
        where: {
          uploadedById: userId,
        },
      }),
      prisma.projectMember.count({
        where: {
          userId: userId,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          projects: projectsCount,
          documents: documentsCount,
          collaborations: collaborationsCount,
        },
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

/**
 * API pour mettre à jour le profil utilisateur
 */
export async function PATCH(request: Request) {
  try {
    // Utiliser le userId du JWT vérifié par le middleware (SÉCURITÉ)
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = body

    // Filtrer les champs autorisés à la mise à jour
    const allowedFields = [
      "name",
      "firstName",
      "lastName",
      "phone",
      "role",
      "bio",
      "avatar",
      "organization",
      "organizationSiret",
    ]

    const filteredData: Record<string, unknown> = {}
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key]
      }
    })

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: filteredData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        bio: true,
        avatar: true,
        organization: true,
        organizationSiret: true,
        plan: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
