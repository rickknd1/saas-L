# 🚀 Guide de Déploiement Vercel - Legal SaaS

## ✅ Préparation Effectuée

### 1. Configuration du Projet
- ✅ `package.json` optimisé pour Vercel
- ✅ Script `build` configuré : `npx prisma generate && next build`
- ✅ Script `postinstall` supprimé (conflit avec Prisma)
- ✅ Dépendances de build déplacées vers `dependencies`:
  - TypeScript + types
  - Tailwind CSS + postcss
  - tw-animate-css
  - bcryptjs
  - Types pour mime-types et pdf-parse

### 2. Middleware Optimisé
- ✅ Middleware réduit de 1.03 MB → 31.4 kB (97% de réduction)
- ✅ Utilise la vérification de cookies au lieu de NextAuth complet
- ✅ Conforme à la limite Vercel Edge Runtime (1 MB)

### 3. Fichier vercel.json
```json
{
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

---

## 🔐 Variables d'Environnement Requises sur Vercel

### Configuration dans: **Vercel Dashboard → Settings → Environment Variables**

### 📊 DATABASE (REQUIS)
```bash
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```
**Exemple Neon:**
```
postgresql://neondb_owner:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 🔑 AUTHENTIFICATION (REQUIS)
```bash
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
**Générer avec:**
```bash
openssl rand -base64 32
# OU
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 💳 STRIPE (REQUIS)
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Optionnel (mais recommandé):**
```bash
STRIPE_PRICE_ID_STANDARD=price_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
STRIPE_PRODUCT_ID=prod_...
```

### 🌐 APPLICATION (REQUIS)
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
⚠️ **Important:** Remplacer par votre URL Vercel après le premier déploiement

### ☁️ AWS S3 (OPTIONNEL)
Si vous utilisez S3 pour stocker les documents:
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=your-bucket-name
```

**Alternative S3-compatible (Cloudflare R2, etc.):**
```bash
S3_ENDPOINT=https://your-endpoint.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=auto
S3_BUCKET_NAME=your-bucket-name
```

---

## 📋 Checklist de Déploiement

### Avant le Déploiement

- [ ] **Base de données configurée** (Neon, Supabase, Railway, etc.)
- [ ] **Compte Stripe créé** et clés API récupérées
- [ ] **Webhook Stripe configuré** pointant vers `https://your-domain.vercel.app/api/webhooks/stripe`
- [ ] **JWT_SECRET généré** (minimum 32 caractères)
- [ ] **Toutes les variables d'environnement** ajoutées sur Vercel

### Après le Premier Déploiement

1. **Mettre à jour `NEXT_PUBLIC_APP_URL`**
   - Remplacer `http://localhost:3000` par votre URL Vercel
   - Redéployer l'application

2. **Configurer le Webhook Stripe**
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Événements à écouter:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Migrer la Base de Données**
   ```bash
   npx prisma migrate deploy
   ```

4. **Tester l'Application**
   - [ ] Connexion/Inscription fonctionne
   - [ ] Création de projet
   - [ ] Upload de documents
   - [ ] Paiement Stripe
   - [ ] Webhooks Stripe

---

## 🐛 Dépannage

### Build échoue avec "Cannot find module"
- **Solution:** Les dépendances sont dans `dependencies` (pas `devDependencies`)
- Vérifier que `npm install --legacy-peer-deps` fonctionne localement

### Middleware trop gros (>1MB)
- **Solution:** ✅ Déjà optimisé (31.4 kB)
- Le middleware vérifie uniquement les cookies de session

### Erreur Prisma "Can't reach database"
- **Solution:** Vérifier `DATABASE_URL` dans les variables d'environnement Vercel
- S'assurer que la connexion SSL est activée (`?sslmode=require`)

### Webhooks Stripe ne fonctionnent pas
- **Solution:**
  1. Vérifier que `STRIPE_WEBHOOK_SECRET` est correctement configuré
  2. Tester le webhook depuis le Dashboard Stripe
  3. Vérifier les logs Vercel pour voir les erreurs

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Configuration Next.js pour Vercel](https://nextjs.org/docs/deployment)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Documentation Neon (PostgreSQL)](https://neon.tech/docs/introduction)

---

## ✅ État du Projet

**Prêt pour le déploiement** ✨

Toutes les optimisations nécessaires ont été appliquées :
- Dependencies correctement configurées
- Middleware optimisé
- Build command configuré
- Variables d'environnement documentées

**Prochaine étape:** Configurer les variables d'environnement sur Vercel et déployer !
