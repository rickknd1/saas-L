"use client"

import { useState, useEffect } from "react"

export interface Member {
  id: string
  projectId: string
  userId: string
  role: string
  canEdit: boolean
  canInvite: boolean
  canDelete: boolean
  invitedAt: string
  acceptedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
    role: string | null
    avatar: string | null
    lastLoginAt: string | null
  }
  project: {
    id: string
    name: string
  }
  projectCount?: number
}

export function useMembers(userId: string | null) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchMembers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/members?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des membres")
        }

        const data = await response.json()
        if (data.success) {
          setMembers(data.members)
        } else {
          throw new Error(data.error || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [userId])

  const refetch = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/members?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setMembers(data.members)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  return { members, isLoading, error, refetch }
}

export function useMemberStats(userId: string | null) {
  const [stats, setStats] = useState({ total: 0, active: 0, totalProjects: 0, pendingInvitations: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/members/stats?userId=${userId}`)

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
  }, [userId])

  return { stats, isLoading, error }
}
