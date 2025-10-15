"use client"

import { AlertTriangle, Info, ShieldAlert, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

type SecurityLevel = "info" | "warning" | "danger" | "critical"

interface SecurityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  severity?: SecurityLevel
  confirmText?: string
  cancelText?: string
  requiresInput?: {
    placeholder: string
    expectedValue: string
    label?: string
  }
  children?: React.ReactNode
  onConfirm: () => void
  onCancel?: () => void
  confirmButtonVariant?: "default" | "destructive"
}

const severityConfig = {
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  danger: {
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  critical: {
    icon: ShieldAlert,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export function SecurityModal({
  open,
  onOpenChange,
  title,
  description,
  severity = "info",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  requiresInput,
  children,
  onConfirm,
  onCancel,
  confirmButtonVariant,
}: SecurityModalProps) {
  const [inputValue, setInputValue] = useState("")
  const config = severityConfig[severity]
  const Icon = config.icon

  const handleConfirm = () => {
    if (requiresInput && inputValue !== requiresInput.expectedValue) {
      return
    }
    onConfirm()
    setInputValue("")
  }

  const handleCancel = () => {
    setInputValue("")
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const isConfirmDisabled = requiresInput ? inputValue !== requiresInput.expectedValue : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-sm">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {children}

          {requiresInput && (
            <div className="space-y-2">
              <Label htmlFor="confirm-input">{requiresInput.label || "Pour confirmer :"}</Label>
              <Input
                id="confirm-input"
                placeholder={requiresInput.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant || (severity === "critical" || severity === "danger" ? "destructive" : "default")}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
