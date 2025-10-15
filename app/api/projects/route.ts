import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"



/**
 * API pour récupérer la liste des projets de l'utilisateur
 * Retourne tous les projets avec leurs statistiques
 *
 * Cahier des charges: Module A - Projets & Documents
 */

export async function GET(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer les projets de l'utilisateur avec leurs relations
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                acceptedAt: {
                  not: null,  // Uniquement si l'utilisateur a accepté l'invitation
                },
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          where: {
            acceptedAt: {
              not: null,  // Uniquement les membres qui ont accepté
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            members: true,
            documents: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Corriger manuellement le _count.members pour chaque projet (car _count ne respecte pas le where)
    const projectsWithCorrectCount = projects.map(project => ({
      ...project,
      _count: {
        ...project._count,
        members: project.members.length,
      },
    }))

    return NextResponse.json({
      success: true,
      projects: projectsWithCorrectCount,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}

/**
 * API pour créer un nouveau projet
 */
export async function POST(request: Request) {
  try {
    // Le middleware a ajouté le userId dans les headers après vérification du JWT
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, status, priority, confidential, deadline } = body

    if (!name) {
      return NextResponse.json(
        { error: "name est requis" },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || "DRAFT",
        priority: priority || "MEDIUM",
        confidential: confidential || false,
        deadline: deadline ? new Date(deadline) : null,
        ownerId: userId,
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
            members: true,
            documents: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    )
  } finally {
    // Ne PAS déconnecter Prisma - laissez le pool gérer les connexions

    // await prisma.$disconnect()
  }
}
