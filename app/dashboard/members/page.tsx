"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, UserPlus, Mail, MoreVertical, Shield, Crown, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function MembersPage() {
  const members = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@cabinet.fr",
      role: "Propriétaire",
      status: "Actif",
      projects: 12,
      lastActive: "En ligne",
      icon: Crown,
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie.martin@cabinet.fr",
      role: "Administrateur",
      status: "Actif",
      projects: 8,
      lastActive: "Il y a 5 min",
      icon: Shield,
    },
    {
      id: 3,
      name: "Pierre Dubois",
      email: "pierre.dubois@cabinet.fr",
      role: "Membre",
      status: "Actif",
      projects: 6,
      lastActive: "Il y a 2 heures",
      icon: User,
    },
    {
      id: 4,
      name: "Sophie Laurent",
      email: "sophie.laurent@cabinet.fr",
      role: "Membre",
      status: "Actif",
      projects: 4,
      lastActive: "Hier",
      icon: User,
    },
    {
      id: 5,
      name: "Thomas Bernard",
      email: "thomas.bernard@cabinet.fr",
      role: "Membre",
      status: "Invité",
      projects: 0,
      lastActive: "Invitation envoyée",
      icon: User,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membres de l'équipe</h1>
          <p className="text-muted-foreground">Gérez les accès et les rôles de votre organisation</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un membre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un nouveau membre</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email pour ajouter un membre à votre organisation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Adresse email</Label>
                <Input id="inviteEmail" type="email" placeholder="nom@exemple.fr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteRole">Rôle</Label>
                <Select defaultValue="member">
                  <SelectTrigger id="inviteRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="member">Membre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Annuler</Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Envoyer l'invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total des membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">4 actifs, 1 invitation en attente</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">Accès complet à l'organisation</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membres actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">Connectés ce mois-ci</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher un membre..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="owner">Propriétaire</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="member">Membre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => {
              const RoleIcon = member.icon
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        <Badge
                          variant="secondary"
                          className={
                            member.status === "Invité"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-green-500/10 text-green-600"
                          }
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-muted-foreground">{member.projects} projets</p>
                        <p className="text-xs text-muted-foreground">• {member.lastActive}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                      <RoleIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{member.role}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Modifier le rôle</DropdownMenuItem>
                        <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                        <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Retirer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Invitations en attente</CardTitle>
          <CardDescription>Invitations envoyées en attente d'acceptation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">thomas.bernard@cabinet.fr</p>
                  <p className="text-sm text-muted-foreground">Invité en tant que Membre • Il y a 2 jours</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Renvoyer
                </Button>
                <Button variant="ghost" size="sm">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
