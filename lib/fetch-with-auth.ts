/**
 * Wrapper autour de fetch pour gérer automatiquement les erreurs 401
 * Redirige vers /login si la session a expiré
 */

import { toast } from 'sonner'

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(input, {
      ...init,
      credentials: 'include', // Toujours inclure les cookies
    })

    // Si 401, rediriger vers login
    if (response.status === 401) {
      console.warn('[FetchWithAuth] Session expirée, redirection vers /login')

      toast.error('Session expirée', {
        description: 'Vous allez être redirigé vers la page de connexion',
      })

      // Rediriger après un court délai
      setTimeout(() => {
        // Sauvegarder l'URL actuelle pour rediriger après reconnexion
        const currentPath = window.location.pathname + window.location.search
        if (currentPath !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath)
        }
        window.location.href = '/login'
      }, 1500)

      // Retourner quand même la réponse pour que le code appelant puisse gérer
      return response
    }

    return response
  } catch (error) {
    console.error('[FetchWithAuth] Network error:', error)
    throw error
  }
}

/**
 * Version async/await de fetchWithAuth qui parse automatiquement le JSON
 */
export async function fetchJsonWithAuth<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetchWithAuth(input, init)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau' }))
    throw new Error(error.error || `Erreur HTTP ${response.status}`)
  }

  return response.json()
}
