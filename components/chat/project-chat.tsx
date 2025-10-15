"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Users,
  Clock,
  Check,
  CheckCheck,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  user: {
    name: string
    initials: string
    color: string
  }
  content: string
  timestamp: Date
  read: boolean
  isCurrentUser?: boolean
}

interface ProjectChatProps {
  projectId: string
  projectName: string
  onClose?: () => void
}

// Mock data
const mockMessages: Message[] = [
  {
    id: "1",
    user: { name: "Marie Dubois", initials: "MD", color: "bg-blue-500" },
    content: "Bonjour à tous, j'ai uploadé la nouvelle version du contrat. Pouvez-vous la réviser ?",
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: "2",
    user: { name: "Pierre Martin", initials: "PM", color: "bg-green-500" },
    content: "Parfait, je regarde ça maintenant.",
    timestamp: new Date(Date.now() - 3000000),
    read: true,
  },
  {
    id: "3",
    user: { name: "Sophie Laurent", initials: "SL", color: "bg-purple-500" },
    content: "La clause 4.2 me semble un peu ambiguë. On devrait la reformuler.",
    timestamp: new Date(Date.now() - 1800000),
    read: true,
  },
  {
    id: "4",
    user: { name: "Vous", initials: "ME", color: "bg-primary" },
    content: "D'accord, je m'en occupe cet après-midi.",
    timestamp: new Date(Date.now() - 600000),
    read: true,
    isCurrentUser: true,
  },
]

const activeMembers = [
  { name: "Marie Dubois", initials: "MD", status: "online" },
  { name: "Pierre Martin", initials: "PM", status: "online" },
  { name: "Sophie Laurent", initials: "SL", status: "away" },
]

export function ProjectChat({ projectId, projectName, onClose }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      user: { name: "Vous", initials: "ME", color: "bg-primary" },
      content: newMessage,
      timestamp: new Date(),
      read: false,
      isCurrentUser: true,
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate other user typing
    setTimeout(() => {
      setIsTyping(true)
    }, 1000)

    setTimeout(() => {
      setIsTyping(false)
    }, 3000)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <Card className="flex h-full flex-col border-border">
      {/* Header */}
      <div className="shrink-0 border-b border-border p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-sm sm:text-base">{projectName}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex -space-x-2">
                {activeMembers.slice(0, 3).map((member, i) => (
                  <div key={i} className="relative">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border-2 border-background">
                      <AvatarFallback className="bg-primary/10 text-[9px] sm:text-[10px] text-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    {member.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full border border-background bg-green-500"></span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {activeMembers.filter((m) => m.status === "online").length} en ligne
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <Users className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Membres</span>
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages - zone scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => {
                const showAvatar =
                  index === 0 || messages[index - 1].user.name !== message.user.name

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 ${message.isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {showAvatar && !message.isCurrentUser ? (
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <AvatarFallback className={`${message.user.color} text-white text-[10px] sm:text-xs`}>
                          {message.user.initials}
                        </AvatarFallback>
                      </Avatar>
                    ) : !message.isCurrentUser ? (
                      <div className="w-7 sm:w-8 shrink-0" />
                    ) : null}

                    <div
                      className={`flex max-w-[85%] sm:max-w-[70%] flex-col gap-1 ${
                        message.isCurrentUser ? "items-end" : "items-start"
                      }`}
                    >
                      {showAvatar && !message.isCurrentUser && (
                        <span className="text-[10px] sm:text-xs font-medium">{message.user.name}</span>
                      )}
                      <div
                        className={`group relative rounded-lg px-3 py-2 ${
                          message.isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        {message.isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -right-8 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hidden sm:flex"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {message.isCurrentUser && (
                          <>
                            {message.read ? (
                              <CheckCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                            ) : (
                              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 sm:gap-3">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-green-500 text-[10px] sm:text-xs text-white">PM</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-muted-foreground" />
                      <div
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      <Separator className="shrink-0" />

      {/* Input - Zone de saisie fixe */}
      <div className="shrink-0 border-t border-border bg-background p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7">
                  <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7">
                  <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <span className="hidden sm:inline text-[10px] text-muted-foreground">
                Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
              </span>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] shrink-0"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
