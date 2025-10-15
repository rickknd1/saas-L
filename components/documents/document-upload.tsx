"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentUploadProps {
  projectId: string
  onUploadComplete?: (document: any) => void
  confidential?: boolean
}

/**
 * Composant d'upload de documents avec drag & drop
 * Supporte uniquement les fichiers PDF (max 20 MB)
 */
export function DocumentUpload({
  projectId,
  onUploadComplete,
  confidential = false
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Réinitialiser l'état
    setError(null)
    setUploadedFile(null)

    // Gérer les fichiers rejetés
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('Le fichier est trop volumineux (maximum 20 MB)')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Seuls les fichiers PDF sont acceptés')
      } else {
        setError('Fichier invalide')
      }
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadedFile(file)
    setUploading(true)
    setProgress(0)

    try {
      // Préparer FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('confidential', confidential.toString())

      // Simuler progression (à améliorer avec XMLHttpRequest pour vraie progression)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // Upload
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important pour envoyer les cookies
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const error = await response.json()

        // Si erreur 401, rediriger vers login
        if (response.status === 401) {
          toast.error('Session expirée', {
            description: 'Vous allez être redirigé vers la page de connexion',
          })
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          return
        }

        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      const data = await response.json()

      toast.success('Document uploadé avec succès', {
        description: `${file.name} a été ajouté au projet`,
      })

      // Callback avec le document créé
      onUploadComplete?.(data.document)

      // Réinitialiser après succès
      setTimeout(() => {
        setUploadedFile(null)
        setProgress(0)
      }, 2000)

    } catch (error: any) {
      console.error('[DocumentUpload] Erreur:', error)

      // Ne pas afficher d'erreur si on redirige déjà vers login
      if (error.message?.includes('Session expirée')) {
        return
      }

      setError(error.message || 'Erreur lors de l\'upload')
      toast.error('Échec de l\'upload', {
        description: error.message || 'Une erreur est survenue',
      })
    } finally {
      setUploading(false)
    }
  }, [projectId, confidential, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 20 * 1024 * 1024, // 20 MB
    maxFiles: 1,
    disabled: uploading,
    multiple: false,
  })

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
          ${error ? 'border-destructive/50 bg-destructive/5' : ''}
        `}
      >
        <input {...getInputProps()} />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />

        {isDragActive ? (
          <p className="text-lg font-medium text-primary">Déposez le fichier ici...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Glissez-déposez un fichier PDF
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              ou cliquez pour sélectionner (maximum 20 MB)
            </p>
            <Button type="button" variant="outline" disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              Choisir un fichier
            </Button>
          </>
        )}
      </div>

      {/* Erreur */}
      {error && !uploading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Barre de progression */}
      {uploading && uploadedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{uploadedFile.name}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-center text-muted-foreground">
            Upload en cours... Veuillez patienter
          </p>
        </div>
      )}

      {/* Fichier sélectionné (avant upload) */}
      {uploadedFile && !uploading && progress === 100 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{uploadedFile.name}</strong> a été uploadé avec succès
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Format accepté : PDF uniquement</p>
        <p>• Taille maximale : 20 MB</p>
        <p>• Le texte sera automatiquement extrait pour la recherche</p>
        {confidential && (
          <p className="text-amber-600 font-medium">⚠ Ce document sera marqué comme confidentiel</p>
        )}
      </div>
    </div>
  )
}
