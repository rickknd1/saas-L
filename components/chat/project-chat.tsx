'use client'

/**
 * Composant de chat pour un projet
 * Module A2 - Messagerie Instantanée (CDC)
 *
 * UI améliorée style messaging app moderne
 */

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Loader2, WifiOff, Wifi } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

interface ProjectChatProps {
  projectId: string
  projectName: string
}

export function ProjectChat({
  projectId,
  projectName,
}: ProjectChatProps) {
  // Récupérer l'utilisateur connecté
  const { user } = useAuth()
  const currentUserId = user?.id || ''

  const {
    messages,
    loading,
    hasMore,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    loadMoreMessages,
  } = useChat(projectId, currentUserId)

  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  /**
   * Auto-scroll vers le bas quand un nouveau message arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Gérer la frappe
   */
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      startTyping()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTyping()
    }, 3000)
  }

  /**
   * Envoyer un message
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim()) return

    sendMessage(messageInput)
    setMessageInput('')

    if (isTyping) {
      setIsTyping(false)
      stopTyping()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  /**
   * Obtenir les initiales pour l'avatar
   */
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full glass-premium border-glow rounded-xl overflow-hidden">
      {/* Header fixe */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 shrink-0">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{projectName}</h3>
          <p className="text-sm text-muted-foreground">
            {messages.length} message{messages.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">En ligne</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Hors ligne</span>
            </div>
          )}
        </div>
      </div>

      {/* Zone des messages avec scroll interne */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {loading && messages.length === 0 ? (
          // Skeleton loading
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "" : "flex-row-reverse")}>
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 max-w-[70%]">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Bouton charger plus */}
            {hasMore && (
              <div className="flex justify-center pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMoreMessages}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Charger plus de messages'
                  )}
                </Button>
              </div>
            )}

            {/* Liste des messages */}
            {messages.map((message) => {
              const isOwnMessage = message.userId === currentUserId

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 items-end',
                    isOwnMessage && 'flex-row-reverse'
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={message.user.avatar || undefined} />
                    <AvatarFallback className={cn(
                      "text-xs",
                      isOwnMessage ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      {getInitials(message.user.name, message.user.email)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Bulle de message */}
                  <div
                    className={cn(
                      'flex flex-col max-w-[70%]',
                      isOwnMessage ? 'items-end' : 'items-start'
                    )}
                  >
                    {/* Nom et timestamp */}
                    <div className={cn(
                      "flex items-center gap-2 mb-1 px-1",
                      isOwnMessage && "flex-row-reverse"
                    )}>
                      <span className="text-xs font-medium text-foreground">
                        {isOwnMessage ? 'Vous' : message.user.name || message.user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>

                    {/* Message content */}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm break-words',
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Indicateur de frappe */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-muted text-xs">
                    {typingUsers[0].userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Référence pour auto-scroll */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input fixe en bas */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-card/50 shrink-0">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value)
              handleTyping()
            }}
            placeholder="Écrivez un message..."
            disabled={!isConnected}
            className="flex-1 h-10"
            maxLength={2000}
          />
          <Button
            type="submit"
            disabled={!isConnected || !messageInput.trim()}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
            <WifiOff className="h-3 w-3" />
            Connexion perdue. Reconnexion en cours...
          </p>
        )}
      </form>
    </div>
  )
}
