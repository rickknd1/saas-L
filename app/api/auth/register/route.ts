import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { applyRateLimit, RATE_LIMIT_CONFIGS, getRequestIdentifier } from "@/lib/rate-limit"
import { apiSuccess, validationError, conflict, handleApiError } from "@/lib/api-response"


/**
 * API d'inscription utilisateur
 * Crée un nouveau compte utilisateur dans la base de données
 * et authentifie automatiquement l'utilisateur avec un JWT
 */

export async function POST(request: Request) {
  try {
    // SÉCURITÉ: Rate limiting pour empêcher l'enregistrement automatisé de comptes
    const rateLimitResponse = applyRateLimit(
      request,
      RATE_LIMIT_CONFIGS.REGISTER,
      getRequestIdentifier(request, 'register')
    )
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const { email, password, firstName, lastName, cabinet, role } = body

    // Validation des champs requis
    if (!email || !password || !firstName || !lastName) {
      return validationError("Tous les champs requis doivent être remplis", {
        missingFields: {
          email: !email,
          password: !password,
          firstName: !firstName,
          lastName: !lastName,
        },
      })
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return conflict("Un compte existe déjà avec cette adresse email")
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        organization: cabinet,
        role,
        plan: "FREEMIUM", // Plan par défaut
      },
    })

    // Créer le JWT token pour authentifier automatiquement l'utilisateur avec durée de vie étendue
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d") // Token valide 30 jours pour éviter les déconnexions intempestives
      .sign(secret)

    // Créer la réponse avec les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      plan: user.plan.toLowerCase(),
    }

    const response = apiSuccess(
      { user: userData },
      "Compte créé avec succès",
      201 // Created
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
    return handleApiError(error, "Register")
  } finally {
    // Ne PAS déconnecter Prisma ici - laissez le pool de connexions gérer ça
    // // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions
 // await prisma.$disconnect()
  }
}
