"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitCompare, FileText, Download, ArrowLeftRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useDocuments } from "@/hooks/use-documents"
import { useDocumentCompare, type DiffPart } from "@/hooks/use-document-compare"

export default function ComparePage() {
  const { user } = useAuth()
  const { documents, isLoading: loadingDocs } = useDocuments(user?.id || null)
  const { compareDocuments, isLoading: comparing, error: compareError, result } = useDocumentCompare()

  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side")
  const [selectedDoc1, setSelectedDoc1] = useState<string>("")
  const [selectedDoc2, setSelectedDoc2] = useState<string>("")
  const [filterTab, setFilterTab] = useState<"all" | "additions" | "deletions" | "changes">("all")

  // Auto-select first two documents if available
  useEffect(() => {
    if (documents.length >= 2 && !selectedDoc1 && !selectedDoc2) {
      setSelectedDoc1(documents[0].id)
      setSelectedDoc2(documents[1].id)
    }
  }, [documents, selectedDoc1, selectedDoc2])

  const handleCompare = async () => {
    if (!selectedDoc1 || !selectedDoc2) {
      alert("Veuillez sélectionner deux documents")
      return
    }

    if (selectedDoc1 === selectedDoc2) {
      alert("Veuillez sélectionner deux documents différents")
      return
    }

    await compareDocuments(selectedDoc1, selectedDoc2)
  }

  const getSelectedDocName = (docId: string) => {
    const doc = documents.find((d) => d.id === docId)
    return doc ? `${doc.name} (v${doc.version})` : "Document"
  }

  // Filter differences based on active tab
  const getFilteredDifferences = (): DiffPart[] => {
    if (!result?.differences) return []

    switch (filterTab) {
      case "additions":
        return result.differences.filter((d) => d.added)
      case "deletions":
        return result.differences.filter((d) => d.removed)
      case "changes":
        return result.differences.filter((d) => !d.added && !d.removed && d.value.trim())
      case "all":
      default:
        return result.differences
    }
  }

  const filteredDiffs = getFilteredDifferences()

  return (
    <div className="relative min-h-screen p-6">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">
            Comparaison de documents
          </h1>
          <p className="text-muted-foreground text-lg">Identifiez les différences entre vos versions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={!result}>
            <Download className="mr-2 h-4 w-4" />
            Exporter le rapport
          </Button>
        </div>
      </div>

      {/* Document Selection */}
      <Card className="card-premium border-glow mb-6">
        <CardHeader>
          <CardTitle>Sélection des documents</CardTitle>
          <CardDescription>Choisissez deux versions à comparer</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDocs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chargement des documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-medium">Aucun document disponible</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajoutez des documents à vos projets pour utiliser la comparaison
              </p>
            </div>
          ) : documents.length === 1 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-medium">Document unique</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vous avez besoin d'au moins 2 documents pour effectuer une comparaison
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document original</label>
                  <Select value={selectedDoc1} onValueChange={setSelectedDoc1}>
                    <SelectTrigger className="glass border-glow">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent className="glass-premium border-glow">
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} (v{doc.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full glass">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouvelle version</label>
                  <Select value={selectedDoc2} onValueChange={setSelectedDoc2}>
                    <SelectTrigger className="glass border-glow">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent className="glass-premium border-glow">
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} (v{doc.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                {result?.stats ? (
                  <div className="flex items-center gap-4">
                    <Badge className="glass bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <span className="mr-1">●</span> {result.stats.added} Ajouts
                    </Badge>
                    <Badge className="glass bg-red-500/10 text-red-600 hover:bg-red-500/20">
                      <span className="mr-1">●</span> {result.stats.removed} Suppressions
                    </Badge>
                    <Badge className="glass bg-accent/10 text-accent hover:bg-accent/20">
                      <span className="mr-1">●</span> {result.stats.modified} Modifications
                    </Badge>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Cliquez sur "Comparer" pour voir les différences
                  </div>
                )}
                <Button
                  onClick={handleCompare}
                  disabled={comparing || !selectedDoc1 || !selectedDoc2 || selectedDoc1 === selectedDoc2}
                >
                  {comparing ? (
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

              {compareError && (
                <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">Erreur lors de la comparaison</p>
                  <p className="mt-1 text-sm text-destructive/80">{compareError}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Comparison View */}
      {result && (
        <>
          <Card className="card-premium border-glow mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-2xl">Résultat de la comparaison</CardTitle>
                  <CardDescription>
                    {getSelectedDocName(selectedDoc1)} vs {getSelectedDocName(selectedDoc2)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "side-by-side" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("side-by-side")}
                    className={
                      viewMode === "side-by-side" ? "glass-premium" : "glass hover-lift"
                    }
                  >
                    Côte à côte
                  </Button>
                  <Button
                    variant={viewMode === "unified" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("unified")}
                    className={viewMode === "unified" ? "glass-premium" : "glass hover-lift"}
                  >
                    Unifié
                  </Button>
                  <div className="ml-2 flex items-center gap-1 border-l pl-2">
                    <Button variant="ghost" size="icon" className="glass hover-lift">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">100%</span>
                    <Button variant="ghost" size="icon" className="glass hover-lift">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)} className="space-y-4">
                <TabsList className="glass border-glow">
                  <TabsTrigger value="all" className="data-[state=active]:glass-premium">Toutes les modifications</TabsTrigger>
                  <TabsTrigger value="additions" className="data-[state=active]:glass-premium">Ajouts ({result.stats.added})</TabsTrigger>
                  <TabsTrigger value="deletions" className="data-[state=active]:glass-premium">Suppressions ({result.stats.removed})</TabsTrigger>
                  <TabsTrigger value="changes" className="data-[state=active]:glass-premium">Modifications ({result.stats.modified})</TabsTrigger>
                </TabsList>

                <TabsContent value={filterTab} className="space-y-4">
                  {viewMode === "unified" ? (
                    <div className="space-y-2 rounded-lg border border-border p-4">
                      <div className="rounded bg-background p-3 font-mono text-sm">
                        {filteredDiffs.map((diff, index) => {
                          if (diff.added) {
                            return (
                              <span key={index} className="bg-green-500/10 text-green-600">
                                {diff.value}
                              </span>
                            )
                          } else if (diff.removed) {
                            return (
                              <span key={index} className="bg-red-500/10 text-red-600 line-through">
                                {diff.value}
                              </span>
                            )
                          } else {
                            return (
                              <span key={index} className="text-foreground">
                                {diff.value}
                              </span>
                            )
                          }
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Original Document */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
                          <span className="text-sm font-medium">{getSelectedDocName(selectedDoc1)}</span>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-2 rounded-b-lg border border-border p-4">
                          <div className="rounded bg-background p-3 font-mono text-sm">
                            {filteredDiffs.map((diff, index) => {
                              if (diff.removed) {
                                return (
                                  <span key={index} className="text-red-600 line-through">
                                    {diff.value}
                                  </span>
                                )
                              } else if (!diff.added) {
                                return (
                                  <span key={index} className="text-foreground">
                                    {diff.value}
                                  </span>
                                )
                              }
                              return null
                            })}
                          </div>
                        </div>
                      </div>

                      {/* New Document */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
                          <span className="text-sm font-medium">{getSelectedDocName(selectedDoc2)}</span>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-2 rounded-b-lg border border-border p-4">
                          <div className="rounded bg-background p-3 font-mono text-sm">
                            {filteredDiffs.map((diff, index) => {
                              if (diff.added) {
                                return (
                                  <span key={index} className="text-green-600">
                                    {diff.value}
                                  </span>
                                )
                              } else if (!diff.removed) {
                                return (
                                  <span key={index} className="text-foreground">
                                    {diff.value}
                                  </span>
                                )
                              }
                              return null
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="card-premium border-glow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Résumé des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl glass-premium hover-lift p-4 border-glow group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                  <div className="flex items-center gap-3 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10">
                      <span className="text-xl font-bold text-green-600">{result.stats.added}</span>
                    </div>
                    <div>
                      <p className="font-medium">Ajouts</p>
                      <p className="text-sm text-muted-foreground">Nouveaux éléments ajoutés</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl glass-premium hover-lift p-4 border-glow group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                  <div className="flex items-center gap-3 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10">
                      <span className="text-xl font-bold text-red-600">{result.stats.removed}</span>
                    </div>
                    <div>
                      <p className="font-medium">Suppressions</p>
                      <p className="text-sm text-muted-foreground">Éléments retirés du document</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl glass-premium hover-lift p-4 border-glow group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                  <div className="flex items-center gap-3 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                      <span className="text-xl font-bold text-accent">{result.stats.modified}</span>
                    </div>
                    <div>
                      <p className="font-medium">Modifications</p>
                      <p className="text-sm text-muted-foreground">Éléments modifiés</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl glass p-4 border-glow">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Total de différences:</span> {result.stats.total} mots
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Comparaison effectuée le {new Date(result.metadata.comparedAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
