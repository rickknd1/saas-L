"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, FolderOpen, Users, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold">
            <Scale className="h-7 w-7 text-primary" />
            <span>Companion</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Bienvenue sur Companion !</h1>
          <p className="mt-2 text-muted-foreground">Découvrez comment tirer le meilleur parti de votre plateforme</p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Créez votre premier projet</CardTitle>
              <CardDescription>Organisez vos contrats par projet pour une meilleure collaboration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Organisez par client ou dossier</p>
                    <p className="text-sm text-muted-foreground">
                      Chaque projet peut contenir plusieurs documents et versions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Suivez l'avancement</p>
                    <p className="text-sm text-muted-foreground">
                      Utilisez les statuts pour suivre l'état de vos projets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Centralisez vos documents</p>
                    <p className="text-sm text-muted-foreground">
                      Tous vos contrats au même endroit, accessibles à tout moment
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={() => setStep(2)}>Suivant</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Collaborez en équipe</CardTitle>
              <CardDescription>Invitez vos collègues et travaillez ensemble sur vos contrats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Invitez des collaborateurs</p>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez des membres à vos projets avec des rôles spécifiques
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Commentez et annotez</p>
                    <p className="text-sm text-muted-foreground">
                      Échangez directement sur les documents pour gagner du temps
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Suivez l'activité</p>
                    <p className="text-sm text-muted-foreground">
                      Restez informé des modifications et commentaires en temps réel
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Précédent
                </Button>
                <Button onClick={() => setStep(3)}>Suivant</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Comparez les versions</CardTitle>
              <CardDescription>Identifiez instantanément les modifications entre deux versions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Comparaison intelligente</p>
                    <p className="text-sm text-muted-foreground">
                      Visualisez les ajouts, suppressions et modifications en couleur
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Historique complet</p>
                    <p className="text-sm text-muted-foreground">
                      Accédez à toutes les versions précédentes de vos documents
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Exportez les rapports</p>
                    <p className="text-sm text-muted-foreground">
                      Générez des rapports PDF de comparaison pour vos clients
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Précédent
                </Button>
                <Button onClick={handleComplete}>Commencer</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={handleComplete} className="text-muted-foreground">
            Passer l'introduction
          </Button>
        </div>
      </div>
    </div>
  )
}
