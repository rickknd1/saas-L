# 🚀 Guide de Configuration - Companion Legal SaaS

## 📋 Prérequis

- Node.js 18+ installé
- PostgreSQL 14+ installé et démarré
- Compte Stripe (mode test)
- Compte AWS (ou alternative S3-compatible)

## 🗄️ Étape 1 : Configuration de la Base de Données

### 1.1 Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE companion_legal;

# Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER companion_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE companion_legal TO companion_user;

# Quitter psql
\q
```

### 1.2 Configurer les variables d'environnement

```bash
# Copier le fichier .env.example
cp .env.example .env

# Éditer le .env avec vos vraies valeurs
```

**Mettre à jour la DATABASE_URL :**
```env
DATABASE_URL="postgresql://companion_user:votre_mot_de_passe@localhost:5432/companion_legal?schema=public"
```

### 1.3 Installer Prisma et générer le client

```bash
# Installer les dépendances Prisma
npm install @prisma/client@^6 @prisma/extension-optimize @prisma/instrumentation@^6
npm install --save-dev prisma@^6

# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# Optionnel: Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

## 🔐 Étape 2 : Configuration de l'Authentification

### 2.1 Générer les secrets

```bash
# Générer NEXTAUTH_SECRET
openssl rand -base64 32

# Générer JWT_SECRET
openssl rand -base64 32
```

Copier ces valeurs dans le `.env` :

```env
NEXTAUTH_SECRET="la_valeur_générée_1"
JWT_SECRET="la_valeur_générée_2"
NEXTAUTH_URL="http://localhost:3000"
```

### 2.2 Installer NextAuth

```bash
npm install next-auth@latest
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### 2.3 Créer le fichier de configuration NextAuth

Créer `lib/auth.ts` :

```typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = user.plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.plan = token.plan
      }
      return session
    }
  }
}
```

## 💳 Étape 3 : Configuration de Stripe

### 3.1 Créer un compte Stripe

1. Aller sur https://stripe.com
2. Créer un compte
3. Activer le mode test

### 3.2 Récupérer les clés API

Dans le dashboard Stripe (mode test) :
- Aller dans "Développeurs" > "Clés API"
- Copier la clé secrète (`sk_test_...`)
- Copier la clé publiable (`pk_test_...`)

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3.3 Créer le produit "Standard"

1. Dans Stripe Dashboard > "Produits"
2. Créer un nouveau produit :
   - Nom: "Plan Standard"
   - Prix: 23€/mois
   - Facturation récurrente : mensuelle
3. Copier l'ID du prix (commence par `price_...`)

```env
STRIPE_PRICE_ID_STANDARD="price_..."
```

### 3.4 Configurer les webhooks

1. Dans Stripe Dashboard > "Développeurs" > "Webhooks"
2. Ajouter un endpoint : `http://localhost:3000/api/webhooks/stripe`
3. Sélectionner les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copier le secret de signature

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3.5 Installer Stripe SDK

```bash
npm install stripe
npm install --save-dev @types/stripe
```

## ☁️ Étape 4 : Configuration du Stockage S3

### Option A : AWS S3 (Production)

1. Créer un compte AWS
2. Créer un bucket S3 :
   - Nom : `companion-legal-documents`
   - Région : `eu-west-3` (Paris)
   - Bloquer l'accès public
3. Créer un utilisateur IAM avec les permissions S3
4. Générer des clés d'accès

```env
AWS_REGION="eu-west-3"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="companion-legal-documents"
```

### Option B : MinIO (Développement local)

```bash
# Installer MinIO avec Docker
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# Accéder à la console: http://localhost:9001
```

```env
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
AWS_S3_BUCKET_NAME="companion-legal-documents"
AWS_S3_ENDPOINT="http://localhost:9000"
```

### 4.1 Installer AWS SDK

```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```

## 📧 Étape 5 : Configuration des Emails

### Option recommandée : Resend

1. Créer un compte sur https://resend.com
2. Vérifier votre domaine
3. Générer une clé API

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@votredomaine.com"
```

```bash
npm install resend
```

## 🔌 Étape 6 : Configuration du Chat (Socket.IO)

```bash
npm install socket.io socket.io-client
```

Créer `server.js` pour Socket.IO :

```javascript
const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`)
    })

    socket.on('send-message', (data) => {
      io.to(`project-${data.projectId}`).emit('new-message', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

## 🧪 Étape 7 : Tester la Configuration

### 7.1 Créer un utilisateur de test

```bash
npx prisma studio
```

Ou via code :

```typescript
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash('password123', 10)

await prisma.user.create({
  data: {
    email: 'test@example.com',
    password: hashedPassword,
    name: 'Test User',
    plan: 'FREEMIUM'
  }
})
```

### 7.2 Démarrer l'application

```bash
# Mode développement
npm run dev

# Ou avec le serveur Socket.IO
node server.js
```

### 7.3 Se connecter

- Aller sur http://localhost:3000/login
- Utiliser les identifiants de test

## 📦 Étape 8 : Dépendances Complètes

Voici toutes les dépendances à installer :

```bash
# Installer toutes les dépendances
npm install

# Dépendances principales
npm install next react react-dom
npm install @prisma/client@^6 @prisma/extension-optimize @prisma/instrumentation@^6
npm install next-auth bcrypt
npm install stripe
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install resend
npm install socket.io socket.io-client
npm install zod
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install @radix-ui/react-tabs @radix-ui/react-avatar @radix-ui/react-scroll-area
npm install sonner
npm install @ai-sdk/react ai

# Dépendances de développement
npm install --save-dev prisma@^6
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev @types/bcrypt
npm install --save-dev typescript
npm install --save-dev tailwindcss postcss autoprefixer
npm install --save-dev eslint eslint-config-next
```

## ✅ Checklist de Configuration

- [ ] Base de données PostgreSQL créée
- [ ] Variables `.env` configurées
- [ ] Prisma client généré (`npx prisma generate`)
- [ ] Tables créées (`npx prisma db push`)
- [ ] NextAuth configuré avec secrets générés
- [ ] Compte Stripe créé (mode test)
- [ ] Produit Standard créé dans Stripe
- [ ] Webhook Stripe configuré
- [ ] Bucket S3 (ou MinIO) configuré
- [ ] Service d'email configuré (Resend)
- [ ] Socket.IO configuré
- [ ] Utilisateur de test créé
- [ ] Application démarre sans erreur

## 🐛 Dépannage

### Erreur Prisma Client

```bash
npx prisma generate
```

### Erreur de connexion à PostgreSQL

Vérifier que PostgreSQL est démarré :
```bash
# Windows
pg_ctl status

# macOS/Linux
sudo service postgresql status
```

### Erreur Stripe

Vérifier que les clés commencent bien par `sk_test_` et `pk_test_` en mode développement.

### Erreur S3

Vérifier les credentials et que le bucket existe.

---

🎉 **Votre environnement est maintenant configuré !**

Pour le **Module C** spécifiquement, vous êtes prêts avec :
- ✅ Schéma de base de données complet (tables Subscription, Payment, Invoice, AuditLog)
- ✅ Configuration Stripe pour les paiements
- ✅ Système de gestion de compte (dans le schéma User)
