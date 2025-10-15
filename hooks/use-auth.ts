"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  plan: "freemium" | "standard"
  role?: string
  phone?: string | null
  bio?: string | null
  avatar?: string | null
  organization?: string | null
  organizationSiret?: string | null
  twoFactorEnabled?: boolean
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date | null
}

interface LoginCredentials {
  email: string
  password: string
}

/**
 * Hook d'authentification avec React Query
 * - Cache automatique des données utilisateur
 * - Pas de localStorage (cookies httpOnly)
 * - Synchronisation automatique entre onglets
 * - Invalidation intelligente du cache
 */
export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Query: Récupérer l'utilisateur authentifié
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
          cache: "no-store", // Ne pas cacher cette requête
        })

        if (!response.ok) {
          // Si 401 ou 403, l'utilisateur n'est pas connecté (pas d'erreur)
          if (response.status === 401 || response.status === 403) {
            return null
          }
          // Autres erreurs (500, etc.) : ne pas throw, juste return null
          // Cela évite de polluer la console avec des erreurs non critiques
          console.warn(`API /api/auth/me returned ${response.status}, user will be treated as not authenticated`)
          return null
        }

        const data = await response.json()
        return data.user
      } catch (error) {
        // Erreur réseau ou autre : ne pas bloquer, juste return null
        // L'utilisateur sera traité comme non authentifié
        console.warn("Network error while fetching user:", error)
        return null
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Ne pas retry si 401
  })

  // Mutation: Login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('[useAuth] Login mutation started', credentials.email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      console.log('[useAuth] Response received', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.log('[useAuth] Login error', error)
        throw new Error(error.error || "Erreur de connexion")
      }

      const apiResponse = await response.json()
      console.log('[useAuth] Login success', apiResponse)

      // Retourner le format attendu par les composants : { success, user }
      return {
        success: apiResponse.success,
        user: apiResponse.data.user,
        message: apiResponse.message
      }
    },
    onSuccess: (data) => {
      // Mettre à jour le cache user automatiquement
      queryClient.setQueryData(["user"], data.user)

      // Cleanup localStorage (migration)
      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
        localStorage.removeItem("userPlan")
        localStorage.removeItem("auth-token")
      }
    },
  })

  // Mutation: Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    },
    onSuccess: () => {
      // Invalider le cache et rediriger
      queryClient.setQueryData(["user"], null)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.clear() // Clear tout le cache

      // Cleanup localStorage (migration)
      if (typeof window !== "undefined") {
        localStorage.removeItem("user")
        localStorage.removeItem("userPlan")
        localStorage.removeItem("auth-token")
      }

      router.push("/login")
    },
  })

  // Fonction pour refetch l'utilisateur (après paiement par exemple)
  const refetchUser = async () => {
    return await refetch()
  }

  // Fonction login simplifiée
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials)
  }

  // Fonction logout simplifiée
  const logout = () => {
    logoutMutation.mutate()
  }

  // Fonction pour update l'utilisateur (optimistic update)
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      queryClient.setQueryData(["user"], updatedUser)
    }
  }

  return {
    user: user || null,
    userId: user?.id,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    refetchUser,
    // États de mutation pour afficher loading/error dans les composants
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    isLogoutLoading: logoutMutation.isPending,
  }
}
