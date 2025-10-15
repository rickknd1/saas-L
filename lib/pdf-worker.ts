/**
 * Configuration du worker PDF.js pour react-pdf
 *
 * Ce fichier configure le worker PDF.js nécessaire pour afficher les PDF
 * dans le navigateur avec react-pdf.
 */

import { pdfjs } from 'react-pdf'

// Configuration du worker PDF.js
// Utiliser la version CDN pour éviter les problèmes de build
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// Alternative locale (à utiliser si vous voulez héberger le worker vous-même):
// pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export { pdfjs }
