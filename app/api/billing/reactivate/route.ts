import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

/**
 * API de réactivation d'abonnement
 * Crée un nouvel abonnement après une annulation
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

    // Vérifier qu'il y a un abonnement
    if (!user.subscription) {
      return NextResponse.json(
        { error: "Aucun historique d'abonnement trouvé" },
        { status: 400 }
      )
    }

    // APPROCHE STANDARD: Vérifier cancelAtPeriodEnd, pas le plan
    // Si l'abonnement n'est pas marqué pour annulation, c'est qu'il est déjà actif
    if (!user.subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Votre abonnement est déjà actif et n'a pas été annulé" },
        { status: 400 }
      )
    }

    // VÉRIFIER SI LA PÉRIODE EST ENCORE VALIDE
    const now = new Date()
    const periodEnd = new Date(user.subscription.currentPeriodEnd)
    const isPeriodValid = periodEnd > now

    if (isPeriodValid) {
      // CAS 1: Période encore valide - Juste réactiver sans nouveau paiement
      console.log(`Réactivation dans période valide jusqu'au ${periodEnd.toISOString()}`)

      try {
        // Récupérer le statut actuel de l'abonnement dans Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId)

        console.log(`Status Stripe: ${stripeSubscription.status}, cancel_at_period_end: ${stripeSubscription.cancel_at_period_end}`)

        // Vérifier si l'abonnement est vraiment expiré (status canceled)
        if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'incomplete_expired') {
          // Abonnement vraiment terminé -> nouveau paiement requis
          console.log("Abonnement expiré dans Stripe, nouveau paiement requis")
          throw new Error("SUBSCRIPTION_EXPIRED")
        }

        // Si statut = active avec cancel_at_period_end = true → Réactiver simplement
        if (stripeSubscription.status === 'active' && stripeSubscription.cancel_at_period_end) {
          console.log("Abonnement actif avec annulation programmée, réactivation sans paiement")

          await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
          })

          console.log("✓ Abonnement réactivé dans Stripe sans nouveau paiement")
        } else {
          // Cas inattendu : abonnement déjà actif sans annulation programmée
          console.log("Abonnement déjà actif, aucune action requise dans Stripe")
        }

      } catch (stripeError: unknown) {
        const hasMessage = stripeError && typeof stripeError === 'object' && 'message' in stripeError
        const hasCode = stripeError && typeof stripeError === 'object' && 'code' in stripeError

        if ((hasMessage && stripeError.message === 'SUBSCRIPTION_EXPIRED') || (hasCode && stripeError.code === 'resource_missing')) {
          // Abonnement canceled ou inexistant -> nouveau paiement requis
          console.log("Création d'une nouvelle session de paiement")

          const PRICE_ID = process.env.STRIPE_PRICE_ID_STANDARD
          if (!PRICE_ID) {
            throw new Error("STRIPE_PRICE_ID_STANDARD non configuré dans .env")
          }

          const session = await stripe.checkout.sessions.create({
            customer: user.subscription.stripeCustomerId,
            payment_method_types: ["card"],
            line_items: [{ price: PRICE_ID, quantity: 1 }],
            mode: "subscription",
            subscription_data: { metadata: { userId } },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
            metadata: { userId },
          })

          return NextResponse.json({
            success: true,
            reactivated: false,
            message: "Redirection vers le paiement...",
            checkoutUrl: session.url,
          })
        } else {
          // Autre erreur Stripe
          throw stripeError
        }
      }

      // Mettre à jour la DB
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "STANDARD" },
      })

      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      })

      return NextResponse.json({
        success: true,
        reactivated: true,
        message: "Abonnement réactivé avec succès. Aucun paiement supplémentaire requis.",
      })
    } else {
      // CAS 2: Période expirée - Créer nouvelle session de paiement
      console.log(`Période expirée (${periodEnd.toISOString()}), nouveau paiement requis`)

      const PRICE_ID = process.env.STRIPE_PRICE_ID_STANDARD

      if (!PRICE_ID) {
        throw new Error("STRIPE_PRICE_ID_STANDARD non configuré dans .env")
      }

      // Créer une nouvelle session Checkout
      const session = await stripe.checkout.sessions.create({
        customer: user.subscription.stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: {
          metadata: {
            userId,
          },
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
        metadata: {
          userId,
        },
      })

      return NextResponse.json({
        success: true,
        reactivated: false,
        message: "Redirection vers le paiement...",
        checkoutUrl: session.url,
      })
    }
  } catch (error) {
    console.error("Erreur réactivation abonnement:", error)
    return NextResponse.json(
      { error: "Erreur lors de la réactivation de l'abonnement" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
