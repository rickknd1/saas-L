/**
 * Validation des variables d'environnement requises
 * Vérifie au démarrage que toutes les variables critiques sont définies
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const

const optionalEnvVars = [
  'STRIPE_PRICE_ID_MONTHLY',
  'STRIPE_PRICE_ID_ANNUAL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET',
] as const

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  // Vérifier les variables requises
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  // Vérifier les variables optionnelles (warning seulement)
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName)
    }
  }

  // Si des variables requises manquent, lever une erreur
  if (missing.length > 0) {
    const errorMessage = `
╔═══════════════════════════════════════════════════════════╗
║  ❌ ERREUR: Variables d'environnement manquantes          ║
╠═══════════════════════════════════════════════════════════╣
║  Les variables suivantes sont REQUISES mais manquantes:   ║
║                                                            ║
${missing.map(v => `║  • ${v.padEnd(54)} ║`).join('\n')}
║                                                            ║
║  Veuillez créer un fichier .env.local avec ces variables ║
║  Consultez .env.example pour un exemple de configuration ║
╚═══════════════════════════════════════════════════════════╝
    `
    throw new Error(errorMessage)
  }

  // Afficher les warnings pour les variables optionnelles
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn("\n⚠️  Variables d'environnement optionnelles manquantes:")
    warnings.forEach(v => console.warn(`   • ${v}`))
    console.warn("   Ces fonctionnalités peuvent ne pas fonctionner correctement.\n")
  }

  // Validation de format
  validateEnvFormats()

  console.log("✅ Variables d'environnement validées avec succès")
}

function validateEnvFormats() {
  // Valider DATABASE_URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️  DATABASE_URL devrait commencer par "postgresql://"')
  }

  // Valider JWT_SECRET (au moins 32 caractères pour la sécurité)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn("⚠️  JWT_SECRET devrait avoir au moins 32 caractères pour une sécurité optimale")
  }

  // Valider NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL)
    } catch {
      throw new Error("NEXT_PUBLIC_APP_URL n'est pas une URL valide")
    }
  }

  // Valider les clés Stripe
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.warn('⚠️  STRIPE_SECRET_KEY devrait commencer par "sk_"')
  }

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    console.warn('⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY devrait commencer par "pk_"')
  }
}

// Export des variables validées avec types
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  STRIPE_PRICE_ID_MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY,
  STRIPE_PRICE_ID_ANNUAL: process.env.STRIPE_PRICE_ID_ANNUAL,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  NODE_ENV: process.env.NODE_ENV,
} as const
