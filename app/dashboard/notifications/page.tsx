"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MessageSquare, Users, CheckCheck, Trash2 } from "lucide-react"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "comment",
      title: "Nouveau commentaire",
      message: "Marie Martin a commenté le document 'Contrat de prestation.pdf'",
      time: "Il y a 5 minutes",
      read: false,
      icon: MessageSquare,
    },
    {
      id: 2,
      type: "document",
      title: "Document mis à jour",
      message: "Le document 'Statuts SARL.pdf' a été modifié par Pierre Dubois",
      time: "Il y a 1 heure",
      read: false,
      icon: FileText,
    },
    {
      id: 3,
      type: "team",
      title: "Nouveau membre",
      message: "Sophie Laurent a rejoint le projet 'Fusion ABC Corp'",
      time: "Il y a 3 heures",
      read: true,
      icon: Users,
    },
    {
      id: 4,
      type: "comment",
      title: "Mention dans un commentaire",
      message: "Vous avez été mentionné par Jean Dupont dans 'Contrat commercial.pdf'",
      time: "Hier à 16:30",
      read: true,
      icon: MessageSquare,
    },
    {
      id: 5,
      type: "document",
      title: "Comparaison terminée",
      message: "La comparaison entre les versions 2 et 3 de 'Bail commercial.pdf' est disponible",
      time: "Hier à 14:20",
      read: true,
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Restez informé de toute l'activité</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Tout effacer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            Toutes
            <Badge className="ml-2 bg-primary/10 text-primary">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues
            <Badge className="ml-2 bg-accent/10 text-accent-foreground">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="comments">Commentaires</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <Card
                key={notification.id}
                className={`border-border transition-colors hover:bg-muted/50 ${
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
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {notifications
            .filter((n) => !n.read)
            .map((notification) => {
              const Icon = notification.icon
              return (
                <Card key={notification.id} className="border-border bg-primary/5 border-primary/20">
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
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="comments" className="space-y-3">
          {notifications
            .filter((n) => n.type === "comment")
            .map((notification) => {
              const Icon = notification.icon
              return (
                <Card
                  key={notification.id}
                  className={`border-border ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
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
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          {notifications
            .filter((n) => n.type === "document")
            .map((notification) => {
              const Icon = notification.icon
              return (
                <Card
                  key={notification.id}
                  className={`border-border ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
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
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>

        <TabsContent value="team" className="space-y-3">
          {notifications
            .filter((n) => n.type === "team")
            .map((notification) => {
              const Icon = notification.icon
              return (
                <Card key={notification.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
