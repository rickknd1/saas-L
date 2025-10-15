"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Info, Lock } from "lucide-react"

type SecurityLevel = "low" | "medium" | "high" | "critical"

interface SecurityBannerProps {
  level: SecurityLevel
  message: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }>
  className?: string
}

const levelConfig = {
  low: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-500/5 text-blue-900 dark:text-blue-100",
    iconClassName: "text-blue-500",
  },
  medium: {
    icon: Shield,
    className: "border-yellow-500/50 bg-yellow-500/5 text-yellow-900 dark:text-yellow-100",
    iconClassName: "text-yellow-500",
  },
  high: {
    icon: AlertTriangle,
    className: "border-orange-500/50 bg-orange-500/5 text-orange-900 dark:text-orange-100",
    iconClassName: "text-orange-500",
  },
  critical: {
    icon: Lock,
    className: "border-destructive/50 bg-destructive/5 text-destructive",
    iconClassName: "text-destructive",
  },
}

export function SecurityBanner({ level, message, actions, className }: SecurityBannerProps) {
  const config = levelConfig[level]
  const Icon = config.icon

  return (
    <Alert className={`${config.className} ${className || ""}`}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="flex-1">{message}</span>
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className="shrink-0"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
