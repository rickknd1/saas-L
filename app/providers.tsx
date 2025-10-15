'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode, useEffect } from 'react'
import { SocketProvider } from '@/lib/socket-context'
import { useAuth } from '@/hooks/use-auth'

/**
 * Wrapper interne pour Socket.io qui a accès à useAuth
 * Charge seulement après le mount pour éviter les conflits d'hydration
 */
function SocketWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Pendant l'hydration SSR, ne pas initialiser Socket.io
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SocketProvider userId={user?.id} userName={user?.name || user?.email}>
      {children}
    </SocketProvider>
  )
}

/**
 * Provider React Query pour cache optimisé
 * - Cache automatique des requêtes API
 * - Revalidation intelligente en arrière-plan
 * - Synchronisation automatique entre onglets
 * - Plus besoin de localStorage pour les données utilisateur
 *
 * + Socket.io Provider pour le chat temps réel
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache valide pendant 1 minute
            staleTime: 60 * 1000,
            // Garder en cache pendant 5 minutes après inutilisation
            gcTime: 5 * 60 * 1000,
            // Refetch quand l'utilisateur revient sur l'onglet
            refetchOnWindowFocus: true,
            // Refetch après reconnexion internet
            refetchOnReconnect: true,
            // Retry 1 fois en cas d'erreur
            retry: 1,
            // Ne pas refetch automatiquement pendant le mount
            refetchOnMount: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SocketWrapper>
        {children}
      </SocketWrapper>
      {/* DevTools pour debug cache (visible seulement en dev) */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  )
}
