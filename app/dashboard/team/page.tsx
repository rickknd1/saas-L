import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const teamMembers = [
  {
    name: "Marie Dubois",
    email: "marie.dubois@cabinet.fr",
    role: "Avocat associé",
    status: "active",
    projects: 8,
    lastActive: "En ligne",
  },
  {
    name: "Pierre Martin",
    email: "pierre.martin@cabinet.fr",
    role: "Collaborateur",
    status: "active",
    projects: 12,
    lastActive: "En ligne",
  },
  {
    name: "Sophie Laurent",
    email: "sophie.laurent@cabinet.fr",
    role: "Juriste",
    status: "idle",
    projects: 6,
    lastActive: "Il y a 30 min",
  },
  {
    name: "Jean Dupont",
    email: "jean.dupont@cabinet.fr",
    role: "Avocat associé",
    status: "active",
    projects: 15,
    lastActive: "En ligne",
  },
  {
    name: "Claire Bernard",
    email: "claire.bernard@cabinet.fr",
    role: "Collaborateur",
    status: "offline",
    projects: 4,
    lastActive: "Il y a 2 jours",
  },
]

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Équipe</h1>
          <p className="text-muted-foreground">Gérez les membres de votre cabinet</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Inviter un membre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="text-2xl font-bold">3</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projets en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invitations en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher un membre..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Membres de l'équipe</CardTitle>
          <CardDescription>Tous les collaborateurs de votre cabinet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {member.status === "active" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Badge variant="secondary">{member.role}</Badge>
                    <p className="mt-1 text-sm text-muted-foreground">{member.projects} projets</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{member.lastActive}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                      <DropdownMenuItem>Modifier le rôle</DropdownMenuItem>
                      <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Retirer de l'équipe</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
