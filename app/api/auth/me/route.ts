import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPrismaRetry } from "@/lib/prisma-helpers"



/**
 * API pour récupérer l'utilisateur authentifié
 * Le middleware a déjà vérifié le JWT et ajouté userId dans les headers
 * Cette route lit simplement le userId depuis les headers
 */
export async function GET(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur depuis la base de données avec retry automatique
    const user = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      })
    )

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Déterminer le plan (priorité : subscription > user.plan)
    let plan = user.plan.toLowerCase()
    if (user.subscription && user.subscription.status === "ACTIVE") {
      plan = user.subscription.plan.toLowerCase()
    }

    // Retourner les données utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        plan,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        organization: user.organization,
        organizationSiret: user.organizationSiret,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
    })
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma ici - laissez le pool de connexions gérer ça
    // // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions
 // await prisma.$disconnect()
  }
}
