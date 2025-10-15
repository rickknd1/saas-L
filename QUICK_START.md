# ⚡ Quick Start - Companion Legal SaaS

## 🎯 Pour démarrer RAPIDEMENT (5 minutes)

### 1️⃣ **Installer PostgreSQL** (si pas déjà fait)

**Windows:**
- Télécharger : https://www.postgresql.org/download/windows/
- Installer avec mot de passe : `postgres`

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2️⃣ **Créer la base de données**

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE companion_legal;

# Quitter
\q
```

### 3️⃣ **Installer les dépendances**

```bash
npm install
```

### 4️⃣ **Configurer Prisma**

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Optionnel: Voir la base de données
npx prisma studio
```

### 5️⃣ **Générer les secrets d'authentification**

**Windows (PowerShell):**
```powershell
# Générer un secret aléatoire
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

Copier le résultat dans `.env` pour `NEXTAUTH_SECRET` et `JWT_SECRET`

### 6️⃣ **Démarrer l'application**

```bash
npm run dev
```

Ouvrir http://localhost:3000

---

## 📝 Pour le Module C - Ce dont vous avez besoin

### ✅ **Déjà configuré dans le schéma :**

- ✅ Table `User` avec champ `plan` (FREEMIUM/STANDARD)
- ✅ Table `Subscription` pour gérer les abonnements Stripe
- ✅ Table `Payment` pour l'historique des paiements
- ✅ Table `Invoice` pour les factures
- ✅ Table `AuditLog` pour la traçabilité RGPD

### 🔑 **Ce qu'il faut configurer (Stripe) :**

#### Étape 1 : Créer un compte Stripe

1. Aller sur https://stripe.com
2. S'inscrire
3. **Rester en mode TEST** (clés commencent par `sk_test_`)

#### Étape 2 : Récupérer les clés

Dans Stripe Dashboard > Développeurs > Clés API :

```env
STRIPE_SECRET_KEY="sk_test_51xxx...xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_51xxx...xxx"
```

#### Étape 3 : Créer le produit "Standard"

1. Stripe Dashboard > Produits > Nouveau produit
2. Remplir :
   - **Nom :** Plan Standard
   - **Prix :** 23€
   - **Facturation :** Mensuelle récurrente
3. Copier l'ID du prix (commence par `price_`)

```env
STRIPE_PRICE_ID_STANDARD="price_xxx...xxx"
```

#### Étape 4 : Configurer le webhook (local)

Pour tester en local, utiliser Stripe CLI :

```bash
# Installer Stripe CLI
# Windows: https://github.com/stripe/stripe-cli/releases/latest
# macOS: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Écouter les événements et forwarder vers votre app
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copier la clé webhook (whsec_xxx) qui s'affiche
```

Mettre dans `.env` :
```env
STRIPE_WEBHOOK_SECRET="whsec_xxx...xxx"
```

---

## 🧪 **Tester le Module C**

### Test 1 : Vérifier la logique Freemium

```typescript
// Dans votre code
import { prisma } from '@/lib/prisma'

const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' },
  include: {
    ownedProjects: true
  }
})

// Freemium = max 1 projet
if (user.plan === 'FREEMIUM' && user.ownedProjects.length >= 1) {
  return { error: 'Limite atteinte. Passez au plan Standard.' }
}
```

### Test 2 : Créer un utilisateur de test

```bash
npx prisma studio
```

Ou via code :

```typescript
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

const password = await bcrypt.hash('password123', 10)

await prisma.user.create({
  data: {
    email: 'test@example.com',
    password,
    name: 'Test User',
    plan: 'FREEMIUM'
  }
})
```

### Test 3 : Simuler un paiement Stripe

Utiliser les cartes de test Stripe :

- **Succès :** `4242 4242 4242 4242`
- **Échec :** `4000 0000 0000 0002`
- **3D Secure :** `4000 0027 6000 3184`

Date : Toute date future
CVC : 3 chiffres au hasard

---

## 🚀 **Commandes utiles**

```bash
# Voir la base de données graphiquement
npx prisma studio

# Réinitialiser la base de données
npx prisma db push --force-reset

# Générer le client après modification du schéma
npx prisma generate

# Voir les logs de migration
npx prisma migrate dev

# Démarrer avec logs détaillés
npm run dev
```

---

## 📦 **Structure des fichiers créés**

```
companion-legal-saas/
├── prisma/
│   └── schema.prisma          ← Schéma de base de données COMPLET
├── lib/
│   └── prisma.ts              ← Client Prisma configuré
├── .env                       ← Variables d'environnement
├── .env.example               ← Template des variables
├── SETUP_GUIDE.md            ← Guide complet de configuration
└── QUICK_START.md            ← Ce fichier (démarrage rapide)
```

---

## ❓ **Problèmes fréquents**

### "Can't reach database server"
➜ PostgreSQL n'est pas démarré
```bash
# Windows
pg_ctl start

# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### "Error: P1001: Can't reach database server"
➜ Vérifier la DATABASE_URL dans .env

### "Invalid `prisma.user.create()` invocation"
➜ Exécuter `npx prisma generate` puis `npx prisma db push`

### "Environment variable not found: DATABASE_URL"
➜ Le fichier `.env` n'est pas au bon endroit (doit être à la racine du projet)

---

## 🎉 **Vous êtes prêt !**

Pour le **Module C**, tout est configuré :

✅ Base de données avec tables Subscription, Payment, Invoice, AuditLog
✅ Schéma User avec champ plan (FREEMIUM/STANDARD)
✅ Template .env avec variables Stripe
✅ Client Prisma prêt à l'emploi

**Prochaine étape :** Configurer Stripe et commencer à coder ! 🚀
