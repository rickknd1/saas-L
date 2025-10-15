"use client"

import { useState, useEffect } from 'react'
import { Download, Loader2, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PDFViewerClientProps {
  documentId: string
  documentTitle?: string
  onLoadSuccess?: () => void
}

/**
 * Composant de visualisation PDF simplifié
 * Utilise un iframe natif pour afficher le PDF
 * Conforme au MVP : visualisation simple sans édition
 */
export default function PDFViewerClient({ documentId, documentTitle, onLoadSuccess }: PDFViewerClientProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Construire l'URL du PDF directement
  useEffect(() => {
    console.log('[PDFViewerClient] Setting PDF URL for document:', documentId)

    // L'API /api/documents/[id]/download retourne directement le PDF
    // On peut l'utiliser directement comme source de l'iframe
    const url = `/api/documents/${documentId}/download`
    setPdfUrl(url)
    setLoading(false)
    onLoadSuccess?.()

    console.log('[PDFViewerClient] PDF URL set:', url)
  }, [documentId, onLoadSuccess])

  const downloadPDF = () => {
    if (!pdfUrl) {
      console.warn('[PDFViewerClient] No PDF URL available for download')
      return
    }

    console.log('[PDFViewerClient] Opening PDF in new tab')
    window.open(pdfUrl, '_blank')
    toast.success('Ouverture du PDF', {
      description: 'Le document s\'ouvre dans un nouvel onglet',
    })
  }

  if (loading) {
    console.log('[PDFViewerClient] Loading PDF document...')
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Chargement du document...</p>
        </div>
      </div>
    )
  }

  if (error || !pdfUrl) {
    console.error('[PDFViewerClient] Error state or no URL:', { error, hasPdfUrl: !!pdfUrl })
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Impossible de charger le document'}
        </AlertDescription>
      </Alert>
    )
  }

  console.log('[PDFViewerClient] Rendering PDF viewer with URL')

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          {documentTitle && (
            <span className="text-sm font-medium">{documentTitle}</span>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={downloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>

      {/* Viewer PDF avec iframe natif */}
      <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          className="w-full h-[800px] border-0"
          title={documentTitle || 'Document PDF'}
          onLoad={() => {
            console.log('[PDFViewerClient] PDF iframe loaded successfully')
          }}
          onError={(e) => {
            console.error('[PDFViewerClient] PDF iframe error:', e)
            setError('Erreur lors du chargement du PDF')
          }}
        />
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center">
        Utilisez les contrôles natifs du navigateur pour naviguer, zoomer et rechercher dans le document
      </div>
    </div>
  )
}
