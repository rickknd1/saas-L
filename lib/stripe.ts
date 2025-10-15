import Stripe from "stripe"

/**
 * Initialisation de Stripe
 * Module C (@kayzeur dylann)
 *
 * Client Stripe pour les opérations serveur (création de sessions, webhooks, etc.)
 */

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})

/**
 * Configuration des prix
 */
export const STRIPE_CONFIG = {
  prices: {
    standard: process.env.STRIPE_PRICE_ID_STANDARD || "",
  },
  products: {
    standard: process.env.STRIPE_PRODUCT_ID || "",
  },
}

/**
 * Vérifier que les IDs de prix sont configurés
 */
export function validateStripeConfig() {
  if (!STRIPE_CONFIG.prices.standard) {
    throw new Error("STRIPE_PRICE_ID_STANDARD is not configured")
  }
  return true
}
