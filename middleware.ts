import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Middleware Next.js pour authentification basée sur cookies httpOnly
 * - Vérifie le token JWT dans les cookies
 * - Protège les routes /dashboard/*
 * - Ajoute le userId dans les headers pour les API routes
 * - Redirige vers /login si non authentifié
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/webhook'
  ]

  // Vérifier si la route est publique (correspondance exacte ou préfixe)
  const isPublicRoute = publicRoutes.some((route) => {
    // Pour la racine, correspondance exacte
    if (route === '/') {
      return pathname === '/'
    }
    // Pour les autres, vérifier le préfixe
    return pathname.startsWith(route)
  }) || pathname === '/'

  // Si route publique, laisser passer sans vérification
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Routes protégées (dashboard et toutes les autres API)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api')

  // Si route protégée et pas de token → redirect vers login
  if (isProtectedRoute && !token) {
    if (pathname.startsWith('/api')) {
      // API: retourner 401
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    } else {
      // Page: rediriger vers login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Si token présent, vérifier sa validité
  if (token && isProtectedRoute) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)

      // Ajouter userId dans les headers pour les API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId as string)
      requestHeaders.set('x-user-email', payload.email as string)

      // Log succès pour debug (seulement en dev)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] ✅ Auth OK pour ${payload.email} → ${pathname}`)
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error: any) {
      // Logger l'erreur avec plus de détails
      console.error('[Middleware] ❌ JWT verification failed:', {
        pathname,
        errorName: error.name,
        errorCode: error.code,
        errorMessage: error.message,
      })

      // Token invalide → redirect vers login
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          {
            error: 'Session expirée. Veuillez vous reconnecter.',
            reason: error.code === 'ERR_JWT_EXPIRED' ? 'expired' : 'invalid'
          },
          { status: 401 }
        )
      } else {
        const response = NextResponse.redirect(new URL('/login', request.url))
        // Supprimer le cookie invalide seulement si vraiment nécessaire
        response.cookies.delete('auth-token')
        console.log('[Middleware] Redirecting to login and clearing cookie')
        return response
      }
    }
  }

  // Routes publiques ou non protégées
  return NextResponse.next()
}

// Configuration : routes à matcher
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
