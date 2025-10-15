"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Scale, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SecurityModal } from "@/components/security/security-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoginLoading, loginError } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Login] Form submitted', formData.email)

    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (!formData.password) newErrors.password = "Le mot de passe est requis"

    if (Object.keys(newErrors).length > 0) {
      console.log('[Login] Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }

    try {
      // Utiliser le hook useAuth qui gère tout (API + cache React Query)
      const data = await login({
        email: formData.email,
        password: formData.password,
      })

      // Succès
      if (data.success && data.user) {
        toast.success("Connexion réussie", {
          description: `Bienvenue ${data.user.name || data.user.email} !`,
          duration: 2000,
        })

        // Redirection quasi-instantanée (juste le temps que le DOM se mette à jour)
        setTimeout(() => {
          // Vérifier s'il y a une URL de redirection sauvegardée
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
          if (redirectUrl) {
            sessionStorage.removeItem('redirectAfterLogin')
            router.push(redirectUrl)
          } else {
            router.push("/dashboard")
          }
        }, 300) // Réduit de 1500ms à 300ms pour une expérience instantanée
      }
    } catch (error: any) {
      // Gestion des erreurs
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)

      if (newAttempts >= 5) {
        toast.error("Compte temporairement verrouillé", {
          description: "Trop de tentatives échouées. Réessayez dans 30 minutes.",
          duration: 6000,
        })
      } else if (newAttempts >= 3) {
        toast.error("Email ou mot de passe incorrect", {
          description: `Attention: ${5 - newAttempts} tentatives restantes avant verrouillage.`,
          duration: 5000,
        })
      } else {
        toast.error("Email ou mot de passe incorrect", {
          description: error.message || "Veuillez vérifier vos identifiants.",
        })
      }
    }
  }

  const handleNewDeviceVerification = () => {
    setShowNewDeviceModal(false)

    toast.success("Connexion autorisée", {
      description: "La connexion a été vérifiée avec succès.",
    })

    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
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

        {loginAttempts >= 3 && loginAttempts < 5 && (
          <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>Attention !</strong> Après {5 - loginAttempts} tentatives supplémentaires échouées, votre compte sera temporairement verrouillé.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>Accédez à votre espace de travail juridique sécurisé</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="avocat@cabinet.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={loginAttempts >= 5}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-destructive" : ""}
                  disabled={loginAttempts >= 5}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                  disabled={loginAttempts >= 5}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Se souvenir de moi
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoginLoading || loginAttempts >= 5}
                onClick={() => console.log('[Login] Button clicked')}
              >
                {isLoginLoading ? "Connexion..." : loginAttempts >= 5 ? "Compte verrouillé" : "Se connecter"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Créer un compte
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          🔒 En vous connectant, vous acceptez nos{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Politique de confidentialité
          </Link>
        </p>
      </div>

      {/* New Device Detection Modal */}
      <SecurityModal
        open={showNewDeviceModal}
        onOpenChange={setShowNewDeviceModal}
        title="Nouvelle connexion détectée"
        description="Pour votre sécurité, nous avons détecté une connexion depuis un nouvel appareil ou une nouvelle localisation."
        severity="warning"
        confirmText="C'était moi"
        cancelText="Ce n'est pas moi"
        onConfirm={handleNewDeviceVerification}
        onCancel={() => {
          setShowNewDeviceModal(false)
          toast.error("Connexion bloquée", {
            description: "La connexion a été bloquée. Un email de sécurité vous a été envoyé.",
          })
        }}
      >
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Appareil :</span>
            <span className="font-medium">Chrome sur Windows</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Localisation :</span>
            <span className="font-medium">Paris, France</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Adresse IP :</span>
            <span className="font-medium">192.168.1.1</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Date :</span>
            <span className="font-medium">{new Date().toLocaleString("fr-FR")}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          ⚡ Un code de vérification a été envoyé à votre adresse email pour confirmer cette connexion.
        </p>
      </SecurityModal>
    </div>
  )
}
