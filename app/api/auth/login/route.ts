import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { applyRateLimit, RATE_LIMIT_CONFIGS, getRequestIdentifier } from "@/lib/rate-limit"
import { apiSuccess, unauthorized, validationError, handleApiError } from "@/lib/api-response"


/**
 * API de connexion utilisateur
 * Authentifie l'utilisateur, crée un JWT dans cookie httpOnly
 * et retourne les informations utilisateur pour React Query cache
 */

export async function POST(request: Request) {
  try {
    // SÉCURITÉ: Rate limiting pour protéger contre les attaques brute force
    const rateLimitResponse = applyRateLimit(
      request,
      RATE_LIMIT_CONFIGS.LOGIN,
      getRequestIdentifier(request, 'login')
    )
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const { email, password } = body

    // Validation des champs
    if (!email || !password) {
      return validationError("Email et mot de passe requis")
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return unauthorized("Email ou mot de passe incorrect")
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return unauthorized("Email ou mot de passe incorrect")
    }

    // Mettre à jour la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Déterminer le plan (priorité : subscription > user.plan)
    let plan = user.plan.toLowerCase()
    if (user.subscription && user.subscription.status === "ACTIVE") {
      plan = user.subscription.plan.toLowerCase()
    }

    // Créer le JWT token avec durée de vie étendue
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // Token valide 30 jours pour éviter les déconnexions intempestives
      .sign(secret)

    // Créer la réponse avec les données utilisateur
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      plan,
    }

    const response = apiSuccess(
      { user: userData },
      "Connexion réussie"
    )

    // Stocker le token dans un cookie httpOnly (sécurisé)
    response.cookies.set("auth-token", token, {
      httpOnly: true, // Pas accessible en JavaScript (sécurité XSS)
      secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
      sameSite: "lax", // Protection CSRF
      maxAge: 60 * 60 * 24 * 30, // 30 jours (en secondes) - correspond à la durée du JWT
      path: "/", // Accessible sur tout le site
    })

    return response
  } catch (error) {
    return handleApiError(error, "Login")
  } finally {
    // Ne PAS déconnecter Prisma ici - laissez le pool de connexions gérer ça
    // // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions
 // await prisma.$disconnect()
  }
}
