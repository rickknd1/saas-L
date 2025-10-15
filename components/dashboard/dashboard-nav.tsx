"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Scale, Search, User, Settings, LogOut, Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useUserPlan } from "@/hooks/use-user-plan"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export function DashboardNav() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isFreemium } = useUserPlan()
  const [searchFocused, setSearchFocused] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase() || "U"

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/50 glass-premium"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-20 items-center gap-6 px-8">
        {/* Logo Premium */}
        <Link href="/dashboard" className="group flex items-center gap-3">
          <motion.div
            className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Scale className="h-6 w-6 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold text-gradient-premium leading-none">
              Companion
            </span>
            <span className="text-xs text-muted-foreground">Legal SaaS</span>
          </div>
        </Link>

        {/* Search Bar Premium */}
        <div className="flex flex-1 items-center justify-center px-4">
          <motion.div
            className={`relative w-full max-w-xl transition-all duration-300 ${
              searchFocused ? "scale-105" : "scale-100"
            }`}
            animate={{ width: searchFocused ? "100%" : "90%" }}
          >
            <Search className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
              searchFocused ? "text-primary" : "text-muted-foreground"
            }`} />
            <Input
              type="search"
              placeholder="Rechercher un projet, document ou collaborateur..."
              className="w-full h-12 pl-12 pr-4 glass-premium border-glow focus-premium text-base"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-primary/50 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-3">
          {/* Plan Badge */}
          {isFreemium && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard/upgrade">
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass gap-2 hover:border-accent/50 group relative overflow-hidden"
                >
                  <Crown className="h-4 w-4 text-accent group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-semibold text-accent">Upgrade</span>
                  <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NotificationBell />
          </motion.div>

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ThemeToggle />
          </motion.div>

          {/* User Menu Premium */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full glass group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20 transition-all" />
                  <span className="relative text-sm font-bold text-gradient-premium">
                    {userInitials}
                  </span>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 glass-premium border-glow p-2">
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-glow">
                    <span className="text-sm font-bold text-white">{userInitials}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">
                      {user?.name || "Utilisateur"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {isFreemium && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                        <Crown className="h-3 w-3" />
                        Plan Freemium
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-border/50" />

              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:glass p-3">
                  <Link href="/dashboard/profile" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Profil</span>
                      <span className="text-xs text-muted-foreground">Gérer votre compte</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </motion.div>

              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:glass p-3">
                  <Link href="/dashboard/settings" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                      <Settings className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Paramètres</span>
                      <span className="text-xs text-muted-foreground">Préférences et sécurité</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </motion.div>

              {isFreemium && (
                <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:glass p-3 border border-accent/30 bg-accent/5">
                    <Link href="/dashboard/upgrade" className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                        <Crown className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-accent">Passer à Standard</span>
                        <span className="text-xs text-muted-foreground">Débloquez toutes les fonctionnalités</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </motion.div>
              )}

              <DropdownMenuSeparator className="bg-border/50" />

              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:glass hover:bg-destructive/10 p-3"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-destructive">Déconnexion</span>
                      <span className="text-xs text-muted-foreground">Se déconnecter du compte</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Premium border glow effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.header>
  )
}
