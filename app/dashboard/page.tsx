"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Clock, TrendingUp, Plus, FolderOpen, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useUserPlan } from "@/hooks/use-user-plan"

export default function DashboardPage() {
  const { plan, isFreemium, isLoading } = useUserPlan()
  const projectCount = 3
  const projectLimit = 5

  if (isLoading) {
    return <div className="space-y-8">Chargement...</div>
  }

  return (
    <div className="space-y-8">
      {isFreemium && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  Passez au plan Standard pour débloquer toutes les fonctionnalités
                </h3>
                <p className="text-sm text-muted-foreground">
                  Projets illimités, IA avancée, support prioritaire et bien plus pour seulement 23€/mois
                </p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/dashboard/upgrade">
                Passer au Standard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue sur votre espace de travail juridique</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectCount}
              {isFreemium && <span className="text-sm font-normal text-muted-foreground">/{projectLimit}</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              {isFreemium ? `${projectLimit - projectCount} restants` : "+2 ce mois-ci"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 cette semaine</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              2{isFreemium && <span className="text-sm font-normal text-muted-foreground">/3</span>}
            </div>
            <p className="text-xs text-muted-foreground">{isFreemium ? "1 restant" : "Dans votre équipe"}</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps gagné</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8h</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
            <CardDescription>Vos derniers dossiers en cours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "Contrat de fusion ABC Corp",
                status: "En révision",
                date: "Il y a 2 heures",
                members: 2,
              },
              {
                name: "Accord de confidentialité XYZ",
                status: "En attente",
                date: "Il y a 5 heures",
                members: 1,
              },
              {
                name: "Bail commercial - Paris 8ème",
                status: "Finalisé",
                date: "Hier",
                members: 2,
              },
            ].map((project, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <p className="font-medium leading-none">{project.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {project.date}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={project.status === "Finalisé" ? "secondary" : "default"}
                    className={
                      project.status === "En révision"
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : project.status === "Finalisé"
                          ? ""
                          : "bg-accent/10 text-accent hover:bg-accent/20"
                    }
                  >
                    {project.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {project.members}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions de votre équipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                user: "Marie Dubois",
                action: "a ajouté un commentaire",
                target: "Contrat de fusion ABC Corp",
                time: "Il y a 15 min",
              },
              {
                user: "Pierre Martin",
                action: "a comparé deux versions",
                target: "Accord de confidentialité XYZ",
                time: "Il y a 1 heure",
              },
              {
                user: "Sophie Laurent",
                action: "a finalisé",
                target: "Bail commercial - Paris 8ème",
                time: "Il y a 3 heures",
              },
              {
                user: "Jean Dupont",
                action: "a créé un nouveau projet",
                target: "Contrat de prestation IT",
                time: "Il y a 5 heures",
              },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
