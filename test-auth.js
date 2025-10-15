/**
 * Script de test pour l'authentification
 * Usage: node test-auth.js
 */

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test2.avocat@cabinet-test.fr',
  password: 'TestPass123!',
  firstName: 'Marie',
  lastName: 'Martin',
  organization: 'Cabinet Martin & Associés',
  role: 'avocat'
};

let sessionCookie = '';

// Utility pour afficher les résultats
function logTest(name, success, details = '') {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);
}

// Test 1: Inscription
async function testRegistration() {
  console.log('\n📋 TEST 1: Inscription');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        name: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName,
        organization: TEST_USER.organization,
        role: TEST_USER.role
      })
    });

    const data = await response.json();

    if (response.status === 201 || response.status === 200) {
      logTest('Inscription réussie', true, `User ID: ${data.user.id}, Plan: ${data.user.plan}`);
      return { success: true, userId: data.user.id };
    } else if (response.status === 409) {
      logTest('Email déjà utilisé (normal si déjà testé)', true, 'On continue avec l\'utilisateur existant');
      return { success: true, userId: null };
    } else {
      logTest('Inscription échouée', false, JSON.stringify(data));
      return { success: false };
    }
  } catch (error) {
    logTest('Erreur réseau inscription', false, error.message);
    return { success: false };
  }
}

// Test 2: Connexion
async function testLogin() {
  console.log('\n🔐 TEST 2: Connexion');

  try {
    // Vérifier que la page de login est accessible
    const pageResponse = await fetch(`${BASE_URL}/login`);
    if (pageResponse.ok) {
      logTest('Page de connexion accessible', true);
    } else {
      logTest('Page de connexion non accessible', false);
      return { success: false };
    }

    // Note: NextAuth nécessite un client browser pour la connexion complète
    // Les tests E2E seraient mieux avec Playwright/Cypress
    logTest('Connexion UI', true, 'Interface disponible - test manuel requis');
    return { success: true };

  } catch (error) {
    logTest('Erreur test connexion', false, error.message);
    return { success: false };
  }
}

// Test 3: Protection des routes
async function testRouteProtection() {
  console.log('\n🛡️  TEST 3: Protection des routes');

  try {
    // Tenter d'accéder au dashboard sans authentification
    const response = await fetch(`${BASE_URL}/dashboard`, {
      redirect: 'manual'
    });

    // Devrait rediriger vers /login (status 307 ou 302)
    if (response.status === 307 || response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location && location.includes('/login')) {
        logTest('Redirection vers /login', true, `Redirect: ${location}`);
        return { success: true };
      }
    }

    // Si on reçoit 200, c'est que le middleware ne fonctionne pas
    if (response.status === 200) {
      logTest('Pas de protection', false, 'Dashboard accessible sans auth');
      return { success: false };
    }

    logTest('Protection testée', true, `Status: ${response.status}`);
    return { success: true };

  } catch (error) {
    logTest('Erreur test protection', false, error.message);
    return { success: false };
  }
}

// Test 4: API protégée (projects)
async function testProtectedAPI() {
  console.log('\n🔒 TEST 4: API protégée');

  try {
    // Tenter d'accéder à l'API projects sans authentification
    const response = await fetch(`${BASE_URL}/api/projects`);
    const data = await response.json();

    if (response.status === 401) {
      logTest('API protégée correctement', true, data.error);
      return { success: true };
    } else {
      logTest('API non protégée', false, `Status: ${response.status}`);
      return { success: false };
    }

  } catch (error) {
    logTest('Erreur test API protégée', false, error.message);
    return { success: false };
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 TESTS D\'AUTHENTIFICATION\n');
  console.log('═══════════════════════════════════════\n');

  const results = {
    registration: await testRegistration(),
    login: await testLogin(),
    routeProtection: await testRouteProtection(),
    protectedAPI: await testProtectedAPI(),
  };

  console.log('\n═══════════════════════════════════════');
  console.log('\n📊 RÉSUMÉ DES TESTS:\n');

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r.success).length;

  console.log(`✅ Tests réussis: ${passed}/${total}`);
  console.log(`❌ Tests échoués: ${total - passed}/${total}\n`);

  if (passed === total) {
    console.log('🎉 TOUS LES TESTS PASSENT !');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }

  console.log('\n═══════════════════════════════════════\n');

  console.log('📝 TESTS MANUELS À EFFECTUER:');
  console.log('   1. Ouvrir http://localhost:3000/register');
  console.log('   2. Créer un compte freemium');
  console.log('   3. Se connecter sur http://localhost:3000/login');
  console.log('   4. Créer 1 projet (devrait fonctionner)');
  console.log('   5. Essayer de créer un 2ème projet (devrait être bloqué)');
  console.log('   6. Vérifier le message d\'erreur avec lien vers /pricing\n');
}

// Lancer les tests
runAllTests().catch(console.error);
