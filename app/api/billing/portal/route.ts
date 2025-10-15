import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * API pour créer une session du portail Stripe
 * Permet à l'utilisateur de gérer son abonnement (annuler, changer de carte, etc.)
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur et sa subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer le customerId depuis user OU subscription
    let customerId = user.customerId
    if (!customerId && user.subscription) {
      customerId = user.subscription.stripeCustomerId
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Aucun compte Stripe trouvé. Veuillez d'abord créer un abonnement." },
        { status: 404 }
      )
    }

    // Créer une session du portail Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
    })

    console.log("✓ Session portail créée:", session.id)

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error: unknown) {
    console.error("Erreur création session portail:", error)

    const hasMessage = error && typeof error === 'object' && 'message' in error
    const hasCode = error && typeof error === 'object' && 'code' in error

    if (hasMessage) {
      console.error("Détails erreur Stripe:", error.message, hasCode ? error.code : 'N/A')
    }

    // Erreur si le portail n'est pas configuré
    if (hasCode && error.code === 'billing_portal_configuration_invalid') {
      return NextResponse.json(
        { error: "Le portail de facturation Stripe n'est pas configuré. Veuillez l'activer dans Stripe Dashboard → Settings → Billing → Customer portal" },
        { status: 500 }
      )
    }

    const errorMessage = hasMessage && typeof error.message === 'string' ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Erreur lors de la création de la session du portail: ${errorMessage}` },
      { status: 500 }
    )
  }
}
