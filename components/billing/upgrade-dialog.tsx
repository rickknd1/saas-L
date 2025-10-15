"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Crown, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string // ex: "créer un nouveau projet", "ajouter des membres"
  currentUsage: number
  limit: number
  usageLabel: string // ex: "projet", "membre", "document"
}

export function UpgradeDialog({
  open,
  onOpenChange,
  feature,
  currentUsage,
  limit,
  usageLabel,
}: UpgradeDialogProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push("/dashboard/upgrade")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Crown className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">Limite du forfait Freemium atteinte</DialogTitle>
          <DialogDescription className="text-center">
            Vous avez déjà utilisé <span className="font-semibold">{currentUsage} {usageLabel}{currentUsage > 1 ? 's' : ''}</span> sur {limit} autorisé{limit > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground text-center">
            Pour {feature}, vous devez passer au <span className="font-semibold text-foreground">forfait Standard</span>.
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Crown className="mr-2 h-4 w-4" />
            Passer au forfait Standard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
