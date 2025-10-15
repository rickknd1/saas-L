"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Search, Filter, MoreVertical, Download, Share2, Trash2, Eye, Upload, Lock, Shield, AlertTriangle, Users, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { SecurityModal } from "@/components/security/security-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DocumentsPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [shareSettings, setShareSettings] = useState({
    accessLevel: "view",
    expirationDays: "30",
    requireAuth: true,
    notifyOnAccess: true,
  })
  const documents = [
    {
      id: "1",
      name: "Contrat de prestation - Client ABC",
      project: "Projet ABC Corp",
      version: "v3.2",
      size: "2.4 MB",
      lastModified: "Il y a 2 heures",
      modifiedBy: "Marie Dubois",
      status: "En révision",
      confidential: true,
    },
    {
      id: "2",
      name: "Conditions générales de vente 2025",
      project: "Refonte CGV",
      version: "v1.0",
      size: "1.8 MB",
      lastModified: "Il y a 5 heures",
      modifiedBy: "Jean Martin",
      status: "Validé",
      confidential: false,
    },
    {
      id: "3",
      name: "Accord de confidentialité - Partenaire XYZ",
      project: "Partenariat XYZ",
      version: "v2.1",
      size: "1.2 MB",
      lastModified: "Hier",
      modifiedBy: "Sophie Laurent",
      status: "En attente",
      confidential: true,
    },
    {
      id: "4",
      name: "Contrat de travail - Nouveau collaborateur",
      project: "Recrutement 2025",
      version: "v1.5",
      size: "980 KB",
      lastModified: "Il y a 2 jours",
      modifiedBy: "Pierre Durand",
      status: "Brouillon",
      confidential: true,
    },
    {
      id: "5",
      name: "Bail commercial - Local Paris 8ème",
      project: "Expansion bureaux",
      version: "v4.0",
      size: "3.1 MB",
      lastModified: "Il y a 3 jours",
      modifiedBy: "Marie Dubois",
      status: "Validé",
      confidential: false,
    },
    {
      id: "6",
      name: "Protocole d'accord transactionnel",
      project: "Litige Client DEF",
      version: "v2.3",
      size: "1.5 MB",
      lastModified: "Il y a 1 semaine",
      modifiedBy: "Jean Martin",
      status: "En révision",
      confidential: true,
    },
  ]

  const handleUpload = () => {
    setShowUploadModal(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Fichier trop volumineux", {
          description: "La taille maximale est de 50 MB.",
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadConfirm = () => {
    if (!selectedFile) {
      toast.error("Aucun fichier sélectionné", {
        description: "Veuillez sélectionner un fichier à téléverser.",
      })
      return
    }

    setShowUploadModal(false)
    toast.success("Document téléversé avec succès", {
      description: `"${selectedFile.name}" a été chiffré et ajouté à votre espace sécurisé.`,
      duration: 4000,
    })

    setTimeout(() => {
      toast.info("Analyse antivirus terminée", {
        description: "Aucune menace détectée. Le document est prêt à être partagé.",
        duration: 3000,
      })
    }, 2000)

    setSelectedFile(null)
  }

  const handleShare = (doc: any) => {
    setSelectedDocument(doc)
    setShowShareModal(true)
  }

  const handleShareConfirm = () => {
    setShowShareModal(false)
    toast.success("Lien de partage créé", {
      description: `Le document "${selectedDocument?.name}" a été partagé avec succès. Un email de notification a été envoyé.`,
      duration: 5000,
    })

    if (shareSettings.notifyOnAccess) {
      setTimeout(() => {
        toast.info("Notification activée", {
          description: "Vous recevrez un email à chaque consultation du document.",
        })
      }, 1500)
    }
  }

  const handleDownload = (doc: any) => {
    toast.info("Téléchargement démarré", {
      description: `Téléchargement de "${doc.name}" en cours...`,
    })

    setTimeout(() => {
      toast.success("Téléchargement terminé", {
        description: "Le document a été téléchargé et un journal d'audit a été créé.",
        duration: 4000,
      })
    }, 1500)
  }

  const handleDeleteInit = (doc: any) => {
    setSelectedDocument(doc)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false)
    toast.success("Document supprimé", {
      description: `"${selectedDocument?.name}" a été déplacé dans la corbeille. Restauration possible pendant 30 jours.`,
      duration: 5000,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validé":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "En révision":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "En attente":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "Brouillon":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Gérez tous vos documents juridiques en un seul endroit</p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Nouveau document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher un document..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total documents</CardDescription>
            <CardTitle className="text-3xl">156</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En révision</CardDescription>
            <CardTitle className="text-3xl text-blue-500">23</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Validés</CardDescription>
            <CardTitle className="text-3xl text-green-500">98</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-3xl text-yellow-500">35</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les documents</CardTitle>
          <CardDescription>{documents.length} documents trouvés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="font-medium hover:text-primary transition-colors truncate"
                      >
                        {doc.name}
                      </Link>
                      <Badge variant="secondary" className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                      {doc.confidential && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                          <Lock className="mr-1 h-3 w-3" />
                          Confidentiel
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{doc.project}</span>
                      <span>•</span>
                      <span>{doc.version}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>
                        Modifié {doc.lastModified} par {doc.modifiedBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/documents/${doc.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ouvrir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(doc)}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(doc)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInit(doc)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <SecurityModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        title="Téléverser un nouveau document"
        description="Le document sera automatiquement chiffré et analysé pour garantir votre sécurité."
        severity="info"
        confirmText="Téléverser"
        cancelText="Annuler"
        onConfirm={handleUploadConfirm}
        onCancel={() => setShowUploadModal(false)}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">
                {selectedFile ? selectedFile.name : "Glissez un fichier ici ou cliquez pour parcourir"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, DOC jusqu'à 50 MB"}
              </p>
            </label>
          </div>

          <Alert className="border-blue-500/50 bg-blue-500/5">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs space-y-2">
              <p><strong>Mesures de sécurité automatiques :</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Chiffrement AES-256 de bout en bout</li>
                <li>Analyse antivirus et anti-malware</li>
                <li>Traçabilité complète des accès</li>
                <li>Sauvegarde automatique chiffrée</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="docType">Type de document</Label>
            <Select defaultValue="contract">
              <SelectTrigger id="docType">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contrat</SelectItem>
                <SelectItem value="nda">Accord de confidentialité</SelectItem>
                <SelectItem value="terms">Conditions générales</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="markConfidential" defaultChecked />
            <label htmlFor="markConfidential" className="text-sm leading-relaxed">
              Marquer comme confidentiel (accès restreint aux membres autorisés uniquement)
            </label>
          </div>
        </div>
      </SecurityModal>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Partager le document</DialogTitle>
            <DialogDescription>
              Configurez les permissions et les options de sécurité pour le partage de ce document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedDocument?.confidential && (
              <Alert className="border-red-500/50 bg-red-500/5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-xs">
                  <strong>Document confidentiel :</strong> Ce document contient des informations sensibles. Assurez-vous de ne le partager qu'avec des personnes autorisées.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="shareEmail">Email du destinataire</Label>
              <Input id="shareEmail" type="email" placeholder="contact@cabinet.fr" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel">Niveau d'accès</Label>
              <Select
                value={shareSettings.accessLevel}
                onValueChange={(value) => setShareSettings({ ...shareSettings, accessLevel: value })}
              >
                <SelectTrigger id="accessLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Lecture seule</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="comment">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Lecture et commentaire</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Édition complète</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration du lien</Label>
              <Select
                value={shareSettings.expirationDays}
                onValueChange={(value) => setShareSettings({ ...shareSettings, expirationDays: value })}
              >
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="never">Jamais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium">Options de sécurité</p>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="requireAuth"
                    checked={shareSettings.requireAuth}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, requireAuth: checked as boolean })}
                  />
                  <label htmlFor="requireAuth" className="text-sm leading-relaxed">
                    Exiger une authentification pour accéder au document
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="notifyAccess"
                    checked={shareSettings.notifyOnAccess}
                    onCheckedChange={(checked) => setShareSettings({ ...shareSettings, notifyOnAccess: checked as boolean })}
                  />
                  <label htmlFor="notifyAccess" className="text-sm leading-relaxed">
                    Me notifier à chaque consultation du document
                  </label>
                </div>
              </div>
            </div>

            <Alert className="border-blue-500/50 bg-blue-500/5">
              <Shield className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs">
                Un journal d'audit complet sera maintenu pour tous les accès à ce document.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleShareConfirm}>
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <SecurityModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Supprimer le document"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedDocument?.name}" ? Cette action peut être annulée dans les 30 jours.`}
        severity="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        confirmButtonVariant="destructive"
      >
        {selectedDocument?.confidential && (
          <Alert className="border-red-500/50 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-xs">
              <strong>Attention :</strong> Ce document est marqué comme confidentiel. Sa suppression sera enregistrée dans le journal d'audit et une notification sera envoyée aux administrateurs.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Document :</span>
            <span className="font-medium">{selectedDocument?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taille :</span>
            <span className="font-medium">{selectedDocument?.size}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dernière modification :</span>
            <span className="font-medium">{selectedDocument?.lastModified}</span>
          </div>
        </div>
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Clock className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            Le document sera déplacé dans la corbeille et pourra être restauré pendant 30 jours avant suppression définitive.
          </AlertDescription>
        </Alert>
      </SecurityModal>
    </div>
  )
}
