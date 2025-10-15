import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, Calendar, User, ArrowRight } from "lucide-react"

export default function BlogPage() {
  const articles = [
    {
      id: 1,
      title: "L'IA au service du droit : révolution ou évolution ?",
      excerpt: "Découvrez comment l'intelligence artificielle transforme la pratique juridique et améliore l'efficacité des cabinets d'avocats.",
      author: "Marie Dubois",
      date: "15 janvier 2025",
      category: "Intelligence Artificielle",
      readTime: "5 min",
    },
    {
      id: 2,
      title: "5 conseils pour optimiser la gestion de vos contrats",
      excerpt: "Des stratégies éprouvées pour améliorer votre workflow de gestion documentaire et gagner du temps au quotidien.",
      author: "Pierre Martin",
      date: "10 janvier 2025",
      category: "Productivité",
      readTime: "7 min",
    },
    {
      id: 3,
      title: "RGPD et confidentialité : les bonnes pratiques",
      excerpt: "Un guide complet pour assurer la conformité RGPD dans la gestion de vos documents juridiques sensibles.",
      author: "Sophie Laurent",
      date: "5 janvier 2025",
      category: "Sécurité",
      readTime: "6 min",
    },
    {
      id: 4,
      title: "Collaboration en temps réel : le futur du droit",
      excerpt: "Comment la collaboration numérique révolutionne le travail d'équipe dans les cabinets juridiques modernes.",
      author: "Marie Dubois",
      date: "1 janvier 2025",
      category: "Collaboration",
      readTime: "4 min",
    },
    {
      id: 5,
      title: "Comparaison de documents : techniques et outils",
      excerpt: "Les meilleures pratiques pour comparer efficacement différentes versions de vos documents juridiques.",
      author: "Pierre Martin",
      date: "28 décembre 2024",
      category: "Outils",
      readTime: "8 min",
    },
    {
      id: 6,
      title: "LegalTech : tendances 2025",
      excerpt: "Un aperçu des innovations technologiques qui façonneront le secteur juridique cette année.",
      author: "Sophie Laurent",
      date: "22 décembre 2024",
      category: "Tendances",
      readTime: "10 min",
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
            Blog
          </Badge>
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Actualités et ressources juridiques
          </h1>
          <p className="text-xl text-muted-foreground text-balance">
            Découvrez nos derniers articles sur la LegalTech, les bonnes pratiques juridiques
            et les tendances du secteur
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="border-border flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {article.category}
                  </Badge>
                  <CardTitle className="text-xl leading-tight">{article.title}</CardTitle>
                  <CardDescription className="mt-2">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{article.readTime} de lecture</span>
                    <Button variant="ghost" size="sm" className="group">
                      Lire plus
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Restez informé</h2>
          <p className="text-muted-foreground mb-8">
            Recevez nos derniers articles et actualités directement dans votre boîte mail
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.fr"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button className="whitespace-nowrap">S'abonner</Button>
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
