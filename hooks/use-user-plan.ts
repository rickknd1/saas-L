"use client"

import { useAuth } from "./use-auth"
import { type UserPlan } from "@/lib/plan-manager"

/**
 * Hook simplifié pour récupérer le plan utilisateur
 * Lit directement depuis useAuth (React Query cache)
 * Plus besoin de localStorage
 */
export function useUserPlan() {
  const { user, isLoading } = useAuth()

  // Lire le plan directement depuis l'utilisateur (source unique de vérité)
  const plan: UserPlan = user?.plan ? (user.plan.toLowerCase() as UserPlan) : "freemium"

  return {
    plan,
    isLoading,
    isStandard: plan === "standard",
    isFreemium: plan === "freemium",
  }
}
