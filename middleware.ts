import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware de protection des routes (optimisé pour Edge Runtime)
 *
 * Module C (@kayzeur dylann)
 * Protège les routes /dashboard et redirige les utilisateurs non authentifiés
 * Redirige les utilisateurs authentifiés depuis /login ou /register vers /dashboard
 *
 * Note: Utilise une vérification légère du cookie de session au lieu d'importer
 * tout NextAuth pour réduire la taille du bundle Edge Runtime (<1MB pour Vercel free tier)
 */

export function middleware(req: NextRequest) {
  // Vérifier la présence du cookie de session NextAuth
  const sessionToken = req.cookies.get("authjs.session-token") ||
                       req.cookies.get("__Secure-authjs.session-token")
  const isLoggedIn = !!sessionToken

  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                       req.nextUrl.pathname.startsWith("/register")

  // Rediriger vers /login si on essaie d'accéder au dashboard sans être connecté
  if (isOnDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Rediriger vers /dashboard si on est déjà connecté et qu'on va sur login/register
  if (isOnAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
