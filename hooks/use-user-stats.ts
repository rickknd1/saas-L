"use client"

import { useState, useEffect } from "react"

interface UserStats {
  projects: number
  documents: number
  collaborators: number
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({ projects: 0, documents: 0, collaborators: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Le userId vient automatiquement du JWT (header x-user-id)
        const response = await fetch(`/api/users/me/stats`, {
          credentials: "include",
        })
        const data = await response.json()

        if (data.success) {
          setStats(data.stats)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError("Erreur lors du chargement des statistiques")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}
