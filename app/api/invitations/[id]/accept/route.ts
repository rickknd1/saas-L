import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour accepter une invitation à un projet
 * POST /api/invitations/[id]/accept
 */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
    const memberId = resolvedParams.id

    // Vérifier que l'invitation existe et appartient à l'utilisateur
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        userId,
        acceptedAt: null, // Seulement les invitations en attente
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
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
        { error: "Invitation non trouvée ou déjà traitée" },
        { status: 404 }
      )
    }

    // Accepter l'invitation
    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: {
        acceptedAt: new Date(),
      },
    })

    // Créer une notification pour informer le propriétaire que son invitation a été acceptée
    await prisma.notification.create({
      data: {
        userId: member.project.ownerId,
        type: "TEAM_MEMBER_ADDED",
        title: "Invitation acceptée ✓",
        message: `${member.user.name || member.user.email} a rejoint le projet "${member.project.name}"`,
        link: `/dashboard/projects/${member.project.id}?tab=team`,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "ACCEPT",
        resource: "PROJECT_MEMBER",
        resourceId: memberId,
        projectId: member.project.id,
        metadata: {
          projectName: member.project.name,
        },
      },
    })

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: `Vous avez rejoint le projet "${member.project.name}"`,
    })
  } catch (error) {
    console.error("Erreur lors de l'acceptation de l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de l'invitation" },
      { status: 500 }
    )
  }
}
