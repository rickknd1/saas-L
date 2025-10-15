"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Download, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function CheckoutSuccessPage() {
  const { refetchUser } = useAuth()

  useEffect(() => {
    // Simple refetch pour synchroniser les données après paiement
    // Le webhook Stripe a déjà mis à jour la BDD instantanément
    refetchUser()
  }, [refetchUser])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/10 p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Bienvenue dans Companion Standard !</h1>
          <p className="text-xl text-muted-foreground">Votre abonnement a été activé avec succès</p>
        </div>

        {/* Details Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Détails de votre abonnement</CardTitle>
            <CardDescription>Voici ce qui vous attend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Plan</div>
                <div className="font-semibold">Standard</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Prix</div>
                <div className="font-semibold">23€/mois</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Facturation</div>
                <div className="font-semibold">Mensuelle</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Premier paiement</div>
                <div className="font-semibold">Effectué</div>
              </div>
            </div>

            <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Gestion de l'abonnement</div>
                  <div className="text-sm text-muted-foreground">
                    Vous pouvez gérer votre abonnement, modifier votre carte bancaire ou annuler à tout moment depuis vos paramètres.
                    En cas d'annulation, vous conservez l'accès jusqu'à la fin de la période payée.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
            <CardDescription>Commencez à utiliser Companion dès maintenant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">Créez votre premier projet</div>
                <div className="text-sm text-muted-foreground">Organisez vos documents juridiques</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">Invitez votre équipe</div>
                <div className="text-sm text-muted-foreground">Collaborez avec vos collègues</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium">Explorez l'assistant IA</div>
                <div className="text-sm text-muted-foreground">Bénéficiez d'analyses juridiques avancées</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/dashboard">
              Accéder au tableau de bord
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent">
            <Link href="/dashboard/settings">
              <Download className="mr-2 h-4 w-4" />
              Télécharger la facture
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground">
          Besoin d'aide ?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contactez notre équipe
          </Link>
        </div>
      </div>
    </div>
  )
}
