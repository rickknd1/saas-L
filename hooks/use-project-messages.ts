"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  projectId: string
  userId: string
  read: boolean
  readAt: Date | null
  attachments: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

interface SendMessageData {
  content: string
  attachments?: any[]
}

/**
 * Hook pour gérer les messages d'un projet
 */
export function useProjectMessages(projectId: string | null) {
  const queryClient = useQueryClient()

  // Récupérer les messages
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Message[]>({
    queryKey: ['projectMessages', projectId],
    queryFn: async () => {
      if (!projectId) return []

      const res = await fetch(`/api/projects/${projectId}/messages`, {
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des messages')
      }

      const data = await res.json()
      return data.messages || []
    },
    enabled: !!projectId,
    refetchInterval: 5000, // Actualiser toutes les 5 secondes
  })

  // Envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      if (!projectId) {
        throw new Error('Project ID manquant')
      }

      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du message')
      }

      return res.json()
    },
    onSuccess: () => {
      // Actualiser la liste des messages
      queryClient.invalidateQueries({ queryKey: ['projectMessages', projectId] })
    },
    onError: (error: Error) => {
      toast.error('Erreur', {
        description: error.message,
      })
    },
  })

  return {
    messages,
    isLoading,
    error,
    refetch,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  }
}
