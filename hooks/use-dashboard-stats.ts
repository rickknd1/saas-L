"use client"

import { useState, useEffect } from "react"

export interface DashboardStats {
  projects: number
  documents: number
  collaborators: number
  timeSaved: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        // Le userId vient automatiquement du JWT (header x-user-id)
        const response = await fetch(`/api/users/me/stats`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques")
        }

        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        } else {
          throw new Error(data.error || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}
