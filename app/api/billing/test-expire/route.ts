import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API DE TEST - Simule l'expiration d'un abonnement
 * ⚠️ À UTILISER UNIQUEMENT EN DÉVELOPPEMENT
 *
 * Cette API simule ce qui se passe quand un abonnement annulé arrive à expiration:
 * - Change le plan de STANDARD vers FREEMIUM
 * - Met le statut de la subscription à CANCELED
 * - Met cancelAtPeriodEnd à false
 */



export async function POST(request: Request) {
  try {
    // SÉCURITÉ: Bloquer en production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: "Cette API est désactivée en production" },
        { status: 403 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur et son abonnement
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    if (!user.subscription) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé" },
        { status: 404 }
      )
    }

    if (!user.subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "L'abonnement n'est pas marqué pour annulation" },
        { status: 400 }
      )
    }

    console.log(`🧪 TEST: Simulation de l'expiration de l'abonnement pour l'utilisateur ${userId}`)

    // 1. Mettre à jour le plan de l'utilisateur vers FREEMIUM
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan: "FREEMIUM" },
    })
    console.log(`✓ Plan mis à jour: ${updatedUser.plan}`)

    // 2. Mettre à jour l'abonnement pour refléter l'expiration
    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: false,
        // On garde currentPeriodEnd tel quel pour historique
      },
    })
    console.log(`✓ Subscription expirée: status=${updatedSubscription.status}`)

    return NextResponse.json({
      success: true,
      message: "Expiration simulée avec succès",
      changes: {
        plan: `${user.plan} → ${updatedUser.plan}`,
        status: `${user.subscription.status} → ${updatedSubscription.status}`,
        cancelAtPeriodEnd: `true → false`,
      },
    })
  } catch (error) {
    console.error("Erreur simulation expiration:", error)
    return NextResponse.json(
      { error: "Erreur lors de la simulation" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
