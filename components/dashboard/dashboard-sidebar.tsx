"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderOpen, FileText, Users, Settings, HelpCircle, GitCompare, Bot } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projets",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    name: "Comparaison",
    href: "/dashboard/compare",
    icon: GitCompare,
  },
  {
    name: "Assistant IA",
    href: "/dashboard/assistant",
    icon: Bot,
  },
  {
    name: "Équipe",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
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
