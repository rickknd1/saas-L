import { NextResponse } from 'next/server'
import { z } from 'zod'
import { extractTextFromPDF, isValidPDF } from '@/lib/pdf-extract'
import { prisma } from '@/lib/prisma'
import { withPrismaRetry } from '@/lib/prisma-helpers'
import { applyRateLimit, RATE_LIMIT_CONFIGS, getRequestIdentifier } from '@/lib/rate-limit'

/**
 * API pour uploader un document PDF directement dans la base de données
 * POST /api/documents/upload
 *
 * Body: FormData
 * - file: File (PDF)
 * - projectId: string (UUID)
 * - confidential: boolean (optionnel)
 */
export async function POST(request: Request) {
  try {
    // SÉCURITÉ: Rate limiting pour protéger contre l'upload massif
    const rateLimitResponse = applyRateLimit(
      request,
      RATE_LIMIT_CONFIGS.UPLOAD,
      getRequestIdentifier(request, 'upload')
    )
    if (rateLimitResponse) return rateLimitResponse

    // 1. Vérifier authentification (middleware a déjà vérifié le JWT)
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    console.log('[Upload] Stockage: DATABASE (PostgreSQL)')

    // 3. Parser le FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const confidentialStr = formData.get('confidential') as string
    const confidential = confidentialStr === 'true'

    // 4. Valider les paramètres
    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Fichier et ID du projet requis' },
        { status: 400 }
      )
    }

    // Valider que projectId est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(projectId) && !projectId.startsWith('c')) {
      return NextResponse.json(
        { error: 'ID de projet invalide' },
        { status: 400 }
      )
    }

    // 5. Vérifier que l'utilisateur a accès au projet
    const project = await withPrismaRetry(() =>
      prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId }, // Propriétaire
            {
              members: {
                some: {
                  userId: userId,
                  canEdit: true, // Doit pouvoir éditer
                },
              },
            },
          ],
        },
      })
    )

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // 6. Valider type de fichier (PDF uniquement pour MVP)
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF sont acceptés' },
        { status: 400 }
      )
    }

    // 7. Valider taille (max 20 MB)
    const maxSize = 20 * 1024 * 1024 // 20 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (maximum 20 MB)' },
        { status: 400 }
      )
    }

    // 8. Convertir File en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 9. Vérifier que c'est bien un PDF valide
    if (!isValidPDF(buffer)) {
      return NextResponse.json(
        { error: 'Le fichier n\'est pas un PDF valide' },
        { status: 400 }
      )
    }

    // 10. Préparer les données pour le stockage en base de données
    console.log('[Upload] Début sauvegarde en BDD:', { fileName: file.name, size: file.size, type: file.type })

    // Le buffer contient déjà le contenu du fichier
    // On va le stocker directement en tant que Bytes dans PostgreSQL

    // 12. Extraire texte du PDF (optionnel, ne bloque pas l'upload)
    let extractedText: string | null = null
    let numPages = 0
    try {
      console.log('[Upload] Extraction texte PDF...')
      const pdfData = await extractTextFromPDF(buffer)
      extractedText = pdfData.text
      numPages = pdfData.numPages
      console.log('[Upload] Extraction réussie:', { numPages, textLength: extractedText.length })
    } catch (error) {
      console.error('[Upload] Erreur extraction texte (non bloquant):', error)
      // Ne pas bloquer l'upload si extraction échoue
    }

    // 11. Créer enregistrement dans la BDD avec le contenu du fichier
    const document = await withPrismaRetry(() =>
      prisma.document.create({
        data: {
          name: file.name,
          type: 'pdf',
          size: file.size,
          fileData: buffer, // Contenu du fichier stocké directement
          mimeType: file.type,
          confidential,
          projectId: projectId,
          uploadedById: userId,
          version: 1, // Première version
          // Créer aussi une DocumentVersion pour l'historique
          versions: {
            create: {
              version: 1,
              name: file.name,
              fileData: buffer, // Contenu du fichier
              mimeType: file.type,
              size: file.size,
              uploadedById: userId,
              changes: 'Version initiale',
            },
          },
        },
        include: {
          versions: true,
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    )

    console.log('[Upload] Document créé dans la BDD:', document.id)

    // 12. Créer audit log
    await withPrismaRetry(() =>
      prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          resource: 'document',
          resourceId: document.id,
          projectId,
          documentId: document.id,
          metadata: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            numPages,
          }),
        },
      })
    )

    // 13. Retourner la réponse SANS le contenu du fichier (fileData)
    const { fileData, ...documentWithoutFileData } = document
    const versionsWithoutFileData = document.versions.map(({ fileData, ...version }) => version)

    return NextResponse.json({
      success: true,
      document: {
        ...documentWithoutFileData,
        versions: versionsWithoutFileData,
        extractedText: extractedText ? extractedText.substring(0, 500) : null, // Limiter la réponse
        numPages,
      },
    })

  } catch (error: unknown) {
    console.error('[Upload] Erreur:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload du document'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

// Configuration pour accepter les uploads de fichiers
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
