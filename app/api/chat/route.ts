import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Mock data - in production, these would query your database
const mockProjects = [
  { id: "1", name: "Contrat de Vente Immobilière", status: "active", documents: 5 },
  { id: "2", name: "Accord de Confidentialité", status: "review", documents: 3 },
  { id: "3", name: "Contrat de Travail", status: "draft", documents: 2 },
]

const mockDocuments = [
  { id: "1", name: "Contrat_Principal_v3.pdf", projectId: "1", version: 3 },
  { id: "2", name: "Annexe_A.pdf", projectId: "1", version: 1 },
  { id: "3", name: "NDA_Standard.pdf", projectId: "2", version: 2 },
]

const tools = {
  searchProjects: tool({
    description: "Rechercher des projets juridiques par nom ou statut",
    inputSchema: z.object({
      query: z.string().describe("Le terme de recherche"),
    }),
    execute: async ({ query }) => {
      const results = mockProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) || p.status.toLowerCase().includes(query.toLowerCase()),
      )
      return { projects: results }
    },
  }),

  getProjectDetails: tool({
    description: "Obtenir les détails complets d'un projet spécifique",
    inputSchema: z.object({
      projectId: z.string().describe("L'ID du projet"),
    }),
    execute: async ({ projectId }) => {
      const project = mockProjects.find((p) => p.id === projectId)
      if (!project) return { error: "Projet non trouvé" }

      const projectDocs = mockDocuments.filter((d) => d.projectId === projectId)
      return {
        project,
        documents: projectDocs,
        totalDocuments: projectDocs.length,
      }
    },
  }),

  searchDocuments: tool({
    description: "Rechercher des documents par nom",
    inputSchema: z.object({
      query: z.string().describe("Le nom du document à rechercher"),
    }),
    execute: async ({ query }) => {
      const results = mockDocuments.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
      return { documents: results }
    },
  }),

  getLegalAdvice: tool({
    description: "Fournir des conseils juridiques généraux sur un sujet",
    inputSchema: z.object({
      topic: z.string().describe("Le sujet juridique"),
    }),
    execute: async ({ topic }) => {
      return {
        advice: `Voici quelques points clés concernant ${topic}. Note: Ceci est un conseil général et ne remplace pas une consultation juridique professionnelle.`,
        disclaimer: "Consultez toujours un avocat pour des conseils juridiques spécifiques.",
      }
    },
  }),

  analyzeDocument: tool({
    description: "Analyser un document et fournir des insights",
    inputSchema: z.object({
      documentId: z.string().describe("L'ID du document"),
    }),
    execute: async ({ documentId }) => {
      const doc = mockDocuments.find((d) => d.id === documentId)
      if (!doc) return { error: "Document non trouvé" }

      return {
        document: doc,
        analysis: {
          clauses: 12,
          risks: ["Clause de résiliation à vérifier", "Délais de paiement non spécifiés"],
          suggestions: ["Ajouter une clause de force majeure", "Préciser les modalités de résiliation"],
        },
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  let contextInfo = {
    selectedProjects: [],
    focusMode: "general",
    tone: "professional",
    expertiseLevel: "intermediate",
    temperature: 0.7,
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === "user") {
    const textPart = lastMessage.parts.find((p) => p.type === "text")
    const text = textPart?.text || ""
    const contextMatch = text.match(/\[Context: (.+)\]/)
    if (contextMatch) {
      try {
        contextInfo = JSON.parse(contextMatch[1])
      } catch (e) {
        // Keep default context
      }
    }
  }

  const systemMessage = {
    role: "system" as const,
    content: `Tu es l'assistant juridique intelligent de Companion, une plateforme de gestion collaborative de contrats pour avocats et professionnels du droit.

Configuration actuelle:
- Mode de focus: ${contextInfo.focusMode}
- Ton: ${contextInfo.tone}
- Niveau d'expertise de l'utilisateur: ${contextInfo.expertiseLevel}
- Projets sélectionnés: ${contextInfo.selectedProjects.length > 0 ? contextInfo.selectedProjects.join(", ") : "aucun"}

Ton rôle:
- Aider les utilisateurs à naviguer dans l'application
- Répondre aux questions sur leurs projets et documents
- Fournir des conseils juridiques généraux (avec disclaimer)
- Analyser des documents et identifier des risques potentiels
- Suggérer des améliorations aux contrats

Adapte ton style selon:
- Mode général: assistance générale et navigation
- Mode analyse juridique: analyse approfondie et détaillée
- Mode révision: suggestions d'amélioration et corrections
- Mode recherche: recherche juridique et jurisprudence

Ton style:
- ${contextInfo.tone === "professional" ? "Professionnel et formel" : contextInfo.tone === "casual" ? "Accessible et décontracté" : "Technique et précis"}
- Adapté au niveau ${contextInfo.expertiseLevel} de l'utilisateur
- Toujours inclure un disclaimer pour les conseils juridiques
- Utiliser un langage juridique approprié

Tu as accès aux outils suivants pour aider l'utilisateur:
- searchProjects: rechercher des projets
- getProjectDetails: obtenir les détails d'un projet
- searchDocuments: rechercher des documents
- getLegalAdvice: fournir des conseils juridiques généraux
- analyzeDocument: analyser un document

Utilise ces outils de manière proactive pour fournir des réponses complètes et utiles.`,
  }

  const result = streamText({
    model: "openai/gpt-4o",
    messages: [systemMessage, ...convertToModelMessages(messages)],
    tools,
    maxSteps: 5,
    temperature: contextInfo.temperature,
  })

  return result.toUIMessageStreamResponse()
}
