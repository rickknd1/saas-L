"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import dynamic from 'next/dynamic'

// Importer react-pdf dynamiquement pour éviter les problèmes SSR
import { pdfjs } from 'react-pdf'

// Configuration du worker PDF.js
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

// Importations dynamiques de react-pdf pour éviter les erreurs SSR
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false, loading: () => <Skeleton className="h-[600px] w-[450px]" /> }
)

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false, loading: () => <Skeleton className="h-[600px] w-[450px]" /> }
)

interface PDFViewerProps {
  documentId: string
  documentTitle?: string
  onLoadSuccess?: () => void
}

/**
 * Composant de visualisation de PDF avec navigation et zoom
 * Utilise react-pdf pour afficher les documents PDF
 */
export function PDFViewer({ documentId, documentTitle, onLoadSuccess }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger l'URL signée du PDF
  useEffect(() => {
    loadPDF()
  }, [documentId])

  const loadPDF = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/documents/${documentId}/download`, {
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Impossible de charger le document')
      }

      const data = await response.json()
      setPdfUrl(data.url)
    } catch (error: any) {
      console.error('[PDFViewer] Erreur chargement:', error)
      setError(error.message || 'Erreur de chargement du document')
      toast.error('Impossible de charger le PDF', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
    onLoadSuccess?.()
  }

  function onDocumentLoadError(error: Error) {
    console.error('[PDFViewer] Erreur chargement document:', error)
    setError('Impossible de charger le document PDF')
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset
      if (newPageNumber < 1) return 1
      if (newPageNumber > numPages) return numPages
      return newPageNumber
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
  const resetZoom = () => setScale(1.0)

  const downloadPDF = () => {
    if (!pdfUrl) return

    // Ouvrir dans nouvel onglet pour téléchargement
    window.open(pdfUrl, '_blank')
    toast.success('Téléchargement du PDF', {
      description: 'Le document va s\'ouvrir dans un nouvel onglet',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error || !pdfUrl) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Impossible de charger le document'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between bg-muted p-3 rounded-lg flex-wrap gap-2">
        {/* Navigation pages */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            title="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium min-w-[100px] text-center">
            Page {pageNumber} / {numPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            title="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Dézoomer"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <button
            onClick={resetZoom}
            className="text-sm min-w-[60px] text-center hover:text-primary transition-colors"
            title="Réinitialiser le zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3}
            title="Zoomer"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Téléchargement */}
        <Button variant="outline" size="sm" onClick={downloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>

      {/* Viewer PDF */}
      <div className="border rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 flex justify-center p-4 min-h-[600px]">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center h-[600px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Chargement du PDF...</p>
            </div>
          }
          error={
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur de chargement du PDF. Le fichier est peut-être corrompu.
              </AlertDescription>
            </Alert>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={
              <Skeleton className="h-[600px] w-[450px]" />
            }
            className="shadow-lg"
          />
        </Document>
      </div>

      {/* Informations document */}
      {documentTitle && (
        <div className="text-sm text-muted-foreground text-center">
          {documentTitle}
        </div>
      )}
    </div>
  )
}
