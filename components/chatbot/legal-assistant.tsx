"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Loader2, Sparkles, FileText, FolderOpen, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function LegalAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const renderToolResult = (part: any) => {
    if (part.type.startsWith("tool-")) {
      const toolName = part.type.replace("tool-", "")

      if (part.state === "input-available") {
        return (
          <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-primary/5 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Recherche en cours...</span>
          </div>
        )
      }

      if (part.state === "output-available") {
        const output = part.output

        if (output.projects) {
          return (
            <div className="p-3 space-y-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderOpen className="w-4 h-4" />
                <span>Projets trouvés ({output.projects.length})</span>
              </div>
              {output.projects.map((project: any) => (
                <div key={project.id} className="p-2 text-sm rounded bg-background">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {project.documents} documents • {project.status}
                  </div>
                </div>
              ))}
            </div>
          )
        }

        if (output.documents) {
          return (
            <div className="p-3 space-y-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                <span>Documents trouvés ({output.documents.length})</span>
              </div>
              {output.documents.map((doc: any) => (
                <div key={doc.id} className="p-2 text-sm rounded bg-background">
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-xs text-muted-foreground">Version {doc.version}</div>
                </div>
              ))}
            </div>
          )
        }

        if (output.analysis) {
          return (
            <div className="p-3 space-y-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Analyse du document</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Clauses détectées:</span> {output.analysis.clauses}
                </div>
                {output.analysis.risks.length > 0 && (
                  <div>
                    <span className="font-medium text-amber-600">Risques identifiés:</span>
                    <ul className="mt-1 ml-4 space-y-1 list-disc">
                      {output.analysis.risks.map((risk: string, i: number) => (
                        <li key={i} className="text-amber-600">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {output.analysis.suggestions.length > 0 && (
                  <div>
                    <span className="font-medium text-green-600">Suggestions:</span>
                    <ul className="mt-1 ml-4 space-y-1 list-disc">
                      {output.analysis.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="text-green-600">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        }
      }
    }
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "fixed z-50 w-14 h-14 transition-all duration-300 rounded-full shadow-lg bottom-6 right-6",
          "bg-gradient-to-br from-primary to-accent hover:shadow-xl hover:scale-110",
          isOpen && "scale-0",
        )}
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed z-50 flex flex-col overflow-hidden transition-all duration-300 border shadow-2xl bottom-6 right-6 w-96 h-[600px] rounded-2xl bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Assistant Juridique</h3>
                <p className="text-xs text-muted-foreground">Propulsé par l'IA</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full hover:bg-background/50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="py-8 space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Bonjour! Comment puis-je vous aider?</h4>
                    <p className="text-sm text-muted-foreground">
                      Je peux vous aider à gérer vos projets, analyser vos documents et répondre à vos questions
                      juridiques.
                    </p>
                  </div>
                  <div className="grid gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue("Quels sont mes projets en cours?")
                      }}
                      className="justify-start text-left"
                    >
                      Quels sont mes projets en cours?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue("Analyse le document Contrat_Principal_v3.pdf")
                      }}
                      className="justify-start text-left"
                    >
                      Analyser un document
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputValue("Quelles sont les clauses importantes dans un contrat de vente?")
                      }}
                      className="justify-start text-left"
                    >
                      Conseils juridiques
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-primary to-accent">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 max-w-[80%]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <div className="space-y-2">
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <p key={index} className="text-sm whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        }
                        return <div key={index}>{renderToolResult(part)}</div>
                      })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-muted">
                      <span className="text-sm font-medium">Vous</span>
                    </div>
                  )}
                </div>
              ))}

              {status === "in_progress" && (
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-primary to-accent">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Réflexion en cours...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez votre question..."
                disabled={status === "in_progress"}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || status === "in_progress"}
                className="rounded-full shrink-0"
              >
                {status === "in_progress" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              L'assistant peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
