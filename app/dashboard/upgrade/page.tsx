"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function UpgradePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const handleUpgrade = async () => {
    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      toast.error("Vous devez être connecté pour souscrire à un abonnement")
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      // Appeler l'API de création de checkout Stripe
      // Note: userId et userEmail sont récupérés automatiquement depuis les headers du middleware
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT: Envoyer les cookies httpOnly
        body: JSON.stringify({
          plan: "standard",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Si erreur 401, la session a expiré
        if (response.status === 401) {
          toast.error("Votre session a expiré. Veuillez vous reconnecter.")
          router.push("/login")
          return
        }
        throw new Error(data.error || "Erreur lors de la création de la session")
      }

      // Rediriger vers Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("URL de checkout manquante")
      }
    } catch (error) {
      console.error("Erreur upgrade:", error)
      toast.error(
        error instanceof Error ? error.message : "Impossible de créer la session de paiement"
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient mesh background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">Passer au plan Standard</h1>
            <p className="text-muted-foreground text-lg">Débloquez toutes les fonctionnalités de Companion</p>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Plan */}
          <Card className="card-premium border-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plan Freemium</CardTitle>
              <Badge variant="secondary">Actuel</Badge>
            </div>
            <CardDescription>Votre plan actuel</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">0€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">1 projet maximum</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Jusqu'à 3 collaborateurs</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">5 Go de stockage</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Comparaison de documents basique</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Support par email</span>
              </li>
            </ul>
          </CardContent>
        </Card>

          {/* Upgrade Plan */}
          <Card className="card-premium border-glow relative shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-accent text-accent-foreground shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Recommandé
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Plan Standard</CardTitle>
            <CardDescription>Pour les professionnels exigeants</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">23€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Projets illimités</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Collaborateurs illimités</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">100 Go de stockage</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Comparaison avancée avec IA</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Historique illimité</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Annotations et commentaires</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Gestion des rôles et permissions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Intégrations tierces</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Support prioritaire 24/7</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Formation personnalisée</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Souscrire maintenant"}
            </Button>
          </CardFooter>
        </Card>
      </div>

        {/* Benefits */}
        <Card className="glass-premium border-glow">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Pourquoi passer au plan Standard ?</CardTitle>
            <CardDescription>Découvrez tous les avantages</CardDescription>
          </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Intelligence juridique avancée</h3>
              <p className="text-sm text-muted-foreground">
                Bénéficiez d'analyses automatiques et de suggestions intelligentes pour optimiser vos documents.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Collaboration illimitée</h3>
              <p className="text-sm text-muted-foreground">
                Travaillez avec autant de collaborateurs que nécessaire sur un nombre illimité de projets.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Support prioritaire</h3>
              <p className="text-sm text-muted-foreground">
                Accédez à notre équipe d'experts 24/7 pour une assistance rapide et personnalisée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* FAQ */}
        <Card className="glass-premium border-glow">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Questions fréquentes</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Comment fonctionne le paiement ?</h4>
            <p className="text-sm text-muted-foreground">
              Le paiement est immédiat et mensuel. Vous pouvez annuler votre abonnement à tout moment depuis vos paramètres.
              En cas d'annulation, vous conservez l'accès jusqu'à la fin de la période payée.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Puis-je revenir au plan gratuit ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres. Vos données seront
              conservées et vous reviendrez au plan Freemium à la fin de votre période de facturation.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Quels moyens de paiement acceptez-vous ?</h4>
            <p className="text-sm text-muted-foreground">
              Nous acceptons toutes les cartes bancaires majeures (Visa, Mastercard, American Express) via Stripe.
            </p>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
