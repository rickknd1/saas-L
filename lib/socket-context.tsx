'use client'

/**
 * Socket.io Context Provider
 * Gère la connexion WebSocket et fournit des hooks pour les composants
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: Set<string>
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
})

export function useSocket() {
  return useContext(SocketContext)
}

interface SocketProviderProps {
  children: ReactNode
  userId?: string
  userName?: string
}

export function SocketProvider({ children, userId, userName }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Ne se connecter que si userId est fourni
    if (!userId) {
      console.log('[Socket] No userId provided, skipping connection')
      return
    }

    console.log('[Socket] Initializing connection for user:', userId)

    // Créer la connexion Socket.io
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        userId,
        userName: userName || 'Utilisateur',
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    // Événements de connexion
    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
      setIsConnected(false)
    })

    // Événements d'utilisateurs en ligne
    socketInstance.on('user:online', (data: { userId: string; userName: string }) => {
      console.log('[Socket] User online:', data.userName)
      setOnlineUsers((prev) => new Set(prev).add(data.userId))
    })

    socketInstance.on('user:offline', (data: { userId: string }) => {
      console.log('[Socket] User offline:', data.userId)
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    })

    setSocket(socketInstance)

    // Cleanup
    return () => {
      console.log('[Socket] Disconnecting...')
      socketInstance.disconnect()
    }
  }, [userId, userName])

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}
