"use client"

import { useState } from "react"

export interface DiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

export interface ComparisonStats {
  added: number
  removed: number
  modified: number
  total: number
}

export interface ComparisonResult {
  success: boolean
  differences: DiffPart[]
  stats: ComparisonStats
  metadata: {
    documentId1: string
    documentId2: string
    comparedAt: string
  }
}

export function useDocumentCompare() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ComparisonResult | null>(null)

  const compareDocuments = async (
    documentId1: string,
    documentId2: string
  ): Promise<ComparisonResult | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/documents/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId1, documentId2 }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la comparaison des documents")
      }

      const data = await response.json()

      if (data.success) {
        setResult(data)
        return data
      } else {
        throw new Error(data.error || "Erreur inconnue lors de la comparaison")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
      setError(errorMessage)
      console.error("Erreur comparaison documents:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const compareContent = async (
    content1: string,
    content2: string
  ): Promise<ComparisonResult | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/documents/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content1, content2 }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la comparaison du contenu")
      }

      const data = await response.json()

      if (data.success) {
        setResult(data)
        return data
      } else {
        throw new Error(data.error || "Erreur inconnue lors de la comparaison")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue"
      setError(errorMessage)
      console.error("Erreur comparaison contenu:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return {
    compareDocuments,
    compareContent,
    isLoading,
    error,
    result,
    reset,
  }
}
