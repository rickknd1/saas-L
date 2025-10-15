import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, Shield } from "lucide-react"

export default function PrivacyPage() {
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
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Politique de confidentialité</h1>
          <p className="text-muted-foreground">Dernière mise à jour : 1er janvier 2025</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Chez Companion, nous prenons la protection de vos données personnelles très au sérieux.
                Cette politique de confidentialité explique comment nous collectons, utilisons, partageons
                et protégeons vos informations personnelles conformément au Règlement Général sur la
                Protection des Données (RGPD).
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">1. Données collectées</h2>
              <p className="text-muted-foreground mb-4">
                Nous collectons les informations suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, navigateur utilisé</li>
                <li><strong>Données d'utilisation :</strong> pages consultées, fonctionnalités utilisées, durée des sessions</li>
                <li><strong>Données professionnelles :</strong> nom du cabinet, fonction, documents téléchargés</li>
                <li><strong>Données de paiement :</strong> informations de carte bancaire (traitées par notre prestataire de paiement sécurisé)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">2. Finalités du traitement</h2>
              <p className="text-muted-foreground mb-4">
                Vos données sont collectées pour les finalités suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Gestion de votre compte et authentification</li>
                <li>Fourniture et amélioration de nos services</li>
                <li>Facturation et gestion des paiements</li>
                <li>Support client et assistance technique</li>
                <li>Communication sur nos services et nouvelles fonctionnalités</li>
                <li>Analyse statistique et amélioration de la plateforme</li>
                <li>Respect de nos obligations légales</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">3. Base légale du traitement</h2>
              <p className="text-muted-foreground mb-4">
                Les traitements de vos données personnelles sont fondés sur :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Exécution du contrat :</strong> pour la fourniture de nos services</li>
                <li><strong>Consentement :</strong> pour l'envoi de communications marketing (révocable à tout moment)</li>
                <li><strong>Intérêt légitime :</strong> pour l'amélioration de nos services et la sécurité</li>
                <li><strong>Obligations légales :</strong> pour la conservation des données comptables et fiscales</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">4. Durée de conservation</h2>
              <p className="text-muted-foreground mb-4">
                Vos données sont conservées pendant :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Données de compte :</strong> durée de la relation contractuelle + 3 ans</li>
                <li><strong>Données de facturation :</strong> 10 ans conformément aux obligations légales</li>
                <li><strong>Données de connexion :</strong> 1 an maximum</li>
                <li><strong>Cookies :</strong> 13 mois maximum</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">5. Partage des données</h2>
              <p className="text-muted-foreground mb-4">
                Nous ne vendons jamais vos données. Vos informations peuvent être partagées uniquement avec :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Nos prestataires de services (hébergement, paiement, support) sous contrat strict</li>
                <li>Les autorités légales sur réquisition judiciaire</li>
                <li>Vos collaborateurs dans le cadre de l'utilisation collaborative de la plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">6. Vos droits</h2>
              <p className="text-muted-foreground mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Pour exercer vos droits, contactez-nous à : <a href="mailto:privacy@companion.fr" className="text-primary hover:underline">privacy@companion.fr</a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">7. Sécurité</h2>
              <p className="text-muted-foreground mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
                protéger vos données contre tout accès non autorisé, perte ou destruction :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Chiffrement AES-256 des données sensibles</li>
                <li>Authentification à deux facteurs (2FA)</li>
                <li>Surveillance et audits de sécurité réguliers</li>
                <li>Formation du personnel à la protection des données</li>
                <li>Hébergement sécurisé en France (certifié ISO 27001)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos
                préférences de cookies à tout moment via les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
              <p className="text-muted-foreground mb-4">
                Nous nous réservons le droit de modifier cette politique de confidentialité. Toute
                modification sera notifiée par email et sur notre site web.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="text-muted-foreground mb-4">
                Pour toute question concernant cette politique de confidentialité :
              </p>
              <ul className="list-none space-y-2 text-muted-foreground">
                <li><strong>Email :</strong> <a href="mailto:privacy@companion.fr" className="text-primary hover:underline">privacy@companion.fr</a></li>
                <li><strong>Adresse :</strong> Companion SAS, 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
                <li><strong>DPO :</strong> <a href="mailto:dpo@companion.fr" className="text-primary hover:underline">dpo@companion.fr</a></li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Vous pouvez également introduire une réclamation auprès de la CNIL :
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  www.cnil.fr
                </a>
              </p>
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
