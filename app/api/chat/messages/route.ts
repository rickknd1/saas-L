import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * API pour récupérer les messages d'un projet
 * Module A2 - Messagerie Instantanée (CDC)
 *
 * GET /api/chat/messages?projectId=xxx&limit=50&before=messageId
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // Pour pagination

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId est requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès au projet
    // TODO: Ajouter vérification userId depuis JWT/session

    // Construire la requête
    const where: Prisma.MessageWhereInput = { projectId }

    // Si before est fourni, récupérer les messages avant ce message
    if (before) {
      const beforeMessage = await prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      })

      if (beforeMessage) {
        where.createdAt = {
          lt: beforeMessage.createdAt,
        }
      }
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    // Inverser pour avoir du plus ancien au plus récent
    const sortedMessages = messages.reverse()

    return NextResponse.json({
      success: true,
      messages: sortedMessages,
      hasMore: messages.length === limit,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    )
  }
}
