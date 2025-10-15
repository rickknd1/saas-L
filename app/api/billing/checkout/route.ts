import { NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG, validateStripeConfig } from "@/lib/stripe"
import { requireAuth } from "@/lib/get-session"

/**
 * API de Checkout Stripe
 * POST /api/billing/checkout
 *
 * Module C (@kayzeur dylann)
 * Crée une session Stripe Checkout et retourne l'URL de paiement
 */

export async function POST(request: NextRequest) {
  try {
    // Valider la configuration Stripe
    validateStripeConfig()

    // Vérifier l'authentification
    const { session: authSession, error } = await requireAuth()
    if (error) return error

    const userId = authSession.user.id
    const userEmail = authSession.user.email

    // Créer une session Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_CONFIG.prices.standard,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error("Checkout error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
