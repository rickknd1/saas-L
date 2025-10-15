"use client"

import { useEffect, useState } from "react"

/**
 * Hook pour récupérer les informations de l'utilisateur connecté
 * Module C (@kayzeur dylann)
 *
 * Remplace l'ancien système localStorage par une récupération depuis l'API
 */

export type UserPlan = "FREEMIUM" | "STANDARD"

export interface User {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string | null
  bio: string | null
  avatar: string | null
  organization: string | null
  organizationSiret: string | null
  plan: UserPlan
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  subscription?: {
    plan: UserPlan
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
  _count?: {
    ownedProjects: number
    documents: number
    comments: number
    messages: number
  }
}

interface UseUserReturn {
  user: User | null
  plan: UserPlan
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook principal pour récupérer l'utilisateur
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/users/me", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Non authentifié - pas d'utilisateur
          setUser(null)
          return
        }
        throw new Error("Failed to fetch user")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      console.error("Error fetching user:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    plan: user?.plan || "FREEMIUM",
    isLoading,
    error,
    refetch: fetchUser,
  }
}

/**
 * Hook simplifié pour récupérer uniquement le plan
 */
export function useUserPlan(): UserPlan {
  const { plan } = useUser()
  return plan
}

/**
 * Hook pour vérifier si l'utilisateur a le plan Standard
 */
export function useIsStandardPlan(): boolean {
  const { plan } = useUser()
  return plan === "STANDARD"
}

/**
 * Hook pour mettre à jour le profil utilisateur
 */
export function useUpdateUser() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUser = async (data: Partial<User>) => {
    try {
      setIsUpdating(true)
      setError(null)

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user")
      }

      const result = await response.json()
      return result.user
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateUser,
    isUpdating,
    error,
  }
}
