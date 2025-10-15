import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, MapPin, Briefcase, Clock, Users, Heart, Zap, Coffee } from "lucide-react"

export default function CareersPage() {
  const jobs = [
    {
      id: 1,
      title: "Développeur Full-Stack Senior",
      department: "Ingénierie",
      location: "Paris / Remote",
      type: "CDI",
      description: "Rejoignez notre équipe technique pour développer la prochaine génération d'outils juridiques collaboratifs.",
    },
    {
      id: 2,
      title: "Product Manager - LegalTech",
      department: "Produit",
      location: "Paris",
      type: "CDI",
      description: "Définissez la vision produit et pilotez le développement de nouvelles fonctionnalités innovantes.",
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Client",
      location: "Paris / Remote",
      type: "CDI",
      description: "Accompagnez nos clients dans leur adoption de Companion et assurez leur réussite.",
    },
    {
      id: 4,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "CDI",
      description: "Créez des expériences utilisateur exceptionnelles pour nos outils juridiques.",
    },
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Mutuelle premium",
      description: "100% prise en charge pour vous et votre famille",
    },
    {
      icon: Coffee,
      title: "Télétravail flexible",
      description: "Travaillez d'où vous voulez, quand vous voulez",
    },
    {
      icon: Zap,
      title: "Formation continue",
      description: "Budget annuel pour votre développement professionnel",
    },
    {
      icon: Users,
      title: "Équipe passionnée",
      description: "Rejoignez une équipe talentueuse et bienveillante",
    },
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
            Carrières
          </Badge>
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Construisez l'avenir du droit avec nous
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Rejoignez une équipe passionnée qui révolutionne la pratique juridique grâce à la technologie
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Pourquoi Companion ?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border text-center">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Postes ouverts</h2>
            <p className="text-muted-foreground">
              Découvrez nos opportunités actuelles et trouvez le rôle qui vous correspond
            </p>
          </div>

          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-base">{job.description}</CardDescription>
                    </div>
                    <Button className="md:shrink-0">
                      Postuler
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas le poste idéal ?</h2>
          <p className="text-muted-foreground mb-8">
            Nous sommes toujours à la recherche de talents exceptionnels. Envoyez-nous votre candidature spontanée !
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Nous contacter</Link>
          </Button>
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
