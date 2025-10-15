/**
 * Module abstrait de stockage qui choisit automatiquement entre :
 * - S3/R2 (si configuré)
 * - Stockage local (fallback pour développement)
 */

import {
  uploadToLocalStorage,
  getLocalSignedUrl,
  deleteFromLocalStorage,
  generateLocalStorageKey,
  validateLocalStorageConfig,
} from './local-storage'

import {
  uploadToS3,
  getSignedDownloadUrl,
  deleteFromS3,
  generateS3Key,
  validateS3Config,
} from './s3'

/**
 * Vérifie si S3 est configuré
 */
function isS3Configured(): boolean {
  return !!(
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  )
}

/**
 * Upload un fichier vers le stockage (S3 ou local)
 */
export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<{ success: boolean; key: string }> {
  if (isS3Configured()) {
    console.log('[Storage] Utilisation de S3/R2')
    return uploadToS3(file, key, contentType)
  } else {
    console.log('[Storage] Utilisation du stockage local')
    return uploadToLocalStorage(file, key, contentType)
  }
}

/**
 * Génère une URL signée pour télécharger un fichier
 */
export async function getDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (isS3Configured()) {
    return getSignedDownloadUrl(key, expiresIn)
  } else {
    return getLocalSignedUrl(key, expiresIn)
  }
}

/**
 * Supprime un fichier du stockage
 */
export async function deleteFile(key: string): Promise<void> {
  if (isS3Configured()) {
    return deleteFromS3(key)
  } else {
    return deleteFromLocalStorage(key)
  }
}

/**
 * Génère une clé unique pour le fichier
 */
export function generateFileKey(originalName: string, projectId: string): string {
  if (isS3Configured()) {
    return generateS3Key(originalName, projectId)
  } else {
    return generateLocalStorageKey(originalName, projectId)
  }
}

/**
 * Valide la configuration du stockage
 */
export function validateStorageConfig(): void {
  if (isS3Configured()) {
    validateS3Config()
    console.log('[Storage] ✓ Configuration S3/R2 validée')
  } else {
    validateLocalStorageConfig()
    console.log('[Storage] ✓ Utilisation du stockage local (développement)')
  }
}

/**
 * Retourne le type de stockage utilisé
 */
export function getStorageType(): 'S3' | 'LOCAL' {
  return isS3Configured() ? 'S3' : 'LOCAL'
}
