import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Freemium",
      price: "0",
      description: "Pour découvrir Companion et ses fonctionnalités de base",
      features: [
        "1 projet actif",
        "Jusqu'à 3 collaborateurs",
        "5 Go de stockage",
        "Comparaison de documents basique",
        "Historique de 30 jours",
        "Support par email",
      ],
      cta: "Commencer gratuitement",
      href: "/register",
      popular: false,
    },
    {
      name: "Standard",
      price: "23",
      description: "Pour les cabinets et équipes juridiques professionnels",
      features: [
        "Projets illimités",
        "Collaborateurs illimités",
        "100 Go de stockage",
        "Comparaison avancée avec IA",
        "Historique illimité",
        "Annotations et commentaires",
        "Gestion des rôles et permissions",
        "Intégrations tierces",
        "Support prioritaire 24/7",
        "Formation personnalisée",
      ],
      cta: "Essayer 14 jours gratuits",
      href: "/dashboard/upgrade",
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Companion
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Connexion
            </Link>
            <Button asChild>
              <Link href="/register">Commencer</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6 text-balance">Tarifs simples et transparents</h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Choisissez le plan qui correspond à vos besoins. Changez ou annulez à tout moment.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Le plus populaire
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}€</span>
                    {plan.price !== "0" && <span className="text-muted-foreground">/mois</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Questions fréquentes</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-muted-foreground">
                Oui, vous pouvez passer du plan Freemium au plan Standard à tout moment. Le changement est immédiat et
                vous ne payez que la différence au prorata.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Que se passe-t-il après la période d'essai ?</h3>
              <p className="text-muted-foreground">
                Après les 14 jours d'essai gratuit du plan Standard, votre carte sera débitée automatiquement. Vous
                pouvez annuler à tout moment pendant la période d'essai sans frais.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quels moyens de paiement acceptez-vous ?</h3>
              <p className="text-muted-foreground">
                Nous acceptons toutes les cartes bancaires majeures (Visa, Mastercard, American Express) ainsi que les
                virements bancaires pour les contrats annuels.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Mes données sont-elles sécurisées ?</h3>
              <p className="text-muted-foreground">
                Absolument. Nous utilisons un chiffrement de niveau bancaire (AES-256) et sommes conformes aux normes
                RGPD. Vos documents sont hébergés en France sur des serveurs sécurisés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-balance">Prêt à transformer votre gestion documentaire ?</h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Rejoignez des centaines de cabinets qui font confiance à Companion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Demander une démo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Companion. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
