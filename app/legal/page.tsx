import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, Building } from "lucide-react"

export default function LegalPage() {
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

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Mentions légales</h1>
          <p className="text-muted-foreground">Informations légales et éditoriales</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Raison sociale :</strong> Companion SAS</p>
                <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
                <p><strong>Capital social :</strong> 100 000 €</p>
                <p><strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                <p><strong>RCS :</strong> Paris B 123 456 789</p>
                <p><strong>SIRET :</strong> 123 456 789 00010</p>
                <p><strong>N° TVA intracommunautaire :</strong> FR 12 123456789</p>
                <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                <p><strong>Email :</strong> <a href="mailto:contact@companion.fr" className="text-primary hover:underline">contact@companion.fr</a></p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">2. Directeur de la publication</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Nom :</strong> Marie Dubois</p>
                <p><strong>Qualité :</strong> Présidente de Companion SAS</p>
                <p><strong>Email :</strong> <a href="mailto:marie.dubois@companion.fr" className="text-primary hover:underline">marie.dubois@companion.fr</a></p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Hébergeur :</strong> OVH</p>
                <p><strong>Raison sociale :</strong> OVH SAS</p>
                <p><strong>Siège social :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
                <p><strong>Téléphone :</strong> 1007</p>
                <p><strong>Site web :</strong> <a href="https://www.ovh.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ovh.com</a></p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
              <p className="text-muted-foreground mb-4">
                L'ensemble du contenu de ce site (structure, textes, graphismes, logos, icônes, sons,
                logiciels, etc.) est la propriété exclusive de Companion SAS, à l'exception des marques,
                logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.
              </p>
              <p className="text-muted-foreground mb-4">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou
                partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite,
                sauf autorisation écrite préalable de Companion SAS.
              </p>
              <p className="text-muted-foreground">
                Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient
                sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux
                dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">5. Protection des données personnelles</h2>
              <p className="text-muted-foreground mb-4">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
                Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de
                suppression et d'opposition aux données personnelles vous concernant.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Responsable du traitement des données :</strong> Companion SAS
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Délégué à la Protection des Données (DPO) :</strong><br />
                Email : <a href="mailto:dpo@companion.fr" className="text-primary hover:underline">dpo@companion.fr</a>
              </p>
              <p className="text-muted-foreground">
                Pour en savoir plus sur la gestion de vos données personnelles, consultez notre{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Ce site utilise des cookies pour améliorer votre expérience de navigation, réaliser
                des statistiques de visites et vous proposer des contenus adaptés.
              </p>
              <p className="text-muted-foreground">
                Vous pouvez paramétrer vos préférences en matière de cookies à tout moment via les
                paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">7. Crédits</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Conception et développement :</strong> Companion SAS</p>
                <p><strong>Icônes :</strong> Lucide Icons</p>
                <p><strong>Typographies :</strong> Geist Sans, Geist Mono</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">8. Litiges</h2>
              <p className="text-muted-foreground mb-4">
                Les présentes mentions légales sont régies par le droit français. En cas de litige et
                à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément
                aux règles de compétence en vigueur.
              </p>
              <p className="text-muted-foreground">
                Conformément aux dispositions du Code de la consommation concernant le règlement amiable
                des litiges, Companion SAS adhère au Service du Médiateur du e-commerce de la FEVAD
                (Fédération du e-commerce et de la vente à distance) dont les coordonnées sont les suivantes :
                Médiateur de la consommation FEVAD – BP 20015 – 75362 PARIS CEDEX 8 –{" "}
                <a href="https://www.mediateurfevad.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.mediateurfevad.fr
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
              <p className="text-muted-foreground mb-4">
                Pour toute question ou réclamation concernant le site :
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Par email :</strong> <a href="mailto:contact@companion.fr" className="text-primary hover:underline">contact@companion.fr</a></li>
                <li><strong>Par téléphone :</strong> +33 1 23 45 67 89</li>
                <li><strong>Par courrier :</strong> Companion SAS, 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Companion. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
