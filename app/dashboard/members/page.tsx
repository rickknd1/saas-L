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
import { Search, UserPlus, MoreVertical, Shield, Crown, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useMembers, useMemberStats } from "@/hooks/use-members"

export default function MembersPage() {
  const { userId } = useAuth()
  const { members, isLoading } = useMembers(userId)
  const { stats, isLoading: statsLoading } = useMemberStats(userId)

  const getRoleIcon = (role: string) => {
    if (role === "OWNER") return Crown
    if (role === "EDITOR") return Shield
    return User
  }

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      OWNER: "Propriétaire",
      EDITOR: "Éditeur",
      VIEWER: "Membre",
    }
    return roleMap[role] || role
  }

  if (isLoading || statsLoading) {
    return <div className="space-y-6">Chargement...</div>
  }

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
            <div className="text-3xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.active || 0} actifs, {stats.pendingInvitations || 0} invitation(s) en attente</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membres actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Connectés récemment</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total projets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Projets collaboratifs</p>
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
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucun membre trouvé</div>
            ) : (
              members.map((member) => {
                const RoleIcon = getRoleIcon(member.role)
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.user.name
                            ? member.user.name.split(" ").map((n) => n[0]).join("")
                            : member.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.userId === userId ? "Vous" : (member.user.name || member.user.email)}
                          </p>
                          <Badge
                            variant="secondary"
                            className={
                              member.acceptedAt
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                            }
                          >
                            {member.acceptedAt ? "Actif" : "Invité"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-muted-foreground">{member.projectCount || 0} projets</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{getRoleName(member.role)}</span>
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
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
