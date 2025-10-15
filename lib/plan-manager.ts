"use client"

export type UserPlan = "freemium" | "standard"

/**
 * Limites par plan
 * Utilisé pour afficher les restrictions côté UI
 */
export const PLAN_LIMITS = {
  freemium: {
    projects: 1,
    collaborators: 2,
    storage: "5 GB",
    storageBytes: 5 * 1024 * 1024 * 1024, // 5 GB en bytes
    aiRequests: 50,
    documentsPerProject: 5,
  },
  standard: {
    projects: Number.POSITIVE_INFINITY,
    collaborators: Number.POSITIVE_INFINITY,
    storage: "Illimité",
    storageBytes: Number.POSITIVE_INFINITY,
    aiRequests: Number.POSITIVE_INFINITY,
    documentsPerProject: Number.POSITIVE_INFINITY,
  },
}

/**
 * DEPRECATED: Les fonctions getUserPlan, setUserPlan, resetUserPlan
 * ont été supprimées. Utiliser useAuth() et useUserPlan() à la place.
 *
 * Migration:
 * - getUserPlan() → useUserPlan().plan
 * - setUserPlan() → géré automatiquement par React Query après login/paiement
 * - resetUserPlan() → géré automatiquement par useAuth().logout()
 */
