"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, CreditCard, Lock } from "lucide-react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "standard"
  const [loading, setLoading] = useState(false)

  const planDetails = {
    standard: {
      name: "Standard",
      price: 23,
      features: [
        "Projets illimités",
        "Collaborateurs illimités",
        "100 Go de stockage",
        "Comparaison avancée avec IA",
        "Support prioritaire 24/7",
      ],
    },
  }

  const selectedPlan = planDetails[plan as keyof typeof planDetails] || planDetails.standard

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    // Redirect to success page
    window.location.href = "/checkout/success"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Companion
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Retour aux tarifs
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finaliser votre abonnement</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de paiement</CardTitle>
                  <CardDescription>Vos informations sont sécurisées et chiffrées</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" required />
                    </div>

                    <Separator />

                    {/* Card Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CreditCard className="h-4 w-4" />
                        Informations de carte
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Numéro de carte</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Date d'expiration</Label>
                          <Input id="expiry" placeholder="MM/AA" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Adresse de facturation</div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" placeholder="Jean Dupont" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" placeholder="123 Rue de la Paix" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Ville</Label>
                          <Input id="city" placeholder="Paris" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal">Code postal</Label>
                          <Input id="postal" placeholder="75001" required />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Traitement en cours..." : `Démarrer l'essai gratuit`}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Paiement sécurisé par Stripe
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-semibold mb-2">{selectedPlan.name}</div>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{selectedPlan.price}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVA (20%)</span>
                      <span>{(selectedPlan.price * 0.2).toFixed(2)}€</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{(selectedPlan.price * 1.2).toFixed(2)}€</span>
                  </div>

                  <div className="text-xs text-muted-foreground">Facturé mensuellement. Annulez à tout moment.</div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <div className="w-full p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="text-sm font-medium mb-2 text-accent">Essai gratuit de 14 jours</div>
                    <div className="text-xs text-muted-foreground">
                      Vous ne serez pas facturé avant la fin de votre période d'essai. Annulez à tout moment.
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
