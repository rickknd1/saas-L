import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * API pour définir une carte comme méthode de paiement par défaut
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})



export async function POST(request: Request) {
  try {
    const { userId, paymentMethodId } = await request.json()

    if (!userId || !paymentMethodId) {
      return NextResponse.json(
        { error: "userId et paymentMethodId sont requis" },
        { status: 400 }
      )
    }

    // Récupérer l'abonnement de l'utilisateur
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    })

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé" },
        { status: 404 }
      )
    }

    // Définir la carte comme défaut dans Stripe
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    console.log(`✓ Carte ${paymentMethodId} définie comme défaut pour le customer ${subscription.stripeCustomerId}`)

    return NextResponse.json({
      success: true,
      message: "Carte définie comme méthode de paiement par défaut",
    })
  } catch (error: unknown) {
    console.error("Erreur lors de la définition de la carte par défaut:", error)

    const hasType = error && typeof error === 'object' && 'type' in error
    if (hasType && error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: "Cette carte n'existe plus ou n'est pas valide" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification de la carte par défaut" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
