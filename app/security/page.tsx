import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, Shield, Lock, Eye, Server, FileCheck, Users, CheckCircle2 } from "lucide-react"

export default function SecurityPage() {
  const features = [
    {
      icon: Lock,
      title: "Chiffrement de bout en bout",
      description: "Vos données sont chiffrées avec l'algorithme AES-256, le même niveau de sécurité que les banques.",
    },
    {
      icon: Server,
      title: "Hébergement sécurisé en France",
      description: "Vos documents sont stockés sur des serveurs certifiés, situés en France et conformes au RGPD.",
    },
    {
      icon: Eye,
      title: "Contrôle d'accès granulaire",
      description: "Définissez précisément qui peut voir, modifier ou partager vos documents juridiques.",
    },
    {
      icon: FileCheck,
      title: "Audit trail complet",
      description: "Traçabilité complète de toutes les actions avec horodatage certifié pour vos besoins de conformité.",
    },
    {
      icon: Users,
      title: "Authentification forte",
      description: "Authentification à deux facteurs (2FA) et SSO pour une sécurité renforcée de vos comptes.",
    },
    {
      icon: Shield,
      title: "Conformité RGPD",
      description: "Respect strict du RGPD avec des politiques claires de protection et de gestion des données.",
    },
  ]

  const certifications = [
    { name: "ISO 27001", description: "Sécurité de l'information" },
    { name: "SOC 2 Type II", description: "Contrôles de sécurité" },
    { name: "RGPD", description: "Protection des données" },
    { name: "HDS", description: "Hébergement données de santé" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-primary">Companion</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Tarifs
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              À propos
            </Link>
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
          <Badge variant="secondary" className="mb-4">
            <Shield className="h-3 w-3 mr-2 inline" />
            Sécurité
          </Badge>
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Vos données juridiques en toute sécurité
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            La sécurité et la confidentialité sont au cœur de notre plateforme. Nous mettons en œuvre
            les meilleures pratiques de l'industrie pour protéger vos informations sensibles.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Nos mesures de sécurité</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Certifications et conformité</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nous sommes certifiés par les organismes les plus reconnus de l'industrie
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <Card key={cert.name} className="border-border text-center">
                <CardContent className="pt-6">
                  <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Practices Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Nos engagements</h2>
          <div className="space-y-6">
            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Surveillance 24/7</h3>
                <p className="text-muted-foreground">
                  Notre équipe de sécurité surveille en permanence nos systèmes pour détecter et prévenir
                  toute activité suspecte. Des audits de sécurité réguliers sont réalisés par des experts indépendants.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Sauvegardes automatiques</h3>
                <p className="text-muted-foreground">
                  Vos données sont sauvegardées automatiquement plusieurs fois par jour dans plusieurs
                  datacenters géographiquement distincts pour garantir leur disponibilité.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Plan de continuité d'activité</h3>
                <p className="text-muted-foreground">
                  Nous disposons d'un plan de reprise d'activité testé régulièrement pour assurer
                  la continuité de service en toutes circonstances.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Transparence totale</h3>
                <p className="text-muted-foreground">
                  En cas d'incident de sécurité, nous nous engageons à vous informer dans les plus brefs
                  délais conformément à nos obligations légales et à notre éthique.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-balance">Des questions sur la sécurité ?</h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Nous contacter</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Essayer gratuitement</Link>
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
