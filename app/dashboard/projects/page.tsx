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
import { PLAN_LIMITS } from "@/lib/plan-manager"
import { useState } from "react"
import { toast } from "sonner"
import { SecurityModal } from "@/components/security/security-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const projects = [
  {
    id: 1,
    name: "Contrat de fusion ABC Corp",
    description: "Révision et négociation du contrat de fusion",
    status: "En révision",
    members: 2,
    documents: 12,
    lastUpdate: "Il y a 2 heures",
    dueDate: "15 Jan 2025",
    confidential: true,
  },
  {
    id: 2,
    name: "Accord de confidentialité XYZ",
    description: "NDA pour partenariat stratégique",
    status: "En attente",
    members: 1,
    documents: 5,
    lastUpdate: "Il y a 5 heures",
    dueDate: "20 Jan 2025",
    confidential: true,
  },
  {
    id: 3,
    name: "Bail commercial - Paris 8ème",
    description: "Contrat de location commerciale",
    status: "Finalisé",
    members: 2,
    documents: 8,
    lastUpdate: "Hier",
    dueDate: "10 Jan 2025",
    confidential: false,
  },
]

export default function ProjectsPage() {
  const { isFreemium, isLoading } = useUserPlan()
  const projectCount = projects.length
  const projectLimit = isFreemium ? PLAN_LIMITS.freemium.projects : PLAN_LIMITS.standard.projects

  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [shareEmail, setShareEmail] = useState("")
  const [shareSettings, setShareSettings] = useState({
    canEdit: false,
    canInvite: false,
    canDelete: false,
  })

  const handleShareProject = (project: any) => {
    setSelectedProject(project)
    setShowShareModal(true)
  }

  const handleShareConfirm = () => {
    if (!shareEmail) {
      toast.error("Email requis", {
        description: "Veuillez entrer l'adresse email du membre à inviter.",
      })
      return
    }

    setShowShareModal(false)
    toast.success("Invitation envoyée", {
      description: `Une invitation a été envoyée à ${shareEmail} pour rejoindre "${selectedProject?.name}".`,
      duration: 5000,
    })

    setTimeout(() => {
      toast.info("Notification envoyée", {
        description: "Le nouveau membre recevra un email avec les instructions d'accès.",
      })
    }, 1500)

    setShareEmail("")
    setShareSettings({ canEdit: false, canInvite: false, canDelete: false })
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">Gérez tous vos dossiers juridiques</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>

      {isFreemium && projectCount >= projectLimit - 1 && (
        <Alert className="border-accent/50 bg-accent/5">
          <AlertCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Vous utilisez{" "}
              <strong>
                {projectCount}/{projectLimit} projet{projectLimit > 1 ? "s" : ""}
              </strong>
              . Passez au plan Standard pour des projets illimités.
            </span>
            <Button variant="outline" size="sm" className="ml-4 shrink-0 bg-transparent" asChild>
              <Link href="/pricing">
                <Sparkles className="mr-2 h-3 w-3" />
                Passer au Standard
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher un projet..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="review">En révision</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Finalisé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="border-border transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg leading-tight">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:text-primary">
                        {project.name}
                      </Link>
                    </CardTitle>
                    {project.confidential && (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        <Lock className="mr-1 h-3 w-3" />
                        Confidentiel
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{project.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>Ouvrir</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageMembers(project)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Gérer les membres
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareProject(project)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Partager
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProject(project)}>
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
                  className={
                    project.status === "En révision"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : project.status === "Finalisé"
                        ? ""
                        : project.status === "Brouillon"
                          ? "bg-muted text-muted-foreground hover:bg-muted"
                          : "bg-accent/10 text-accent hover:bg-accent/20"
                  }
                >
                  {project.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{project.lastUpdate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span>{project.documents}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.members}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{project.dueDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share/Invite Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Inviter un membre au projet</DialogTitle>
            <DialogDescription>
              Partagez l'accès à ce projet avec un collègue ou un collaborateur externe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedProject?.confidential && (
              <Alert className="border-red-500/50 bg-red-500/5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-xs">
                  <strong>Projet confidentiel :</strong> Ce projet contient des informations sensibles. Assurez-vous que le nouveau membre a l'autorisation nécessaire.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email du membre</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="collaborateur@cabinet.fr"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">Permissions</p>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canEdit"
                    checked={shareSettings.canEdit}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, canEdit: checked as boolean })}
                  />
                  <label htmlFor="canEdit" className="text-sm leading-relaxed">
                    Peut modifier les documents du projet
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canInvite"
                    checked={shareSettings.canInvite}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, canInvite: checked as boolean })}
                  />
                  <label htmlFor="canInvite" className="text-sm leading-relaxed">
                    Peut inviter d'autres membres
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="canDelete"
                    checked={shareSettings.canDelete}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, canDelete: checked as boolean })}
                  />
                  <label htmlFor="canDelete" className="text-sm leading-relaxed">
                    Peut supprimer des documents (nécessite confirmation)
                  </label>
                </div>
              </div>
            </div>

            <Alert className="border-blue-500/50 bg-blue-500/5">
              <Shield className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs">
                Le nouveau membre recevra un email d'invitation sécurisé. Toutes ses actions seront enregistrées dans le journal d'audit.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowShareModal(false)
              setShareEmail("")
            }}>
              Annuler
            </Button>
            <Button onClick={handleShareConfirm}>
              <UserPlus className="mr-2 h-4 w-4" />
              Envoyer l'invitation
            </Button>
          </DialogFooter>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gérer les membres - {selectedProject?.name}</DialogTitle>
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
              {/* Mock members list */}
              {[
                { name: "Jean Dupont", email: "jean.dupont@cabinet.fr", role: "Propriétaire", canRemove: false },
                { name: "Marie Dubois", email: "marie.dubois@cabinet.fr", role: "Éditeur", canRemove: true },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{member.role}</Badge>
                    {member.canRemove && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          toast.success("Membre retiré", {
                            description: `${member.name} n'a plus accès au projet.`,
                          })
                        }}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowMembersModal(false)
                handleShareProject(selectedProject)
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Inviter un nouveau membre
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowMembersModal(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
