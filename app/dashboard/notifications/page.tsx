"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  MessageSquare,
  Users,
  CheckCheck,
  Trash2,
  Mail,
  Check,
  X,
  Loader2,
  AlertCircle,
  UserPlus
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string | null
}

interface Invitation {
  id: string
  role: string
  invitedAt: string
  project: {
    id: string
    name: string
    description: string | null
    owner: {
      name: string | null
      email: string
    }
    _count: {
      documents: number
      members: number
    }
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "COMMENT_ADDED":
    case "COMMENT_REPLIED":
      return MessageSquare
    case "DOCUMENT_ADDED":
    case "DOCUMENT_UPDATED":
      return FileText
    case "TEAM_MEMBER_ADDED":
    case "TEAM_MEMBER_REMOVED":
      return Users
    case "PROJECT_INVITE":
      return Mail
    default:
      return FileText
  }
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("all")

  // Récupérer les notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Erreur lors du chargement des notifications")
      return res.json()
    },
  })

  // Récupérer les invitations en attente
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await fetch("/api/invitations", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Erreur lors du chargement des invitations")
      return res.json()
    },
  })

  // Accepter une invitation
  const acceptInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de l'acceptation")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success("Invitation acceptée", {
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message,
      })
    },
  })

  // Refuser une invitation
  const declineInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(`/api/invitations/${invitationId}/decline`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors du refus")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success("Invitation refusée", {
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message,
      })
    },
  })

  // Marquer toutes les notifications comme lues
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
      toast.success("Toutes les notifications ont été marquées comme lues")
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const notifications: Notification[] = notificationsData?.notifications || []
  const invitations: Invitation[] = invitationsData?.invitations || []
  const unreadCount = notifications.filter((n) => !n.read).length
  const invitationsCount = invitations.length

  if (notificationsLoading || invitationsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-6">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-lg">Restez informé de toute l'activité</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Invitations en attente */}
      {invitationsCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Invitations en attente</h2>
            <Badge variant="default">{invitationsCount}</Badge>
          </div>

          {invitations.map((invitation) => {
            // Vérifier si CETTE invitation spécifique est en cours de traitement
            const isThisInvitationPending =
              (acceptInvitation.isPending && acceptInvitation.variables === invitation.id) ||
              (declineInvitation.isPending && declineInvitation.variables === invitation.id)

            const isAccepting = acceptInvitation.isPending && acceptInvitation.variables === invitation.id
            const isDeclining = declineInvitation.isPending && declineInvitation.variables === invitation.id

            return (
              <Card key={invitation.id} className="card-premium border-glow border-primary/40 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-semibold text-lg">{invitation.project.name}</p>
                        {invitation.project.description && (
                          <p className="text-sm text-muted-foreground">{invitation.project.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Invité par <span className="font-medium">{invitation.project.owner.name || invitation.project.owner.email}</span>
                        </span>
                        <span>•</span>
                        <span>Rôle: <span className="font-medium">{invitation.role}</span></span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(invitation.invitedAt), { addSuffix: true, locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{invitation.project._count.documents} documents</span>
                        <span>•</span>
                        <span>{invitation.project._count.members + 1} membres</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => acceptInvitation.mutate(invitation.id)}
                        disabled={isThisInvitationPending}
                      >
                        {isAccepting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineInvitation.mutate(invitation.id)}
                        disabled={isThisInvitationPending}
                      >
                        {isDeclining ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Refuser
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            Toutes
            {notifications.length > 0 && (
              <Badge className="ml-2 bg-primary/10 text-primary">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-destructive/10 text-destructive">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucune notification pour le moment
              </AlertDescription>
            </Alert>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              return (
                <Card
                  key={notification.id}
                  className={`card-premium border-glow transition-colors ${
                    !notification.read ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          !notification.read ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                          {!notification.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2"></div>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {unreadCount === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucune notification non lue
              </AlertDescription>
            </Alert>
          ) : (
            notifications
              .filter((n) => !n.read)
              .map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                return (
                  <Card key={notification.id} className="card-premium border-glow bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2"></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
