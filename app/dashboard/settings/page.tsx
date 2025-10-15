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
import { CreditCard, Users, Shield, Check, AlertTriangle, Lock, QrCode, Smartphone, Key } from "lucide-react"
import Link from "next/link"
import { useUserPlan } from "@/hooks/use-user-plan"
import { useState } from "react"
import { toast } from "sonner"
import { SecurityModal } from "@/components/security/security-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function SettingsPage() {
  const { plan, isFreemium, isStandard, isLoading } = useUserPlan()
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

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

  if (isLoading) {
    return <div className="space-y-6">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et votre compte</p>
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
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-xl text-primary">JD</AvatarFallback>
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
                  <Input id="firstName" defaultValue="Jean" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue="Dupont" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="jean.dupont@cabinet.fr" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" defaultValue="+33 1 23 45 67 89" />
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
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleProfileSave}>
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Informations de l'organisation</CardTitle>
              <CardDescription>Gérez les détails de votre cabinet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nom du cabinet</Label>
                <Input id="orgName" defaultValue="Cabinet Dupont & Associés" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgAddress">Adresse</Label>
                <Input id="orgAddress" defaultValue="123 Avenue des Champs-Élysées, 75008 Paris" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Téléphone</Label>
                  <Input id="orgPhone" defaultValue="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Email</Label>
                  <Input id="orgEmail" type="email" defaultValue="contact@cabinet-dupont.fr" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSiret">SIRET</Label>
                <Input id="orgSiret" defaultValue="123 456 789 00012" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Annuler</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Membres de l'organisation</CardTitle>
              <CardDescription>Gérez les accès et les rôles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">8 membres actifs</p>
                      <p className="text-sm text-muted-foreground">2 invitations en attente</p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/members">Gérer les membres</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
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
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleNotificationsSave}>
                  Enregistrer les préférences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePasswordChange}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Authentification à deux facteurs</CardTitle>
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

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Sessions actives</CardTitle>
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
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Abonnement actuel</CardTitle>
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
                      <p className="mt-2 text-muted-foreground">5 projets maximum • Fonctionnalités de base</p>
                      <p className="mt-4 text-3xl font-bold">
                        0€<span className="text-base font-normal text-muted-foreground">/mois</span>
                      </p>
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                      <Link href="/dashboard/upgrade">Passer au Standard</Link>
                    </Button>
                  </div>

                  <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
                    <p className="text-sm font-medium text-primary">
                      Passez au plan Standard pour 23€/mois et débloquez toutes les fonctionnalités
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 p-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">Plan Standard</h3>
                        <Badge className="bg-primary/10 text-primary">Actif</Badge>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Projets illimités • Toutes les fonctionnalités • Support prioritaire
                      </p>
                      <p className="mt-4 text-3xl font-bold">
                        23€<span className="text-base font-normal text-muted-foreground">/mois</span>
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">Prochaine facturation le 22 janvier 2025</p>
                    </div>
                    <Button variant="outline" className="bg-transparent">
                      Gérer l'abonnement
                    </Button>
                  </div>

                  <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-4">
                    <p className="text-sm font-medium text-green-600">
                      Vous profitez actuellement de toutes les fonctionnalités premium de Companion
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Méthode de paiement</CardTitle>
              <CardDescription>Gérez vos moyens de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isStandard ? (
                <>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Visa •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expire 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Ajouter une méthode de paiement
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucune méthode de paiement configurée. Passez au plan Standard pour ajouter un moyen de paiement.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Historique de facturation</CardTitle>
              <CardDescription>
                {isStandard ? "Vos dernières factures" : "Aucune facture pour le moment"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStandard ? (
                <div className="space-y-3">
                  {[
                    { date: "1 Jan 2025", amount: "23€", status: "Payée", invoice: "INV-2025-001" },
                    { date: "1 Déc 2024", amount: "23€", status: "Payée", invoice: "INV-2024-012" },
                    { date: "1 Nov 2024", amount: "23€", status: "Payée", invoice: "INV-2024-011" },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium">{invoice.invoice}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          {invoice.status}
                        </Badge>
                        <p className="font-semibold">{invoice.amount}</p>
                        <Button variant="outline" size="sm">
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous êtes actuellement sur le plan gratuit. Passez au plan Standard pour accéder à l'historique de
                    facturation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
    </div>
  )
}
