import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * API pour supprimer une méthode de paiement
 * Note: Impossible de supprimer la carte par défaut (protégée)
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

    // Vérifier que ce n'est pas la carte par défaut
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId) as Stripe.Customer
    const defaultPaymentMethodId = typeof customer.invoice_settings.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings.default_payment_method?.id

    if (paymentMethodId === defaultPaymentMethodId) {
      return NextResponse.json(
        { error: "Impossible de supprimer la carte par défaut. Définissez d'abord une autre carte comme défaut." },
        { status: 400 }
      )
    }

    // Détacher la carte du customer Stripe
    await stripe.paymentMethods.detach(paymentMethodId)

    console.log(`✓ Carte ${paymentMethodId} supprimée du customer ${subscription.stripeCustomerId}`)

    return NextResponse.json({
      success: true,
      message: "Carte supprimée avec succès",
    })
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression de la carte:", error)

    const hasCode = error && typeof error === 'object' && 'code' in error
    const hasType = error && typeof error === 'object' && 'type' in error

    if (hasCode && error.code === 'resource_missing') {
      return NextResponse.json(
        { error: "Cette carte n'existe plus" },
        { status: 404 }
      )
    }

    if (hasType && error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: "Cette carte ne peut pas être supprimée" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression de la carte" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
