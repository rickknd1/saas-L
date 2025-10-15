"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useProjects, type Project } from "@/hooks/use-projects"
import { toast } from "sonner"

export default function NewProjectPage() {
  const router = useRouter()
  const { userId, user } = useAuth()
  const { projects } = useProjects(userId || null)

  const userPlan = user?.plan || "freemium"
  const projectCount = projects?.length || 0
  const projectLimit = userPlan === "freemium" ? 5 : 999999
  const isAtLimit = userPlan === "freemium" && projectCount >= projectLimit

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    type: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isAtLimit) {
      setErrors({ limit: "Limite de projets atteinte" })
      toast.error("Limite de projets atteinte", {
        description: "Passez au plan Standard pour créer des projets illimités"
      })
      return
    }

    if (!userId) {
      toast.error("Erreur", { description: "Vous devez être connecté pour créer un projet" })
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
    setErrors({})

    try {
      // Créer le projet via l'API
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          name: formData.name.trim(),
          description: `${formData.type} - ${formData.client}${formData.description ? '\n\n' + formData.description : ''}`,
          status: "DRAFT",
          priority: "MEDIUM",
          confidential: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création du projet")
      }

      const data = await response.json()
      console.log("[NewProject] Project created:", data.project)

      toast.success("Projet créé avec succès", {
        description: `${formData.name} a été créé`
      })

      // Rediriger vers la page du projet créé avec le vrai ID
      router.push(`/dashboard/projects/${data.project.id}`)
    } catch (error: any) {
      console.error("[NewProject] Error creating project:", error)
      toast.error("Erreur lors de la création", {
        description: error.message || "Une erreur est survenue"
      })
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient mesh background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">Nouveau projet</h1>
            <p className="text-muted-foreground text-lg">Créez un nouveau projet pour organiser vos contrats</p>
          </div>
        </div>

      {userPlan === "freemium" && projectCount >= projectLimit - 1 && (
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
                  <strong>Attention !</strong> Vous utilisez {projectCount}/{projectLimit} projets. Il vous reste{" "}
                  {projectLimit - projectCount} projet disponible.
                </>
              )}
            </div>
            <Button variant="outline" size="sm" className="ml-4 shrink-0 bg-transparent" asChild>
              <Link href="/dashboard/upgrade">
                <Sparkles className="mr-2 h-3 w-3" />
                Passer au Standard
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

        <Card className="card-premium border-glow">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Informations du projet</CardTitle>
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

            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

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
    </div>
  )
}
