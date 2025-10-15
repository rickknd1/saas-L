"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MessageSquare, Users, Download, Share2, MoreVertical, Send, AtSign, Paperclip } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const [comment, setComment] = useState("")
  const [activeUsers] = useState([
    { name: "Marie Dubois", initials: "MD", status: "active" },
    { name: "Pierre Martin", initials: "PM", status: "active" },
    { name: "Sophie Laurent", initials: "SL", status: "idle" },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/projects/1"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au projet
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Contrat_Fusion_v3.pdf</h1>
          <p className="text-muted-foreground">Modifié il y a 2 heures par Marie Dubois</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Renommer</DropdownMenuItem>
              <DropdownMenuItem>Déplacer</DropdownMenuItem>
              <DropdownMenuItem>Historique des versions</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Users */}
      <Card className="border-border">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Collaborateurs actifs</span>
          </div>
          <div className="flex items-center gap-2">
            {activeUsers.map((user, i) => (
              <div key={i} className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">{user.initials}</AvatarFallback>
                </Avatar>
                {user.status === "active" && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></span>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" className="ml-2">
              + Inviter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Viewer */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <Badge variant="secondary">Page 1 sur 24</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Zoom -
                  </Button>
                  <span className="text-sm text-muted-foreground">100%</span>
                  <Button variant="ghost" size="sm">
                    Zoom +
                  </Button>
                </div>
              </div>
              <div className="relative min-h-[600px] bg-muted/30 p-8">
                <div className="mx-auto max-w-2xl rounded-lg bg-background p-8 shadow-sm">
                  <div className="space-y-4 font-serif text-sm leading-relaxed">
                    <h2 className="text-xl font-bold">CONTRAT DE FUSION</h2>
                    <p className="text-muted-foreground">Entre les soussignés :</p>
                    <p>
                      La société ABC CORP, société anonyme au capital de 1.000.000 euros, immatriculée au RCS de Paris
                      sous le numéro 123 456 789, dont le siège social est situé...
                    </p>
                    <p className="font-semibold">Ci-après dénommée "la Société Absorbante"</p>
                    <p className="mt-4">D'une part,</p>
                    <p className="mt-4">Et :</p>
                    <p>
                      La société XYZ SARL, société à responsabilité limitée au capital de 500.000 euros, immatriculée au
                      RCS de Paris sous le numéro 987 654 321...
                    </p>

                    {/* Annotation Example */}
                    <div className="relative my-6 rounded-lg border-2 border-accent bg-accent/5 p-4">
                      <div className="absolute -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        1
                      </div>
                      <p className="text-sm">
                        Article 4.2 - Les parties conviennent d'un délai de{" "}
                        <span className="bg-accent/30">120 jours</span> pour finaliser la fusion.
                      </p>
                    </div>

                    <p className="mt-4">
                      Il a été convenu et arrêté ce qui suit conformément aux dispositions des articles L. 236-1 et
                      suivants du Code de commerce...
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collaboration Panel */}
        <div className="space-y-6">
          <Card className="border-border">
            <Tabs defaultValue="comments" className="w-full">
              <div className="border-b border-border px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="comments" className="flex-1">
                    Commentaires
                  </TabsTrigger>
                  <TabsTrigger value="annotations" className="flex-1">
                    Annotations
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="space-y-4 p-4">
                {/* Comment Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <AtSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Send className="mr-2 h-3 w-3" />
                      Envoyer
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {[
                    {
                      user: "Marie Dubois",
                      initials: "MD",
                      time: "Il y a 15 min",
                      comment: "La clause 4.2 nécessite une révision urgente. Le délai de 120 jours semble trop court.",
                      replies: 2,
                    },
                    {
                      user: "Pierre Martin",
                      initials: "PM",
                      time: "Il y a 1 heure",
                      comment: "J'ai vérifié les conditions préalables, tout semble conforme.",
                      replies: 0,
                    },
                    {
                      user: "Sophie Laurent",
                      initials: "SL",
                      time: "Il y a 3 heures",
                      comment: "Pouvons-nous ajouter une clause de confidentialité supplémentaire ?",
                      replies: 1,
                    },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.user}</span>
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.comment}</p>
                          {item.replies > 0 && (
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                              {item.replies} réponse{item.replies > 1 ? "s" : ""}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="annotations" className="space-y-4 p-4">
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      page: 1,
                      user: "Marie Dubois",
                      initials: "MD",
                      text: "Délai à réviser",
                      time: "Il y a 30 min",
                    },
                    {
                      id: 2,
                      page: 3,
                      user: "Pierre Martin",
                      initials: "PM",
                      text: "Vérifier la conformité",
                      time: "Il y a 2 heures",
                    },
                    {
                      id: 3,
                      page: 5,
                      user: "Sophie Laurent",
                      initials: "SL",
                      text: "Clause manquante",
                      time: "Il y a 4 heures",
                    },
                  ].map((annotation) => (
                    <div
                      key={annotation.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {annotation.id}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{annotation.user}</span>
                          <Badge variant="secondary" className="text-xs">
                            Page {annotation.page}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{annotation.text}</p>
                        <span className="text-xs text-muted-foreground">{annotation.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Activity Feed */}
          <Card className="border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Activité récente</span>
              </div>
              <div className="space-y-3">
                {[
                  { user: "MD", action: "a ajouté un commentaire", time: "Il y a 15 min" },
                  { user: "PM", action: "a téléchargé le document", time: "Il y a 1h" },
                  { user: "SL", action: "a créé une annotation", time: "Il y a 3h" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                        {activity.user}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="text-muted-foreground">{activity.action}</span>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
