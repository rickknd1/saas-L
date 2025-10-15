"use client"

import type React from "react"

import { Button } from "@/components/ui/button"

// Désactiver le pré-rendering pour cette page (utilise React Query)
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Shield, Check, X, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SecurityModal } from "@/components/security/security-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useQueryClient } from "@tanstack/react-query"

type PasswordStrength = "weak" | "medium" | "strong" | "very-strong"

interface PasswordValidation {
  strength: PasswordStrength
  score: number
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cabinet: "",
    role: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    strength: "weak",
    score: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  })
  const [showNonProfessionalWarning, setShowNonProfessionalWarning] = useState(false)

  // Calculate password strength in real-time
  const calculatePasswordStrength = (password: string): PasswordValidation => {
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length
    let strength: PasswordStrength = "weak"

    if (score >= 5) strength = "very-strong"
    else if (score >= 4) strength = "strong"
    else if (score >= 3) strength = "medium"

    return { strength, score, checks }
  }

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(calculatePasswordStrength(formData.password))
    }
  }, [formData.password])

  // Check for professional email domain
  useEffect(() => {
    if (formData.email) {
      const commonFreeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com"]
      const domain = formData.email.split("@")[1]?.toLowerCase()
      setShowNonProfessionalWarning(commonFreeProviders.includes(domain))
    }
  }, [formData.email])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide"
    }
    if (!formData.cabinet.trim()) newErrors.cabinet = "Le cabinet est requis"
    if (!formData.role) newErrors.role = "La fonction est requise"
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 caractères"
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Doit contenir majuscules et chiffres"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez corriger les erreurs avant de continuer.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Appel à l'API réelle de register
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          cabinet: formData.cabinet,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          // Email déjà utilisé
          toast.error("Email déjà utilisé", {
            description: "Un compte existe déjà avec cette adresse email. Essayez de vous connecter.",
            duration: 5000,
          })
          setErrors({ ...errors, email: data.error || "Cet email est déjà associé à un compte" })
        } else {
          toast.error("Erreur lors de l'inscription", {
            description: data.error || "Une erreur est survenue. Veuillez réessayer.",
            duration: 5000,
          })
        }
        setIsLoading(false)
        return
      }

      // Succès - L'API a créé le cookie automatiquement, on met juste à jour le cache React Query
      if (data.success && data.user) {
        // Mettre à jour le cache React Query avec les données utilisateur
        queryClient.setQueryData(["user"], data.user)

        // Show modal
        setShowSuccessModal(true)

        // Send confirmation email notification
        setTimeout(() => {
          toast.info("Compte créé avec succès", {
            description: "Bienvenue sur Companion! Votre compte a été créé.",
            duration: 6000,
          })
        }, 1000)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      toast.error("Erreur réseau", {
        description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
        duration: 5000,
      })
      setIsLoading(false)
    }
  }

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false)
    toast.success("Bienvenue sur Companion !", {
      description: "Votre compte a été créé avec succès. Vous allez être redirigé...",
    })

    setTimeout(() => {
      router.push("/onboarding")
    }, 300) // Réduit de 1500ms à 300ms pour une expérience instantanée
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold">
            <Scale className="h-7 w-7 text-primary" />
            <span>Companion</span>
          </Link>
        </div>

        {showNonProfessionalWarning && (
          <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>Email personnel détecté.</strong> Pour une meilleure sécurité et organisation, nous recommandons d'utiliser votre adresse email professionnelle.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
            <CardDescription>Commencez votre essai gratuit dès aujourd'hui</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email professionnelle</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@cabinet.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cabinet">Cabinet / Organisation</Label>
                <Input
                  id="cabinet"
                  placeholder="Cabinet Dupont & Associés"
                  value={formData.cabinet}
                  onChange={(e) => setFormData({ ...formData, cabinet: e.target.value })}
                  className={errors.cabinet ? "border-destructive" : ""}
                />
                {errors.cabinet && <p className="text-xs text-destructive">{errors.cabinet}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Fonction</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role" className={errors.role ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionnez votre fonction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avocat">Avocat</SelectItem>
                    <SelectItem value="associe">Associé</SelectItem>
                    <SelectItem value="collaborateur">Collaborateur</SelectItem>
                    <SelectItem value="juriste">Juriste d'entreprise</SelectItem>
                    <SelectItem value="notaire">Notaire</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-destructive" : ""}
                />

                {formData.password && (
                  <div className="space-y-2">
                    {/* Password strength bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Force du mot de passe</span>
                        <span
                          className={`font-medium ${
                            passwordValidation.strength === "very-strong"
                              ? "text-green-500"
                              : passwordValidation.strength === "strong"
                                ? "text-blue-500"
                                : passwordValidation.strength === "medium"
                                  ? "text-yellow-500"
                                  : "text-destructive"
                          }`}
                        >
                          {passwordValidation.strength === "very-strong"
                            ? "Très fort"
                            : passwordValidation.strength === "strong"
                              ? "Fort"
                              : passwordValidation.strength === "medium"
                                ? "Moyen"
                                : "Faible"}
                        </span>
                      </div>
                      <Progress
                        value={(passwordValidation.score / 5) * 100}
                        className={`h-2 ${
                          passwordValidation.strength === "very-strong"
                            ? "[&>div]:bg-green-500"
                            : passwordValidation.strength === "strong"
                              ? "[&>div]:bg-blue-500"
                              : passwordValidation.strength === "medium"
                                ? "[&>div]:bg-yellow-500"
                                : "[&>div]:bg-destructive"
                        }`}
                      />
                    </div>

                    {/* Password requirements checklist */}
                    <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Exigences de sécurité :</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.checks.length ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span
                            className={passwordValidation.checks.length ? "text-foreground" : "text-muted-foreground"}
                          >
                            Au moins 12 caractères
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.checks.uppercase ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span
                            className={passwordValidation.checks.uppercase ? "text-foreground" : "text-muted-foreground"}
                          >
                            Une lettre majuscule
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.checks.lowercase ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span
                            className={passwordValidation.checks.lowercase ? "text-foreground" : "text-muted-foreground"}
                          >
                            Une lettre minuscule
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.checks.number ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span
                            className={passwordValidation.checks.number ? "text-foreground" : "text-muted-foreground"}
                          >
                            Un chiffre
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {passwordValidation.checks.special ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span
                            className={passwordValidation.checks.special ? "text-foreground" : "text-muted-foreground"}
                          >
                            Un caractère spécial (@, #, $, etc.)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    className="mt-1"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J'accepte les{" "}
                    <Link href="/terms" className="font-medium text-primary hover:underline">
                      Conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="font-medium text-primary hover:underline">
                      Politique de confidentialité
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}
              </div>

              {/* Security information */}
              <Alert className="border-blue-500/50 bg-blue-500/5">
                <Shield className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-xs">
                  <strong>Sécurité et confidentialité :</strong> Vos données sont chiffrées de bout en bout et conformes au RGPD. Nous ne partagerons jamais vos informations avec des tiers.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Success Modal */}
      <SecurityModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Compte créé avec succès !"
        description="Votre compte a été créé avec succès. Un email de vérification a été envoyé à votre adresse."
        severity="info"
        confirmText="Continuer"
        onConfirm={handleSuccessModalConfirm}
      >
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Protection renforcée activée</p>
              <p className="text-xs text-muted-foreground">Authentification à deux facteurs disponible dans les paramètres</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Données chiffrées</p>
              <p className="text-xs text-muted-foreground">Vos documents sont protégés par un chiffrement de niveau bancaire</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Conformité RGPD</p>
              <p className="text-xs text-muted-foreground">Toutes vos données respectent les normes européennes</p>
            </div>
          </div>
        </div>
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            <strong>Prochaine étape :</strong> Vérifiez votre email pour activer votre compte. Le lien est valable 24 heures.
          </AlertDescription>
        </Alert>
      </SecurityModal>
    </div>
  )
}
