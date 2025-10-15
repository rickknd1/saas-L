import { NextRequest, NextResponse } from "next/server"
import * as Diff from "diff"

/**
 * API de comparaison de documents
 * POST /api/documents/compare
 *
 * Fonctionnalité du Module C (@kayzeur dylann)
 * Compare deux versions de documents et retourne les différences
 */

interface CompareRequest {
  documentId1: string
  documentId2: string
  content1?: string
  content2?: string
}

interface DiffResult {
  type: "added" | "removed" | "unchanged"
  value: string
  lineNumber?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json()
    const { documentId1, documentId2, content1, content2 } = body

    // Validation
    if (!documentId1 || !documentId2) {
      return NextResponse.json(
        { error: "documentId1 and documentId2 are required" },
        { status: 400 }
      )
    }

    // Pour le MVP, on accepte le contenu directement
    // En production, on récupérerait le contenu depuis S3 ou la BDD
    if (!content1 || !content2) {
      return NextResponse.json(
        { error: "content1 and content2 are required for comparison" },
        { status: 400 }
      )
    }

    // Comparaison ligne par ligne avec jsdiff
    const differences = Diff.diffLines(content1, content2)

    // Formater les résultats
    const formattedDiffs: DiffResult[] = []
    let lineNumber = 0

    differences.forEach((part) => {
      const lines = part.value.split("\n")

      lines.forEach((line, index) => {
        if (line.trim() === "" && index === lines.length - 1) return

        let type: "added" | "removed" | "unchanged" = "unchanged"

        if (part.added) {
          type = "added"
        } else if (part.removed) {
          type = "removed"
        }

        formattedDiffs.push({
          type,
          value: line,
          lineNumber: lineNumber++
        })
      })
    })

    // Statistiques
    const stats = {
      totalLines: formattedDiffs.length,
      added: formattedDiffs.filter(d => d.type === "added").length,
      removed: formattedDiffs.filter(d => d.type === "removed").length,
      unchanged: formattedDiffs.filter(d => d.type === "unchanged").length
    }

    return NextResponse.json({
      success: true,
      documentId1,
      documentId2,
      differences: formattedDiffs,
      stats
    })

  } catch (error) {
    console.error("Error comparing documents:", error)
    return NextResponse.json(
      {
        error: "Failed to compare documents",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Méthode GET pour récupérer l'historique des comparaisons (future fonctionnalité)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Method not implemented yet" },
    { status: 501 }
  )
}
