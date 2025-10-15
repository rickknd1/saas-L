import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-manager"
import { requireAuth } from "@/lib/get-session"

/**
 * API de gestion des membres de projet
 * GET /api/projects/[id]/members - Liste des membres
 * POST /api/projects/[id]/members - Ajouter un membre
 *
 * Module C (@kayzeur dylann)
 * Implémente la limitation freemium (3 collaborateurs max par projet)
 */

/**
 * GET /api/projects/[id]/members
 * Récupère la liste des membres d'un projet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id
    const { id: projectId } = await params

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé ou accès refusé" },
        { status: 404 }
      )
    }

    // Récupérer les membres du projet
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            organization: true,
          },
        },
      },
      orderBy: {
        invitedAt: "asc",
      },
    })

    return NextResponse.json({
      members,
      count: members.length,
    })
  } catch (error) {
    console.error("Error fetching project members:", error)
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/members
 * Ajoute un membre au projet avec vérification de la limitation freemium
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id
    const { id: projectId } = await params

    const body = await request.json()
    const { email, role, canEdit, canInvite, canDelete } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "L'email du membre est requis" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et que l'utilisateur est propriétaire ou a permission d'inviter
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
                canInvite: true,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            plan: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé ou vous n'avez pas la permission d'inviter des membres" },
        { status: 404 }
      )
    }

    // Récupérer l'utilisateur à inviter
    const memberToInvite = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    })

    if (!memberToInvite) {
      return NextResponse.json(
        {
          error: "Utilisateur non trouvé",
          message: "Cet email n'est pas enregistré. L'utilisateur doit d'abord créer un compte.",
        },
        { status: 404 }
      )
    }

    // Vérifier si le membre est déjà dans le projet
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberToInvite.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "Cet utilisateur est déjà membre du projet" },
        { status: 409 }
      )
    }

    // Vérifier la limitation freemium (3 collaborateurs max, owner inclus)
    if (project.owner.plan === "FREEMIUM") {
      const membersCount = await prisma.projectMember.count({
        where: { projectId },
      })

      // +1 pour l'owner qui n'est pas compté dans projectMember
      // +1 pour le nouveau membre qu'on veut ajouter
      const totalMembers = membersCount + 1 + 1
      const limit = PLAN_LIMITS.freemium.collaborators

      if (totalMembers > limit) {
        return NextResponse.json(
          {
            error: "Limite de collaborateurs atteinte",
            message: `Vous avez atteint la limite de ${limit} collaborateurs (vous inclus) pour le plan Freemium. Passez au plan Standard pour des collaborateurs illimités.`,
            code: "FREEMIUM_LIMIT_REACHED",
            limit,
            current: membersCount + 1, // +1 pour l'owner
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        )
      }
    }

    // Ajouter le membre au projet
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberToInvite.id,
        role: role || "VIEWER",
        canEdit: canEdit || false,
        canInvite: canInvite || false,
        canDelete: canDelete || false,
        invitedBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    // Créer une notification pour le membre invité
    await prisma.notification.create({
      data: {
        userId: memberToInvite.id,
        type: "TEAM_MEMBER_ADDED",
        title: "Nouveau projet",
        message: `Vous avez été ajouté au projet "${project.name}"`,
        link: `/dashboard/projects/${projectId}`,
      },
    })

    // Créer un log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE",
        resource: "project_member",
        resourceId: member.id,
        projectId,
        metadata: JSON.stringify({
          invitedUserEmail: memberToInvite.email,
          role: member.role,
        }),
      },
    })

    console.log(`✅ Member added to project: ${memberToInvite.email} → ${project.name}`)

    return NextResponse.json(
      {
        member,
        message: "Membre ajouté avec succès",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding project member:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to add project member" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]/members?userId=xxx
 * Retire un membre du projet
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id
    const { id: projectId } = await params

    const { searchParams } = new URL(request.url)
    const memberUserId = searchParams.get("userId")

    if (!memberUserId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a la permission
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId }, // Owner peut toujours supprimer
          {
            members: {
              some: {
                userId,
                canDelete: true, // Ou a permission canDelete
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé ou vous n'avez pas la permission de retirer des membres" },
        { status: 404 }
      )
    }

    // Supprimer le membre
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId,
        },
      },
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "DELETE",
        resource: "project_member",
        resourceId: memberUserId,
        projectId,
        metadata: JSON.stringify({
          removedUserId: memberUserId,
        }),
      },
    })

    console.log(`✅ Member removed from project: ${memberUserId} from ${projectId}`)

    return NextResponse.json({
      message: "Membre retiré avec succès",
    })
  } catch (error) {
    console.error("Error removing project member:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to remove project member" },
      { status: 500 }
    )
  }
}
