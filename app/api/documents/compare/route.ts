import { NextResponse } from "next/server"
import * as Diff from "diff"
import { prisma } from "@/lib/prisma"
import { extractTextOnly, cleanExtractedText } from "@/lib/pdf-extract"
import { applyRateLimit, RATE_LIMIT_CONFIGS, getRequestIdentifier } from "@/lib/rate-limit"

/**
 * API de comparaison de documents
 * Compare deux versions de documents et retourne les différences
 *
 * Cahier des charges: Section 2.1 - Comparaison de Documents
 */

export async function POST(request: Request) {
  try {
    // SÉCURITÉ: Rate limiting pour protéger contre l'abus (opération coûteuse)
    const rateLimitResponse = applyRateLimit(
      request,
      RATE_LIMIT_CONFIGS.COMPARE,
      getRequestIdentifier(request, 'compare')
    )
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const { documentId1, documentId2, content1, content2 } = body

    let finalContent1: string
    let finalContent2: string

    // Cas 1 : IDs de documents fournis - récupérer et extraire le texte
    if (documentId1 && documentId2) {
      try {
        // Récupérer les documents depuis la BDD
        const [doc1, doc2] = await Promise.all([
          prisma.document.findUnique({
            where: { id: documentId1 },
            select: { fileData: true, mimeType: true, name: true }
          }),
          prisma.document.findUnique({
            where: { id: documentId2 },
            select: { fileData: true, mimeType: true, name: true }
          })
        ])

        if (!doc1 || !doc2) {
          return NextResponse.json(
            { error: "Un ou plusieurs documents sont introuvables" },
            { status: 404 }
          )
        }

        // Extraire le texte des PDFs
        if (doc1.mimeType === "application/pdf" && doc2.mimeType === "application/pdf") {
          const [text1, text2] = await Promise.all([
            extractTextOnly(Buffer.from(doc1.fileData)),
            extractTextOnly(Buffer.from(doc2.fileData))
          ])

          finalContent1 = cleanExtractedText(text1)
          finalContent2 = cleanExtractedText(text2)
        } else {
          // Pour les fichiers non-PDF, convertir directement en texte
          finalContent1 = doc1.fileData.toString('utf-8')
          finalContent2 = doc2.fileData.toString('utf-8')
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des documents:", error)
        return NextResponse.json(
          { error: "Erreur lors de la récupération ou de l'extraction du contenu des documents" },
          { status: 500 }
        )
      }
    }
    // Cas 2 : Contenus fournis directement
    else if (content1 && content2) {
      finalContent1 = content1
      finalContent2 = content2
    }
    // Cas 3 : Données manquantes
    else {
      return NextResponse.json(
        { error: "Vous devez fournir soit documentId1 et documentId2, soit content1 et content2" },
        { status: 400 }
      )
    }

    // Comparaison avec jsdiff
    const differences = Diff.diffWords(finalContent1, finalContent2)

    // Calcul des statistiques
    let addedCount = 0
    let removedCount = 0
    let modifiedCount = 0

    differences.forEach((part) => {
      if (part.added) {
        addedCount += part.value.split(/\s+/).length
      } else if (part.removed) {
        removedCount += part.value.split(/\s+/).length
      }
    })

    // Détection des modifications (removed + added consécutifs)
    for (let i = 0; i < differences.length - 1; i++) {
      if (differences[i].removed && differences[i + 1].added) {
        modifiedCount++
      }
    }

    return NextResponse.json({
      success: true,
      differences,
      stats: {
        added: addedCount,
        removed: removedCount,
        modified: modifiedCount,
        total: differences.length,
      },
      metadata: {
        documentId1,
        documentId2,
        comparedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erreur lors de la comparaison:", error)
    return NextResponse.json(
      { error: "Erreur lors de la comparaison des documents" },
      { status: 500 }
    )
  }
}
