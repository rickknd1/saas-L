import { NextResponse } from "next/server"

/**
 * Types pour les réponses API standardisées
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Codes d'erreur standardisés
 */
export const ErrorCodes = {
  // Authentification & Autorisation (4xx)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Validation (4xx)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELDS: "MISSING_REQUIRED_FIELDS",
  INVALID_INPUT: "INVALID_INPUT",

  // Ressources (4xx)
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Serveur (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const

/**
 * Helper pour créer une réponse de succès standardisée
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
export function apiError(
  code: string,
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

/**
 * Helpers spécifiques pour les erreurs courantes
 */

export function unauthorized(message = "Non authentifié") {
  return apiError(ErrorCodes.UNAUTHORIZED, message, 401)
}

export function forbidden(message = "Accès refusé") {
  return apiError(ErrorCodes.FORBIDDEN, message, 403)
}

export function notFound(resource = "Ressource", details?: unknown) {
  return apiError(
    ErrorCodes.NOT_FOUND,
    `${resource} non trouvé(e)`,
    404,
    details
  )
}

export function validationError(message: string, details?: unknown) {
  return apiError(ErrorCodes.VALIDATION_ERROR, message, 400, details)
}

export function conflict(message: string, details?: unknown) {
  return apiError(ErrorCodes.CONFLICT, message, 409, details)
}

export function internalError(message = "Une erreur interne est survenue", details?: unknown) {
  return apiError(ErrorCodes.INTERNAL_ERROR, message, 500, details)
}

export function databaseError(message = "Erreur lors de l'accès à la base de données") {
  return apiError(ErrorCodes.DATABASE_ERROR, message, 500)
}

/**
 * Helper pour gérer les erreurs dans les try-catch
 * Log l'erreur et retourne une réponse d'erreur appropriée
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiErrorResponse> {
  const prefix = context ? `[${context}]` : "[API]"
  console.error(`${prefix} Erreur:`, error)

  // Erreur Prisma
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string }

    // Erreurs Prisma courantes
    if (prismaError.code === 'P2002') {
      return conflict("Cette ressource existe déjà")
    }
    if (prismaError.code === 'P2025') {
      return notFound("Ressource")
    }
    if (prismaError.code.startsWith('P1')) {
      return databaseError("Impossible de se connecter à la base de données")
    }

    return databaseError(`Erreur de base de données: ${prismaError.message}`)
  }

  // Erreur standard JavaScript
  if (error instanceof Error) {
    return internalError(error.message)
  }

  // Erreur inconnue
  return internalError()
}
