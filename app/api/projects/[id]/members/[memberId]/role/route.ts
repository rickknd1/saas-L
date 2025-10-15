import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour changer le rôle d'un membre dans un projet
 * PATCH /api/projects/[id]/members/[memberId]/role
 *
 * Body: { role: "OWNER" | "EDITOR" | "VIEWER" }
 *
 * Seul le propriétaire du projet peut changer les rôles
 */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id
    const memberId = resolvedParams.memberId

    const body = await request.json()
    const { role } = body

    if (!role || !["OWNER", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide. Doit être OWNER, EDITOR ou VIEWER" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et que l'utilisateur est le propriétaire
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      )
    }

    // Seul le propriétaire peut changer les rôles
    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Seul le propriétaire du projet peut changer les rôles" },
        { status: 403 }
      )
    }

    // Vérifier que le membre existe dans ce projet
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé dans ce projet" },
        { status: 404 }
      )
    }

    // Définir les permissions selon le nouveau rôle
    let canEdit = false
    let canInvite = false
    let canDelete = false

    if (role === "OWNER") {
      canEdit = true
      canInvite = true
      canDelete = true
    } else if (role === "EDITOR") {
      canEdit = true
      canInvite = false
      canDelete = false
    } else if (role === "VIEWER") {
      canEdit = false
      canInvite = false
      canDelete = false
    }

    // Mettre à jour le rôle du membre
    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: {
        role,
        canEdit,
        canInvite,
        canDelete,
      },
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
    })

    // Créer une notification pour l'utilisateur dont le rôle a changé
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "TEAM_MEMBER_ADDED",
        title: "Rôle modifié",
        message: `Votre rôle dans le projet "${project.name}" a été changé en ${role}`,
        link: `/dashboard/projects/${projectId}`,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "CHANGE_ROLE",
        resource: "PROJECT_MEMBER",
        resourceId: memberId,
        projectId,
        metadata: {
          userEmail: member.user.email,
          userName: member.user.name,
          oldRole: member.role,
          newRole: role,
          projectName: project.name,
        },
      },
    })

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: `Le rôle de ${member.user.name || member.user.email} a été changé en ${role}`,
    })
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error)
    return NextResponse.json(
      { error: "Erreur lors du changement de rôle" },
      { status: 500 }
    )
  }
}
