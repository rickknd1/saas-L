"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useUserPlan } from "@/hooks/use-user-plan"
import { PLAN_LIMITS } from "@/lib/plan-manager"

export default function NewProjectPage() {
  const router = useRouter()
  const { plan, isFreemium, isLoading: planLoading } = useUserPlan()
  const [projectCount, setProjectCount] = useState(0)
  const [isFetching, setIsFetching] = useState(true)

  const projectLimit = isFreemium ? PLAN_LIMITS.freemium.projects : PLAN_LIMITS.standard.projects
  const isAtLimit = projectCount >= projectLimit

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    type: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Récupérer le nombre de projets au chargement
  useEffect(() => {
    const fetchProjectCount = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjectCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching project count:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchProjectCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isAtLimit) {
      setErrors({ limit: "Limite de projets atteinte" })
      return
    }

    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Le nom du projet est requis"
    if (!formData.client.trim()) newErrors.client = "Le nom du client est requis"
    if (!formData.type) newErrors.type = "Le type de contrat est requis"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          client: formData.client,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Gérer l'erreur de limitation freemium
        if (data.code === "FREEMIUM_LIMIT_REACHED") {
          toast.error("Limite atteinte", {
            description: data.message,
            action: {
              label: "Passer au Standard",
              onClick: () => router.push("/pricing"),
            },
            duration: 8000,
          })
          setErrors({ limit: data.message })
          return
        }

        throw new Error(data.error || "Erreur lors de la création du projet")
      }

      toast.success("Projet créé !", {
        description: `Le projet "${formData.name}" a été créé avec succès.`,
      })

      // Rediriger vers la page du projet
      router.push(`/dashboard/projects/${data.project.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible de créer le projet",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Afficher un loader pendant le chargement
  if (planLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouveau projet</h1>
          <p className="text-muted-foreground">Créez un nouveau projet pour organiser vos contrats</p>
        </div>
      </div>

      {isFreemium && projectCount >= projectLimit - 1 && (
        <Alert className={isAtLimit ? "border-destructive/50 bg-destructive/5" : "border-accent/50 bg-accent/5"}>
          <AlertCircle className={`h-4 w-4 ${isAtLimit ? "text-destructive" : "text-accent"}`} />
          <AlertDescription className="flex items-center justify-between">
            <div>
              {isAtLimit ? (
                <>
                  <strong>Limite atteinte !</strong> Vous avez utilisé tous vos projets ({projectCount}/{projectLimit}).
                  Passez au plan Standard pour créer des projets illimités.
                </>
              ) : (
                <>
                  <strong>Attention !</strong> Vous utilisez {projectCount}/{projectLimit} projet{projectLimit > 1 ? "s" : ""}. Il vous reste{" "}
                  {projectLimit - projectCount} projet disponible.
                </>
              )}
            </div>
            <Button variant="outline" size="sm" className="ml-4 shrink-0 bg-transparent" asChild>
              <Link href="/pricing">
                <Sparkles className="mr-2 h-3 w-3" />
                Passer au Standard
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations du projet</CardTitle>
          <CardDescription>Renseignez les détails de votre nouveau projet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                placeholder="Ex: Contrat de bail commercial - Société ABC"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
                disabled={isAtLimit}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Nom du client *</Label>
              <Input
                id="client"
                placeholder="Ex: Société ABC"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className={errors.client ? "border-destructive" : ""}
                disabled={isAtLimit}
              />
              {errors.client && <p className="text-xs text-destructive">{errors.client}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de contrat *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={isAtLimit}
              >
                <SelectTrigger id="type" className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travail">Contrat de travail</SelectItem>
                  <SelectItem value="commercial">Contrat commercial</SelectItem>
                  <SelectItem value="bail">Bail commercial</SelectItem>
                  <SelectItem value="nda">NDA / Confidentialité</SelectItem>
                  <SelectItem value="prestation">Contrat de prestation</SelectItem>
                  <SelectItem value="partenariat">Accord de partenariat</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Ajoutez des notes ou détails sur ce projet..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isAtLimit}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/projects">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isAtLimit}>
                {isLoading ? "Création..." : isAtLimit ? "Limite atteinte" : "Créer le projet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
