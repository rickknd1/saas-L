"use client"

import { useState, useEffect } from "react"

export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  confidential: boolean
  deadline: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string | null
      email: string
    }
  }>
  documents: Array<{
    id: string
  }>
  _count: {
    members: number
    documents: number
  }
}

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/projects?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des projets")
        }

        const data = await response.json()
        if (data.success) {
          setProjects(data.projects)
        } else {
          throw new Error(data.error || "Erreur inconnue")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [userId])

  const refetch = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/projects?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  return { projects, isLoading, error, refetch }
}
