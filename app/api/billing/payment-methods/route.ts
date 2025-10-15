import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})


/**
 * API pour récupérer les méthodes de paiement de l'utilisateur depuis Stripe
 * Retourne la liste des cartes et autres moyens de paiement
 *
 * Cahier des charges: Module C - Paiement & Abonnement
 */

export async function GET(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer l'abonnement de l'utilisateur depuis la DB
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
      },
    })

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        paymentMethods: [],
      })
    }

    // Récupérer le customer depuis Stripe pour connaître le default payment method
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId) as Stripe.Customer
    let defaultPaymentMethodId = typeof customer.invoice_settings.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings.default_payment_method?.id

    // Récupérer les méthodes de paiement depuis Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: "card",
    })

    // RÈGLE: Il doit toujours y avoir une carte par défaut
    // Si aucune carte n'est définie comme défaut et qu'il y a des cartes, définir la plus récente
    if (!defaultPaymentMethodId && paymentMethods.data.length > 0) {
      console.log('⚠️  Aucune carte par défaut trouvée, définition de la carte la plus récente...')

      // Trier les cartes par date de création (la plus récente en premier)
      const sortedMethods = paymentMethods.data.sort((a, b) => b.created - a.created)
      const newestMethod = sortedMethods[0]

      // Définir la carte la plus récente comme défaut
      await stripe.customers.update(subscription.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: newestMethod.id,
        },
      })

      defaultPaymentMethodId = newestMethod.id
      console.log(`✅ Carte ${newestMethod.id} définie comme carte par défaut`)
    }

    // Formater les données pour le frontend
    // Trier par date de création (la plus récente en premier)
    const sortedMethods = paymentMethods.data.sort((a, b) => b.created - a.created)

    const formattedMethods = sortedMethods.map((method) => ({
      id: method.id,
      brand: method.card?.brand || "unknown",
      last4: method.card?.last4 || "****",
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year,
      isDefault: method.id === defaultPaymentMethodId,
      created: method.created, // Timestamp de création
    }))

    return NextResponse.json({
      success: true,
      paymentMethods: formattedMethods,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des méthodes de paiement:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des méthodes de paiement" },
      { status: 500 }
    )
  }
}
