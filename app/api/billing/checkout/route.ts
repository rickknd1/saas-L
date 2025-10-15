import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * API de création de session Stripe Checkout
 * Crée une session de paiement pour l'abonnement Standard
 *
 * Cahier des charges: Section 5.5.2 - Paiement
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(request: Request) {
  try {
    // SÉCURITÉ: Récupérer userId depuis le middleware (pas du body)
    const userId = request.headers.get("x-user-id")
    const userEmail = request.headers.get("x-user-email")

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan = "standard" } = body

    // Validation
    if (plan !== "standard") {
      return NextResponse.json(
        { error: "Seul le plan 'standard' est disponible" },
        { status: 400 }
      )
    }

    // PROTECTION: Vérifier si l'utilisateur a déjà un abonnement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (user?.subscription) {
      const now = new Date()
      const periodEnd = new Date(user.subscription.currentPeriodEnd)
      const isPeriodValid = periodEnd > now

      // Si abonnement actif (non annulé)
      if (user.plan === "STANDARD" && !user.subscription.cancelAtPeriodEnd) {
        return NextResponse.json(
          { error: "Vous avez déjà un abonnement Standard actif" },
          { status: 400 }
        )
      }

      // Si abonnement annulé mais période encore valide → utiliser réactivation
      if (user.subscription.cancelAtPeriodEnd && isPeriodValid) {
        return NextResponse.json(
          {
            error: "Vous avez un abonnement en cours. Utilisez la réactivation depuis vos paramètres.",
            shouldReactivate: true,
          },
          { status: 400 }
        )
      }
    }

    // Prix selon le cahier des charges: 23€/mois
    const PRICE_ID = process.env.STRIPE_PRICE_ID_STANDARD

    if (!PRICE_ID) {
      throw new Error("STRIPE_PRICE_ID_STANDARD non configuré dans .env")
    }

    // Créer ou récupérer le customer Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    let customerId: string
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      })
      customerId = customer.id
    }

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        // trial_period_days: 14, // Désactivé pour paiement immédiat
        metadata: {
          userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error("Erreur création session Stripe:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    )
  }
}
