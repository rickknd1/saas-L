import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

/**
 * Webhook Stripe
 * POST /api/webhooks/stripe
 *
 * Module C (@kayzeur dylann)
 * Écoute les événements Stripe et met à jour la base de données
 *
 * Événements gérés:
 * - checkout.session.completed: Activation abonnement
 * - customer.subscription.updated: Modification abonnement
 * - customer.subscription.deleted: Annulation abonnement
 * - invoice.paid: Paiement réussi
 * - invoice.payment_failed: Échec paiement
 */

// Désactiver le body parser de Next.js pour lire le raw body
export const runtime = 'nodejs'

/**
 * Récupère l'userId depuis les metadata ou via le customerId
 */
async function getUserIdFromMetadata(
  metadata?: Stripe.Metadata | null,
  customerId?: string | Stripe.Customer | null
): Promise<string | null> {
  // Essayer depuis metadata
  if (metadata?.userId) {
    return metadata.userId
  }

  // Essayer via customerId
  if (customerId && typeof customerId === "string") {
    const user = await prisma.user.findFirst({
      where: { customerId },
      select: { id: true },
    })
    return user?.id || null
  }

  return null
}

/**
 * Crée une notification pour l'utilisateur
 */
async function createNotification(
  userId: string,
  type: "SYSTEM",
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    })
  } catch (error) {
    console.error("Failed to create notification:", error)
  }
}

/**
 * Crée un log d'audit
 */
async function createAuditLog(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  metadata?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    console.error("❌ Webhook: No signature found")
    return NextResponse.json(
      { error: "No signature found" },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  console.log(`📥 Webhook received: ${event.type}`)

  // Répondre immédiatement à Stripe
  return NextResponse.json({ received: true })
}

/**
 * Traite l'événement webhook de manière asynchrone
 */
async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Récupérer l'ID utilisateur depuis les metadata ou customerId
        const userId = await getUserIdFromMetadata(
          session.metadata,
          session.customer
        )

        if (!userId) {
          console.error("❌ checkout.session.completed: No userId found")
          return
        }

        // Mettre à jour le plan de l'utilisateur
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "STANDARD",
            customerId: session.customer as string,
          },
        })

        // Créer l'abonnement dans la base de données
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await prisma.subscription.create({
            data: {
              userId: userId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCustomerId: subscription.customer as string,
              status: subscription.status.toUpperCase() as any,
              plan: "STANDARD",
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })

          // Créer une notification
          await createNotification(
            userId,
            "SYSTEM",
            "Bienvenue dans le plan Standard ! 🎉",
            "Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium.",
            "/dashboard"
          )

          // Log d'audit
          await createAuditLog(
            userId,
            "SUBSCRIPTION_CREATED",
            "subscription",
            subscription.id,
            {
              plan: "STANDARD",
              amount: session.amount_total,
              currency: session.currency,
            }
          )
        }

        console.log(`✅ User ${userId} upgraded to STANDARD plan`)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        const userId = await getUserIdFromMetadata(
          subscription.metadata,
          subscription.customer
        )

        if (!userId) {
          console.error("❌ customer.subscription.updated: No userId found")
          return
        }

        // Mettre à jour l'abonnement
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status.toUpperCase() as any,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
          },
        })

        // Notification si annulation programmée
        if (subscription.cancel_at_period_end && !subscription.canceled_at) {
          const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR')
          await createNotification(
            userId,
            "SYSTEM",
            "Abonnement annulé",
            `Votre abonnement sera résilié le ${endDate}. Vous conservez l'accès jusqu'à cette date.`,
            "/dashboard/settings"
          )
        }

        // Log d'audit
        await createAuditLog(
          userId,
          "SUBSCRIPTION_UPDATED",
          "subscription",
          subscription.id,
          {
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        )

        console.log(`✅ Subscription ${subscription.id} updated`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const userId = await getUserIdFromMetadata(
          subscription.metadata,
          subscription.customer
        )

        if (!userId) {
          console.error("❌ customer.subscription.deleted: No userId found")
          return
        }

        // Rétrograder l'utilisateur vers FREEMIUM
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "FREEMIUM" },
        })

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "CANCELED",
            canceledAt: new Date(),
          },
        })

        // Notification de rétrogradation
        await createNotification(
          userId,
          "SYSTEM",
          "Retour au plan Freemium",
          "Votre abonnement Standard a été annulé. Vous êtes maintenant sur le plan Freemium avec des fonctionnalités limitées.",
          "/pricing"
        )

        // Log d'audit
        await createAuditLog(
          userId,
          "SUBSCRIPTION_DELETED",
          "subscription",
          subscription.id,
          {
            plan: "FREEMIUM",
            canceledAt: new Date().toISOString(),
          }
        )

        console.log(`✅ User ${userId} downgraded to FREEMIUM`)
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice

        if (!invoice.customer || !invoice.subscription) {
          console.error("❌ invoice.paid: Missing customer or subscription")
          return
        }

        // Récupérer l'abonnement
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
          include: { user: true },
        })

        if (!subscription) {
          console.error(`❌ invoice.paid: Subscription ${invoice.subscription} not found`)
          return
        }

        const userId = subscription.userId

        // Enregistrer le paiement
        if (invoice.payment_intent) {
          await prisma.payment.create({
            data: {
              userId,
              stripePaymentId: invoice.payment_intent as string,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "SUCCEEDED",
              description: invoice.description || "Abonnement Standard",
            },
          })
        }

        // Enregistrer la facture
        const createdInvoice = await prisma.invoice.create({
          data: {
            userId,
            stripeInvoiceId: invoice.id,
            number: invoice.number || `INV-${Date.now()}`,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "PAID",
            pdfUrl: invoice.invoice_pdf || null,
            paidAt: new Date(),
          },
        })

        // Notification de paiement réussi
        const amountFormatted = (invoice.amount_paid / 100).toFixed(2)
        await createNotification(
          userId,
          "SYSTEM",
          "Paiement confirmé ✅",
          `Votre paiement de ${amountFormatted} ${invoice.currency.toUpperCase()} a été reçu avec succès.`,
          `/dashboard/settings`
        )

        // Log d'audit
        await createAuditLog(
          userId,
          "PAYMENT_SUCCEEDED",
          "payment",
          invoice.id,
          {
            amount: invoice.amount_paid,
            currency: invoice.currency,
            invoiceNumber: invoice.number,
          }
        )

        console.log(`✅ Invoice ${invoice.id} paid - User ${userId}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (!invoice.customer || !invoice.subscription) {
          console.error("❌ invoice.payment_failed: Missing customer or subscription")
          return
        }

        // Récupérer l'abonnement
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
        })

        if (!subscription) {
          console.error(`❌ invoice.payment_failed: Subscription ${invoice.subscription} not found`)
          return
        }

        const userId = subscription.userId

        // Enregistrer l'échec du paiement
        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: invoice.payment_intent as string || `failed-${invoice.id}`,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: "FAILED",
            description: "Échec du paiement de l'abonnement",
          },
        })

        // Notification d'échec
        const amountFormatted = (invoice.amount_due / 100).toFixed(2)
        await createNotification(
          userId,
          "SYSTEM",
          "Échec du paiement ⚠️",
          `Le paiement de ${amountFormatted} ${invoice.currency.toUpperCase()} a échoué. Veuillez mettre à jour vos informations de paiement pour conserver votre abonnement.`,
          "/dashboard/settings"
        )

        // Log d'audit
        await createAuditLog(
          userId,
          "PAYMENT_FAILED",
          "payment",
          invoice.id,
          {
            amount: invoice.amount_due,
            currency: invoice.currency,
            attemptCount: invoice.attempt_count,
          }
        )

        console.log(`❌ Invoice ${invoice.id} payment failed - User ${userId}`)
        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`❌ Error processing webhook event ${event.type}:`, error)
    throw error
  }
}
