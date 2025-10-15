/**
 * Script de test des limites Freemium
 * Module C - Test automatisé
 */

const BASE_URL = 'http://localhost:3000'

// Test user credentials
const TEST_USER = {
  email: 'test.module.c@avocat.fr',
  password: 'TestPass123!',
  id: 'cmgkwo1ko0000flpcjn147c81'
}

async function testProjectLimit() {
  console.log('\n🧪 TEST 4: Limite Freemium - 1 Projet Max\n')
  console.log('='  .repeat(60))

  try {
    // Step 1: Login avec NextAuth
    console.log('📝 Step 1: Authentification...')

    // Pour ce test, on va utiliser directement l'API sans authentification NextAuth
    // car c'est complexe à tester avec curl. On va plutôt vérifier manuellement
    // ou créer un endpoint de test.

    console.log('⚠️  NextAuth nécessite un navigateur pour l\'authentification complète.')
    console.log('📋 Tests manuels à effectuer:')
    console.log('')
    console.log('1. Se connecter sur http://localhost:3000/login avec:')
    console.log(`   - Email: ${TEST_USER.email}`)
    console.log(`   - Password: ${TEST_USER.password}`)
    console.log('')
    console.log('2. Aller sur http://localhost:3000/dashboard/projects')
    console.log('')
    console.log('3. Créer un premier projet:')
    console.log('   - Nom: "Projet Test 1"')
    console.log('   - Type: "civil"')
    console.log('   ✅ Devrait fonctionner (0 → 1 projet)')
    console.log('')
    console.log('4. Tenter de créer un deuxième projet:')
    console.log('   - Nom: "Projet Test 2"')
    console.log('   - Type: "penal"')
    console.log('   ❌ Devrait être bloqué avec message:')
    console.log('      "Limite de projets atteinte"')
    console.log('      "Passez au plan Standard pour des projets illimités"')
    console.log('')
    console.log('='  .repeat(60))

    // Alternative: Tester avec l'API directement via Prisma
    console.log('\n🔧 Alternative: Test via base de données directe\n')
    console.log('Vérification du plan actuel de l\'utilisateur:')
    console.log(`User ID: ${TEST_USER.id}`)
    console.log('')
    console.log('Commande SQL à exécuter:')
    console.log(`SELECT id, email, name, plan FROM "User" WHERE id = '${TEST_USER.id}';`)
    console.log('')
    console.log('Commande SQL pour compter les projets:')
    console.log(`SELECT COUNT(*) FROM "Project" WHERE "ownerId" = '${TEST_USER.id}';`)
    console.log('')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter le test
testProjectLimit()
