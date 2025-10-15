import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour récupérer les détails d'un projet spécifique
 * GET /api/projects/[id]
 *
 * Retourne :
 * - Informations du projet
 * - Membres avec leurs rôles
 * - Statistiques (nombre de documents, activité récente)
 * - Vérification des permissions
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params avec React.use() pattern pour Next.js 15
    const { id: projectId } = await params

    // Récupérer l'userId depuis le header ajouté par le middleware JWT
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer le projet avec toutes ses relations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          // Récupérer TOUS les membres (acceptés ET invitations en attente)
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: [
            { acceptedAt: 'desc' }, // Membres acceptés en premier
            { invitedAt: 'desc' },  // Puis invitations récentes
          ],
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            size: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            members: true,
            documents: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur a accès au projet (seulement les membres acceptés)
    const acceptedMembers = project.members.filter(m => m.acceptedAt !== null)
    const pendingInvitations = project.members.filter(m => m.acceptedAt === null)

    const isMember = acceptedMembers.some(m => m.userId === userId)
    const isOwner = project.ownerId === userId

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Accès refusé à ce projet" },
        { status: 403 }
      )
    }

    // Calculer le rôle de l'utilisateur
    let userRole = "VIEWER"
    if (isOwner) {
      userRole = "OWNER"
    } else {
      const membership = acceptedMembers.find(m => m.userId === userId)
      userRole = membership?.role || "VIEWER"
    }

    // Compter seulement les membres acceptés (exclure les invitations en attente)
    const acceptedMembersCount = acceptedMembers.length

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        _count: {
          ...project._count,
          members: acceptedMembersCount,
        },
        userRole,
      },
    })
  } catch (error) {
    console.error("[API] Erreur récupération projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du projet" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

/**
 * API pour mettre à jour un projet
 * PUT /api/projects/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()
    const { name, description, status, priority, confidential, deadline } = body

    // Récupérer l'userId depuis le header ajouté par le middleware JWT
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seul le owner ou un admin peut modifier)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      )
    }

    const isOwner = project.ownerId === userId
    const isAdmin = project.members.some(m => m.userId === userId && m.role === 'ADMIN')

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour modifier ce projet" },
        { status: 403 }
      )
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(confidential !== undefined && { confidential }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            documents: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      project: updatedProject,
    })
  } catch (error) {
    console.error("[API] Erreur mise à jour projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du projet" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

/**
 * API pour supprimer un projet
 * DELETE /api/projects/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Récupérer l'userId depuis le header ajouté par le middleware JWT
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est le propriétaire
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      )
    }

    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Seul le propriétaire peut supprimer le projet" },
        { status: 403 }
      )
    }

    // Supprimer le projet (cascade delete des membres et documents via Prisma)
    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({
      success: true,
      message: "Projet supprimé avec succès",
    })
  } catch (error) {
    console.error("[API] Erreur suppression projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
