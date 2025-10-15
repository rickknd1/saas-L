import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/prisma-helpers'

/**
 * GET /api/documents/[id]
 * Récupère les détails complets d'un document
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le document avec toutes les relations
    const document = await prisma.document.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Retirer les données binaires pour la réponse JSON
    const { fileData, ...documentWithoutBinary } = document

    return NextResponse.json({ document: documentWithoutBinary })
  } catch (error) {
    console.error('[GET /api/documents/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement du document' },
      { status: 500 }
    )
  }
}
