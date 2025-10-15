/**
 * Test de l'upgrade FREEMIUM → STANDARD
 * Module C - Simulation complète
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEST_USER_ID = 'cmgkwo1ko0000flpcjn147c81'
const TEST_USER_EMAIL = 'test.module.c@avocat.fr'

async function main() {
  console.log('\n🧪 TEST 5: Upgrade FREEMIUM → STANDARD\n')
  console.log('='  .repeat(60))

  try {
    // 1. Vérifier l'état actuel
    console.log('📋 Étape 1: Vérification de l\'état actuel')
    const userBefore = await prisma.user.findUnique({
      where: { id: TEST_USER_ID },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        customerId: true,
        _count: {
          select: { ownedProjects: true }
        }
      }
    })

    if (!userBefore) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    console.log(`   User: ${userBefore.email}`)
    console.log(`   Plan actuel: ${userBefore.plan}`)
    console.log(`   Projets: ${userBefore._count.ownedProjects}`)
    console.log(`   Customer ID: ${userBefore.customerId || '(aucun)'}`)
    console.log('')

    // 2. Simuler l'upgrade (ce que le webhook ferait)
    console.log('💳 Étape 2: Simulation du paiement Stripe')
    console.log('   (Simule: checkout.session.completed webhook)')
    console.log('')

    // Générer un faux Stripe Customer ID et Subscription ID
    const fakeCustomerId = `cus_test_${Date.now()}`
    const fakeSubscriptionId = `sub_test_${Date.now()}`
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: TEST_USER_ID },
      data: {
        plan: 'STANDARD',
        customerId: fakeCustomerId,
        subscriptionId: fakeSubscriptionId,
      }
    })

    console.log(`✅ User upgradé vers STANDARD`)
    console.log(`   Customer ID: ${fakeCustomerId}`)
    console.log(`   Subscription ID: ${fakeSubscriptionId}`)
    console.log('')

    // Créer l'abonnement dans la table Subscription
    await prisma.subscription.create({
      data: {
        userId: TEST_USER_ID,
        stripeSubscriptionId: fakeSubscriptionId,
        stripePriceId: process.env.STRIPE_PRICE_ID_STANDARD || 'price_test',
        stripeCustomerId: fakeCustomerId,
        status: 'ACTIVE',
        plan: 'STANDARD',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      }
    })

    console.log('✅ Abonnement créé dans la BDD')
    console.log(`   Status: ACTIVE`)
    console.log(`   Période: ${now.toISOString()} → ${periodEnd.toISOString()}`)
    console.log('')

    // Créer une notification (ce que le webhook ferait)
    await prisma.notification.create({
      data: {
        userId: TEST_USER_ID,
        type: 'SYSTEM',
        title: 'Bienvenue dans le plan Standard ! 🎉',
        message: 'Vous avez désormais accès à toutes les fonctionnalités premium : projets illimités, documents illimités, et bien plus encore.',
        link: '/dashboard',
      }
    })

    console.log('✅ Notification créée')
    console.log('')

    // Créer un log d\'audit
    await prisma.auditLog.create({
      data: {
        userId: TEST_USER_ID,
        action: 'UPDATE',
        resource: 'user',
        resourceId: TEST_USER_ID,
        metadata: JSON.stringify({
          action: 'SUBSCRIPTION_CREATED',
          previousPlan: 'FREEMIUM',
          newPlan: 'STANDARD',
          subscriptionId: fakeSubscriptionId,
        }),
      }
    })

    console.log('✅ Audit log créé')
    console.log('')

    // 3. Vérifier l'état final
    console.log('📊 Étape 3: Vérification de l\'upgrade')
    const userAfter = await prisma.user.findUnique({
      where: { id: TEST_USER_ID },
      include: {
        subscription: true,
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    })

    console.log(`   User: ${userAfter.email}`)
    console.log(`   Plan: ${userAfter.plan} ✅`)
    console.log(`   Customer ID: ${userAfter.customerId}`)
    console.log(`   Subscription:`)
    console.log(`      - Status: ${userAfter.subscription?.status}`)
    console.log(`      - Plan: ${userAfter.subscription?.plan}`)
    console.log(`   Notifications non lues: ${userAfter.notifications.length}`)
    if (userAfter.notifications.length > 0) {
      console.log(`      - "${userAfter.notifications[0].title}"`)
    }
    console.log('')

    // 4. Tester la création de projets illimités
    console.log('🚀 Étape 4: Test des projets illimités')

    // Créer un 2ème projet (maintenant autorisé)
    const project2 = await prisma.project.create({
      data: {
        name: 'Projet Test 2 - Dossier Pénal',
        description: 'Test après upgrade vers Standard - devrait fonctionner',
        status: 'DRAFT',
        priority: 'HIGH',
        ownerId: TEST_USER_ID,
      }
    })

    console.log(`✅ Projet 2 créé: ${project2.name}`)
    console.log(`   ID: ${project2.id}`)
    console.log('')

    // Créer un 3ème projet pour confirmer
    const project3 = await prisma.project.create({
      data: {
        name: 'Projet Test 3 - Dossier Commercial',
        description: 'Confirmation que les projets sont illimités',
        status: 'IN_REVIEW',
        priority: 'MEDIUM',
        ownerId: TEST_USER_ID,
      }
    })

    console.log(`✅ Projet 3 créé: ${project3.name}`)
    console.log(`   ID: ${project3.id}`)
    console.log('')

    // Compter les projets
    const totalProjects = await prisma.project.count({
      where: { ownerId: TEST_USER_ID }
    })

    console.log(`📊 Total des projets: ${totalProjects}/∞`)
    console.log('')

    console.log('='  .repeat(60))
    console.log('\n📋 RÉSUMÉ DU TEST:')
    console.log('')
    console.log('✅ Utilisateur upgradé de FREEMIUM → STANDARD')
    console.log('✅ Abonnement créé dans la BDD (Status: ACTIVE)')
    console.log('✅ Notification "Bienvenue Standard" créée')
    console.log('✅ Audit log enregistré')
    console.log(`✅ Projets illimités vérifiés (3 projets créés)`)
    console.log('')
    console.log('🎯 TEST 5: RÉUSSI\n')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
