"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  FolderOpen,
  Trash2,
  Download,
  Copy,
  Upload,
  Paperclip,
  X,
} from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data for projects
const mockProjects = [
  { id: "1", name: "Contrat de Vente Immobilière", documents: 5 },
  { id: "2", name: "Accord de Confidentialité", documents: 3 },
  { id: "3", name: "Contrat de Travail", documents: 2 },
  { id: "4", name: "Bail Commercial", documents: 4 },
]

const mockDocuments = [
  { id: "1", name: "Contrat_Vente_v3.pdf", projectId: "1", size: "2.4 MB" },
  { id: "2", name: "Annexe_A.pdf", projectId: "1", size: "1.1 MB" },
  { id: "3", name: "NDA_Standard.pdf", projectId: "2", size: "856 KB" },
  { id: "4", name: "Contrat_CDI.pdf", projectId: "3", size: "1.8 MB" },
]

export default function AssistantPage() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [showContextPanel, setShowContextPanel] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, isLoading, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId],
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles((prev) => [...prev, ...files])
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = (content: string) => {
    if (!content.trim() && attachedFiles.length === 0) return

    const contextInfo = {
      selectedProjects,
      selectedDocuments,
      attachedFiles: attachedFiles.map((f) => f.name),
    }

    const enhancedContent = `${content}\n\n[Context: ${JSON.stringify(contextInfo)}]`

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: enhancedContent }],
    })

    setAttachedFiles([])
  }

  const clearChat = () => {
    window.location.reload()
  }

  const exportChat = () => {
    const chatText = messages
      .map((m) => {
        const text = m.parts.find((p) => p.type === "text")?.text || ""
        return `${m.role.toUpperCase()}: ${text}`
      })
      .join("\n\n")

    const blob = new Blob([chatText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-${new Date().toISOString()}.txt`
    a.click()
  }

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <Card className="mb-4 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Assistant Juridique IA</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Analysez vos documents, posez des questions juridiques et obtenez des conseils
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {selectedProjects.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {selectedProjects.length} projet(s)
                  </Badge>
                )}
                {selectedDocuments.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {selectedDocuments.length} document(s)
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContextPanel(!showContextPanel)}
            >
              {showContextPanel ? "Masquer le contexte" : "Afficher le contexte"}
            </Button>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Comment puis-je vous aider ?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Posez des questions sur vos projets, documents, ou demandez des conseils juridiques
                  </p>
                </div>
                <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSendMessage("Analyse mon dernier contrat")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Analyser un document
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSendMessage("Quels sont mes projets en cours ?")}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Voir mes projets
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSendMessage("Explique-moi les clauses de résiliation")}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Conseil juridique
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSendMessage("Compare mes deux dernières versions")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Comparer des documents
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => {
                  const textPart = message.parts.find((p) => p.type === "text")
                  const text = textPart?.text || ""
                  const isUser = message.role === "user"

                  return (
                    <div key={index} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                      {!isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{text}</p>
                        {!isUser && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={() => copyMessage(text)}
                            >
                              <Copy className="h-3 w-3" />
                              Copier
                            </Button>
                          </div>
                        )}
                      </div>
                      {isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                          <span className="text-xs font-semibold">ME</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className="p-4">
            {error && (
              <div className="mb-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                Erreur: {error.message}
              </div>
            )}

            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <Badge key={index} variant="secondary" className="gap-2 pr-1">
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[150px] truncate text-xs">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() => removeAttachedFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem("message") as HTMLTextAreaElement
                handleSendMessage(input.value)
                input.value = ""
              }}
              className="flex gap-2"
            >
              <div className="flex flex-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                  name="message"
                  placeholder="Posez votre question..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      const form = e.currentTarget.form
                      if (form) {
                        form.requestSubmit()
                      }
                    }
                  }}
                />
              </div>
              <Button type="submit" size="icon" className="h-[60px] w-[60px] shrink-0" disabled={isLoading}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Entrée pour envoyer • Shift+Entrée pour nouvelle ligne</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={clearChat}>
                  <Trash2 className="h-3 w-3" />
                  Effacer
                </Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={exportChat}>
                  <Download className="h-3 w-3" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Context Panel - Simplifié */}
      {showContextPanel && (
        <Card className="w-80 overflow-hidden">
          <div className="border-b p-4">
            <h3 className="font-semibold">Contexte de la conversation</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Sélectionnez les projets et documents à inclure
            </p>
          </div>

          <ScrollArea className="h-[calc(100%-5rem)]">
            <div className="p-4 space-y-6">
              {/* Project Selection */}
              <div>
                <Label className="text-sm font-semibold">Projets</Label>
                <p className="mb-3 text-xs text-muted-foreground">
                  Projets à inclure dans le contexte
                </p>
                <div className="space-y-2">
                  {mockProjects.map((project) => (
                    <div key={project.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => handleProjectToggle(project.id)}
                      />
                      <label htmlFor={`project-${project.id}`} className="flex-1 cursor-pointer text-sm">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">{project.documents} documents</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Document Selection */}
              <div>
                <Label className="text-sm font-semibold">Documents</Label>
                <p className="mb-3 text-xs text-muted-foreground">Documents à analyser</p>
                <div className="space-y-2">
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                      />
                      <label htmlFor={`doc-${doc.id}`} className="flex-1 cursor-pointer text-sm">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.size}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
