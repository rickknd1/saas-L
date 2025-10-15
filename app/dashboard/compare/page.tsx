"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { GitCompare, Download, ArrowLeftRight, Loader2 } from "lucide-react"
import { SplitView } from "@/components/compare/split-view"
import { toast } from "sonner"

/**
 * Page de comparaison de documents
 * Module C (@kayzeur dylann)
 *
 * Permet de sélectionner et comparer deux versions de documents
 */

interface ComparisonResult {
  success: boolean
  documentId1: string
  documentId2: string
  differences: Array<{
    type: "added" | "removed" | "unchanged"
    value: string
    lineNumber?: number
  }>
  stats: {
    totalLines: number
    added: number
    removed: number
    unchanged: number
  }
}

export default function ComparePage() {
  const [document1, setDocument1] = useState<string>("v2")
  const [document2, setDocument2] = useState<string>("v3")
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)

  // Documents disponibles (mock data - en production, vient de la BDD)
  const documents = [
    { id: "v1", name: "Contrat_Fusion_v1.pdf", content: "Article 1.1\nLes parties conviennent de...\nArticle 2.1\nLes conditions sont..." },
    { id: "v2", name: "Contrat_Fusion_v2.pdf", content: "Article 1.1\nLes parties conviennent de fusionner...\nArticle 2.1\nLes conditions préalables sont..." },
    { id: "v3", name: "Contrat_Fusion_v3.pdf", content: "Article 1.1\nLes parties conviennent de fusionner leurs activités...\nArticle 2.1\nLes conditions préalables strictes sont..." }
  ]

  const handleCompare = async () => {
    if (!document1 || !document2) {
      toast.error("Veuillez sélectionner deux documents")
      return
    }

    if (document1 === document2) {
      toast.error("Veuillez sélectionner deux documents différents")
      return
    }

    setIsComparing(true)

    try {
      const doc1 = documents.find(d => d.id === document1)
      const doc2 = documents.find(d => d.id === document2)

      const response = await fetch("/api/documents/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId1: document1,
          documentId2: document2,
          content1: doc1?.content,
          content2: doc2?.content
        })
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la comparaison")
      }

      const data: ComparisonResult = await response.json()
      setComparisonResult(data)
      toast.success("Comparaison effectuée avec succès")

    } catch (error) {
      console.error("Error comparing documents:", error)
      toast.error("Erreur lors de la comparaison des documents")
    } finally {
      setIsComparing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comparaison de documents</h1>
          <p className="text-muted-foreground">Identifiez les différences entre vos versions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={!comparisonResult}>
            <Download className="mr-2 h-4 w-4" />
            Exporter le rapport
          </Button>
        </div>
      </div>

      {/* Document Selection */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Sélection des documents</CardTitle>
          <CardDescription>Choisissez deux versions à comparer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document original</label>
              <Select value={document1} onValueChange={setDocument1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-center">
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nouvelle version</label>
              <Select value={document2} onValueChange={setDocument2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {comparisonResult && (
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  <span className="mr-1">●</span> {comparisonResult.stats.added} Ajouts
                </Badge>
                <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
                  <span className="mr-1">●</span> {comparisonResult.stats.removed} Suppressions
                </Badge>
                <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20">
                  <span className="mr-1">●</span> {comparisonResult.stats.unchanged} Inchangés
                </Badge>
              </div>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCompare}
              disabled={isComparing}
            >
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparaison...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Comparer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Result */}
      {comparisonResult && (
        <SplitView
          documentName1={documents.find(d => d.id === document1)?.name || "Document 1"}
          documentName2={documents.find(d => d.id === document2)?.name || "Document 2"}
          differences={comparisonResult.differences}
          stats={comparisonResult.stats}
        />
      )}

      {/* Empty State */}
      {!comparisonResult && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitCompare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune comparaison effectuée</p>
            <p className="text-sm text-muted-foreground">
              Sélectionnez deux documents et cliquez sur "Comparer" pour voir les différences
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
