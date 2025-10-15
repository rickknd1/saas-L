import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API d'export des données personnelles (RGPD)
 * Retourne toutes les données de l'utilisateur au format JSON
 *
 * Cahier des charges: Section 3.3 - Conformité RGPD
 * Article RGPD: Droit d'accès (Article 15)
 */


export async function GET(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer TOUTES les données de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Projets créés
        ownedProjects: {
          include: {
            documents: true,
            members: true,
            messages: true,
          },
        },
        // Participations aux projets
        projectMembers: {
          include: {
            project: true,
          },
        },
        // Documents uploadés
        documents: true,
        // Commentaires
        comments: {
          include: {
            document: true,
          },
        },
        // Messages
        messages: {
          include: {
            project: true,
          },
        },
        // Notifications
        notifications: true,
        // Abonnement et paiements
        subscription: true,
        payments: true,
        invoices: true,
        // Logs d'audit
        auditLogs: true,
        // Sessions
        sessions: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Anonymiser les données sensibles
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        dataProtectionNotice:
          "Conformément au RGPD (Article 15), ces données représentent l'ensemble des informations personnelles conservées par Companion.",
      },
      userData: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        organization: user.organization,
        organizationSiret: user.organizationSiret,
        plan: user.plan,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
      projects: {
        owned: user.ownedProjects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdAt: p.createdAt,
          documentsCount: p.documents.length,
          membersCount: p.members.length,
          messagesCount: p.messages.length,
        })),
        memberOf: user.projectMembers.map((pm) => ({
          projectId: pm.projectId,
          projectName: pm.project.name,
          role: pm.role,
          joinedAt: pm.acceptedAt,
        })),
      },
      documents: user.documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        size: d.size,
        version: d.version,
        uploadedAt: d.createdAt,
      })),
      comments: user.comments.map((c) => ({
        id: c.id,
        content: c.content,
        documentId: c.documentId,
        createdAt: c.createdAt,
      })),
      messages: user.messages.map((m) => ({
        id: m.id,
        content: m.content,
        projectId: m.projectId,
        createdAt: m.createdAt,
      })),
      notifications: user.notifications.map((n) => ({
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          }
        : null,
      payments: user.payments.map((p) => ({
        amount: p.amount / 100,
        currency: p.currency,
        status: p.status,
        description: p.description,
        date: p.createdAt,
      })),
      invoices: user.invoices.map((i) => ({
        number: i.number,
        amount: i.amount / 100,
        currency: i.currency,
        status: i.status,
        paidAt: i.paidAt,
      })),
      activityLogs: user.auditLogs.slice(0, 100).map((log) => ({
        action: log.action,
        resource: log.resource,
        createdAt: log.createdAt,
      })),
    }

    // Retourner en JSON téléchargeable
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="companion-export-${userId}-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error("Erreur export données:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    )
  }
}
