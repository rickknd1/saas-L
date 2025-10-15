import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

/**
 * API d'annulation d'abonnement
 * Annule l'abonnement Stripe de l'utilisateur immédiatement
 */


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur et son abonnement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    if (!user.subscription) {
      return NextResponse.json(
        { error: "Aucun abonnement actif à annuler" },
        { status: 400 }
      )
    }

    // Vérifier si l'abonnement est déjà annulé
    if (user.subscription.status === "CANCELED") {
      return NextResponse.json(
        { error: "Cet abonnement est déjà annulé" },
        { status: 400 }
      )
    }

    // Annuler l'abonnement dans Stripe à la fin de période (pas immédiatement)
    try {
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      console.log("✓ Abonnement marqué pour annulation à la fin de période dans Stripe")
    } catch (stripeError: unknown) {
      // Si l'abonnement n'existe plus dans Stripe (déjà annulé), continuer quand même
      const hasCode = stripeError && typeof stripeError === 'object' && 'code' in stripeError
      if (!hasCode || stripeError.code !== 'resource_missing') {
        throw stripeError
      }
    }

    // APPROCHE STANDARD: L'utilisateur GARDE le plan STANDARD jusqu'à la fin de période
    // Le plan sera changé vers FREEMIUM automatiquement par le webhook à l'expiration
    console.log(`✓ L'utilisateur garde le plan STANDARD jusqu'au ${new Date(user.subscription.currentPeriodEnd).toISOString()}`)

    // Mettre à jour dans la base de données
    console.log(`🔄 Mise à jour de la subscription ${user.subscription.id}`)
    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: "ACTIVE", // Reste ACTIVE jusqu'à la fin de période
        canceledAt: new Date(),
        cancelAtPeriodEnd: true, // Marqué pour annulation
      },
    })
    console.log(`✓ Subscription mise à jour: status=${updatedSubscription.status}, cancelAtPeriodEnd=${updatedSubscription.cancelAtPeriodEnd}`)

    const periodEnd = new Date(updatedSubscription.currentPeriodEnd)

    return NextResponse.json({
      success: true,
      message: `Abonnement annulé. Vous conservez l'accès Standard jusqu'au ${periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    })
  } catch (error) {
    console.error("Erreur annulation abonnement:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation de l'abonnement" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
