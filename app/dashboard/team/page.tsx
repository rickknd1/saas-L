"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useMembers, useMemberStats } from "@/hooks/use-members"

export default function TeamPage() {
  const { userId } = useAuth()
  const { members, isLoading } = useMembers(userId)
  const { stats, isLoading: statsLoading } = useMemberStats(userId)

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      OWNER: "Propriétaire",
      EDITOR: "Éditeur",
      VIEWER: "Membre",
    }
    return roleMap[role] || "Membre"
  }

  const getStatusDisplay = (member: any) => {
    if (member.acceptedAt) {
      // Check if last login was recent
      if (member.user.lastLoginAt) {
        const lastLogin = new Date(member.user.lastLoginAt)
        const hoursSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60)
        if (hoursSinceLogin < 1) return { status: "active", text: "En ligne" }
        if (hoursSinceLogin < 24) return { status: "idle", text: `Il y a ${Math.floor(hoursSinceLogin)}h` }
      }
      return { status: "offline", text: "Hors ligne" }
    }
    return { status: "pending", text: "Invitation en attente" }
  }

  if (isLoading || statsLoading) {
    return <div className="space-y-6">Chargement...</div>
  }

  return (
    <div className="relative min-h-screen p-6">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">
            Équipe
          </h1>
          <p className="text-muted-foreground text-lg">Gérez les membres de votre cabinet</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Inviter un membre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card className="card-premium border-glow group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Total membres</CardDescription>
            <CardTitle className="text-4xl font-bold text-primary">{stats.total || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="card-premium border-glow group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Actifs</CardDescription>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <CardTitle className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.active || 0}</CardTitle>
            </div>
          </CardHeader>
        </Card>

        <Card className="card-premium border-glow group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Projets en cours</CardDescription>
            <CardTitle className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.totalProjects || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="card-premium border-glow group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
          <CardHeader className="pb-3">
            <CardDescription className="text-muted-foreground">Invitations en attente</CardDescription>
            <CardTitle className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingInvitations || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-premium mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher un membre..." className="pl-9 glass border-glow" />
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="card-premium border-glow">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Membres de l'équipe</CardTitle>
          <CardDescription>Tous les collaborateurs de votre cabinet</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Aucun membre trouvé</div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const statusInfo = getStatusDisplay(member)
                return (
                  <div key={member.id} className="flex items-center justify-between rounded-xl glass-premium hover-lift p-4 border-glow group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.user.name
                              ? member.user.name.split(" ").map((n) => n[0]).join("")
                              : member.user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {statusInfo.status === "active" && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.userId === userId ? "Vous" : (member.user.name || member.user.email)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {member.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <Badge variant="secondary" className="glass">{getRoleLabel(member.role)}</Badge>
                        <p className="mt-1 text-sm text-muted-foreground">{member.projectCount || 0} projets</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{statusInfo.text}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="glass hover-lift">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-premium border-glow">
                          <DropdownMenuItem className="cursor-pointer hover:glass">Voir le profil</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:glass">Modifier le rôle</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:glass">Envoyer un message</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-destructive/10">Retirer de l'équipe</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
