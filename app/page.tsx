import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, FileText, Users, Shield, Zap, Clock, CheckCircle2, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Companion</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Tarifs
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              À propos
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              <Zap className="mr-2 h-3 w-3" />
              La plateforme N°1 pour professionnels du droit
            </Badge>

            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Gérez vos contrats juridiques{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                en toute confiance
              </span>
            </h1>

            <p className="mb-8 text-xl text-muted-foreground">
              Companion révolutionne la gestion collaborative de documents juridiques.
              Comparez, annotez et collaborez en temps réel avec votre équipe.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/register">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/contact">
                  <Play className="mr-2 h-4 w-4" />
                  Voir la démo
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Essai gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Annulation à tout moment</span>
              </div>
            </div>
          </div>

          {/* Product Preview */}
          <div className="mt-16">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-primary/5 to-transparent blur-3xl" />
              <div className="overflow-hidden rounded-xl border border-border bg-background/50 p-2 shadow-2xl backdrop-blur-sm">
                <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary/20 via-background to-accent/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {["Cabinet Dupont", "Avocats & Associés", "LegalTech Partners", "Justice Conseil", "Droit & Innovation"].map((name) => (
              <div key={name} className="text-lg font-semibold text-muted-foreground/60">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Cabinets d'avocats</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">50k+</div>
              <div className="text-muted-foreground">Documents traités</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-primary">99.9%</div>
              <div className="text-muted-foreground">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">Fonctionnalités</Badge>
            <h2 className="mb-4 text-4xl font-bold">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Des outils puissants conçus spécifiquement pour les professionnels du droit
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Comparaison intelligente",
                description: "Comparez instantanément différentes versions de vos documents PDF avec IA.",
              },
              {
                icon: Users,
                title: "Collaboration en temps réel",
                description: "Travaillez simultanément avec votre équipe sur les mêmes documents.",
              },
              {
                icon: Shield,
                title: "Sécurité maximale",
                description: "Chiffrement de bout en bout et conformité RGPD garantis.",
              },
              {
                icon: Zap,
                title: "Intelligence juridique",
                description: "Analyses automatiques et suggestions intelligentes par IA.",
              },
              {
                icon: Scale,
                title: "Gestion de projets",
                description: "Organisez vos dossiers avec workflows personnalisables.",
              },
              {
                icon: Clock,
                title: "Historique complet",
                description: "Traçabilité totale avec horodatage certifié.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b bg-muted/30 py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">Témoignages</Badge>
            <h2 className="mb-4 text-4xl font-bold">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Marie Dubois",
                role: "Avocate, Cabinet Dupont",
                content: "Companion a transformé notre façon de travailler. Nous gagnons un temps précieux sur chaque dossier.",
              },
              {
                name: "Pierre Martin",
                role: "Associé, Martin & Associés",
                content: "La comparaison de documents est d'une précision remarquable. Un outil indispensable pour notre cabinet.",
              },
              {
                name: "Sophie Laurent",
                role: "Juriste, TechCorp",
                content: "Interface intuitive et fonctionnalités puissantes. Exactement ce dont nous avions besoin.",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="border-border p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">Tarifs</Badge>
            <h2 className="mb-4 text-4xl font-bold">
              Des tarifs simples et transparents
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            <Card className="border-border p-8">
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold">Freemium</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">0€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-muted-foreground">Pour découvrir la plateforme</p>
              </div>
              <ul className="mb-8 space-y-3">
                {["5 projets maximum", "Comparaison de documents", "Collaboration basique", "Support par email"].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">Commencer gratuitement</Link>
              </Button>
            </Card>

            <Card className="relative border-primary p-8 shadow-xl">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Recommandé
              </Badge>
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold">Standard</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">23€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-muted-foreground">Pour les professionnels exigeants</p>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  "Projets illimités",
                  "Toutes les fonctionnalités",
                  "Intelligence juridique IA",
                  "Support prioritaire 24/7",
                  "API et intégrations",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href="/dashboard/upgrade">Essayer 14 jours gratuits</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b bg-muted/30 py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="mb-4 text-4xl font-bold">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, vous pouvez passer du plan Freemium au plan Standard à tout moment. Le changement est immédiat.",
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Absolument. Nous utilisons un chiffrement AES-256 et sommes conformes au RGPD. Vos documents sont hébergés en France.",
              },
              {
                q: "Que se passe-t-il après la période d'essai ?",
                a: "Après les 14 jours d'essai, votre carte sera débitée. Vous pouvez annuler à tout moment sans frais.",
              },
              {
                q: "Proposez-vous une formation ?",
                a: "Oui, nous offrons une formation personnalisée pour tous les abonnés Standard.",
              },
            ].map((faq, i) => (
              <Card key={i} className="border-border p-6">
                <h3 className="mb-2 font-semibold">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Prêt à transformer votre pratique juridique ?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Rejoignez des centaines de cabinets qui font confiance à Companion
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Démarrer gratuitement</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/contact">Contacter l'équipe</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <span className="font-semibold">Companion</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plateforme collaborative pour professionnels du droit.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Tarifs</Link></li>
                <li><Link href="/security" className="hover:text-foreground">Sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">À propos</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">CGU</Link></li>
                <li><Link href="/legal" className="hover:text-foreground">Mentions légales</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 Companion. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
