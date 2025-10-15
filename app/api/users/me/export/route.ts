import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/get-session"

/**
 * API d'export des données utilisateur (RGPD)
 * GET /api/users/me/export
 *
 * Module C (@kayzeur dylann)
 * Permet à l'utilisateur d'exporter toutes ses données conformément au RGPD
 */

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

    // Récupérer toutes les données de l'utilisateur
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
        // Participation aux projets
        projectMembers: {
          include: {
            project: true,
          },
        },
        // Documents uploadés
        documents: true,
        // Commentaires
        comments: true,
        // Messages
        messages: true,
        // Notifications
        notifications: true,
        // Abonnement
        subscription: true,
        // Paiements
        payments: true,
        // Factures
        invoices: true,
        // Logs d'audit
        auditLogs: {
          take: 100, // Limiter à 100 dernières actions
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Préparer les données à exporter (nettoyer les données sensibles)
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportType: "RGPD_FULL_DATA_EXPORT",
        version: "1.0",
      },
      profile: {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
      projects: {
        owned: user.ownedProjects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          confidential: project.confidential,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          documentsCount: project.documents.length,
          membersCount: project.members.length,
          messagesCount: project.messages.length,
        })),
        member: user.projectMembers.map((member) => ({
          projectId: member.projectId,
          projectName: member.project.name,
          role: member.role,
          permissions: {
            canEdit: member.canEdit,
            canInvite: member.canInvite,
            canDelete: member.canDelete,
          },
          joinedAt: member.invitedAt,
          acceptedAt: member.acceptedAt,
        })),
      },
      documents: user.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        projectId: doc.projectId,
        version: doc.version,
        confidential: doc.confidential,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      comments: user.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        documentId: comment.documentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      messages: user.messages.map((message) => ({
        id: message.id,
        content: message.content,
        projectId: message.projectId,
        createdAt: message.createdAt,
      })),
      notifications: user.notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: notif.read,
        createdAt: notif.createdAt,
      })),
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            status: user.subscription.status,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
            createdAt: user.subscription.createdAt,
          }
        : null,
      payments: user.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
      })),
      invoices: user.invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        pdfUrl: invoice.pdfUrl,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
      })),
      auditLogs: user.auditLogs.map((log) => ({
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      statistics: {
        totalProjects: user.ownedProjects.length,
        totalDocuments: user.documents.length,
        totalComments: user.comments.length,
        totalMessages: user.messages.length,
        totalNotifications: user.notifications.length,
        totalPayments: user.payments.length,
        accountAge: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    }

    console.log(`✅ User data exported: ${user.email} (${user.id})`)

    // Retourner les données au format JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="companion-data-export-${user.email}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting user data:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    )
  }
}
