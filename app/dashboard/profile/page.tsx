"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail, Phone, Briefcase, MapPin, CreditCard, Download,
  Trash2, AlertTriangle, Shield, Sparkles, Calendar, X, Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser, useUpdateUser } from "@/hooks/use-user"
import { SecurityModal } from "@/components/security/security-modal"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, refetch } = useUser()
  const { updateUser, isUpdating } = useUpdateUser()

  const [isEditing, setIsEditing] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    bio: "",
    organization: "",
  })

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role || "",
        bio: user.bio || "",
        organization: user.organization || "",
      })
    }
  }, [user])

  const isFreemium = user?.plan === "FREEMIUM"
  const isStandard = user?.plan === "STANDARD"

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user?.name) {
      const parts = user.name.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return user.name[0].toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || "U"
  }

  // Get full name
  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.name || user?.email || "Utilisateur"
  }

  // Handle form save
  const handleSave = async () => {
    try {
      await updateUser(formData)
      await refetch()
      setIsEditing(false)
      toast.success("Profil mis à jour", {
        description: "Vos informations ont été enregistrées avec succès.",
      })
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
      })
    }
  }

  // Gestion de l'annulation de l'abonnement
  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      // TODO: Appeler l'API pour annuler l'abonnement Stripe
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulation

      toast.success("Abonnement annulé", {
        description: "Votre abonnement sera résilié à la fin de la période actuelle.",
        duration: 6000,
      })
      setShowCancelModal(false)
      await refetch()
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible d'annuler l'abonnement. Veuillez réessayer.",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  // Export des données RGPD
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/users/me/export")

      if (!response.ok) {
        throw new Error("Échec de l'export des données")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `companion-data-export-${user?.email}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Export réussi", {
        description: "Vos données ont été téléchargées avec succès.",
      })
    } catch (error) {
      toast.error("Erreur d'export", {
        description: "Impossible d'exporter vos données. Veuillez réessayer.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Suppression du compte
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/users/me", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Échec de la suppression du compte")
      }

      toast.success("Compte supprimé", {
        description: "Votre compte a été supprimé. Redirection...",
      })

      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      toast.error("Erreur de suppression", {
        description: "Impossible de supprimer votre compte. Veuillez réessayer.",
      })
      setIsDeleting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Vous devez être connecté pour voir cette page.</p>
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et professionnelles</p>
      </div>

      {/* Profile Header Card */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-primary/10 text-4xl text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Changer la photo
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{getFullName()}</h2>
                <p className="text-muted-foreground">
                  {user.bio || user.role || "Avocat"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.organization && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{user.organization}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {user.role && (
                  <Badge className="bg-primary/10 text-primary">{user.role}</Badge>
                )}
                <Badge className={isFreemium ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent-foreground"}>
                  Plan {isFreemium ? "Freemium" : "Standard"}
                </Badge>
                <Badge className="bg-green-500/10 text-green-600">Actif</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input id="email" type="email" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Fonction</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionnez votre fonction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Avocat">Avocat</SelectItem>
                  <SelectItem value="Associé">Associé</SelectItem>
                  <SelectItem value="Collaborateur">Collaborateur</SelectItem>
                  <SelectItem value="Juriste">Juriste d'entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Cabinet / Organisation</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              disabled={!isEditing}
              placeholder="Nom de votre cabinet"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biographie professionnelle</Label>
            <Textarea
              id="bio"
              placeholder="Parlez-nous de votre parcours et expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[120px]"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Projets actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user._count?.ownedProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Projets possédés</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user._count?.documents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Documents uploadés</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(user._count?.comments || 0) + (user._count?.messages || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Commentaires & messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Management - Module C */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Abonnement & Facturation</CardTitle>
          </div>
          <CardDescription>Gérez votre abonnement et consultez vos factures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFreemium ? (
            <>
              <Alert className="border-accent/50 bg-accent/5">
                <Sparkles className="h-4 w-4 text-accent" />
                <AlertDescription>
                  Vous utilisez actuellement le plan <strong>Freemium</strong>. Passez au plan Standard pour bénéficier de projets et documents illimités, de la collaboration avancée et du support prioritaire.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link href="/pricing">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Passer au Standard - 23€/mois
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan actuel</span>
                  <Badge className="bg-accent/10 text-accent-foreground">Standard - 23€/mois</Badge>
                </div>
                {user.subscription && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Prochain paiement</span>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(user.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Statut</span>
                      <Badge className="bg-green-500/10 text-green-600">
                        {user.subscription.status === 'ACTIVE' ? 'Actif' : user.subscription.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <Alert className="border-blue-500/50 bg-blue-500/5">
                <Shield className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-xs">
                  Vos paiements sont sécurisés par Stripe. Vous pouvez annuler à tout moment.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowCancelModal(true)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler l'abonnement
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* RGPD - Data Privacy - Module C */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Confidentialité & Données</CardTitle>
          </div>
          <CardDescription>Gérez vos données personnelles conformément au RGPD</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-500/50 bg-blue-500/5">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs">
              Conformément au RGPD, vous avez le droit d'accéder, de modifier et de supprimer vos données personnelles. Toutes vos données sont chiffrées et stockées en France.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-medium mb-2">Exporter mes données</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Téléchargez une copie complète de toutes vos données (profil, projets, documents, messages) au format JSON.
              </p>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter mes données
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <h4 className="font-medium mb-2 text-destructive">Zone de danger</h4>
              <p className="text-sm text-muted-foreground mb-3">
                La suppression de votre compte est <strong>irréversible</strong>. Toutes vos données, projets et documents seront définitivement supprimés.
              </p>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Modal */}
      <SecurityModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        title="Annuler l'abonnement"
        description="Êtes-vous sûr de vouloir annuler votre abonnement Standard ?"
        severity="warning"
        confirmText={isCanceling ? "Annulation..." : "Confirmer l'annulation"}
        cancelText="Conserver mon abonnement"
        onConfirm={handleCancelSubscription}
        onCancel={() => setShowCancelModal(false)}
        confirmButtonVariant="destructive"
      >
        <Alert className="border-yellow-500/50 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-xs">
            Votre abonnement sera résilié à la fin de la période actuelle. Vous conserverez l'accès à toutes les fonctionnalités jusqu'à cette date.
          </AlertDescription>
        </Alert>
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium">Ce que vous perdrez :</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Projets illimités (retour à 1 projet max)</li>
            <li>• Documents illimités (retour à 5 documents max)</li>
            <li>• Collaboration avancée et chat temps réel</li>
            <li>• Support prioritaire 24/7</li>
          </ul>
        </div>
      </SecurityModal>

      {/* Delete Account Modal */}
      <SecurityModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Supprimer définitivement mon compte"
        description="Cette action est irréversible. Toutes vos données seront définitivement supprimées."
        severity="danger"
        confirmText={isDeleting ? "Suppression..." : "Supprimer mon compte"}
        cancelText="Annuler"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        confirmButtonVariant="destructive"
      >
        <Alert className="border-red-500/50 bg-red-500/5">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-xs">
            <strong>Attention :</strong> Cette action est définitive et irréversible. Toutes vos données seront supprimées immédiatement.
          </AlertDescription>
        </Alert>
        <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Données qui seront supprimées :</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Votre profil et informations personnelles</li>
            <li>• Tous vos projets et documents</li>
            <li>• Historique de collaboration et messages</li>
            <li>• Factures et données de paiement</li>
          </ul>
        </div>
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Shield className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            Nous vous recommandons d'exporter vos données avant de supprimer votre compte.
          </AlertDescription>
        </Alert>
      </SecurityModal>
    </div>
  )
}
