# 🔐 Guide d'Authentification & Configuration

## ✅ Ce qui a été fait

### 1. NextAuth.js v5 - Installé et configuré
- ✅ Installation de `next-auth@beta` et `bcryptjs`
- ✅ Configuration dans `lib/auth.ts`
- ✅ Credentials Provider (email/password)
- ✅ JWT avec session de 30 jours
- ✅ Callbacks pour ajouter user.id, user.plan, etc.

### 2. APIs d'authentification créées
- ✅ `/api/auth/[...nextauth]/route.ts` - NextAuth handlers
- ✅ `/api/auth/register` - Inscription avec bcrypt hashing
- ✅ `lib/get-session.ts` - Utilitaires pour récupérer la session

### 3. Pages d'authentification
- ✅ `/login` - Connexion avec NextAuth
- ⚠️ `/register` - À mettre à jour (utilise encore du code mockup)

---

## 🔨 Étapes restantes

### Étape 1 : Mettre à jour la page d'inscription

**Fichier :** `app/register/page.tsx`

Remplacer la ligne 129-168 (fonction `handleSubmit`) par :

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) {
    toast.error("Formulaire incomplet", {
      description: "Veuillez corriger les erreurs avant de continuer.",
    })
    return
  }

  setIsLoading(true)

  try {
    // Appel à l'API d'inscription
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organization: formData.cabinet,
        role: formData.role,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 409) {
        setErrors({ ...errors, email: "Cet email est déjà associé à un compte" })
        toast.error("Email déjà utilisé", {
          description: "Un compte existe déjà avec cette adresse email.",
          duration: 5000,
        })
      } else {
        toast.error("Erreur d'inscription", {
          description: data.error || "Une erreur est survenue.",
        })
      }
      return
    }

    // Succès - afficher le modal
    setShowSuccessModal(true)

    toast.info("Email de confirmation envoyé", {
      description: "Un email de vérification a été envoyé à votre adresse.",
      duration: 6000,
    })
  } catch (error) {
    console.error("Registration error:", error)
    toast.error("Erreur réseau", {
      description: "Impossible de créer le compte. Vérifiez votre connexion.",
    })
  } finally {
    setIsLoading(false)
  }
}
```

---

### Étape 2 : Mettre à jour TOUTES les APIs pour utiliser la session

**Important** : Remplacer `const userId = "user_test_123"` par la vraie session dans :

#### A. `/api/projects/route.ts` (GET et POST)
```typescript
import { requireAuth } from "@/lib/get-session"

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const userId = session.user.id

  // ... reste du code
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const userId = session.user.id

  // ... reste du code
}
```

#### B. `/api/billing/checkout/route.ts`
```typescript
import { requireAuth } from "@/lib/get-session"

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const userId = session.user.id
  const userEmail = session.user.email

  // ... reste du code (enlever les TODO)
}
```

#### C. `/api/webhooks/stripe/route.ts`
**Note** : Les webhooks Stripe ne peuvent PAS utiliser la session (ils viennent de Stripe, pas d'un navigateur).
Garder le système actuel avec `metadata.userId`.

#### D. `/api/users/me/route.ts` (GET et DELETE)
```typescript
import { requireAuth } from "@/lib/get-session"

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const userId = session.user.id
  // ... reste du code
}

export async function DELETE(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const userId = session.user.id
  // ... reste du code
}
```

#### E. `/api/users/me/export/route.ts`
```typescript
import { requireAuth } from "@/lib/get-session"

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const userId = session.user.id
  // ... reste du code
}
```

---

### Étape 3 : Créer le middleware de protection des routes

**Fichier :** `middleware.ts` (à la racine du projet)

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                       req.nextUrl.pathname.startsWith("/register")

  // Rediriger vers /login si on essaie d'accéder au dashboard sans être connecté
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Rediriger vers /dashboard si on est déjà connecté et qu'on va sur login/register
  if (isOnAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
```

---

### Étape 4 : Mettre à jour le .env avec NEXTAUTH_SECRET

**Fichier :** `.env`

Ajouter ces variables :

```bash
# NextAuth
NEXTAUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Pour générer le secret (sur Windows) :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Ou utilisez : `aK9dF2hG8jL4mN6pQ1rS5tU7vW9xY0zA3bC5dE6fG8h=` (pour le dev uniquement)

---

## 📦 Configuration Stripe Webhook - GUIDE COMPLET

### Prérequis
1. Compte Stripe (mode test) : https://dashboard.stripe.com
2. Stripe CLI installé (optionnel pour tests locaux)

### Option A : Configuration en LOCAL avec Stripe CLI

#### 1. Installer Stripe CLI
**Windows :**
```bash
# Via Scoop
scoop install stripe

# OU télécharger depuis https://github.com/stripe/stripe-cli/releases
```

#### 2. Login Stripe CLI
```bash
stripe login
```
→ Une fenêtre de navigateur s'ouvre pour autoriser

#### 3. Démarrer le webhook listener en local
```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

**Output attendu :**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef (^C to quit)
```

#### 4. Copier le `whsec_...` dans `.env`
```bash
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef"
```

#### 5. Tester avec un événement simulé
```bash
stripe trigger checkout.session.completed
```

---

### Option B : Configuration en PRODUCTION (Vercel/autre)

#### 1. Déployer l'application
Déployez votre app (ex: `https://votre-app.vercel.app`)

#### 2. Aller sur le Dashboard Stripe
https://dashboard.stripe.com/webhooks

#### 3. Cliquer sur "Add endpoint"
- **URL du endpoint :** `https://votre-app.vercel.app/api/webhooks/stripe`
- **Description :** "Companion SaaS webhook"
- **Version de l'API :** Latest (2024-12-18.acacia)
- **Événements à écouter :**
  - ✅ `checkout.session.completed`
  - ✅ `customer.subscription.updated`
  - ✅ `customer.subscription.deleted`
  - ✅ `invoice.paid`
  - ✅ `invoice.payment_failed`

#### 4. Copier le "Signing secret"
Après avoir créé le webhook, Stripe affiche `whsec_...`

#### 5. Ajouter dans les variables d'environnement Vercel
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

### Vérification du webhook

**Test 1 : Logs Stripe**
Aller sur https://dashboard.stripe.com/test/logs
→ Vous devriez voir les événements arriver avec status `200`

**Test 2 : Créer un paiement test**
1. Aller sur `/pricing`
2. Cliquer sur "S'abonner"
3. Utiliser la carte test : `4242 4242 4242 4242`
4. Vérifier que l'utilisateur passe bien en plan `STANDARD`

---

## 🗄️ Base de données : Ajustements nécessaires

### Vérifier le schéma Prisma

Le schéma actuel (`prisma/schema.prisma`) semble déjà conforme. Vérifiez que :

✅ Table `User` a bien :
- `email` (unique)
- `password`
- `plan` (enum FREEMIUM | STANDARD)
- `customerId` (Stripe)

✅ Table `Session` existe pour NextAuth

✅ Table `Subscription` a bien :
- `stripeSubscriptionId`
- `status`

### Migration à exécuter

```bash
npx prisma migrate dev --name add-nextauth
npx prisma generate
```

---

## ✅ Checklist finale avant test

- [ ] .env configuré avec `NEXTAUTH_SECRET` et `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook Stripe créé (local OU production)
- [ ] Base de données migrée
- [ ] Toutes les APIs mises à jour avec `requireAuth()`
- [ ] Middleware créé dans `middleware.ts`
- [ ] Page `/register` mise à jour pour appeler `/api/auth/register`

---

## 🧪 Tests à effectuer

### 1. Test d'inscription
```
1. Aller sur /register
2. Remplir le formulaire
3. Vérifier que le compte est créé en BDD
4. Vérifier le hash bcrypt du password
```

### 2. Test de connexion
```
1. Aller sur /login
2. Se connecter avec les credentials
3. Vérifier la redirection vers /dashboard
4. Vérifier que session.user.id est correct
```

### 3. Test de protection des routes
```
1. Se déconnecter
2. Essayer d'aller sur /dashboard
3. Vérifier la redirection vers /login
```

### 4. Test de limitation freemium
```
1. Créer un compte freemium
2. Créer 1 projet → OK
3. Essayer de créer un 2ème projet → BLOQUÉ
4. Message d'erreur avec lien vers /pricing
```

### 5. Test de paiement Stripe
```
1. Sur /pricing, cliquer "S'abonner"
2. Payer avec carte test 4242...
3. Vérifier webhook reçu (logs Stripe)
4. Vérifier user.plan = "STANDARD" en BDD
5. Créer un 2ème projet → OK (plus de limite)
```

---

## 📝 Notes importantes

### Sécurité
- ✅ **Bcrypt** pour les passwords (10 rounds)
- ✅ **JWT** sécurisés avec NEXTAUTH_SECRET
- ✅ **Webhook Stripe** vérifié avec signature
- ✅ **Rate limiting** à ajouter sur `/api/auth/login` (5 tentatives/15min)

### Variables d'environnement minimales

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="aK9dF2hG8jL4mN6pQ1rS5tU7vW9xY0zA3bC5dE6fG8h="
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Obtenu via stripe listen ou dashboard
STRIPE_PRODUCT_ID="prod_..."
STRIPE_PRICE_ID_STANDARD="price_..."
```

---

## 🎯 Prochaines étapes (Post-authentification)

1. **Email de vérification** (optionnel pour MVP)
   - Utiliser Resend API
   - Créer `/api/auth/verify-email`

2. **Mot de passe oublié** (optionnel pour MVP)
   - Créer `/api/auth/forgot-password`
   - Créer `/api/auth/reset-password`

3. **2FA / MFA** (Post-MVP)
   - Ajouter TOTP avec `otpauth` library
   - Conformément au cahier des charges

---

Créé le **10 janvier 2025** - SDEN Engineering
