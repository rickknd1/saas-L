import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API pour marquer un ou plusieurs messages comme lus
 * Module A2 - Messagerie Instantanée (CDC)
 *
 * POST /api/chat/read
 * Body: { messageId: string } ou { projectId: string } (tous les messages)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messageId, projectId, userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      )
    }

    let updatedCount = 0

    // Marquer un message spécifique comme lu
    if (messageId) {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      })

      if (!message) {
        return NextResponse.json(
          { error: 'Message non trouvé' },
          { status: 404 }
        )
      }

      // Ne marquer que si ce n'est pas le message de l'utilisateur
      if (message.userId !== userId && !message.read) {
        await prisma.message.update({
          where: { id: messageId },
          data: {
            read: true,
            readAt: new Date(),
          },
        })
        updatedCount = 1
      }
    }
    // Marquer tous les messages non lus du projet comme lus
    else if (projectId) {
      const result = await prisma.message.updateMany({
        where: {
          projectId,
          userId: { not: userId }, // Ne pas marquer ses propres messages
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      })
      updatedCount = result.count
    } else {
      return NextResponse.json(
        { error: 'messageId ou projectId est requis' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      updatedCount,
    })
  } catch (error) {
    console.error('Erreur lors du marquage des messages:', error)
    return NextResponse.json(
      { error: 'Erreur lors du marquage des messages' },
      { status: 500 }
    )
  }
}
