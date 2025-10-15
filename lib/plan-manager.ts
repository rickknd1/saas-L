/**
 * Plan Manager - Configuration des limites de plans
 * Module C (@kayzeur dylann)
 *
 * ✅ MIGRATION EFFECTUÉE: localStorage → Database
 *
 * Ce fichier contient maintenant uniquement les limites de plans.
 * Pour récupérer le plan utilisateur, utilisez le hook useUserPlan() ou useUser()
 *
 * @deprecated getUserPlan, setUserPlan, resetUserPlan - Utilisez hooks/use-user-plan.ts
 */

/**
 * Type de plan utilisateur (en minuscules pour compatibilité frontend)
 */
export type UserPlan = "freemium" | "standard"

/**
 * Type de plan en base de données (en majuscules comme dans Prisma)
 */
export type UserPlanDB = "FREEMIUM" | "STANDARD"

/**
 * Configuration des limites par plan
 * Utilisé côté serveur (APIs) et côté client (UI)
 */
export const PLAN_LIMITS = {
  freemium: {
    projects: 1,
    documents: 5,
    collaborators: 3,
    storage: "1 GB",
    storageBytes: 1_000_000_000, // 1 GB
    aiRequests: 50,
  },
  standard: {
    projects: Number.POSITIVE_INFINITY,
    documents: Number.POSITIVE_INFINITY,
    collaborators: Number.POSITIVE_INFINITY,
    storage: "100 GB",
    storageBytes: 100_000_000_000, // 100 GB
    aiRequests: Number.POSITIVE_INFINITY,
  },
} as const

/**
 * Mapping entre les plans DB et frontend
 */
export function dbPlanToFrontend(dbPlan: UserPlanDB): UserPlan {
  return dbPlan.toLowerCase() as UserPlan
}

export function frontendPlanToDB(plan: UserPlan): UserPlanDB {
  return plan.toUpperCase() as UserPlanDB
}

/**
 * Vérifie si l'utilisateur a atteint une limite
 */
export function hasReachedLimit(
  plan: UserPlan,
  limitType: keyof typeof PLAN_LIMITS.freemium,
  currentCount: number
): boolean {
  const limit = PLAN_LIMITS[plan][limitType]
  if (typeof limit === "number") {
    return currentCount >= limit
  }
  return false
}

/**
 * Récupère la limite pour un type donné
 */
export function getLimit(
  plan: UserPlan,
  limitType: keyof typeof PLAN_LIMITS.freemium
): number | string {
  return PLAN_LIMITS[plan][limitType]
}

// ============================================
// FONCTIONS DEPRECATED - À NE PLUS UTILISER
// ============================================

/**
 * @deprecated Utilisez le hook useUserPlan() depuis hooks/use-user-plan.ts
 * Cette fonction lit depuis localStorage qui n'est plus synchronisé avec la BDD
 */
export function getUserPlan(): UserPlan {
  console.warn("⚠️ getUserPlan() is deprecated. Use useUserPlan() hook instead.")
  if (typeof window === "undefined") return "freemium"
  const plan = localStorage.getItem("userPlan")
  return (plan as UserPlan) || "freemium"
}

/**
 * @deprecated Le plan est maintenant géré par les webhooks Stripe et l'API
 */
export function setUserPlan(plan: UserPlan) {
  console.warn("⚠️ setUserPlan() is deprecated. Plan is managed by Stripe webhooks.")
  if (typeof window === "undefined") return
  localStorage.setItem("userPlan", plan)
  window.dispatchEvent(new CustomEvent("planChanged", { detail: { plan } }))
}

/**
 * @deprecated Le plan est maintenant géré par les webhooks Stripe et l'API
 */
export function resetUserPlan() {
  console.warn("⚠️ resetUserPlan() is deprecated. Plan is managed by Stripe webhooks.")
  if (typeof window === "undefined") return
  localStorage.removeItem("userPlan")
  window.dispatchEvent(new CustomEvent("planChanged", { detail: { plan: "freemium" } }))
}
