import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour supprimer un membre d'un projet
 * DELETE /api/projects/[id]/members/[memberId]
 *
 * Seul le propriétaire du projet peut supprimer des membres
 */

export async function DELETE(
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

    // Seul le propriétaire peut supprimer des membres
    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Seul le propriétaire du projet peut supprimer des membres" },
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

    // Empêcher le propriétaire de se retirer lui-même du projet
    if (member.userId === project.ownerId) {
      return NextResponse.json(
        { error: "Le propriétaire du projet ne peut pas être retiré" },
        { status: 400 }
      )
    }

    // Supprimer le membre
    await prisma.projectMember.delete({
      where: { id: memberId },
    })

    // Créer une notification pour l'utilisateur retiré
    await prisma.notification.create({
      data: {
        userId: member.userId,
        type: "TEAM_MEMBER_REMOVED",
        title: "Retiré d'un projet",
        message: `Vous avez été retiré du projet "${project.name}"`,
        link: `/dashboard/projects`,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "REMOVE_MEMBER",
        resource: "PROJECT_MEMBER",
        resourceId: memberId,
        projectId,
        metadata: {
          removedUserEmail: member.user.email,
          removedUserName: member.user.name,
          projectName: project.name,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `${member.user.name || member.user.email} a été retiré du projet`,
    })
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    )
  }
}
