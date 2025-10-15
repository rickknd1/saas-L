"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Forcer le rendu dynamique pour éviter les erreurs SSR avec react-pdf
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Download,
  Share2,
  MoreVertical,
  Send,
  AtSign,
  Paperclip,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PDFViewer } from "@/components/documents/pdf-viewer-wrapper"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  type: string
  size: number
  version: number
  createdAt: string
  updatedAt: string
  projectId: string
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
  project: {
    id: string
    name: string
    owner: {
      id: string
      name: string | null
      email: string
    }
    members: Array<{
      id: string
      role: string
      user: {
        id: string
        name: string | null
        email: string
      }
    }>
  }
}

interface Comment {
  id: string
  content: string
  documentId: string
  userId: string
  page: number | null
  position: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = use(params)
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  const [newComment, setNewComment] = useState("")

  // Récupérer les détails du document
  const { data: document, isLoading: isLoadingDoc, error: docError } = useQuery<Document>({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${documentId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors du chargement du document')
      }
      const data = await res.json()
      return data.document
    },
    enabled: !!documentId,
  })

  // Récupérer les commentaires
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['comments', documentId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        credentials: 'include',
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.comments || []
    },
    enabled: !!documentId,
  })

  // Mutation pour ajouter un commentaire
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du commentaire')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', documentId] })
      setNewComment("")
      toast.success('Commentaire ajouté')
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message })
    },
  })

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/download`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erreur lors du téléchargement')
      const data = await res.json()
      window.open(data.url, '_blank')
      toast.success('Téléchargement démarré')
    } catch (error: any) {
      toast.error('Erreur', { description: error.message })
    }
  }

  const handleSendComment = () => {
    if (!newComment.trim() || addCommentMutation.isPending) return
    addCommentMutation.mutate(newComment.trim())
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / (3600000 * 24))

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  // États de chargement
  if (isLoadingDoc) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // État d'erreur
  if (docError || !document) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux documents
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {docError?.message || 'Document non trouvé ou accès refusé'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Récupérer tous les collaborateurs du projet
  const allProjectMembers = [
    {
      id: document.project.owner.id,
      name: document.project.owner.name || document.project.owner.email,
      initials: getInitials(document.project.owner.name, document.project.owner.email),
      status: 'active',
    },
    ...document.project.members.map(member => ({
      id: member.user.id,
      name: member.user.name || member.user.email,
      initials: getInitials(member.user.name, member.user.email),
      status: 'active',
    })),
  ]

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient mesh background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link
              href={`/dashboard/projects/${document.projectId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au projet {document.project.name}
            </Link>
            <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">{document.name}</h1>
          <p className="text-muted-foreground">
            Modifié {formatTime(document.updatedAt)} par{' '}
            {document.uploadedBy.name || document.uploadedBy.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
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
        <Card className="glass-premium border-glow">
          <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Collaborateurs du projet</span>
          </div>
          <div className="flex items-center gap-2">
            {allProjectMembers.slice(0, 5).map((user) => (
              <div key={user.id} className="relative" title={user.name}>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
            {allProjectMembers.length > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                +{allProjectMembers.length - 5}
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <Card className="card-premium border-glow">
            <CardContent className="p-4">
              <PDFViewer documentId={documentId} documentTitle={document.name} />
            </CardContent>
          </Card>
        </div>

          {/* Collaboration Panel */}
          <div className="space-y-6">
            <Card className="glass-premium border-glow">
            <Tabs defaultValue="comments" className="w-full">
              <div className="border-b border-border px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="comments" className="flex-1">
                    Commentaires ({comments.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="space-y-4 p-4">
                {/* Comment Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={addCommentMutation.isPending}
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
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSendComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-3 w-3" />
                      )}
                      Envoyer
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {isLoadingComments ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun commentaire</p>
                    <p className="text-xs text-muted-foreground mt-1">Soyez le premier à commenter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-2 rounded-lg border border-border p-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {getInitials(comment.user.name, comment.user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {comment.user.name || comment.user.email}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {comment.content}
                            </p>
                            {comment.page && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Page {comment.page}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

            {/* Info Card */}
            <Card className="glass-premium border-glow">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Informations</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v{document.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taille</span>
                  <span className="font-medium">
                    {(document.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{document.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé</span>
                  <span className="font-medium">
                    {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
