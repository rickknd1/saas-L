import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

/**
 * Stockage local qui simule S3 pour le développement
 * Les fichiers sont stockés dans le dossier .storage/
 */

const STORAGE_DIR = path.join(process.cwd(), '.storage')

/**
 * Initialise le dossier de stockage local
 */
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR)
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  }
}

/**
 * Upload un fichier en local (simule S3)
 * @param file - Buffer du fichier
 * @param key - Chemin virtuel du fichier (ex: "documents/project-123/doc.pdf")
 * @param contentType - Type MIME
 * @returns Objet avec succès et clé
 */
export async function uploadToLocalStorage(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ success: boolean; key: string }> {
  try {
    await ensureStorageDir()

    // Créer le chemin complet
    const filePath = path.join(STORAGE_DIR, key)
    const fileDir = path.dirname(filePath)

    // Créer les sous-dossiers si nécessaire
    await fs.mkdir(fileDir, { recursive: true })

    // Sauvegarder le fichier
    await fs.writeFile(filePath, file)

    // Sauvegarder les métadonnées (type MIME, date, etc.)
    const metadataPath = `${filePath}.meta.json`
    await fs.writeFile(
      metadataPath,
      JSON.stringify({
        contentType,
        uploadedAt: new Date().toISOString(),
        size: file.length,
      })
    )

    console.log(`[LocalStorage] Fichier sauvegardé: ${key}`)
    return { success: true, key }
  } catch (error) {
    console.error('[LocalStorage] Erreur upload:', error)
    throw new Error('Impossible d\'uploader le fichier vers le stockage local')
  }
}

/**
 * Génère une URL "signée" pour le fichier local
 * @param key - Chemin du fichier
 * @param expiresIn - Durée de validité (ignoré pour le stockage local)
 * @returns URL locale vers le fichier
 */
export async function getLocalSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    await ensureStorageDir()

    const filePath = path.join(STORAGE_DIR, key)

    // Vérifier que le fichier existe
    await fs.access(filePath)

    // Générer un token temporaire (pour simuler une URL signée)
    const token = randomUUID()

    // Retourner une URL d'API qui servira le fichier
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/api/storage/download?key=${encodeURIComponent(key)}&token=${token}`
  } catch (error) {
    console.error('[LocalStorage] Erreur génération URL:', error)
    throw new Error('Impossible de générer l\'URL de téléchargement')
  }
}

/**
 * Récupère un fichier du stockage local
 * @param key - Chemin du fichier
 * @returns Buffer du fichier
 */
export async function getFromLocalStorage(key: string): Promise<Buffer> {
  try {
    const filePath = path.join(STORAGE_DIR, key)
    return await fs.readFile(filePath)
  } catch (error) {
    console.error('[LocalStorage] Erreur lecture fichier:', error)
    throw new Error('Fichier non trouvé')
  }
}

/**
 * Récupère les métadonnées d'un fichier
 * @param key - Chemin du fichier
 * @returns Métadonnées (type MIME, etc.)
 */
export async function getLocalFileMetadata(key: string): Promise<any> {
  try {
    const filePath = path.join(STORAGE_DIR, key)
    const metadataPath = `${filePath}.meta.json`
    const metadata = await fs.readFile(metadataPath, 'utf-8')
    return JSON.parse(metadata)
  } catch (error) {
    return { contentType: 'application/octet-stream' }
  }
}

/**
 * Supprime un fichier du stockage local
 * @param key - Chemin du fichier
 */
export async function deleteFromLocalStorage(key: string): Promise<void> {
  try {
    const filePath = path.join(STORAGE_DIR, key)
    const metadataPath = `${filePath}.meta.json`

    await fs.unlink(filePath)

    // Supprimer les métadonnées aussi
    try {
      await fs.unlink(metadataPath)
    } catch {
      // Ignorer si le fichier metadata n'existe pas
    }

    console.log(`[LocalStorage] Fichier supprimé: ${key}`)
  } catch (error) {
    console.error('[LocalStorage] Erreur suppression:', error)
    throw new Error('Impossible de supprimer le fichier du stockage local')
  }
}

/**
 * Génère un nom de fichier unique
 * @param originalName - Nom original du fichier
 * @param projectId - ID du projet
 * @returns Clé unique
 */
export function generateLocalStorageKey(originalName: string, projectId: string): string {
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()

  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)

  return `documents/project-${projectId}/${timestamp}-${randomStr}-${sanitizedName}`
}

/**
 * Valide la configuration du stockage local (toujours OK)
 */
export function validateLocalStorageConfig(): void {
  // Pas de configuration requise pour le stockage local
  console.log('[LocalStorage] Mode de stockage local activé')
}
