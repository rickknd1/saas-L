import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PLAN_LIMITS } from "@/lib/plan-manager"
import { requireAuth } from "@/lib/get-session"

/**
 * API de gestion des projets
 * GET /api/projects - Liste des projets
 * POST /api/projects - Création de projet
 *
 * Module C (@kayzeur dylann)
 * Implémente la limitation freemium (1 projet max)
 */

/**
 * GET /api/projects
 * Récupère la liste des projets de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        _count: {
          select: {
            documents: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      projects,
      count: projects.length,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects
 * Crée un nouveau projet avec vérification de la limitation freemium
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session.user.id

    const body = await request.json()
    const { name, description, type, client, confidential } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur et son plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier la limitation freemium (1 projet max)
    if (user.plan === "FREEMIUM") {
      const projectCount = await prisma.project.count({
        where: { ownerId: userId },
      })

      const limit = PLAN_LIMITS.freemium.projects

      if (projectCount >= limit) {
        return NextResponse.json(
          {
            error: "Limite de projets atteinte",
            message: `Vous avez atteint la limite de ${limit} projet${limit > 1 ? "s" : ""} pour le plan Freemium. Passez au plan Standard pour créer des projets illimités.`,
            code: "FREEMIUM_LIMIT_REACHED",
            limit,
            current: projectCount,
            upgradeUrl: "/pricing",
          },
          { status: 403 }
        )
      }
    }

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: userId,
        confidential: confidential || false,
        // Stocker le type de contrat dans les métadonnées si nécessaire
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            documents: true,
            members: true,
          },
        },
      },
    })

    console.log(`✅ Project created: ${project.name} (${project.id}) by user ${userId}`)

    return NextResponse.json(
      {
        project,
        message: "Projet créé avec succès",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating project:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
