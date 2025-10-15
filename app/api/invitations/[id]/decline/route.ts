import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour refuser une invitation à un projet
 * POST /api/invitations/[id]/decline
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

    // Supprimer l'invitation (le membre disparaît de la liste)
    await prisma.projectMember.delete({
      where: { id: memberId },
    })

    // Créer une notification pour informer le propriétaire que son invitation a été refusée
    await prisma.notification.create({
      data: {
        userId: member.project.ownerId,
        type: "SYSTEM",
        title: "Invitation refusée",
        message: `${member.user.name || member.user.email} a décliné l'invitation au projet "${member.project.name}"`,
        link: `/dashboard/projects/${member.project.id}?tab=team`,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "DECLINE",
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
      message: `Vous avez refusé l'invitation au projet "${member.project.name}"`,
    })
  } catch (error) {
    console.error("Erreur lors du refus de l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors du refus de l'invitation" },
      { status: 500 }
    )
  }
}
