"use client"

import { useState, useEffect } from "react"

export interface Activity {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string
  projectId: string | null
  documentId: string | null
  metadata: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  } | null
  project: {
    id: string
    name: string
  } | null
  document: {
    id: string
    name: string
  } | null
}

export function useRecentActivity(userId: string | null, limit: number = 10) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/projects/recent-activity?userId=${userId}&limit=${limit}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de l'activité")
        }

        const data = await response.json()
        if (data.success) {
          setActivities(data.activities)
        } else {
          throw new Error(data.error || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [userId, limit])

  const refetch = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects/recent-activity?userId=${userId}&limit=${limit}`)
      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  return { activities, isLoading, error, refetch }
}
