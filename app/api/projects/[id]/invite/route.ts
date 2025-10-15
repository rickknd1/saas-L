import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API pour inviter un membre à un projet
 * POST /api/projects/[id]/invite
 *
 * Body: { email: string, role?: "OWNER" | "EDITOR" | "VIEWER" }
 */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id
    const body = await request.json()
    const { email, role = "EDITOR" } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email est requis" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et que l'utilisateur a les droits
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                canInvite: true,
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé ou droits insuffisants" },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur existe
    const invitedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!invitedUser) {
      return NextResponse.json(
        { error: "Utilisateur avec cet email n'existe pas. Il doit d'abord créer un compte." },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur n'essaie pas de s'inviter lui-même
    if (invitedUser.id === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous inviter vous-même au projet" },
        { status: 400 }
      )
    }

    // Vérifier si déjà membre (invitation acceptée)
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: invitedUser.id,
      },
    })

    if (existingMember) {
      // Si l'invitation a déjà été acceptée, erreur
      if (existingMember.acceptedAt) {
        return NextResponse.json(
          { error: "Cet utilisateur est déjà membre du projet" },
          { status: 400 }
        )
      }

      // Si l'invitation est en attente, la supprimer pour en créer une nouvelle
      await prisma.projectMember.delete({
        where: { id: existingMember.id },
      })
    }

    // Définir les permissions selon le rôle
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

    // Créer le membre (en attente d'acceptation)
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role,
        invitedBy: userId,
        canEdit,
        canInvite,
        canDelete,
        acceptedAt: null, // En attente d'acceptation
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

    // PAS de notification ici - l'invitation dans ProjectMember suffit
    // L'utilisateur la verra dans sa liste d'invitations (/api/invitations)

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "INVITE",
        resource: "PROJECT_MEMBER",
        resourceId: member.id,
        projectId,
        metadata: {
          invitedEmail: email,
          role,
        },
      },
    })

    return NextResponse.json({
      success: true,
      member,
      message: `Invitation envoyée à ${invitedUser.name || invitedUser.email} pour rejoindre le projet`,
    })
  } catch (error) {
    console.error("Erreur lors de l'invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'invitation" },
      { status: 500 }
    )
  }
}
