import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})


/**
 * API pour récupérer l'historique de facturation de l'utilisateur depuis Stripe
 * Retourne la liste des factures payées et leur statut
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
        invoices: [],
      })
    }

    // Récupérer les factures depuis Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 10,
    })

    // Formater les données pour le frontend
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number || `INV-${invoice.id.slice(-8)}`,
      amount: (invoice.amount_paid / 100).toFixed(2), // Convertir de centimes en euros
      currency: invoice.currency.toUpperCase(),
      status: invoice.status === "paid" ? "Payée" : "En attente",
      date: new Date(invoice.created * 1000).toLocaleDateString("fr-FR"),
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    }))

    return NextResponse.json({
      success: true,
      invoices: formattedInvoices,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique de facturation" },
      { status: 500 }
    )
  }
}
