"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, Shield, Users, FileText, AlertTriangle, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  read: boolean
  link?: string | null
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "COMMENT":
    case "MENTION":
      return MessageSquare
    case "DOCUMENT_UPDATED":
      return FileText
    case "PROJECT_SHARED":
      return Mail
    case "TEAM_MEMBER_ADDED":
      return Users
    case "SYSTEM":
      return Bell
    default:
      return Bell
  }
}

function formatTimestamp(date: string): string {
  const now = new Date()
  const timestamp = new Date(date)
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

export function NotificationBell() {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Charger les notifications réelles depuis l'API
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      })
      if (!res.ok) return { notifications: [] }
      return res.json()
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    enabled: mounted, // Attendre que le composant soit monté
  })

  // Charger les invitations en attente
  const { data: invitationsData } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await fetch("/api/invitations", {
        credentials: "include",
      })
      if (!res.ok) return { invitations: [] }
      return res.json()
    },
    refetchInterval: 30000,
    enabled: mounted, // Attendre que le composant soit monté
  })

  const notifications: Notification[] = notificationsData?.notifications || []
  const invitationsCount = invitationsData?.invitations?.length || 0
  const unreadCount = notifications.filter((n) => !n.read).length
  const totalBadgeCount = unreadCount + invitationsCount

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Erreur")
      return res.json()
    },
    onSuccess: () => {
      // Rafraîchir les deux queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" suppressHydrationWarning>
          <Bell className="h-5 w-5" />
          {mounted && totalBadgeCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {totalBadgeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Notifications</span>
            {mounted && unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {mounted && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="h-auto p-0 text-xs text-primary hover:bg-transparent"
              suppressHydrationWarning
            >
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {mounted && invitationsCount > 0 && (
            <div className="p-2 pb-0">
              <Link href="/dashboard/notifications">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 cursor-pointer">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {invitationsCount} invitation{invitationsCount > 1 ? 's' : ''} en attente
                  </span>
                </div>
              </Link>
            </div>
          )}
          {!mounted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Chargement...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.length > 5 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Affichage des 5 dernières sur {notifications.length} notifications
                </div>
              )}
              {notifications.slice(0, 5).map((notification) => {
                const Icon = getNotificationIcon(notification.type)

                return (
                  <Link
                    key={notification.id}
                    href={notification.link || "/dashboard/notifications"}
                  >
                    <DropdownMenuItem
                      className={`flex cursor-pointer gap-3 p-3 ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        !notification.read ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`h-4 w-4 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="default" className="h-2 w-2 rounded-full p-0 bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                )
              })}
            </div>
          )}
        </ScrollArea>
        {mounted && (notifications.length > 0 || invitationsCount > 0) && (
          <>
            <DropdownMenuSeparator />
            <Link href="/dashboard/notifications">
              <DropdownMenuItem className="justify-center text-center text-sm text-primary cursor-pointer">
                Voir toutes les notifications
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
