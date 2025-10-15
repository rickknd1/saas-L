"use client"

import { useUser } from "./use-user"

/**
 * Hook pour récupérer le plan utilisateur depuis l'API
 * Module C (@kayzeur dylann)
 *
 * ✅ Migration localStorage → Database
 * Ce hook remplace l'ancien système localStorage par une lecture depuis l'API
 */

export function useUserPlan() {
  const { user, plan, isLoading } = useUser()

  return {
    plan: plan.toLowerCase() as "freemium" | "standard",
    isLoading,
    isStandard: plan === "STANDARD",
    isFreemium: plan === "FREEMIUM",
    user,
  }
}
