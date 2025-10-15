import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import mime from 'mime-types'

/**
 * Client S3 configuré pour Cloudflare R2 (compatible S3)
 * Peut également être utilisé avec AWS S3 standard
 */
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME!

/**
 * Upload un fichier vers S3
 * @param file - Buffer du fichier à uploader
 * @param key - Chemin du fichier dans S3 (ex: "documents/project-123/doc-456.pdf")
 * @param contentType - Type MIME (ex: "application/pdf")
 * @returns Objet contenant le succès et la clé S3
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ success: boolean; key: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Sécurité : empêcher accès public direct
      ACL: 'private',
      // Métadonnées optionnelles
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(command)

    return { success: true, key }
  } catch (error) {
    console.error('Erreur upload S3:', error)
    throw new Error('Impossible d\'uploader le fichier vers le stockage cloud')
  }
}

/**
 * Génère une URL signée temporaire pour télécharger un fichier
 * @param key - Chemin du fichier dans S3
 * @param expiresIn - Durée de validité en secondes (défaut: 1h)
 * @returns URL signée temporaire
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('Erreur génération URL signée:', error)
    throw new Error('Impossible de générer l\'URL de téléchargement')
  }
}

/**
 * Supprime un fichier de S3
 * @param key - Chemin du fichier dans S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('Erreur suppression S3:', error)
    throw new Error('Impossible de supprimer le fichier du stockage cloud')
  }
}

/**
 * Génère un nom de fichier unique et sécurisé pour S3
 * @param originalName - Nom original du fichier
 * @param projectId - ID du projet
 * @returns Clé S3 unique (ex: "documents/project-123/1234567890-abc123-document.pdf")
 */
export function generateS3Key(originalName: string, projectId: string): string {
  // Nettoyer le nom de fichier (retirer caractères dangereux)
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()

  // Ajouter timestamp pour unicité
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)

  // Structure : documents/project-{id}/{timestamp}-{random}-{filename}
  return `documents/project-${projectId}/${timestamp}-${randomStr}-${sanitizedName}`
}

/**
 * Vérifie que les variables d'environnement S3 sont configurées
 * @throws Error si configuration manquante
 */
export function validateS3Config(): void {
  const requiredEnvVars = [
    'S3_ENDPOINT',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(
      `Configuration S3 manquante. Variables requises: ${missingVars.join(', ')}`
    )
  }
}
