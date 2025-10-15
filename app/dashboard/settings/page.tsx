"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Users, Shield, Check, AlertTriangle, Lock, QrCode, Smartphone, Key, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserPlan } from "@/hooks/use-user-plan"
import { useBillingData } from "@/hooks/use-billing-data"
import { useAuth } from "@/hooks/use-auth"
import { useMemberStats } from "@/hooks/use-members"
import { useState, useEffect } from "react"
import { toast } from "sonner"
// resetUserPlan supprimé - géré automatiquement par React Query
import { SecurityModal } from "@/components/security/security-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { UpdatePaymentModal } from "@/components/billing/update-payment-modal"

export default function SettingsPage() {
  const router = useRouter()
  const { plan, isFreemium, isStandard, isLoading } = useUserPlan()
  const { user, userId, refetchUser } = useAuth()
  const { paymentMethods, invoices, isLoading: billingLoading } = useBillingData()
  const { stats, isLoading: statsLoading } = useMemberStats(userId)
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Éviter les erreurs d'hydratation en attendant le montage côté client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Refetch user data on mount to ensure plan is up to date
  useEffect(() => {
    refetchUser()
  }, [refetchUser])

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U'
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [settingDefaultCardId, setSettingDefaultCardId] = useState<string | null>(null)

  // Récupérer les détails de l'abonnement (seulement si historique existe)
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!userId) return

      try {
        const response = await fetch(`/api/billing/subscription?userId=${userId}`, {
          credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
        })
        const data = await response.json()

        if (response.ok && data.hasSubscription !== false) {
          // Ne set que si l'utilisateur a un historique d'abonnement
          setSubscriptionDetails(data)

          // APPROCHE STANDARD: L'utilisateur garde son plan jusqu'à expiration
          // On affichera un message "Prend fin le [DATE]" dans l'UI
          if (data.cancelAtPeriodEnd === true) {
            console.log("⚠️ Abonnement marqué pour annulation à la fin de période:", data.currentPeriodEnd)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'abonnement:", error)
      }
    }

    fetchSubscriptionDetails()
  }, [userId])

  const handleUpdatePaymentMethod = () => {
    if (!userId) {
      toast.error("Erreur", {
        description: "Utilisateur non connecté",
      })
      return
    }
    setShowPaymentModal(true)
  }

  const handleCancelSubscription = () => {
    setShowCancelModal(true)
  }

  const handleReactivateSubscription = async () => {
    if (!userId) {
      toast.error("Erreur", {
        description: "Utilisateur non connecté",
      })
      return
    }

    try {
      const response = await fetch("/api/billing/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.reactivated) {
          // Cas 1 : Réactivation directe (période encore valide)

          toast.success("Abonnement réactivé", {
            description: data.message,
            duration: 3000,
          })

          // Recharger la page pour afficher le plan Standard (React Query refetch auto)
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else if (data.checkoutUrl) {
          // Cas 2 : Période expirée, redirection vers Stripe
          window.location.href = data.checkoutUrl
        } else {
          throw new Error("Réponse invalide du serveur")
        }
      } else {
        throw new Error(data.error || "Erreur lors de la réactivation")
      }
    } catch (error) {
      console.error("Erreur réactivation:", error)
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible de réactiver l'abonnement",
      })
    }
  }

  const handleCancelConfirm = async () => {
    if (!userId) {
      toast.error("Erreur", {
        description: "Utilisateur non connecté",
      })
      return
    }

    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        setShowCancelModal(false)

        // APPROCHE STANDARD: L'utilisateur garde son plan jusqu'à expiration
        // Pas besoin de changer localStorage, juste recharger pour afficher le nouveau statut

        toast.success("Abonnement annulé", {
          description: data.message,
          duration: 5000,
        })

        // Recharger après un délai pour laisser le temps au toast
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(data.error || "Erreur lors de l'annulation")
      }
    } catch (error) {
      console.error("Erreur annulation:", error)
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible d'annuler l'abonnement",
      })
    }
  }

  const handlePasswordChange = () => {
    if (!passwordData.current) {
      toast.error("Mot de passe actuel requis", {
        description: "Veuillez entrer votre mot de passe actuel pour continuer.",
      })
      return
    }

    if (passwordData.new.length < 12) {
      toast.error("Mot de passe trop faible", {
        description: "Le nouveau mot de passe doit contenir au moins 12 caractères.",
      })
      return
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error("Mots de passe différents", {
        description: "Les mots de passe ne correspondent pas.",
      })
      return
    }

    setShowPasswordChangeModal(true)
  }

  const handlePasswordChangeConfirm = () => {
    setShowPasswordChangeModal(false)
    toast.success("Mot de passe modifié", {
      description: "Votre mot de passe a été changé avec succès. Un email de confirmation vous a été envoyé.",
      duration: 5000,
    })

    setTimeout(() => {
      toast.info("Sécurité renforcée", {
        description: "Toutes les autres sessions ont été déconnectées pour votre sécurité.",
        duration: 4000,
      })
    }, 1500)

    setPasswordData({ current: "", new: "", confirm: "" })
  }

  const handleActivate2FA = () => {
    setShow2FAModal(true)
  }

  const handle2FAConfirm = () => {
    if (verificationCode.length !== 6) {
      toast.error("Code invalide", {
        description: "Veuillez entrer le code à 6 chiffres de votre application d'authentification.",
      })
      return
    }

    setShow2FAModal(false)
    setTwoFAEnabled(true)
    setVerificationCode("")

    toast.success("2FA activé avec succès", {
      description: "Votre compte est maintenant protégé par l'authentification à deux facteurs.",
      duration: 5000,
    })

    setTimeout(() => {
      toast.info("Codes de récupération générés", {
        description: "10 codes de récupération ont été générés. Conservez-les en lieu sûr.",
        duration: 6000,
      })
    }, 1500)
  }

  const handleRevokeSession = (session: any) => {
    setSelectedSession(session)
    setShowRevokeModal(true)
  }

  const handleRevokeConfirm = () => {
    setShowRevokeModal(false)
    toast.success("Session révoquée", {
      description: `La session "${selectedSession?.device}" a été déconnectée avec succès.`,
      duration: 4000,
    })
  }

  const handleProfileSave = () => {
    toast.success("Profil mis à jour", {
      description: "Vos informations ont été enregistrées avec succès.",
      duration: 3000,
    })
  }

  const handleNotificationsSave = () => {
    toast.success("Préférences enregistrées", {
      description: "Vos préférences de notification ont été mises à jour.",
      duration: 3000,
    })
  }

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    if (!userId) {
      toast.error("Erreur", {
        description: "Utilisateur non connecté",
      })
      return
    }

    setSettingDefaultCardId(paymentMethodId)

    try {
      const response = await fetch("/api/billing/payment-methods/set-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
        body: JSON.stringify({ userId, paymentMethodId }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Carte mise à jour", {
          description: "Cette carte est maintenant votre méthode de paiement par défaut.",
          duration: 3000,
        })

        // Recharger pour afficher le nouveau statut
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(data.error || "Erreur lors de la modification")
      }
    } catch (error) {
      console.error("Erreur set default card:", error)
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible de modifier la carte par défaut",
      })
    } finally {
      setSettingDefaultCardId(null)
    }
  }

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!userId) {
      toast.error("Erreur", {
        description: "Utilisateur non connecté",
      })
      return
    }

    setDeletingCardId(paymentMethodId)

    try {
      const response = await fetch("/api/billing/payment-methods/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
        body: JSON.stringify({ userId, paymentMethodId }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Carte supprimée", {
          description: "La carte a été supprimée de votre compte.",
          duration: 3000,
        })

        // Recharger pour afficher la liste mise à jour
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur delete card:", error)
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible de supprimer cette carte",
      })
    } finally {
      setDeletingCardId(null)
    }
  }

  // Éviter hydration mismatch en rendant uniquement après montage
  if (!isMounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        <div className="h-4 w-96 animate-pulse rounded bg-muted"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-6">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-lg">Gérez vos préférences et votre compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="organization">Organisation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-xl text-primary">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Changer la photo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue={user?.firstName || ''} placeholder="Votre prénom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue={user?.lastName || ''} placeholder="Votre nom" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} placeholder="votre@email.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" defaultValue="" placeholder="+33 1 23 45 67 89" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Fonction</Label>
                <Select defaultValue="avocat">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avocat">Avocat</SelectItem>
                    <SelectItem value="associe">Associé</SelectItem>
                    <SelectItem value="collaborateur">Collaborateur</SelectItem>
                    <SelectItem value="juriste">Juriste d'entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous de vous..."
                  defaultValue="Avocat spécialisé en droit des affaires avec 15 ans d'expérience."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Annuler</Button>
                <Button onClick={handleProfileSave}>
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Informations de l'organisation</CardTitle>
              <CardDescription>Gérez les détails de votre cabinet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nom du cabinet</Label>
                <Input id="orgName" defaultValue="" placeholder="Nom de votre cabinet" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgAddress">Adresse</Label>
                <Input id="orgAddress" defaultValue="" placeholder="Adresse du cabinet" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Téléphone</Label>
                  <Input id="orgPhone" defaultValue="" placeholder="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Email</Label>
                  <Input id="orgEmail" type="email" defaultValue="" placeholder="contact@votrecabinet.fr" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSiret">SIRET</Label>
                <Input id="orgSiret" defaultValue="" placeholder="123 456 789 00012" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Annuler</Button>
                <Button>
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Membres de l'organisation</CardTitle>
              <CardDescription>Gérez les accès et les rôles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{stats?.total || 0} membre{(stats?.total || 0) > 1 ? 's' : ''} actif{(stats?.total || 0) > 1 ? 's' : ''}</p>
                      <p className="text-sm text-muted-foreground">{stats?.pendingInvitations || 0} invitation{(stats?.pendingInvitations || 0) > 1 ? 's' : ''} en attente</p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/team">Gérer les membres</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Préférences de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotif">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des emails pour les mises à jour importantes
                    </p>
                  </div>
                  <Switch id="emailNotif" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="commentNotif">Commentaires</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications lorsque quelqu'un commente vos documents
                    </p>
                  </div>
                  <Switch id="commentNotif" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mentionNotif">Mentions</Label>
                    <p className="text-sm text-muted-foreground">Notifications lorsque vous êtes mentionné</p>
                  </div>
                  <Switch id="mentionNotif" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectNotif">Projets</Label>
                    <p className="text-sm text-muted-foreground">Mises à jour sur vos projets</p>
                  </div>
                  <Switch id="projectNotif" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="teamNotif">Équipe</Label>
                    <p className="text-sm text-muted-foreground">Notifications sur l'activité de l'équipe</p>
                  </div>
                  <Switch id="teamNotif" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingNotif">Marketing</Label>
                    <p className="text-sm text-muted-foreground">Nouveautés et conseils</p>
                  </div>
                  <Switch id="marketingNotif" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationsSave}>
                  Enregistrer les préférences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Mot de passe</CardTitle>
              <CardDescription>Modifiez votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-500/50 bg-blue-500/5">
                <Shield className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-xs">
                  <strong>Sécurité :</strong> Pour votre protection, toutes les sessions actives seront déconnectées après le changement de mot de passe.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Minimum 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handlePasswordChange}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Authentification à deux facteurs</CardTitle>
              <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFAEnabled && (
                <Alert className="border-green-500/50 bg-green-500/5">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-xs">
                    <strong>Protection active :</strong> Votre compte est protégé par l'authentification à deux facteurs. Vous devrez entrer un code de vérification à chaque connexion.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">Protégez votre compte avec 2FA</p>
                </div>
                <Badge variant="secondary" className={twoFAEnabled ? "bg-green-500/10 text-green-500" : ""}>
                  {twoFAEnabled ? "Activé" : "Non activé"}
                </Badge>
              </div>

              {!twoFAEnabled ? (
                <Button variant="outline" onClick={handleActivate2FA}>
                  <Shield className="mr-2 h-4 w-4" />
                  Activer 2FA
                </Button>
              ) : (
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium">Options 2FA</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <QrCode className="mr-2 h-4 w-4" />
                      Voir les codes de récupération
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Désactiver 2FA
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Sessions actives</CardTitle>
              <CardDescription>Gérez vos sessions de connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { device: "Chrome sur Windows", location: "Paris, France", current: true, time: "Maintenant" },
                { device: "Safari sur iPhone", location: "Paris, France", current: false, time: "Il y a 2 heures" },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">
                      {session.device}
                      {session.current && (
                        <Badge className="ml-2 bg-green-500/10 text-green-600">Session actuelle</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.location} • {session.time}
                    </p>
                  </div>
                  {!session.current && (
                    <Button variant="outline" size="sm" onClick={() => handleRevokeSession(session)}>
                      Révoquer
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Abonnement actuel</CardTitle>
              <CardDescription>Gérez votre plan et votre facturation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isFreemium ? (
                <>
                  <div className="flex items-center justify-between rounded-lg border-2 border-border bg-muted/30 p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">Plan Freemium</h3>
                        <Badge variant="secondary">Actif</Badge>
                      </div>
                      <p className="mt-2 text-muted-foreground">1 projet maximum • Fonctionnalités de base</p>
                      <p className="mt-4 text-3xl font-bold">
                        0€<span className="text-base font-normal text-muted-foreground">/mois</span>
                      </p>
                    </div>
                    {/* Bouton différent selon historique d'abonnement */}
                    {subscriptionDetails ? (
                      <Button
                        onClick={handleReactivateSubscription}
                      >
                        Réactiver mon abonnement
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/dashboard/upgrade">Passer au Standard</Link>
                      </Button>
                    )}
                  </div>

                  {!subscriptionDetails && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
                      <p className="text-sm font-medium text-primary">
                        Passez au plan Standard pour 23€/mois et débloquez toutes les fonctionnalités
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">Plan Standard</h3>
                        {subscriptionDetails?.cancelAtPeriodEnd ? (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
                            Prend fin le {subscriptionDetails?.currentPeriodEnd ? new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary">Actif</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">Mensuel</p>
                      {subscriptionDetails?.cancelAtPeriodEnd ? (
                        <p className="mt-1 text-sm text-orange-600 font-medium">
                          Votre abonnement a été annulé. Vous conservez l'accès jusqu'au {subscriptionDetails?.currentPeriodEnd ? new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}.
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Votre abonnement se renouvellera automatiquement le {subscriptionDetails?.currentPeriodEnd ? new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                        </p>
                      )}
                      <p className="mt-4 text-3xl font-bold">
                        23€<span className="text-base font-normal text-muted-foreground">/mois</span>
                      </p>
                    </div>
                    {/* Bouton Réactiver si abonnement annulé */}
                    {subscriptionDetails?.cancelAtPeriodEnd && (
                      <Button
                        onClick={handleReactivateSubscription}
                      >
                        Réactiver mon abonnement
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section Paiement - Toujours afficher s'il y a eu un abonnement */}
          {(paymentMethods.length > 0 || subscriptionDetails) && (
            <Card className="card-premium border-glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-2xl">Méthodes de paiement</CardTitle>
                  <CardDescription>Gérez vos cartes bancaires enregistrées</CardDescription>
                </div>
                {isStandard && subscriptionDetails?.status === 'active' && !subscriptionDetails?.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    onClick={handleUpdatePaymentMethod}
                    disabled={isPortalLoading}
                  >
                    {isPortalLoading ? "Ouverture..." : "Ajouter une carte"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-sm text-muted-foreground">Chargement des cartes...</p>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                          method.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className={`h-5 w-5 ${method.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{method.brand} •••• {method.last4}</span>
                              {method.isDefault && (
                                <Badge className="bg-primary/10 text-primary">Par défaut</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Expire {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && isStandard && subscriptionDetails?.status === 'active' && !subscriptionDetails?.cancelAtPeriodEnd && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefaultCard(method.id)}
                              disabled={settingDefaultCardId === method.id || deletingCardId !== null}
                            >
                              {settingDefaultCardId === method.id ? "Mise à jour..." : "Définir par défaut"}
                            </Button>
                          )}
                          {!method.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCard(method.id)}
                              disabled={deletingCardId === method.id || settingDefaultCardId !== null}
                            >
                              {deletingCardId === method.id ? "Suppression..." : "Supprimer"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground mb-2">Aucune carte enregistrée</p>
                    <p className="text-xs text-muted-foreground mb-4">Ajoutez une carte pour gérer vos paiements</p>
                    {isStandard && subscriptionDetails?.status === 'active' && !subscriptionDetails?.cancelAtPeriodEnd && (
                      <Button
                        variant="outline"
                        onClick={handleUpdatePaymentMethod}
                        disabled={isPortalLoading}
                      >
                        {isPortalLoading ? "Ouverture..." : "Ajouter une carte"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Factures - Toujours afficher s'il y a eu un abonnement */}
          {(invoices.length > 0 || subscriptionDetails) && (
            <Card className="card-premium border-glow" data-section="invoices">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Factures</CardTitle>
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                          <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                          <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm">{invoice.date}</td>
                            <td className="py-3 text-sm font-medium">{invoice.amount} {invoice.currency}</td>
                            <td className="py-3 text-sm">
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-right">
                              {invoice.pdfUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    Voir
                                  </a>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aucune facture pour le moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Annulation - Seulement si abonnement Standard actif et non annulé */}
          {isStandard && subscriptionDetails?.status === 'active' && !subscriptionDetails?.cancelAtPeriodEnd && (
            <Card className="card-premium border-glow">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Annulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Annuler l'abonnement</p>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </TabsContent>
      </Tabs>

      {/* Password Change Confirmation Modal */}
      <SecurityModal
        open={showPasswordChangeModal}
        onOpenChange={setShowPasswordChangeModal}
        title="Confirmer le changement de mot de passe"
        description="Votre mot de passe va être modifié. Toutes vos autres sessions seront déconnectées pour votre sécurité."
        severity="warning"
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={handlePasswordChangeConfirm}
        onCancel={() => setShowPasswordChangeModal(false)}
      >
        <Alert className="border-yellow-500/50 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-xs">
            <strong>Attention :</strong> Après ce changement, vous devrez vous reconnecter sur tous vos appareils avec le nouveau mot de passe.
          </AlertDescription>
        </Alert>
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            <span>Email de confirmation sera envoyé</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            <span>Toutes les sessions seront déconnectées</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500" />
            <span>Enregistrement dans le journal d'audit</span>
          </div>
        </div>
      </SecurityModal>

      {/* 2FA Activation Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activer l'authentification à deux facteurs</DialogTitle>
            <DialogDescription>
              Scannez ce code QR avec votre application d'authentification (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-blue-500/50 bg-blue-500/5">
              <Shield className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs">
                <strong>Sécurité renforcée :</strong> Votre compte sera protégé par un code à 6 chiffres qui change toutes les 30 secondes.
              </AlertDescription>
            </Alert>

            {/* Mock QR Code */}
            <div className="flex justify-center rounded-lg border border-border bg-white p-6">
              <div className="flex h-48 w-48 items-center justify-center rounded bg-muted">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">Clé manuelle (si vous ne pouvez pas scanner) :</p>
              <code className="block rounded bg-muted px-2 py-1 text-xs font-mono">
                ABCD EFGH IJKL MNOP QRST UVWX YZ23 4567
              </code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Code de vérification</Label>
              <Input
                id="verificationCode"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-muted-foreground">Entrez le code à 6 chiffres de votre application</p>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">À savoir :</p>
              <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                <li>10 codes de récupération seront générés et affichés</li>
                <li>Conservez ces codes dans un endroit sûr</li>
                <li>Chaque code ne peut être utilisé qu'une seule fois</li>
                <li>Vous pouvez générer de nouveaux codes à tout moment</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShow2FAModal(false)
              setVerificationCode("")
            }}>
              Annuler
            </Button>
            <Button onClick={handle2FAConfirm} disabled={verificationCode.length !== 6}>
              <Check className="mr-2 h-4 w-4" />
              Activer 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Revocation Modal */}
      <SecurityModal
        open={showRevokeModal}
        onOpenChange={setShowRevokeModal}
        title="Révoquer la session"
        description={`Êtes-vous sûr de vouloir déconnecter "${selectedSession?.device}" ?`}
        severity="warning"
        confirmText="Révoquer"
        cancelText="Annuler"
        onConfirm={handleRevokeConfirm}
        onCancel={() => setShowRevokeModal(false)}
      >
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Appareil :</span>
            <span className="font-medium">{selectedSession?.device}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Localisation :</span>
            <span className="font-medium">{selectedSession?.location}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dernière activité :</span>
            <span className="font-medium">{selectedSession?.time}</span>
          </div>
        </div>
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Shield className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            Cette action déconnectera immédiatement cette session. L'utilisateur devra se reconnecter avec ses identifiants.
          </AlertDescription>
        </Alert>
      </SecurityModal>

      {/* Subscription Cancellation Modal */}
      <SecurityModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        title="Annuler votre abonnement"
        description="Êtes-vous sûr de vouloir annuler votre abonnement Standard ?"
        severity="danger"
        confirmText="Annuler l'abonnement"
        cancelText="Conserver l'abonnement"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelModal(false)}
      >
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs">
            <strong>Attention :</strong> Votre abonnement restera actif jusqu'à la fin de la période en cours, puis sera automatiquement annulé.
          </AlertDescription>
        </Alert>
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium">Que se passera-t-il après l'annulation ?</p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
            <li>Vous conserverez l'accès jusqu'à la fin de la période en cours</li>
            <li>Aucun remboursement ne sera effectué pour la période en cours</li>
            <li>Votre compte redeviendra Freemium après la fin de l'abonnement</li>
            <li>Vous pourrez vous réabonner à tout moment</li>
          </ul>
        </div>
      </SecurityModal>

      {/* Update Payment Method Modal */}
      <UpdatePaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        userId={userId || ""}
        onSuccess={() => {
          setShowPaymentModal(false)
          toast.success("Paiement mis à jour", {
            description: "Votre méthode de paiement a été mise à jour avec succès.",
          })
          // Recharger les données de facturation
          window.location.reload()
        }}
      />
    </div>
  )
}
