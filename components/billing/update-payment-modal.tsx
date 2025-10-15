"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface UpdatePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess?: () => void
}

export function UpdatePaymentModal({ open, onOpenChange, userId, onSuccess }: UpdatePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "google_pay">("card")
  const [formData, setFormData] = useState({
    name: "",
    country: "FR",
    address: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.cardNumber || !formData.expiry || !formData.cvc) {
      toast.error("Tous les champs sont requis")
      return
    }

    setIsLoading(true)

    try {
      // TODO: Intégrer avec Stripe Elements pour sécuriser la saisie de carte
      // Pour l'instant, on redirige vers le portail Stripe
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Erreur lors de l'ouverture du portail")
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Impossible de mettre à jour le paiement")
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(" ").substr(0, 19)
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + " / " + cleaned.substr(2, 2)
    }
    return cleaned
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mode de paiement</DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations de paiement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Rick knd"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Pays ou région</Label>
            <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="TN">Tunisie</SelectItem>
                <SelectItem value="BE">Belgique</SelectItem>
                <SelectItem value="CH">Suisse</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse - Ligne 1</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Rue de la Paix"
            />
          </div>

          <div className="space-y-3">
            <Label>Méthode de paiement</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">Carte bancaire</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("google_pay")}
                className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  paymentMethod === "google_pay"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-sm font-medium">Google Pay</span>
              </button>
            </div>
          </div>

          {paymentMethod === "card" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                    placeholder="1234 1234 1234 1234"
                    maxLength={19}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="h-5 w-8 rounded bg-gradient-to-r from-red-500 to-orange-500"></div>
                    <div className="h-5 w-8 rounded bg-gradient-to-r from-blue-600 to-blue-400"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Date d'expiration</Label>
                  <Input
                    id="expiry"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM / AA"
                    maxLength={7}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">Code de sécurité</Label>
                  <Input
                    id="cvc"
                    value={formData.cvc}
                    onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, "") })}
                    placeholder="CVC"
                    maxLength={4}
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
