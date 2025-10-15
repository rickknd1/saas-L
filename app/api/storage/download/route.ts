import { NextResponse } from 'next/server'
import { getFromLocalStorage, getLocalFileMetadata } from '@/lib/local-storage'

/**
 * API pour télécharger un fichier depuis le stockage local
 * GET /api/storage/download?key=...&token=...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const token = searchParams.get('token')

    if (!key) {
      return NextResponse.json(
        { error: 'Clé de fichier manquante' },
        { status: 400 }
      )
    }

    // TODO: Valider le token en production (vérifier qu'il n'a pas expiré, etc.)
    // Pour le développement, on accepte n'importe quel token

    // Récupérer le fichier
    const fileBuffer = await getFromLocalStorage(key)
    const metadata = await getLocalFileMetadata(key)

    // Retourner le fichier avec les bons headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error: unknown) {
    console.error('[API Storage] Erreur:', error)
    return NextResponse.json(
      { error: 'Fichier non trouvé' },
      { status: 404 }
    )
  }
}
