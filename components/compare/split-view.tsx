"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

/**
 * Composant SplitView pour la comparaison de documents
 * Module C (@kayzeur dylann)
 *
 * Affiche deux versions de documents côte à côte avec coloration des différences
 */

interface DiffResult {
  type: "added" | "removed" | "unchanged"
  value: string
  lineNumber?: number
}

interface SplitViewProps {
  documentName1: string
  documentName2: string
  differences: DiffResult[]
  stats?: {
    totalLines: number
    added: number
    removed: number
    unchanged: number
  }
}

export function SplitView({
  documentName1,
  documentName2,
  differences,
  stats
}: SplitViewProps) {
  // Séparer les différences pour l'affichage côte à côte
  const leftSide: DiffResult[] = []
  const rightSide: DiffResult[] = []

  differences.forEach((diff) => {
    if (diff.type === "removed" || diff.type === "unchanged") {
      leftSide.push(diff)
    }
    if (diff.type === "added" || diff.type === "unchanged") {
      rightSide.push(diff)
    }
  })

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      {stats && (
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="gap-1">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{stats.totalLines}</span>
          </Badge>
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-300">
            <span>Ajouts:</span>
            <span className="font-semibold">{stats.added}</span>
          </Badge>
          <Badge variant="destructive" className="gap-1">
            <span>Suppressions:</span>
            <span className="font-semibold">{stats.removed}</span>
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <span>Inchangés:</span>
            <span className="font-semibold">{stats.unchanged}</span>
          </Badge>
        </div>
      )}

      {/* Vue côte à côte */}
      <div className="grid grid-cols-2 gap-4">
        {/* Document 1 (Original) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{documentName1}</span>
              <Badge variant="secondary">Original</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-0">
                {leftSide.map((diff, index) => (
                  <DiffLine key={index} diff={diff} side="left" />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document 2 (Modifié) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{documentName2}</span>
              <Badge variant="default">Modifié</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-0">
                {rightSide.map((diff, index) => (
                  <DiffLine key={index} diff={diff} side="right" />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Composant pour afficher une ligne avec coloration selon le type de diff
 */
interface DiffLineProps {
  diff: DiffResult
  side: "left" | "right"
}

function DiffLine({ diff, side }: DiffLineProps) {
  const getLineStyle = () => {
    if (diff.type === "added") {
      return {
        className: "bg-green-50 text-green-900 border-l-4 border-green-500",
        symbol: "+"
      }
    }
    if (diff.type === "removed") {
      return {
        className: "bg-red-50 text-red-900 border-l-4 border-red-500 line-through",
        symbol: "-"
      }
    }
    return {
      className: "bg-background text-foreground border-l-4 border-transparent",
      symbol: " "
    }
  }

  const { className, symbol } = getLineStyle()

  // N'afficher que les lignes pertinentes pour chaque côté
  if (side === "left" && diff.type === "added") return null
  if (side === "right" && diff.type === "removed") return null

  return (
    <div className={cn("px-3 py-1 font-mono text-sm hover:bg-muted/50 transition-colors", className)}>
      <span className="text-muted-foreground mr-4 select-none">{diff.lineNumber}</span>
      <span className="font-bold mr-2 select-none">{symbol}</span>
      <span>{diff.value || "\u00A0"}</span>
    </div>
  )
}
