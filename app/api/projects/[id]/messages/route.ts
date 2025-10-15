import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromCookie } from '@/lib/prisma-helpers'

/**
 * GET /api/projects/[id]/messages
 * Récupère tous les messages d'un projet
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Récupérer les messages avec les informations de l'utilisateur
    const messages = await prisma.message.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[GET /api/projects/[id]/messages] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des messages' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects/[id]/messages
 * Envoie un nouveau message dans un projet
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { content, attachments } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu du message est requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        projectId,
        userId: user.id,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/projects/[id]/messages] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
