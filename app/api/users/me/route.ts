import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { requireAuth } from "@/lib/get-session"

/**
 * API de gestion du compte utilisateur (RGPD)
 * DELETE /api/users/me
 *
 * Module C (@kayzeur dylann)
 * Permet à l'utilisateur de supprimer définitivement son compte et toutes ses données
 */

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

    // Récupérer l'utilisateur avec son abonnement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        ownedProjects: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Annuler l'abonnement Stripe s'il existe
    if (user.subscription?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(
          user.subscription.stripeSubscriptionId
        )
        console.log(`✅ Stripe subscription canceled: ${user.subscription.stripeSubscriptionId}`)
      } catch (stripeError) {
        console.error("Error canceling Stripe subscription:", stripeError)
        // Continue même si l'annulation Stripe échoue
      }
    }

    // Créer un log d'audit avant la suppression
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        resource: "user",
        resourceId: user.id,
        metadata: JSON.stringify({
          email: user.email,
          plan: user.plan,
          projectsCount: user.ownedProjects.length,
          deletedAt: new Date().toISOString(),
          reason: "User requested account deletion (RGPD)",
        }),
      },
    })

    // Supprimer toutes les données de l'utilisateur
    // Grâce à onDelete: Cascade dans le schéma Prisma,
    // toutes les données liées seront supprimées automatiquement :
    // - Sessions
    // - PasswordResetTokens
    // - VerificationTokens
    // - Projets (et leurs documents, messages, etc.)
    // - ProjectMembers
    // - Documents
    // - Comments
    // - Messages
    // - Notifications
    // - Subscription
    // - Payments
    // - Invoices
    // - AuditLogs

    await prisma.user.delete({
      where: { id: userId },
    })

    console.log(`✅ User account deleted: ${user.email} (${user.id})`)

    return NextResponse.json(
      {
        message: "Compte supprimé avec succès",
        deletedAt: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting user account:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/me
 * Met à jour les informations du compte utilisateur
 */
export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id
    const body = await request.json()

    // Champs autorisés à la modification
    const allowedFields = [
      "name",
      "firstName",
      "lastName",
      "phone",
      "bio",
      "avatar",
      "organization",
      "organizationSiret",
    ]

    // Filtrer les champs autorisés
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Empêcher la modification du plan manuellement (sécurité)
    if (body.plan) {
      return NextResponse.json(
        { error: "Le plan ne peut pas être modifié manuellement" },
        { status: 403 }
      )
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        updatedAt: true,
      },
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE",
        resource: "user",
        resourceId: userId,
        metadata: JSON.stringify({
          updatedFields: Object.keys(updateData),
        }),
      },
    })

    console.log(`✅ User profile updated: ${user.email} (${user.id})`)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/users/me
 * Récupère les informations du compte utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

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
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
        _count: {
          select: {
            ownedProjects: true,
            documents: true,
            comments: true,
            messages: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
