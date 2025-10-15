import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * API de gestion du compte utilisateur
 * GET: Récupérer le profil
 * PATCH: Modifier le profil
 * DELETE: Supprimer le compte (RGPD - Droit à l'oubli)
 *
 * Cahier des charges:
 * - Section 4.2.2 - Utilisateurs
 * - Section 3.3 - Conformité RGPD (Droit à l'oubli - Article 17)
 */


// GET /api/users/me - Récupérer le profil
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
        // Ne pas exposer le mot de passe ni les secrets
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Erreur récupération profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    )
  }
}

// PATCH /api/users/me - Modifier le profil
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
    const allowedFields = [
      "name",
      "firstName",
      "lastName",
      "phone",
      "role",
      "bio",
      "organization",
      "organizationSiret",
    ]

    // Filtrer les champs autorisés
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedUser = await prisma.user.update({
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
        organization: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Erreur modification profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification du profil" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/me - Supprimer le compte (RGPD)
export async function DELETE(request: Request) {
  try {
    // Utiliser le userId du JWT vérifié par le middleware (SÉCURITÉ)
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Si abonnement actif, l'annuler d'abord sur Stripe
    if (user.subscription && user.subscription.stripeSubscriptionId) {
      try {
        const Stripe = require("stripe")
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId)
        console.log(`Abonnement Stripe ${user.subscription.stripeSubscriptionId} annulé`)
      } catch (stripeError) {
        console.error("Erreur annulation Stripe:", stripeError)
        // Continuer malgré l'erreur Stripe
      }
    }

    // Créer un log d'audit avant suppression
    await prisma.auditLog.create({
      data: {
        userId,
        action: "DELETE_ACCOUNT",
        resource: "user",
        resourceId: userId,
        metadata: JSON.stringify({
          email: user.email,
          deletedAt: new Date().toISOString(),
          reason: "User requested account deletion (RGPD)",
        }),
      },
    })

    // Suppression CASCADE configurée dans Prisma Schema
    // Toutes les données liées seront supprimées automatiquement
    await prisma.user.delete({
      where: { id: userId },
    })

    console.log(`✅ Compte utilisateur ${userId} supprimé (RGPD)`)

    return NextResponse.json({
      success: true,
      message: "Votre compte a été supprimé conformément au RGPD",
      deletedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur suppression compte:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    )
  }
}
