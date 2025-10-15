import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"



/**
 * API pour récupérer la liste des documents de l'utilisateur
 * Retourne tous les documents avec leurs métadonnées
 *
 * Cahier des charges: Module A - Projets & Documents
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    // Récupérer l'userId depuis le header ajouté par le middleware JWT
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Construire les conditions de filtre
    const where: Prisma.DocumentWhereInput = {
      project: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
    }

    // Si projectId est fourni, filtrer par projet
    if (projectId) {
      where.projectId = projectId
    }

    // Récupérer les documents avec les filtres appliqués
    const documents = await prisma.document.findMany({
      where,
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
            comments: true,
            versions: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      documents,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des documents" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

/**
 * API pour créer un nouveau document
 */
export async function POST(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, name, type, size, url, key, confidential } = body

    if (!projectId || !name || !url || !key) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      )
    }

    const document = await prisma.document.create({
      data: {
        name,
        type: type || "pdf",
        size: size || 0,
        url,
        key,
        confidential: confidential || false,
        projectId,
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
      },
    })

    return NextResponse.json({
      success: true,
      document,
    })
  } catch (error) {
    console.error("Erreur lors de la création du document:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du document" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
