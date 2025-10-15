"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function UpgradePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/checkout?plan=standard")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Passer au plan Standard</h1>
          <p className="text-muted-foreground">Débloquez toutes les fonctionnalités de Companion</p>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Plan */}
        <Card className="border-border">
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
                <span className="text-sm text-muted-foreground">5 projets maximum</span>
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
        <Card className="border-primary shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              Recommandé
            </Badge>
          </div>
          <CardHeader>
            <CardTitle>Plan Standard</CardTitle>
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
              {isLoading ? "Chargement..." : "Essayer 14 jours gratuits"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Benefits */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Pourquoi passer au plan Standard ?</CardTitle>
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
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Comment fonctionne l'essai gratuit ?</h4>
            <p className="text-sm text-muted-foreground">
              Vous bénéficiez de 14 jours d'essai gratuit du plan Standard. Aucun paiement ne sera effectué pendant
              cette période. Vous pouvez annuler à tout moment.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Puis-je revenir au plan gratuit ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui, vous pouvez rétrograder vers le plan Freemium à tout moment depuis vos paramètres. Vos données seront
              conservées.
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
  )
}
