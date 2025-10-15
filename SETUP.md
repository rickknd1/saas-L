# 🚀 Guide d'installation - Companion Legal SaaS

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Installation PostgreSQL](#installation-postgresql)
3. [Configuration du projet](#configuration-du-projet)
4. [Initialisation de la base de données](#initialisation-de-la-base-de-données)
5. [Workflow de collaboration](#workflow-de-collaboration)
6. [Synchronisation des bases de données](#synchronisation-des-bases-de-données)

---

## Prérequis

Assurez-vous d'avoir installé sur votre machine:

- **Node.js** (version 18+) - [Télécharger](https://nodejs.org/)
- **npm** ou **pnpm** (gestionnaire de paquets)
- **Git** - [Télécharger](https://git-scm.com/)
- **PostgreSQL** (version 14+) - Voir instructions ci-dessous

---

## Installation PostgreSQL

### Windows

1. **Téléchargez PostgreSQL:**
   - Allez sur https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Téléchargez la dernière version (16+)

2. **Installation:**
   - Lancez l'installeur
   - **Important:** Notez le mot de passe que vous définissez pour l'utilisateur `postgres`
   - Port par défaut: `5432` (gardez-le)
   - Cochez toutes les options (PostgreSQL Server, pgAdmin, Command Line Tools)

3. **Vérification:**
   ```bash
   psql --version
   ```
   Vous devriez voir: `psql (PostgreSQL) 16.x` ou supérieur

### macOS

```bash
# Avec Homebrew
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Configuration du projet

### 1. Cloner le dépôt

```bash
git clone [URL_DU_REPO]
cd companion-legal-saas
```

### 2. Installer les dépendances

```bash
npm install
# ou
pnpm install
```

### 3. Configurer les variables d'environnement

1. **Copiez le fichier de template:**
   ```bash
   cp .env.example .env
   ```

2. **Modifiez le fichier `.env`:**

   **IMPORTANT - Base de données:**
   ```env
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/saas_avocat?schema=public&sslmode=disable"
   ```
   Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe que vous avez défini lors de l'installation de PostgreSQL.

   **Clés d'authentification:**
   ```bash
   # Générez des clés sécurisées avec:
   openssl rand -base64 32
   ```

   Copiez le résultat dans:
   - `NEXTAUTH_SECRET`
   - `JWT_SECRET`

   **Stripe (optionnel pour le développement):**
   - Créez un compte sur https://stripe.com
   - Mode Test: Dashboard > Developers > API keys
   - Copiez vos clés `sk_test_...` et `pk_test_...`

   **AWS S3 (optionnel - MinIO pour le dev local):**
   - Pour le développement local, gardez les valeurs par défaut (MinIO)
   - Pour la production, créez un bucket S3 et copiez vos credentials

   **Resend (Email - optionnel):**
   - Créez un compte sur https://resend.com
   - Générez une clé API
   - Copiez-la dans `RESEND_API_KEY`

---

## Initialisation de la base de données

### 1. Créer la base de données

**Option A: Avec psql (ligne de commande)**

```bash
# Windows (PowerShell)
$env:PGPASSWORD="votre_mot_de_passe"
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE saas_avocat;"

# macOS/Linux
PGPASSWORD=votre_mot_de_passe psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE saas_avocat;"
```

**Option B: Avec Prisma (plus simple - recommandé)**

Prisma créera automatiquement la base de données si elle n'existe pas:

```bash
npx prisma db push
```

### 2. Appliquer le schéma

Si vous n'avez pas déjà utilisé `db push`, exécutez:

```bash
# Applique le schéma et crée les tables
npx prisma db push

# Génère le client Prisma
npx prisma generate
```

### 3. Vérifier l'installation

Ouvrez Prisma Studio pour voir votre base de données:

```bash
npx prisma studio
```

Cela ouvrira http://localhost:5555 avec une interface graphique de votre base de données.

---

## Workflow de collaboration

### ⚠️ IMPORTANT: Synchronisation des bases de données

Pour éviter que chaque membre de l'équipe ait une base de données différente, suivez ce workflow:

### Quand VOUS modifiez le schéma de la base de données

1. **Modifiez le fichier `prisma/schema.prisma`**

2. **Créez une migration:**
   ```bash
   npx prisma migrate dev --name description_du_changement
   ```
   Exemple:
   ```bash
   npx prisma migrate dev --name add_user_role_field
   ```

3. **Committez la migration ET le schema:**
   ```bash
   git add prisma/schema.prisma prisma/migrations
   git commit -m "feat: ajout du champ role dans User"
   git push
   ```

### Quand un COÉQUIPIER modifie le schéma

1. **Récupérez les derniers changements:**
   ```bash
   git pull
   ```

2. **Appliquez les migrations:**
   ```bash
   npx prisma migrate dev
   ```

3. **Régénérez le client Prisma:**
   ```bash
   npx prisma generate
   ```

### Résumé du workflow

```
Développeur A modifie le schéma
    ↓
Créer migration (prisma migrate dev)
    ↓
Commit + Push (schema + migrations)
    ↓
Développeur B récupère (git pull)
    ↓
Applique migrations (prisma migrate dev)
    ↓
Tous les devs ont la MÊME structure de base
```

---

## Synchronisation des bases de données

### Commandes importantes

| Commande | Utilisation |
|----------|-------------|
| `npx prisma migrate dev` | Crée et applique une migration (développement) |
| `npx prisma migrate deploy` | Applique les migrations (production) |
| `npx prisma db push` | Synchronise le schéma sans créer de migration (prototype rapide) |
| `npx prisma studio` | Ouvre l'interface graphique de la base de données |
| `npx prisma generate` | Génère le client Prisma |

### Scénarios courants

**Nouveau membre rejoint l'équipe:**
```bash
git clone [repo]
npm install
cp .env.example .env
# Modifier .env avec ses credentials
npx prisma migrate dev  # Crée la base + applique toutes les migrations
npm run dev
```

**Conflit de migration:**
Si deux développeurs créent des migrations en même temps:
```bash
# Réinitialisez votre base locale (attention: perte de données!)
npx prisma migrate reset

# Ou: résolvez manuellement et créez une nouvelle migration
npx prisma migrate dev --name fix_migration_conflict
```

---

## Démarrage du projet

Une fois tout configuré:

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

---

## Checklist pour les nouveaux membres

- [ ] PostgreSQL installé et démarré
- [ ] Dépôt Git cloné
- [ ] `npm install` exécuté
- [ ] Fichier `.env` créé et configuré
- [ ] Base de données `saas_avocat` créée
- [ ] Migrations appliquées (`npx prisma migrate dev`)
- [ ] L'application démarre (`npm run dev`)
- [ ] Accès à http://localhost:3000

---

## Support et questions

Si vous rencontrez des problèmes:

1. Vérifiez que PostgreSQL est bien démarré
2. Vérifiez vos credentials dans le fichier `.env`
3. Assurez-vous d'avoir appliqué toutes les migrations
4. Contactez l'équipe sur [votre canal de communication]

---

## Ressources utiles

- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Stripe](https://stripe.com/docs)
