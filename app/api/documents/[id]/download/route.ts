import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withPrismaRetry } from '@/lib/prisma-helpers'

/**
 * API pour télécharger un document depuis la base de données
 * GET /api/documents/[id]/download
 *
 * Retourne directement le contenu du fichier avec les bons headers
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Vérifier authentification
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: documentId } = await params

    // 2. Récupérer le document avec le contenu du fichier
    const document = await withPrismaRetry(() =>
      prisma.document.findUnique({
        where: { id: documentId },
        include: {
          project: {
            include: {
              members: {
                where: {
                  userId: userId,
                },
              },
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
    )

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // 3. Vérifier permissions (propriétaire du projet ou membre)
    const hasAccess =
      document.project.ownerId === userId ||
      document.project.members.length > 0

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    console.log('[Download] Téléchargement depuis DATABASE:', { documentId, name: document.name })

    // 4. Créer audit log
    await withPrismaRetry(() =>
      prisma.auditLog.create({
        data: {
          userId,
          action: 'DOWNLOAD',
          resource: 'document',
          resourceId: document.id,
          projectId: document.projectId,
          documentId: document.id,
          metadata: JSON.stringify({
            fileName: document.name,
            fileSize: document.size,
          }),
        },
      })
    )

    // 5. Retourner le fichier avec les bons headers
    return new NextResponse(document.fileData, {
      headers: {
        'Content-Type': document.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${document.name}"`,
        'Content-Length': document.size.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    })

  } catch (error: unknown) {
    console.error('[Download] Erreur:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération du lien de téléchargement'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

export const dynamic = 'force-dynamic'
