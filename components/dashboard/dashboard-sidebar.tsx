"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderOpen, FileText, Users, Settings, HelpCircle, GitCompare, Bot } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    disabled: false,
  },
  {
    name: "Projets",
    href: "/dashboard/projects",
    icon: FolderOpen,
    disabled: false,
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    disabled: false,
  },
  {
    name: "Comparaison",
    href: "/dashboard/compare",
    icon: GitCompare,
    disabled: false,
  },
  {
    name: "Assistant IA",
    href: "/dashboard/assistant",
    icon: Bot,
    disabled: true,
    disabledMessage: "Cette fonctionnalité sera disponible dans la version finale du projet. Elle n'est pas encore implémentée dans cette version MVP.",
  },
  {
    name: "Équipe",
    href: "/dashboard/team",
    icon: Users,
    disabled: false,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
    disabled: false,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  const handleDisabledClick = (message: string) => {
    toast.info("Fonctionnalité à venir", {
      description: message,
      duration: 5000,
    })
  }

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href

          if (item.disabled) {
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start opacity-50 cursor-not-allowed hover:opacity-60",
                )}
                onClick={() => handleDisabledClick(item.disabledMessage || "Cette fonctionnalité arrive bientôt")}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            )
          }

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Button variant="ghost" className="w-full justify-start">
          <HelpCircle className="mr-3 h-4 w-4" />
          Aide & Support
        </Button>
      </div>
    </aside>
  )
}
