/**
 * Rate Limiting pour protéger contre les attaques brute force
 * Utilise une Map en mémoire pour le développement
 * En production, utiliser Redis pour un système distribué
 */

interface RateLimitConfig {
  windowMs: number  // Fenêtre de temps en millisecondes
  maxRequests: number  // Nombre maximum de requêtes dans la fenêtre
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store en mémoire (en production, utiliser Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configurations prédéfinies (optimisées pour l'UX)
export const RATE_LIMIT_CONFIGS = {
  // Login - 10 tentatives par 5 minutes (permet de se tromper plusieurs fois)
  LOGIN: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
  },
  // Register - 5 inscriptions par heure (permet des erreurs de formulaire)
  REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 5,
  },
  // API générale - 100 requêtes par minute
  API_GENERAL: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  // Upload de fichiers - 10 uploads par minute
  UPLOAD: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  // Comparaison de documents - 20 par minute (opération coûteuse)
  COMPARE: {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
} as const

/**
 * Vérifie si une requête dépasse la limite
 * @param identifier - Identifiant unique (IP + endpoint ou userId + endpoint)
 * @param config - Configuration du rate limit
 * @returns true si la limite est dépassée, false sinon
 */
export function isRateLimited(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Nettoyer les entrées expirées toutes les 1000 requêtes
  if (rateLimitStore.size % 1000 === 0) {
    cleanupExpiredEntries()
  }

  // Pas d'entrée ou entrée expirée
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Incrémenter le compteur
  entry.count++

  // Vérifier si limite dépassée
  if (entry.count > config.maxRequests) {
    return {
      limited: true,
      resetTime: entry.resetTime,
      remaining: 0,
    }
  }

  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Nettoie les entrées expirées du store
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Récupère l'identifiant de la requête (IP + User Agent hash)
 */
export function getRequestIdentifier(request: Request, suffix?: string): string {
  // En production, utiliser X-Forwarded-For ou X-Real-IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Hash simple du user agent pour économiser la mémoire
  const uaHash = hashCode(userAgent).toString()

  return suffix ? `${ip}:${uaHash}:${suffix}` : `${ip}:${uaHash}`
}

/**
 * Hash code simple pour les strings
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Middleware pour appliquer le rate limiting
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig,
  identifier?: string
): Response | null {
  const id = identifier || getRequestIdentifier(request)
  const result = isRateLimited(id, config)

  if (result.limited) {
    const retryAfter = Math.ceil((result.resetTime! - Date.now()) / 1000)

    // Calculer le temps restant en format lisible
    const minutes = Math.floor(retryAfter / 60)
    const seconds = retryAfter % 60
    const timeMessage = minutes > 0
      ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds > 0 ? `et ${seconds} seconde${seconds > 1 ? 's' : ''}` : ''}`
      : `${seconds} seconde${seconds > 1 ? 's' : ''}`

    return new Response(
      JSON.stringify({
        error: `Trop de tentatives. Veuillez patienter ${timeMessage} avant de réessayer.`,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter,
        retryAfterFormatted: timeMessage,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime!.toString(),
        },
      }
    )
  }

  return null
}

/**
 * Réinitialise les compteurs pour un identifiant (utile pour les tests)
 */
export function resetRateLimit(identifier: string) {
  rateLimitStore.delete(identifier)
}

/**
 * Obtient les statistiques de rate limiting
 */
export function getRateLimitStats() {
  return {
    totalEntries: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
      identifier: key,
      count: entry.count,
      resetTime: new Date(entry.resetTime).toISOString(),
    })),
  }
}
