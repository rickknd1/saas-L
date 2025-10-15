import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, FileText, Users, Clock, Share2, MoreVertical, Download, GitCompare, MessageSquare } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProjectChat } from "@/components/chat/project-chat"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Contrat de fusion ABC Corp</h1>
          <p className="text-muted-foreground">Révision et négociation du contrat de fusion</p>
        </div>
        <div className="flex items-center gap-2">
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
              <DropdownMenuItem>Modifier le projet</DropdownMenuItem>
              <DropdownMenuItem>Exporter</DropdownMenuItem>
              <DropdownMenuItem>Archiver</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">En révision</Badge>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">12</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Échéance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">15 Jan 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Discussion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents du projet</CardTitle>
                  <CardDescription>Tous les fichiers liés à ce dossier</CardDescription>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <FileText className="mr-2 h-4 w-4" />
                  Ajouter un document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Contrat_Fusion_v3.pdf",
                    size: "2.4 MB",
                    date: "Il y a 2 heures",
                    user: "Marie Dubois",
                  },
                  {
                    name: "Annexe_Financiere.pdf",
                    size: "1.8 MB",
                    date: "Il y a 5 heures",
                    user: "Pierre Martin",
                  },
                  {
                    name: "Due_Diligence_Report.pdf",
                    size: "3.2 MB",
                    date: "Hier",
                    user: "Sophie Laurent",
                  },
                  {
                    name: "Contrat_Fusion_v2.pdf",
                    size: "2.3 MB",
                    date: "Il y a 2 jours",
                    user: "Marie Dubois",
                  },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} • Modifié {doc.date} par {doc.user}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <GitCompare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ouvrir</DropdownMenuItem>
                          <DropdownMenuItem>Renommer</DropdownMenuItem>
                          <DropdownMenuItem>Partager</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Historique des actions sur ce projet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    user: "Marie Dubois",
                    action: "a ajouté un commentaire sur",
                    target: "Contrat_Fusion_v3.pdf",
                    time: "Il y a 15 min",
                    comment: "La clause 4.2 nécessite une révision urgente.",
                  },
                  {
                    user: "Pierre Martin",
                    action: "a comparé",
                    target: "v2 et v3 du contrat",
                    time: "Il y a 1 heure",
                  },
                  {
                    user: "Sophie Laurent",
                    action: "a téléchargé",
                    target: "Due_Diligence_Report.pdf",
                    time: "Il y a 3 heures",
                  },
                  {
                    user: "Jean Dupont",
                    action: "a modifié le statut en",
                    target: "En révision",
                    time: "Il y a 5 heures",
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed">
                        <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      {activity.comment && (
                        <div className="rounded-lg border border-border bg-muted/50 p-3">
                          <p className="text-sm text-muted-foreground">{activity.comment}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Membres de l'équipe</CardTitle>
                  <CardDescription>Collaborateurs sur ce projet</CardDescription>
                </div>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Inviter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Marie Dubois", role: "Avocat associé", email: "marie.dubois@cabinet.fr" },
                  { name: "Pierre Martin", role: "Collaborateur", email: "pierre.martin@cabinet.fr" },
                  { name: "Sophie Laurent", role: "Juriste", email: "sophie.laurent@cabinet.fr" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role} • {member.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Modifier le rôle</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Retirer du projet</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="h-[600px]">
            <ProjectChat
              projectId={id}
              projectName="Contrat de fusion ABC Corp"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
