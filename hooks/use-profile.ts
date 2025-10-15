"use client"

import { useState, useEffect } from "react"

export interface UserProfile {
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
  plan: string
  createdAt: string
  lastLoginAt: string | null
  stats?: {
    projects: number
    documents: number
    collaborations: number
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        // Le userId vient automatiquement du JWT (header x-user-id)
        const response = await fetch(`/api/users/profile`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du profil")
        }

        const data = await response.json()
        if (data.success) {
          setProfile(data.user)
        } else {
          throw new Error(data.error || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch(`/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (data.success) {
        setProfile(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue" }
    }
  }

  const refetch = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/profile`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setProfile(data.user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  return { profile, isLoading, error, updateProfile, refetch }
}
