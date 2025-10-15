"use client"

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

interface PDFViewerWrapperProps {
  documentId: string
  documentTitle?: string
  onLoadSuccess?: () => void
}

// Importer le vrai viewer uniquement côté client
const PDFViewerClient = dynamic(
  () => import('./pdf-viewer-client').then(mod => {
    console.log('[PDFViewerWrapper] Client component loaded successfully')
    return mod
  }),
  {
    ssr: false,
    loading: () => {
      console.log('[PDFViewerWrapper] Loading PDF viewer...')
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      )
    },
  }
)

/**
 * Wrapper pour le viewer PDF qui gère le chargement côté client uniquement
 * Évite les erreurs SSR avec pdfjs-dist
 */
export function PDFViewer({ documentId, documentTitle, onLoadSuccess }: PDFViewerWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    console.log('[PDFViewerWrapper] Component mounted, setting isClient=true')
    setIsClient(true)
  }, [])

  if (!isClient) {
    console.log('[PDFViewerWrapper] SSR mode - showing skeleton')
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  console.log('[PDFViewerWrapper] Client mode - rendering PDFViewerClient', { documentId, documentTitle })

  return (
    <PDFViewerClient
      documentId={documentId}
      documentTitle={documentTitle}
      onLoadSuccess={onLoadSuccess}
    />
  )
}
