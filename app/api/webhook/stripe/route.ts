import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * Webhook Stripe
 * Reçoit les événements de Stripe (paiement, abonnement)
 * Active automatiquement le plan Standard après paiement
 *
 * Cahier des charges: Section 5.5.2 - Paiement (Webhook)
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  console.log('\n🔔 WEBHOOK STRIPE REÇU')
  console.log('='.repeat(60))

  if (!signature) {
    console.error('❌ Signature manquante')
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log(`✅ Événement validé: ${event.type}`)
  } catch (err) {
    console.error("❌ Erreur signature webhook:", err)
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  try {
    console.log(`📋 Type: ${event.type} | ID: ${event.id}`)

    switch (event.type) {
      // Abonnement créé (après paiement réussi ou début d'essai)
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        }
        const userId = subscription.metadata.userId

        console.log(`📝 Traitement ${event.type} pour userId: ${userId}`)

        if (!userId) {
          console.error("❌ userId manquant dans metadata")
          break
        }

        try {
          // Vérifier que l'utilisateur existe
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true }
          })

          if (!user) {
            console.error(`❌ Utilisateur ${userId} introuvable`)
            break
          }

          console.log(`   Utilisateur trouvé: ${user.email}`)
          console.log(`   Abonnement existant: ${user.subscription ? 'Oui' : 'Non'}`)

          // Mettre à jour l'utilisateur
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "STANDARD",
              customerId: subscription.customer as string,
              subscriptionId: subscription.id,
            },
          })
          console.log(`   ✓ User mis à jour`)

          // Créer ou mettre à jour l'abonnement (upsert pour éviter les race conditions)
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCustomerId: subscription.customer as string,
              status: subscription.status.toUpperCase() as any,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCustomerId: subscription.customer as string,
              status: subscription.status.toUpperCase() as any,
              plan: "STANDARD",
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          })
          console.log(`   ✓ Abonnement créé/mis à jour`)

          console.log(`✅ Abonnement activé pour userId: ${userId}`)
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de l'abonnement:`)
          console.error(error)
          throw error
        }
        break
      }

      // Abonnement annulé
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "FREEMIUM",
          },
        })

        await prisma.subscription.update({
          where: { userId },
          data: {
            status: "CANCELED",
            canceledAt: new Date(),
          },
        })

        console.log(`❌ Abonnement annulé pour userId: ${userId}`)
        break
      }

      // Paiement réussi
      case "invoice.payment_succeeded": {
        console.log('💰 Traitement: invoice.payment_succeeded')
        const invoice = event.data.object as Stripe.Invoice & {
          subscription: string | Stripe.Subscription;
          payment_intent: string | Stripe.PaymentIntent;
        }
        const subscriptionId = invoice.subscription as string

        console.log(`   Invoice ID: ${invoice.id}`)
        console.log(`   Montant: ${invoice.amount_paid / 100} ${invoice.currency}`)
        console.log(`   Subscription ID: ${subscriptionId}`)

        if (!subscriptionId) {
          console.warn('⚠️  Pas de subscriptionId sur cette invoice')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.userId

        console.log(`   User ID (metadata): ${userId}`)

        if (!userId) {
          console.error('❌ userId manquant dans metadata de la subscription')
          break
        }

        // Enregistrer le paiement
        console.log('   📝 Création du payment...')
        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "SUCCEEDED",
            description: invoice.lines.data[0]?.description || "Abonnement Standard",
          },
        })

        // Enregistrer la facture
        await prisma.invoice.create({
          data: {
            userId,
            stripeInvoiceId: invoice.id,
            number: invoice.number || `INV-${invoice.id.slice(-8)}`,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "PAID",
            pdfUrl: invoice.invoice_pdf || null,
            paidAt: invoice.status_transitions.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : new Date(),
          },
        })

        console.log(`💰 Paiement et facture enregistrés pour userId: ${userId}`)
        break
      }

      // Paiement échoué
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription: string | Stripe.Subscription;
          payment_intent: string | Stripe.PaymentIntent;
        }
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.userId

        if (!userId) break

        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: invoice.payment_intent as string,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "FAILED",
            description: "Échec du paiement",
          },
        })

        console.error(`⚠️ Paiement échoué pour userId: ${userId}`)
        break
      }

      // Nouvelle méthode de paiement attachée (carte ajoutée)
      case "payment_method.attached": {
        console.log('💳 Traitement: payment_method.attached')
        const paymentMethod = event.data.object as Stripe.PaymentMethod
        const customerId = paymentMethod.customer as string

        console.log(`   Payment Method ID: ${paymentMethod.id}`)
        console.log(`   Customer ID: ${customerId}`)

        if (!customerId) {
          console.warn('⚠️  Pas de customerId sur ce payment method')
          break
        }

        try {
          // Récupérer le customer pour vérifier s'il a déjà une carte par défaut
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
          const currentDefaultPM = customer.invoice_settings.default_payment_method

          console.log(`   Carte par défaut actuelle: ${currentDefaultPM || 'Aucune'}`)

          // Si pas de carte par défaut OU si on veut que la nouvelle carte soit toujours par défaut (logique de l'user)
          // Alors on définit cette nouvelle carte comme carte par défaut
          if (!currentDefaultPM) {
            console.log('   → Pas de carte par défaut, définition de la nouvelle carte comme défaut...')
            await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: paymentMethod.id,
              },
            })
            console.log(`✅ Nouvelle carte ${paymentMethod.id} définie comme carte par défaut`)
          } else {
            // LOGIQUE: La carte la plus récente devient automatiquement la carte par défaut
            console.log('   → Définition de la nouvelle carte comme carte par défaut (carte la plus récente)...')
            await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: paymentMethod.id,
              },
            })
            console.log(`✅ Nouvelle carte ${paymentMethod.id} définie comme carte par défaut (remplace l'ancienne)`)
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la définition de la carte par défaut:`)
          console.error(error)
        }
        break
      }

      default:
        console.log(`Type d'événement non géré: ${event.type}`)
    }

    console.log('='.repeat(60))
    console.log('✅ Webhook traité avec succès\n')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("\n❌ ERREUR TRAITEMENT WEBHOOK:")
    console.error(error)
    console.error('='.repeat(60) + '\n')
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 500 }
    )
  }
}
