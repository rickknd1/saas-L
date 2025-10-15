import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"



/**
 * API pour récupérer la liste des membres de l'équipe
 * Retourne tous les membres qui collaborent avec l'utilisateur
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

    // OPTIMISÉ: Récupérer tous les membres avec leurs infos en UNE SEULE requête
    // au lieu de faire N+1 queries (3 queries par membre!)
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        acceptedAt: {
          not: null,  // Uniquement les membres qui ont accepté
        },
        project: {
          ownerId: userId,  // Uniquement les projets dont l'utilisateur est propriétaire
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            lastLoginAt: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    })

    // Type pour les données utilisateur du select
    type UserSelect = {
      id: string
      name: string | null
      email: string
      role: string | null
      avatar: string | null
      lastLoginAt: Date | null
    }

    // Grouper par userId et compter les projets
    const membersByUserId = new Map<string, {
      userId: string
      user: UserSelect
      role: string
      canEdit: boolean
      canInvite: boolean
      canDelete: boolean
      projectCount: number
      projects: Array<{ id: string; name: string }>
      lastAcceptedAt: Date
    }>()

    for (const member of projectMembers) {
      const existing = membersByUserId.get(member.userId)

      if (existing) {
        // Incrémenter le nombre de projets
        existing.projectCount++
        existing.projects.push(member.project)
        // Garder la date d'acceptation la plus récente
        if (member.acceptedAt && member.acceptedAt > existing.lastAcceptedAt) {
          existing.lastAcceptedAt = member.acceptedAt
        }
      } else {
        // Première occurrence de cet utilisateur
        membersByUserId.set(member.userId, {
          userId: member.userId,
          user: member.user,
          role: member.role,
          canEdit: member.canEdit,
          canInvite: member.canInvite,
          canDelete: member.canDelete,
          projectCount: 1,
          projects: [member.project],
          lastAcceptedAt: member.acceptedAt || new Date(),
        })
      }
    }

    // Convertir en array et trier par date d'acceptation (plus récent en premier)
    const validMembers = Array.from(membersByUserId.values()).sort(
      (a, b) => b.lastAcceptedAt.getTime() - a.lastAcceptedAt.getTime()
    )

    return NextResponse.json({
      success: true,
      members: validMembers,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
