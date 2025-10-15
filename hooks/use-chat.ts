'use client'

/**
 * Hook personnalisé pour la messagerie instantanée
 * Module A2 - Messagerie Instantanée (CDC)
 */

import { useEffect, useState, useCallback } from 'react'
import { useSocket } from '@/lib/socket-context'
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
    role: string | null
  }
}

interface TypingUser {
  userId: string
  userName: string
}

export function useChat(projectId: string, currentUserId: string) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [hasMore, setHasMore] = useState(false)

  /**
   * Charger les messages initiaux depuis l'API
   */
  const loadMessages = useCallback(async (before?: string) => {
    try {
      setLoading(true)
      const url = new URL('/api/chat/messages', window.location.origin)
      url.searchParams.set('projectId', projectId)
      url.searchParams.set('limit', '50')
      if (before) {
        url.searchParams.set('before', before)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.success) {
        if (before) {
          // Ajouter les messages plus anciens au début
          setMessages((prev) => [...data.messages, ...prev])
        } else {
          // Premiers messages
          setMessages(data.messages)
        }
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('[useChat] Error loading messages:', error)
      toast.error('Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  /**
   * Envoyer un message via WebSocket
   */
  const sendMessage = useCallback(
    (content: string, attachments?: string) => {
      if (!socket || !isConnected) {
        toast.error('Connexion WebSocket non établie')
        return
      }

      if (!content.trim()) {
        return
      }

      socket.emit('message:send', {
        projectId,
        content: content.trim(),
        attachments,
      })
    },
    [socket, isConnected, projectId]
  )

  /**
   * Démarrer l'indicateur de frappe
   */
  const startTyping = useCallback(() => {
    if (!socket || !isConnected) return
    socket.emit('typing:start', projectId)
  }, [socket, isConnected, projectId])

  /**
   * Arrêter l'indicateur de frappe
   */
  const stopTyping = useCallback(() => {
    if (!socket || !isConnected) return
    socket.emit('typing:stop', projectId)
  }, [socket, isConnected, projectId])

  /**
   * Marquer un message comme lu
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        await fetch('/api/chat/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId,
            userId: currentUserId,
          }),
        })
      } catch (error) {
        console.error('[useChat] Error marking message as read:', error)
      }
    },
    [currentUserId]
  )

  /**
   * Marquer tous les messages du projet comme lus
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId: currentUserId,
        }),
      })
    } catch (error) {
      console.error('[useChat] Error marking all messages as read:', error)
    }
  }, [projectId, currentUserId])

  /**
   * Rejoindre le projet (room)
   */
  useEffect(() => {
    if (!socket || !isConnected) return

    console.log('[useChat] Joining project:', projectId)
    socket.emit('project:join', projectId)

    return () => {
      console.log('[useChat] Leaving project:', projectId)
      socket.emit('project:leave', projectId)
    }
  }, [socket, isConnected, projectId])

  /**
   * Écouter les nouveaux messages
   */
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      console.log('[useChat] New message received:', message.id)
      setMessages((prev) => [...prev, message])

      // Notification si ce n'est pas notre message
      if (message.userId !== currentUserId) {
        toast.info(`${message.user.name || 'Utilisateur'}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`)
      }
    }

    const handleTypingStart = (data: { userId: string; userName: string; projectId: string }) => {
      if (data.userId !== currentUserId && data.projectId === projectId) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.userId === data.userId)) return prev
          return [...prev, { userId: data.userId, userName: data.userName }]
        })
      }
    }

    const handleTypingStop = (data: { userId: string; projectId: string }) => {
      if (data.projectId === projectId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
      }
    }

    socket.on('message:new', handleNewMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [socket, projectId, currentUserId])

  /**
   * Charger les messages au montage
   */
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    loading,
    hasMore,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    markAllAsRead,
    loadMoreMessages: () => loadMessages(messages[0]?.id),
  }
}
