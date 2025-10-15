import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

/**
 * API de récupération des informations d'abonnement
 * Retourne les détails de l'abonnement de l'utilisateur
 *
 * Cahier des charges: Section 4.2.7 - Notifications et Facturation
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function GET(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

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

    // Si pas d'abonnement, retourner null (pas d'historique)
    if (!user.subscription) {
      return NextResponse.json({
        hasSubscription: false,
        plan: "FREEMIUM",
      })
    }

    // Récupérer les détails depuis Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    )

    return NextResponse.json({
      plan: user.plan,
      status: user.subscription.status.toLowerCase(),
      currentPeriodStart: user.subscription.currentPeriodStart,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      nextBillingDate: user.subscription.currentPeriodEnd,
      amount: 23,
      currency: "eur",
      features: {
        projects: "illimité",
        collaborators: "illimité",
        storage: "100 GB",
      },
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
    })
  } catch (error) {
    console.error("Erreur récupération abonnement:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'abonnement" },
      { status: 500 }
    )
  }
}
