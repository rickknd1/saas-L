/**
 * Configuration du serveur WebSocket avec Socket.io
 * Module A2 - Messagerie Instantanée (CDC)
 *
 * Fonctionnalités:
 * - Chat temps réel par projet
 * - Indicateurs de frappe
 * - Statut en ligne/hors ligne
 * - Notification de messages
 */

import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { prisma } from './prisma'

export type SocketServer = SocketIOServer

// Store typing users per project
const typingUsers = new Map<string, Set<string>>()

// Store online users
const onlineUsers = new Set<string>()

/**
 * Initialize Socket.io server
 */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  })

  console.log('[Socket.io] Server initializing...')

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.auth.userId
    const userName = socket.handshake.auth.userName || 'Utilisateur'

    console.log(`[Socket.io] User connected: ${userId} (${userName})`)

    // Add to online users
    if (userId) {
      onlineUsers.add(userId)
      io.emit('user:online', { userId, userName })
    }

    /**
     * Join a project room
     */
    socket.on('project:join', async (projectId: string) => {
      console.log(`[Socket.io] User ${userId} joining project: ${projectId}`)

      socket.join(`project:${projectId}`)

      // Notify others that user joined
      socket.to(`project:${projectId}`).emit('user:joined', {
        userId,
        userName,
        projectId,
      })
    })

    /**
     * Leave a project room
     */
    socket.on('project:leave', (projectId: string) => {
      console.log(`[Socket.io] User ${userId} leaving project: ${projectId}`)

      socket.leave(`project:${projectId}`)

      // Notify others that user left
      socket.to(`project:${projectId}`).emit('user:left', {
        userId,
        userName,
        projectId,
      })

      // Remove from typing users
      const projectTyping = typingUsers.get(projectId)
      if (projectTyping) {
        projectTyping.delete(userId)
      }
    })

    /**
     * Send a message
     */
    socket.on('message:send', async (data: {
      projectId: string
      content: string
      attachments?: string
    }) => {
      try {
        console.log(`[Socket.io] Message from ${userId} in project ${data.projectId}`)

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: data.content,
            projectId: data.projectId,
            userId: userId,
            attachments: data.attachments,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        })

        // Broadcast to all users in the project room
        io.to(`project:${data.projectId}`).emit('message:new', message)

        console.log(`[Socket.io] Message saved and broadcast: ${message.id}`)

        // Stop typing indicator for this user
        const projectTyping = typingUsers.get(data.projectId)
        if (projectTyping) {
          projectTyping.delete(userId)
          io.to(`project:${data.projectId}`).emit('typing:stop', {
            userId,
            userName,
            projectId: data.projectId,
          })
        }
      } catch (error) {
        console.error('[Socket.io] Error saving message:', error)
        socket.emit('message:error', {
          error: 'Failed to send message',
        })
      }
    })

    /**
     * User is typing
     */
    socket.on('typing:start', (projectId: string) => {
      console.log(`[Socket.io] User ${userId} started typing in project ${projectId}`)

      // Add to typing users
      if (!typingUsers.has(projectId)) {
        typingUsers.set(projectId, new Set())
      }
      typingUsers.get(projectId)!.add(userId)

      // Notify others in the project
      socket.to(`project:${projectId}`).emit('typing:start', {
        userId,
        userName,
        projectId,
      })
    })

    /**
     * User stopped typing
     */
    socket.on('typing:stop', (projectId: string) => {
      console.log(`[Socket.io] User ${userId} stopped typing in project ${projectId}`)

      // Remove from typing users
      const projectTyping = typingUsers.get(projectId)
      if (projectTyping) {
        projectTyping.delete(userId)
      }

      // Notify others in the project
      socket.to(`project:${projectId}`).emit('typing:stop', {
        userId,
        userName,
        projectId,
      })
    })

    /**
     * Mark message as read
     */
    socket.on('message:read', async (data: {
      messageId: string
      projectId: string
    }) => {
      try {
        await prisma.message.update({
          where: { id: data.messageId },
          data: {
            read: true,
            readAt: new Date(),
          },
        })

        // Notify sender
        io.to(`project:${data.projectId}`).emit('message:read', {
          messageId: data.messageId,
          userId,
        })
      } catch (error) {
        console.error('[Socket.io] Error marking message as read:', error)
      }
    })

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`[Socket.io] User disconnected: ${userId}`)

      // Remove from online users
      if (userId) {
        onlineUsers.delete(userId)
        io.emit('user:offline', { userId })
      }

      // Clean up typing indicators
      typingUsers.forEach((users, projectId) => {
        if (users.has(userId)) {
          users.delete(userId)
          io.to(`project:${projectId}`).emit('typing:stop', {
            userId,
            userName,
            projectId,
          })
        }
      })
    })
  })

  console.log('[Socket.io] Server initialized successfully')

  return io
}

/**
 * Get online users count
 */
export function getOnlineUsersCount(): number {
  return onlineUsers.size
}

/**
 * Check if user is online
 */
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId)
}

/**
 * Get typing users for a project
 */
export function getTypingUsers(projectId: string): string[] {
  const users = typingUsers.get(projectId)
  return users ? Array.from(users) : []
}
