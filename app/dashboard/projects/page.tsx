"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, FolderOpen, Users, Clock, MoreVertical, AlertCircle, Sparkles, Lock, Shield, Share2, Trash2, UserPlus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserPlan } from "@/hooks/use-user-plan"
import { useAuth } from "@/hooks/use-auth"
import { useProjects } from "@/hooks/use-projects"
import { useState } from "react"
import { toast } from "sonner"
import { SecurityModal } from "@/components/security/security-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InviteMemberDialog } from "@/components/projects/invite-member-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { UpgradeDialog } from "@/components/billing/upgrade-dialog"
import { useRouter } from "next/navigation"
import { PLAN_LIMITS } from "@/lib/plan-manager"

export default function ProjectsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userId } = useAuth()
  const { plan, isFreemium, isLoading: planLoading } = useUserPlan()
  const { projects, isLoading: projectsLoading } = useProjects(userId)

  const projectCount = projects.length
  const projectLimit = PLAN_LIMITS[plan].projects
  const isLoading = planLoading || projectsLoading
  const hasReachedLimit = isFreemium && projectCount >= projectLimit

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Il y a quelques minutes"
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`
    if (diffDays < 2) return "Hier"
    return `Il y a ${diffDays} jours`
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: "Brouillon",
      IN_REVIEW: "En révision",
      PENDING: "En attente",
      COMPLETED: "Finalisé",
      ARCHIVED: "Archivé",
    }
    return statusMap[status] || status
  }

  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  const handleNewProject = () => {
    if (hasReachedLimit) {
      setShowUpgradeDialog(true)
    } else {
      router.push("/dashboard/projects/new")
    }
  }

  const handleShareProject = (project: any) => {
    setSelectedProject(project)
    setShowInviteDialog(true)
  }

  const handleInviteSuccess = () => {
    setShowInviteDialog(false)
    queryClient.invalidateQueries({ queryKey: ["projects"] })
  }

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false)
    toast.success("Projet supprimé", {
      description: `Le projet "${selectedProject?.name}" a été supprimé. Restauration possible pendant 30 jours.`,
      duration: 5000,
    })

    if (selectedProject?.confidential) {
      setTimeout(() => {
        toast.info("Audit de sécurité", {
          description: "La suppression d'un projet confidentiel a été enregistrée dans le journal d'audit.",
          duration: 4000,
        })
      }, 1500)
    }
  }

  const handleManageMembers = (project: any) => {
    setSelectedProject(project)
    setShowMembersModal(true)
  }

  if (isLoading) {
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
            Projets
          </h1>
          <p className="text-muted-foreground text-lg">Gérez tous vos dossiers juridiques</p>
        </div>
        <Button
          onClick={handleNewProject}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {isFreemium && projectCount >= projectLimit - 1 && (
        <Alert className="border-accent/50 bg-accent/5 glass mb-6">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Vous utilisez{" "}
              <strong>
                {projectCount}/{projectLimit} projets
              </strong>
              . Passez au plan Standard pour des projets illimités.
            </span>
            <Button variant="outline" size="sm" className="ml-4 shrink-0 glass hover-lift" asChild>
              <Link href="/dashboard/upgrade">
                <Sparkles className="mr-2 h-3 w-3" />
                Passer au Standard
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="card-premium mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher un projet..." className="pl-9 glass border-glow" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48 glass border-glow">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="glass-premium border-glow">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="review">En révision</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Finalisé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto glass hover-lift">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectsLoading ? (
          <div className="col-span-full text-center text-muted-foreground">Chargement...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">Aucun projet trouvé</div>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="card-premium border-glow group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg leading-tight font-serif">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:text-primary transition-colors">
                        {project.name}
                      </Link>
                    </CardTitle>
                    {project.confidential && (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 glass">
                        <Lock className="mr-1 h-3 w-3" />
                        Confidentiel
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{project.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 glass hover-lift">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-premium border-glow">
                    <DropdownMenuItem asChild className="cursor-pointer hover:glass">
                      <Link href={`/dashboard/projects/${project.id}`}>Ouvrir</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageMembers(project)} className="cursor-pointer hover:glass">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Gérer les membres
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareProject(project)} className="cursor-pointer hover:glass">
                      <Share2 className="mr-2 h-4 w-4" />
                      Partager
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-destructive/10" onClick={() => handleDeleteProject(project)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={project.status === "Finalisé" ? "secondary" : "default"}
                  className={`glass ${
                    project.status === "En révision"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : project.status === "Finalisé"
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        : project.status === "Brouillon"
                          ? "bg-muted text-muted-foreground hover:bg-muted"
                          : "bg-accent/10 text-accent hover:bg-accent/20"
                  }`}
                >
                  {project.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{project.lastUpdate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span>{project._count.documents}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project._count.members}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{project.deadline ? new Date(project.deadline).toLocaleDateString("fr-FR") : "Aucune échéance"}</span>
                </div>
              </div>
            </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invite Member Dialog */}
      {selectedProject && (
        <InviteMemberDialog
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          onInviteSuccess={handleInviteSuccess}
          trigger={null}
        />
      )}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px] glass-premium border-glow">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Inviter un membre</DialogTitle>
                <DialogDescription>
                  Invitez un collaborateur à rejoindre le projet "{selectedProject.name}"
                </DialogDescription>
              </DialogHeader>
              {selectedProject.confidential && (
                <Alert className="border-red-500/50 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-xs">
                    <strong>Projet confidentiel :</strong> Ce projet contient des informations sensibles. Assurez-vous que le nouveau membre a l'autorisation nécessaire.
                  </AlertDescription>
                </Alert>
              )}
              <InviteMemberDialog
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                onInviteSuccess={handleInviteSuccess}
                trigger={
                  <Button className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Ouvrir le formulaire d'invitation
                  </Button>
                }
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Project Modal */}
      <SecurityModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Supprimer le projet"
        description={`Êtes-vous sûr de vouloir supprimer le projet "${selectedProject?.name}" ? Cette action peut être annulée dans les 30 jours.`}
        severity="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        confirmButtonVariant="destructive"
      >
        {selectedProject?.confidential && (
          <Alert className="border-red-500/50 bg-red-500/5">
            <Lock className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-xs">
              <strong>Projet confidentiel :</strong> La suppression de ce projet sera enregistrée dans le journal d'audit et une notification sera envoyée aux administrateurs.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Documents :</span>
            <span className="font-medium">{selectedProject?.documents} documents</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Membres :</span>
            <span className="font-medium">{selectedProject?.members} membres</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dernière activité :</span>
            <span className="font-medium">{selectedProject?.lastUpdate}</span>
          </div>
        </div>
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Shield className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            Tous les documents et données du projet seront archivés et pourront être restaurés pendant 30 jours.
          </AlertDescription>
        </Alert>
      </SecurityModal>

      {/* Members Management Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="sm:max-w-[600px] glass-premium border-glow">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Gérer les membres - {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Visualisez et gérez les accès au projet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedProject?.confidential && (
              <Alert className="border-yellow-500/50 bg-yellow-500/5">
                <Lock className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs">
                  <strong>Projet confidentiel :</strong> Toutes les modifications d'accès sont enregistrées dans le journal d'audit.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {/* TODO: Integrate dynamic members list with project-specific API endpoint */}
              {selectedProject?._count?.members > 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  <p className="font-medium">{selectedProject._count.members} membre{selectedProject._count.members > 1 ? 's' : ''} dans ce projet</p>
                  <p className="text-sm mt-1">Fonctionnalité de gestion des membres en cours d'implémentation</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>Aucun membre dans ce projet</p>
                </div>
              )}
            </div>

            {selectedProject && (
              <InviteMemberDialog
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                onInviteSuccess={() => {
                  setShowMembersModal(false)
                  queryClient.invalidateQueries({ queryKey: ["projects"] })
                }}
                trigger={
                  <Button variant="outline" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inviter un nouveau membre
                  </Button>
                }
              />
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowMembersModal(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature="créer un nouveau projet"
        currentUsage={projectCount}
        limit={projectLimit}
        usageLabel="projet"
      />
    </div>
  )
}
