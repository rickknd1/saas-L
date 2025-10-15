/**
 * Script de vérification directe en base de données
 * Test des limites Freemium - Module C
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Vérification de l\'utilisateur test\n')
  console.log('='  .repeat(60))

  try {
    // 1. Vérifier l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: 'test.module.c@avocat.fr' },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            ownedProjects: true,
          }
        }
      }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:')
    console.log(`   - ID: ${user.id}`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Nom: ${user.name}`)
    console.log(`   - Plan: ${user.plan}`)
    console.log(`   - Créé le: ${user.createdAt.toISOString()}`)
    console.log(`   - Projets possédés: ${user._count.ownedProjects}`)
    console.log('')

    // 2. Vérifier les projets
    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        createdAt: true,
      }
    })

    console.log(`📁 Projets (${projects.length}):`)
    if (projects.length === 0) {
      console.log('   (aucun projet)')
    } else {
      projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.status}) - ${p.id}`)
      })
    }
    console.log('')

    // 3. Simuler la logique de vérification freemium
    console.log('🔒 Vérification limite Freemium:')
    console.log(`   - Plan actuel: ${user.plan}`)
    console.log(`   - Limite projets Freemium: 1`)
    console.log(`   - Projets actuels: ${user._count.ownedProjects}`)

    if (user.plan === 'FREEMIUM') {
      if (user._count.ownedProjects >= 1) {
        console.log('   ❌ LIMITE ATTEINTE - Impossible de créer un nouveau projet')
        console.log('   💡 Message: "Passez au plan Standard pour des projets illimités"')
      } else {
        console.log('   ✅ OK - Peut créer un projet')
      }
    } else {
      console.log('   ✅ Plan STANDARD - Projets illimités')
    }

    console.log('')
    console.log('='  .repeat(60))

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
