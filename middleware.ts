import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Middleware de protection des routes
 *
 * Module C (@kayzeur dylann)
 * Protège les routes /dashboard et redirige les utilisateurs non authentifiés
 * Redirige les utilisateurs authentifiés depuis /login ou /register vers /dashboard
 */

export default auth((req) => {
  const isLoggedIn = !!req.auth
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
})

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
