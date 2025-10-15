import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, FileText } from "lucide-react"

export default function TermsPage() {
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Conditions générales d'utilisation</h1>
          <p className="text-muted-foreground">Dernière mise à jour : 1er janvier 2025</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
              <p className="text-muted-foreground mb-4">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la
                plateforme Companion (ci-après "la Plateforme") éditée par Companion SAS (ci-après "l'Éditeur").
              </p>
              <p className="text-muted-foreground">
                L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">2. Définitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Utilisateur :</strong> toute personne physique ou morale utilisant la Plateforme</li>
                <li><strong>Contenu :</strong> l'ensemble des documents, données et informations mis en ligne</li>
                <li><strong>Services :</strong> l'ensemble des fonctionnalités proposées par la Plateforme</li>
                <li><strong>Compte :</strong> espace personnel créé par l'Utilisateur sur la Plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">3. Inscription et compte</h2>
              <p className="text-muted-foreground mb-4">
                <strong>3.1 Création de compte</strong><br />
                L'accès à certaines fonctionnalités de la Plateforme nécessite la création d'un compte.
                L'Utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>3.2 Sécurité du compte</strong><br />
                L'Utilisateur est responsable de la confidentialité de ses identifiants de connexion.
                Toute utilisation du compte est présumée émaner de l'Utilisateur.
              </p>
              <p className="text-muted-foreground">
                <strong>3.3 Suspension et résiliation</strong><br />
                L'Éditeur se réserve le droit de suspendre ou résilier un compte en cas de violation
                des présentes CGU ou d'utilisation frauduleuse.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">4. Services proposés</h2>
              <p className="text-muted-foreground mb-4">
                La Plateforme propose les services suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Gestion et stockage de documents juridiques</li>
                <li>Comparaison de versions de documents</li>
                <li>Collaboration en temps réel</li>
                <li>Annotation et commentaires</li>
                <li>Assistant juridique intelligent</li>
                <li>Gestion de projets juridiques</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                L'Éditeur se réserve le droit de modifier, suspendre ou interrompre tout ou partie
                des Services à tout moment.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">5. Obligations de l'Utilisateur</h2>
              <p className="text-muted-foreground mb-4">
                L'Utilisateur s'engage à :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Ne pas utiliser la Plateforme à des fins illégales ou non autorisées</li>
                <li>Ne pas porter atteinte aux droits de tiers</li>
                <li>Ne pas tenter d'accéder de manière non autorisée aux systèmes de la Plateforme</li>
                <li>Ne pas diffuser de virus ou autres codes malveillants</li>
                <li>Respecter les lois et réglementations en vigueur</li>
                <li>Ne pas usurper l'identité d'une autre personne</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
              <p className="text-muted-foreground mb-4">
                <strong>6.1 Propriété de la Plateforme</strong><br />
                L'ensemble des éléments de la Plateforme (structure, design, textes, graphiques, logiciels)
                sont la propriété exclusive de l'Éditeur et sont protégés par les lois relatives à la
                propriété intellectuelle.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>6.2 Propriété du Contenu</strong><br />
                L'Utilisateur conserve tous ses droits de propriété intellectuelle sur le Contenu qu'il
                télécharge sur la Plateforme.
              </p>
              <p className="text-muted-foreground">
                <strong>6.3 Licence d'utilisation</strong><br />
                En téléchargeant du Contenu, l'Utilisateur accorde à l'Éditeur une licence non exclusive
                pour héberger, stocker, et afficher ce Contenu dans le cadre de la fourniture des Services.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">7. Données personnelles</h2>
              <p className="text-muted-foreground mb-4">
                Le traitement des données personnelles est régi par notre{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">8. Tarifs et paiement</h2>
              <p className="text-muted-foreground mb-4">
                <strong>8.1 Tarifs</strong><br />
                Les tarifs des Services sont indiqués sur la{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  page Tarifs
                </Link>
                . Ils sont exprimés en euros TTC.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>8.2 Paiement</strong><br />
                Le paiement s'effectue par carte bancaire via un prestataire de paiement sécurisé.
                Pour les abonnements mensuels, le paiement est automatiquement renouvelé chaque mois.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>8.3 Résiliation</strong><br />
                L'Utilisateur peut résilier son abonnement à tout moment depuis son espace personnel.
                Aucun remboursement n'est effectué pour la période en cours.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">9. Responsabilité</h2>
              <p className="text-muted-foreground mb-4">
                <strong>9.1 Disponibilité</strong><br />
                L'Éditeur s'efforce d'assurer la disponibilité de la Plateforme 24h/24 et 7j/7,
                mais ne peut garantir une accessibilité permanente.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>9.2 Limitation de responsabilité</strong><br />
                L'Éditeur ne saurait être tenu responsable des dommages indirects résultant de
                l'utilisation de la Plateforme.
              </p>
              <p className="text-muted-foreground">
                <strong>9.3 Contenu Utilisateur</strong><br />
                L'Utilisateur est seul responsable du Contenu qu'il télécharge et de son utilisation
                de la Plateforme.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">10. Modification des CGU</h2>
              <p className="text-muted-foreground mb-4">
                L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les
                modifications entrent en vigueur dès leur publication sur la Plateforme. L'Utilisateur
                sera informé par email de toute modification substantielle.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">11. Loi applicable et juridiction</h2>
              <p className="text-muted-foreground mb-4">
                Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut
                d'accord amiable, compétence exclusive est attribuée aux tribunaux de Paris.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
              <p className="text-muted-foreground mb-4">
                Pour toute question concernant les présentes CGU :
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email :</strong> <a href="mailto:legal@companion.fr" className="text-primary hover:underline">legal@companion.fr</a></li>
                <li><strong>Adresse :</strong> Companion SAS, 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
                <li><strong>Téléphone :</strong> +33 1 23 45 67 89</li>
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
