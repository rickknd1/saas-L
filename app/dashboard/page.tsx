"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, Clock, TrendingUp, Plus, FolderOpen, Sparkles, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { useUserPlan } from "@/hooks/use-user-plan"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useProjects } from "@/hooks/use-projects"
import { useRecentActivity } from "@/hooks/use-recent-activity"
import { useEffect } from "react"
import { motion } from "framer-motion"

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 }
  }
}

export default function DashboardPage() {
  const { userId, refetchUser } = useAuth()
  const { plan, isFreemium, isLoading: planLoading } = useUserPlan()
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { projects, isLoading: projectsLoading } = useProjects(userId)
  const { activities, isLoading: activitiesLoading } = useRecentActivity(userId, 4)

  // Refetch user data on mount to ensure plan is up to date after payment
  useEffect(() => {
    refetchUser()
  }, [refetchUser])

  const projectLimit = isFreemium ? 1 : Infinity
  const projectCount = stats?.projects || 0
  const isLoading = planLoading || statsLoading

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  const recentProjects = projects.slice(0, 3)

  const formatActivity = (activity: any) => {
    const actionMap: Record<string, string> = {
      CREATE: "a créé",
      UPDATE: "a modifié",
      DELETE: "a supprimé",
      VIEW: "a consulté",
      DOWNLOAD: "a téléchargé",
      SHARE: "a partagé",
    }

    return {
      user: activity.user?.name || "Utilisateur inconnu",
      action: actionMap[activity.action] || activity.action,
      target: activity.project?.name || activity.document?.name || "un élément",
      time: new Date(activity.createdAt).toLocaleString("fr-FR", {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "short",
      }),
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Il y a quelques minutes"
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`
    if (diffDays < 2) return "Hier"
    return `Il y a ${diffDays} jours`
  }

  const getProjectStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: "Brouillon",
      IN_REVIEW: "En révision",
      PENDING: "En attente",
      COMPLETED: "Finalisé",
      ARCHIVED: "Archivé",
    }
    return statusMap[status] || status
  }

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient mesh background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <motion.div
        className="space-y-8 pb-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Premium Upgrade Banner */}
        {isFreemium && (
          <motion.div variants={item}>
            <Card className="glass-premium border-glow overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
              <CardContent className="relative flex items-center justify-between p-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-glow"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Sparkles className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-2 text-foreground">
                      Passez au plan Standard
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      Projets illimités, IA avancée, support prioritaire et bien plus pour seulement 23€/mois
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                >
                  <Link href="/dashboard/upgrade">
                    <span className="flex items-center gap-2">
                      Passer au Standard
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          variants={item}
        >
          <div className="space-y-2">
            <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground">
              Tableau de bord
            </h1>
            <p className="text-lg text-muted-foreground">
              Bienvenue sur votre espace de travail juridique
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
            >
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-5 w-5" />
                Nouveau projet
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
        >
          <motion.div variants={statsCardVariants} whileHover="hover">
            <Card className="card-premium border-glow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Projets actifs</CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold font-serif">
                  {projectCount}
                  {isFreemium && <span className="text-lg font-normal text-muted-foreground">/{projectLimit}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isFreemium ? `${projectLimit - projectCount} restant${projectLimit - projectCount > 1 ? 's' : ''}` : "Projets actifs"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statsCardVariants} whileHover="hover">
            <Card className="card-premium border-glow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Documents</CardTitle>
                <div className="rounded-lg bg-accent/10 p-2 group-hover:bg-accent/20 transition-colors">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold font-serif">{stats?.documents || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">Total documents</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statsCardVariants} whileHover="hover">
            <Card className="card-premium border-glow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Collaborateurs</CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold font-serif">
                  {stats?.collaborators || 0}
                  {isFreemium && <span className="text-lg font-normal text-muted-foreground">/3</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isFreemium ? `${Math.max(0, 3 - (stats?.collaborators || 0))} restant(s)` : "Dans votre équipe"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statsCardVariants} whileHover="hover">
            <Card className="card-premium border-glow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Temps gagné</CardTitle>
                <div className="rounded-lg bg-accent/10 p-2 group-hover:bg-accent/20 transition-colors">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold font-serif">{stats?.timeSaved || 0}h</div>
                <p className="text-sm text-muted-foreground mt-2">Ce mois-ci</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Projects & Activity */}
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={container}
        >
          <motion.div variants={item}>
            <Card className="glass-premium hover-lift">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Projets récents
                </CardTitle>
                <CardDescription>Vos derniers dossiers en cours</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {projectsLoading ? (
                  <div className="text-center text-muted-foreground py-8">Chargement...</div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Aucun projet récent</div>
                ) : (
                  recentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <div className="group relative rounded-xl border border-border/50 p-4 hover:border-primary/50 transition-all duration-300 glass cursor-pointer overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <p className="font-semibold leading-none group-hover:text-primary transition-colors">
                                {project.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(project.updatedAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={project.status === "COMPLETED" ? "secondary" : "default"}
                                className={`glass-premium ${
                                  project.status === "IN_REVIEW"
                                    ? "bg-primary/20 text-primary"
                                    : project.status === "COMPLETED"
                                      ? ""
                                      : "bg-accent/20 text-accent"
                                }`}
                              >
                                {getProjectStatus(project.status)}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {project._count.members}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-premium hover-lift">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Activité récente
                </CardTitle>
                <CardDescription>Dernières actions de votre équipe</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {activitiesLoading ? (
                  <div className="text-center text-muted-foreground py-8">Chargement...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Aucune activité récente</div>
                ) : (
                  activities.map((activity, index) => {
                    const formatted = formatActivity(activity)
                    return (
                      <motion.div
                        key={activity.id}
                        className="flex gap-4 group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 text-sm font-bold text-primary group-hover:from-primary/30 group-hover:to-accent/20 transition-all">
                          {formatted.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm leading-relaxed">
                            <span className="font-semibold text-foreground">{formatted.user}</span>{" "}
                            <span className="text-muted-foreground">{formatted.action}</span>{" "}
                            <span className="font-medium text-foreground">{formatted.target}</span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatted.time}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
