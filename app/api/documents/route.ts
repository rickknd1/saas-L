import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-manager"
import { requireAuth } from "@/lib/get-session"

/**
 * API de gestion des documents
 * GET /api/documents - Liste des documents
 * POST /api/documents - Upload de document
 *
 * Module C (@kayzeur dylann)
 * Implémente la limitation freemium (5 documents max)
 */

/**
 * GET /api/documents
 * Récupère la liste des documents de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

    // Récupérer tous les documents uploadés par l'utilisateur
    const documents = await prisma.document.findMany({
      where: {
        uploadedById: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            versions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      documents,
      count: documents.length,
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/documents
 * Upload un nouveau document avec vérification de la limitation freemium
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

    const body = await request.json()
    const { name, type, size, url, key, projectId, confidential, version } = body

    // Validation des champs requis
    if (!name || !type || !size || !url || !key || !projectId) {
      return NextResponse.json(
        {
          error: "Champs requis manquants",
          required: ["name", "type", "size", "url", "key", "projectId"],
        },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur et son plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier la limitation freemium (5 documents max)
    if (user.plan === "FREEMIUM") {
      const documentCount = await prisma.document.count({
        where: { uploadedById: userId },
      })

      const limit = PLAN_LIMITS.freemium.documents

      if (documentCount >= limit) {
        return NextResponse.json(
          {
            error: "Limite de documents atteinte",
            message: `Vous avez atteint la limite de ${limit} documents pour le plan Freemium. Passez au plan Standard pour un stockage illimité.`,
            code: "FREEMIUM_LIMIT_REACHED",
            limit,
            current: documentCount,
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        )
      }

      // Vérifier aussi la limite de stockage (1 GB)
      const totalStorage = await prisma.document.aggregate({
        where: { uploadedById: userId },
        _sum: {
          size: true,
        },
      })

      const currentStorage = totalStorage._sum.size || 0
      const storageLimit = PLAN_LIMITS.freemium.storageBytes

      if (currentStorage + size > storageLimit) {
        const currentStorageGB = (currentStorage / 1_000_000_000).toFixed(2)
        const limitGB = PLAN_LIMITS.freemium.storage

        return NextResponse.json(
          {
            error: "Limite de stockage atteinte",
            message: `Vous avez atteint la limite de stockage de ${limitGB} pour le plan Freemium (utilisé: ${currentStorageGB} GB). Passez au plan Standard pour 100 GB de stockage.`,
            code: "STORAGE_LIMIT_REACHED",
            currentStorage,
            limit: storageLimit,
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        )
      }
    }

    // Vérifier que le projet existe et que l'utilisateur y a accès
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                canEdit: true,
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé ou accès refusé" },
        { status: 404 }
      )
    }

    // Créer le document
    const document = await prisma.document.create({
      data: {
        name: name.trim(),
        type,
        size,
        url,
        key,
        projectId,
        uploadedById: userId,
        version: version || 1,
        confidential: confidential || false,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Créer un log d'audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE",
        resource: "document",
        resourceId: document.id,
        projectId,
        documentId: document.id,
        metadata: JSON.stringify({
          name: document.name,
          type: document.type,
          size: document.size,
        }),
      },
    })

    console.log(`✅ Document created: ${document.name} (${document.id}) by user ${userId}`)

    return NextResponse.json(
      {
        document,
        message: "Document uploadé avec succès",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating document:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
