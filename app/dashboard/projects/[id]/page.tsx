"use client"

import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, FileText, Users, Clock, Share2, MoreVertical, Download, GitCompare, MessageSquare, Eye, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProjectChat } from "@/components/chat/project-chat"
import { DocumentUpload } from "@/components/documents/document-upload"
import { PDFViewer } from "@/components/documents/pdf-viewer-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useProject } from "@/hooks/use-project"
import { InviteMemberDialog } from "@/components/projects/invite-member-dialog"
import { useUserPlan } from "@/hooks/use-user-plan"
import { PLAN_LIMITS } from "@/lib/plan-manager"
import { UpgradeDialog } from "@/components/billing/upgrade-dialog"

interface Document {
  id: string
  name: string
  type: string
  size: number
  version: number
  createdAt: string
  updatedAt: string
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
}

// Mapping des statuts en français
const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  IN_PROGRESS: { label: 'En cours', variant: 'default' },
  REVIEW: { label: 'En révision', variant: 'default' },
  COMPLETED: { label: 'Terminé', variant: 'default' },
  ARCHIVED: { label: 'Archivé', variant: 'secondary' },
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params avec React.use() pour Next.js 15
  const { id: projectId } = use(params)

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState("")
  const [upgradeLimit, setUpgradeLimit] = useState(0)
  const [upgradeCurrentUsage, setUpgradeCurrentUsage] = useState(0)
  const [upgradeUsageLabel, setUpgradeUsageLabel] = useState("")

  // Récupérer l'utilisateur connecté
  const { userId, isLoading: isAuthLoading } = useAuth()
  const { plan, isFreemium } = useUserPlan()

  // Récupérer les détails du projet
  const { project, isLoading: isProjectLoading, error: projectError, refetch: refetchProject } = useProject(projectId, userId)

  // Récupérer les documents du projet
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useQuery<Document[]>({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/documents?projectId=${projectId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des documents')
      }
      const data = await res.json()
      return data.documents || []
    },
    enabled: !!projectId,
  })

  const handleUploadComplete = (document: any) => {
    refetchDocuments()
    setUploadDialogOpen(false)
    toast.success('Document uploadé', {
      description: `${document.name} a été ajouté au projet`,
    })
  }

  const handleViewDocument = (documentId: string) => {
    setSelectedDocumentId(documentId)
    setViewerDialogOpen(true)
  }

  const handleDownloadDocument = async (documentId: string, documentName: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/download`, {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Erreur lors du téléchargement')
      }
      const data = await res.json()
      window.open(data.url, '_blank')
      toast.success('Téléchargement démarré')
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message,
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatDeadline = (dateString: string | null) => {
    if (!dateString) return 'Non définie'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  // États de chargement
  if (isAuthLoading || isProjectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // État d'erreur
  if (projectError || !project) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {projectError?.message || 'Projet non trouvé ou accès refusé'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[project.status] || { label: project.status, variant: 'default' }

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient mesh background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

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
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
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
        <Card className="card-premium border-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              {statusInfo.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="card-premium border-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{project._count.documents}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{project._count.members + 1}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Échéance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{formatDeadline(project.deadline)}</span>
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
          {/* Section Upload */}
          <Card className="glass-premium border-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ajouter un document</CardTitle>
                  <CardDescription>Uploadez un fichier PDF dans ce projet</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      const documentCount = project._count.documents
                      const documentLimit = PLAN_LIMITS[plan].documentsPerProject
                      if (isFreemium && documentCount >= documentLimit) {
                        e.preventDefault()
                        setUpgradeFeature("uploader des documents")
                        setUpgradeLimit(documentLimit)
                        setUpgradeCurrentUsage(documentCount)
                        setUpgradeUsageLabel("document")
                        setShowUpgradeDialog(true)
                      }
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Uploader un document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Uploader un document</DialogTitle>
                  </DialogHeader>
                  <DocumentUpload
                    projectId={projectId}
                    onUploadComplete={handleUploadComplete}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Section Documents List */}
          <Card className="glass-premium border-glow">
            <CardHeader>
              <CardTitle>Documents du projet</CardTitle>
              <CardDescription>
                {documents?.length || 0} fichier{(documents?.length || 0) > 1 ? 's' : ''} dans ce projet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.size)} • Version {doc.version} •
                            Uploadé le {formatDate(doc.createdAt)} par {doc.uploadedBy.name || doc.uploadedBy.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDocument(doc.id)}
                          title="Visualiser"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadDocument(doc.id, doc.name)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDocument(doc.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualiser
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadDocument(doc.id, doc.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <GitCompare className="mr-2 h-4 w-4" />
                              Comparer
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun document pour le moment</p>
                  <p className="text-sm mt-2">Uploadez votre premier document pour commencer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="glass-premium border-glow">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Historique des actions sur ce projet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p className="font-medium">Chargement de l'activité récente...</p>
                <p className="text-sm mt-2">Les actions sur ce projet apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="glass-premium border-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Membres de l'équipe</CardTitle>
                  <CardDescription>
                    {project._count.members + 1} collaborateur{project._count.members > 0 ? 's' : ''} sur ce projet
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const memberCount = project._count.members
                    const memberLimit = PLAN_LIMITS[plan].collaborators
                    if (isFreemium && memberCount >= memberLimit) {
                      setUpgradeFeature("ajouter des membres")
                      setUpgradeLimit(memberLimit)
                      setUpgradeCurrentUsage(memberCount)
                      setUpgradeUsageLabel("membre")
                      setShowUpgradeDialog(true)
                    } else {
                      setInviteDialogOpen(true)
                    }
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Inviter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {project.owner.name ? project.owner.name.charAt(0).toUpperCase() : project.owner.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {project.owner.id === userId ? "Vous" : (project.owner.name || project.owner.email)}
                      </p>
                      <p className="text-sm text-muted-foreground">{project.owner.email}</p>
                    </div>
                  </div>
                  <Badge>Propriétaire</Badge>
                </div>

                {/* Accepted Members */}
                {project.members
                  .filter(member => member.acceptedAt !== null)
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.user.name ? member.user.name.charAt(0).toUpperCase() : member.user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.userId === userId ? "Vous" : (member.user.name || member.user.email)}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}

                {/* Pending Invitations - Visible uniquement par le propriétaire */}
                {project.ownerId === userId &&
                 project.members.filter(member => member.acceptedAt === null).length > 0 && (
                  <>
                    <div className="my-4 border-t border-border pt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Invitations en attente ({project.members.filter(m => m.acceptedAt === null).length})
                      </p>
                    </div>
                    {project.members
                      .filter(member => member.acceptedAt === null)
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="opacity-60">
                              <AvatarFallback>
                                {member.user.name ? member.user.name.charAt(0).toUpperCase() : member.user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-muted-foreground">
                                {member.user.name || member.user.email}
                              </p>
                              <p className="text-sm text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
                            En attente
                          </Badge>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="h-[calc(100vh-20rem)]">
            <ProjectChat
              projectId={projectId}
              projectName={project.name}
            />
          </div>
        </TabsContent>
      </Tabs>
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={viewerDialogOpen} onOpenChange={setViewerDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDocumentId && documents?.find(d => d.id === selectedDocumentId)?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedDocumentId && (
            <PDFViewer
              documentId={selectedDocumentId}
              documentTitle={documents?.find(d => d.id === selectedDocumentId)?.name}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog - controlled */}
      {project && (
        <InviteMemberDialog
          projectId={projectId}
          projectName={project.name}
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onInviteSuccess={() => {
            setInviteDialogOpen(false)
            refetchProject()
          }}
        />
      )}

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature={upgradeFeature}
        currentUsage={upgradeCurrentUsage}
        limit={upgradeLimit}
        usageLabel={upgradeUsageLabel}
      />
    </div>
  )
}
