/**
 * Interface pour les données extraites d'un PDF
 */
export interface PDFData {
  text: string
  numPages: number
  info: {
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
    Producer?: string
    CreationDate?: string
    ModDate?: string
  }
  metadata?: Record<string, unknown>
}

/**
 * Extrait le texte brut et les métadonnées d'un PDF
 * @param buffer - Buffer du fichier PDF
 * @returns Données extraites du PDF
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFData> {
  try {
    // Import dynamique pour éviter les problèmes de bundling webpack
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

    // Charger le document PDF
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/standard_fonts/',
    })

    const pdfDocument = await loadingTask.promise
    const numPages = pdfDocument.numPages

    // Extraire le texte de chaque page
    const textPromises: Promise<string>[] = []
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      textPromises.push(
        pdfDocument.getPage(pageNum).then(async (page) => {
          const textContent = await page.getTextContent()
          return textContent.items
            .map((item: { str?: string }) => item.str || '')
            .join(' ')
        })
      )
    }

    const pageTexts = await Promise.all(textPromises)
    const text = pageTexts.join('\n\n')

    // Récupérer les métadonnées
    const metadata = await pdfDocument.getMetadata()
    const info = metadata.info || {}

    return {
      text,
      numPages,
      info: {
        Title: info.Title,
        Author: info.Author,
        Subject: info.Subject,
        Creator: info.Creator,
        Producer: info.Producer,
        CreationDate: info.CreationDate,
        ModDate: info.ModDate,
      },
      metadata: metadata.metadata,
    }
  } catch (error) {
    console.error('Erreur extraction PDF:', error)
    throw new Error('Impossible d\'extraire le texte du PDF')
  }
}

/**
 * Extrait uniquement le texte d'un PDF (sans métadonnées)
 * @param buffer - Buffer du fichier PDF
 * @returns Texte extrait
 */
export async function extractTextOnly(buffer: Buffer): Promise<string> {
  const data = await extractTextFromPDF(buffer)
  return data.text
}

/**
 * Compte le nombre de pages d'un PDF
 * @param buffer - Buffer du fichier PDF
 * @returns Nombre de pages
 */
export async function getPDFPageCount(buffer: Buffer): Promise<number> {
  const data = await extractTextFromPDF(buffer)
  return data.numPages
}

/**
 * Vérifie si un buffer est un PDF valide
 * @param buffer - Buffer à vérifier
 * @returns true si le buffer est un PDF valide
 */
export function isValidPDF(buffer: Buffer): boolean {
  // Les fichiers PDF commencent par les bytes %PDF
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]) // %PDF
  return buffer.subarray(0, 4).equals(pdfSignature)
}

/**
 * Nettoie le texte extrait d'un PDF
 * Supprime les espaces multiples, les retours à la ligne excessifs, etc.
 * @param text - Texte brut extrait
 * @returns Texte nettoyé
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normaliser les retours à la ligne
    .replace(/\n{3,}/g, '\n\n') // Limiter les sauts de ligne multiples
    .replace(/ {2,}/g, ' ') // Remplacer espaces multiples par un seul
    .trim()
}
