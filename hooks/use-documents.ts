"use client"

import { useState, useEffect } from "react"

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  key: string
  projectId: string
  uploadedById: string
  version: number
  isCurrentVersion: boolean
  confidential: boolean
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
  }
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    comments: number
    versions: number
  }
}

export function useDocuments(userId: string | null) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchDocuments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/documents?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des documents")
        }

        const data = await response.json()
        if (data.success) {
          setDocuments(data.documents)
        } else {
          throw new Error(data.error || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [userId])

  const refetch = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/documents?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  return { documents, isLoading, error, refetch }
}

export function useDocumentStats(userId: string | null) {
  const [stats, setStats] = useState({ total: 0, inReview: 0, validated: 0, pending: 0 })
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
        const response = await fetch(`/api/documents/stats?userId=${userId}`)

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
