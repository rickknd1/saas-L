"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "./use-auth"

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface Invoice {
  id: string
  number: string
  amount: string
  currency: string
  status: string
  date: string
  pdfUrl: string | null
  hostedUrl: string | null
}

interface BillingData {
  paymentMethods: PaymentMethod[]
  invoices: Invoice[]
  subscription?: {
    status: string
    plan: string
    currentPeriodEnd: string
  } | null
  hasActiveSubscription: boolean
}

/**
 * Hook pour récupérer les données de facturation avec React Query
 * - Cache automatique
 * - Revalidation intelligente
 * - Dépend de l'utilisateur authentifié
 */
export function useBillingData() {
  const { user, userId } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["billing", userId],
    queryFn: async (): Promise<BillingData> => {
      if (!userId) {
        return {
          paymentMethods: [],
          invoices: [],
          subscription: null,
          hasActiveSubscription: false,
        }
      }

      try {
        // Fetch payment methods
        const pmResponse = await fetch(`/api/billing/payment-methods?userId=${userId}`, {
          credentials: "include",
        })
        const pmData = await pmResponse.json()

        // Fetch invoices
        const invResponse = await fetch(`/api/billing/invoices?userId=${userId}`, {
          credentials: "include",
        })
        const invData = await invResponse.json()

        // Déterminer si l'utilisateur a un abonnement actif
        const hasActiveSubscription = user?.plan === "standard"

        return {
          paymentMethods: pmData.success ? pmData.paymentMethods : [],
          invoices: invData.success ? invData.invoices : [],
          subscription: pmData.subscription || null,
          hasActiveSubscription,
        }
      } catch (err) {
        console.error("Erreur chargement billing data:", err)
        return {
          paymentMethods: [],
          invoices: [],
          subscription: null,
          hasActiveSubscription: false,
        }
      }
    },
    enabled: !!userId, // Ne query que si userId existe
    staleTime: 2 * 60 * 1000, // 2 minutes (données billing moins fréquentes)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fonction pour refetch les données de billing
  const refetchBillingData = () => {
    queryClient.invalidateQueries({ queryKey: ["billing", userId] })
  }

  return {
    billingData: data,
    paymentMethods: data?.paymentMethods || [],
    invoices: data?.invoices || [],
    subscription: data?.subscription,
    hasActiveSubscription: data?.hasActiveSubscription || false,
    isLoading,
    error,
    refetch,
    refetchBillingData,
  }
}
