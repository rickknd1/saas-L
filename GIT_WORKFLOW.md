# 🔀 Guide de Workflow Git - Companion Legal SaaS

## 👥 Répartition des Modules

### Socle Commun (Semaine 1) - Rick & Miguel ✅
- Infrastructure (Next.js, PostgreSQL, Prisma)
- Authentification complète
- Layout Dashboard (navbar, sidebar)
- Protection des routes

**Statut** : ✅ Terminé et pushé sur `main`

---

### Module A (Semaine 2) - @Gilles Kouebou
**Branche** : `module-a/gilles`

**Responsabilités** :
- Gestion des projets (CRUD)
- Upload de documents (drag & drop + S3)
- Visualisation de documents (lecteur PDF)
- Gestion des versions de documents

**Interdépendance** : Indépendant (nécessite seulement le Socle Commun)

---

### Module B (Semaine 3) - @Miguel Onana
**Branche** : `module-b/miguel`

**Responsabilités** :
- Invitations & Permissions (Editor, Viewer)
- Commentaires sur documents
- Chat temps réel (Socket.io)
- Notifications in-app

**Interdépendance** : Faible (peut utiliser des données mock pour les projets/documents)

---

### Module C (Semaine 4) - @kayzeur dylann
**Branche** : `module-c/kayzeur`

**Responsabilités** :
- Comparaison de versions (jsdiff + split view)
- Paiement Stripe (Checkout + Webhooks)
- Logique Freemium (limitation 1 projet)
- Gestion de compte RGPD (export/suppression)

**Interdépendance** : Faible (peut utiliser des données mock pour la comparaison)

---

## 🌳 Structure des Branches

```
main (production - protégée)
  ├── develop (intégration - protégée)
  │   ├── module-a/gilles (Gilles)
  │   ├── module-b/miguel (Miguel)
  │   └── module-c/kayzeur (Kayzeur/Dylan)
```

### Branches Principales

#### `main`
- Code en production
- ⛔ **Protégée** : Pas de push direct
- Merge uniquement depuis `develop` après validation complète

#### `develop`
- Intégration de tous les modules
- ⛔ **Protégée** : Pas de push direct
- Merge depuis les branches de modules via Pull Request

### Branches de Modules

Chaque développeur travaille dans sa branche dédiée :
- `module-a/gilles`
- `module-b/miguel`
- `module-c/kayzeur`

---

## 🚀 Workflow de Développement

### 1️⃣ Récupérer le Projet Initial

```bash
# Cloner le repository
git clone https://github.com/sden-engineering/lawyer-saas.git
cd lawyer-saas

# Vérifier qu'on est sur main
git branch
```

### 2️⃣ Créer la Branche `develop`

**⚠️ À faire UNE SEULE FOIS par le chef de projet (Rick/Kayzeur)**

```bash
# Créer et pousser la branche develop
git checkout -b develop
git push -u origin develop
```

### 3️⃣ Chaque Développeur Crée sa Branche de Module

**Gilles (@Gilles Kouebou)** :
```bash
# Se positionner sur develop
git checkout develop
git pull origin develop

# Créer sa branche
git checkout -b module-a/gilles
git push -u origin module-a/gilles
```

**Miguel (@Miguel Onana)** :
```bash
git checkout develop
git pull origin develop

git checkout -b module-b/miguel
git push -u origin module-b/miguel
```

**Kayzeur/Dylan (@kayzeur dylann)** :
```bash
git checkout develop
git pull origin develop

git checkout -b module-c/kayzeur
git push -u origin module-c/kayzeur
```

### 4️⃣ Développement Quotidien

```bash
# Vérifier qu'on est sur sa branche
git branch

# Avant de commencer à coder, toujours récupérer les dernières modifications
git pull origin develop
git merge develop

# Coder...

# Ajouter les fichiers modifiés
git add .

# Committer avec un message clair (voir conventions ci-dessous)
git commit -m "feat(module-a): add project creation form"

# Pousser régulièrement (au moins 1 fois par jour)
git push origin module-a/gilles
```

### 5️⃣ Synchronisation avec `develop`

**⚠️ Important** : Récupérer régulièrement les modifications des autres modules

```bash
# Se positionner sur sa branche
git checkout module-a/gilles

# Récupérer develop
git pull origin develop

# Fusionner develop dans sa branche
git merge develop

# Résoudre les conflits si nécessaire (voir section ci-dessous)

# Pousser
git push origin module-a/gilles
```

**Fréquence recommandée** : Tous les matins avant de coder

### 6️⃣ Créer une Pull Request (PR)

Quand votre module est prêt à être intégré :

1. **Sur GitHub** : Aller dans "Pull Requests" > "New Pull Request"
2. **Base** : `develop` ← **Compare** : `module-a/gilles`
3. **Titre** : `[Module A] Gestion des projets et upload de documents`
4. **Description** :
   ```markdown
   ## 📋 Checklist
   - [x] Fonctionnalité CRUD projets
   - [x] Upload de documents vers S3
   - [x] Visualisation PDF
   - [x] Tests manuels effectués
   - [x] Pas de conflits avec develop

   ## 🧪 Comment tester
   1. Se connecter sur /login
   2. Aller sur /dashboard/projects
   3. Créer un nouveau projet
   4. Uploader un PDF
   ```
5. **Reviewers** : Assigner les autres membres (Rick, Miguel, Kayzeur)
6. **Labels** : `module-a`, `ready-for-review`

### 7️⃣ Review & Merge

**Processus de Review** :
- Au moins **2 approbations** requises
- Tous les commentaires résolus
- Aucun conflit avec `develop`
- Tests passent (si CI/CD configuré)

**Merge** :
```bash
# Option 1 : Merge via GitHub (recommandé)
# Cliquer sur "Merge Pull Request" après approbations

# Option 2 : Merge en local
git checkout develop
git pull origin develop
git merge module-a/gilles
git push origin develop
```

---

## 📝 Conventions de Commit

### Format Standard

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage (pas de changement de code)
- `refactor` : Refactoring
- `test` : Ajout de tests
- `chore` : Tâches diverses (config, etc.)

### Scopes

- `module-a` : Gestion projets & documents
- `module-b` : Collaboration & chat
- `module-c` : Comparaison & paiement
- `auth` : Authentification
- `ui` : Interface utilisateur
- `db` : Base de données
- `api` : API routes

### Exemples

```bash
# Bonne pratique ✅
git commit -m "feat(module-a): add project creation API endpoint"
git commit -m "fix(module-b): resolve chat message duplication issue"
git commit -m "refactor(module-c): optimize document comparison algorithm"

# Mauvaise pratique ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "WIP"
```

---

## ⚠️ Gestion des Conflits

### Détecter un Conflit

```bash
git merge develop
# Auto-merging app/dashboard/page.tsx
# CONFLICT (content): Merge conflict in app/dashboard/page.tsx
# Automatic merge failed; fix conflicts and then commit the result.
```

### Résoudre le Conflit

1. **Ouvrir le fichier en conflit**
```typescript
<<<<<<< HEAD
// Votre code (branche actuelle)
const projects = await prisma.project.findMany()
=======
// Code de develop
const projects = await db.project.getAll()
>>>>>>> develop
```

2. **Décider quelle version garder** ou **fusionner manuellement**
```typescript
// Version fusionnée
const projects = await prisma.project.findMany()
```

3. **Marquer le conflit comme résolu**
```bash
git add app/dashboard/page.tsx
git commit -m "merge: resolve conflict in dashboard page"
git push origin module-a/gilles
```

### Éviter les Conflits

- **Communication** : Annoncer sur le chat d'équipe quand on modifie un fichier partagé
- **Synchronisation régulière** : Merger `develop` tous les jours
- **Fichiers séparés** : Chaque module travaille dans ses propres dossiers autant que possible

**Zones à risque** (fichiers partagés) :
- `prisma/schema.prisma` (schéma BDD)
- `app/layout.tsx` (layout principal)
- `components/dashboard/dashboard-nav.tsx` (navigation)
- `lib/` (utilitaires partagés)

**Règle** : Si vous devez modifier un fichier partagé, **prévenez l'équipe sur le chat** !

---

## 📂 Organisation des Fichiers par Module

### Module A (Gilles)
```
app/
  ├── dashboard/
  │   ├── projects/           # 🟢 Zone Gilles
  │   │   ├── page.tsx
  │   │   ├── new/page.tsx
  │   │   └── [id]/page.tsx
  │   └── documents/          # 🟢 Zone Gilles
  │       ├── page.tsx
  │       └── [id]/page.tsx
  └── api/
      ├── projects/           # 🟢 Zone Gilles
      │   └── route.ts
      └── documents/          # 🟢 Zone Gilles
          ├── upload/route.ts
          └── [id]/route.ts

components/
  ├── projects/               # 🟢 Zone Gilles
  │   ├── project-card.tsx
  │   └── create-project-modal.tsx
  └── documents/              # 🟢 Zone Gilles
      ├── document-viewer.tsx
      └── upload-zone.tsx
```

### Module B (Miguel)
```
app/
  ├── dashboard/
  │   ├── members/            # 🔵 Zone Miguel
  │   │   └── page.tsx
  │   └── notifications/      # 🔵 Zone Miguel
  │       └── page.tsx
  └── api/
      ├── invitations/        # 🔵 Zone Miguel
      │   └── route.ts
      ├── comments/           # 🔵 Zone Miguel
      │   └── route.ts
      └── chat/               # 🔵 Zone Miguel
          └── route.ts

components/
  ├── chat/                   # 🔵 Zone Miguel
  │   └── project-chat.tsx
  ├── comments/               # 🔵 Zone Miguel
  │   └── comment-thread.tsx
  └── notifications/          # 🔵 Zone Miguel
      └── notification-bell.tsx
```

### Module C (Kayzeur)
```
app/
  ├── dashboard/
  │   ├── compare/            # 🟠 Zone Kayzeur
  │   │   └── page.tsx
  │   ├── profile/            # 🟠 Zone Kayzeur
  │   │   └── page.tsx
  │   └── upgrade/            # 🟠 Zone Kayzeur
  │       └── page.tsx
  ├── pricing/                # 🟠 Zone Kayzeur
  │   └── page.tsx
  ├── checkout/               # 🟠 Zone Kayzeur
  │   └── page.tsx
  └── api/
      ├── documents/
      │   └── compare/        # 🟠 Zone Kayzeur
      │       └── route.ts
      ├── billing/            # 🟠 Zone Kayzeur
      │   └── route.ts
      ├── webhooks/           # 🟠 Zone Kayzeur
      │   └── stripe/route.ts
      └── users/
          └── me/             # 🟠 Zone Kayzeur
              ├── export/route.ts
              └── route.ts (DELETE)

components/
  ├── compare/                # 🟠 Zone Kayzeur
  │   └── split-view.tsx
  ├── billing/                # 🟠 Zone Kayzeur
  │   └── pricing-cards.tsx
  └── profile/                # 🟠 Zone Kayzeur
      └── account-settings.tsx
```

### Fichiers Partagés (⚠️ Attention)
```
prisma/
  └── schema.prisma           # ⚠️ TOUS - Coordination requise

app/
  └── layout.tsx              # ⚠️ TOUS - Ne pas modifier sans prévenir

components/
  └── dashboard/
      ├── dashboard-nav.tsx   # ⚠️ TOUS - Navigation partagée
      └── dashboard-sidebar.tsx # ⚠️ TOUS - Sidebar partagée

lib/
  ├── prisma.ts              # ⚠️ TOUS - Client BDD
  └── utils.ts               # ⚠️ TOUS - Utilitaires
```

---

## 🎯 Checklist Quotidienne

### Matin (avant de coder)
- [ ] `git checkout module-X/nom`
- [ ] `git pull origin develop`
- [ ] `git merge develop`
- [ ] Résoudre les conflits si nécessaire
- [ ] Vérifier les messages sur le chat d'équipe

### Soir (avant de quitter)
- [ ] `git add .`
- [ ] `git commit -m "feat(module-X): description"`
- [ ] `git push origin module-X/nom`
- [ ] Documenter ce qui a été fait (message sur le chat)

---

## 🆘 Commandes d'Urgence

### Annuler le dernier commit (pas encore pushé)
```bash
git reset --soft HEAD~1
```

### Annuler un fichier avant commit
```bash
git restore app/dashboard/page.tsx
```

### Abandonner tous les changements locaux
```bash
git reset --hard HEAD
```

### Récupérer une branche supprimée par erreur
```bash
git reflog
git checkout -b module-a/gilles <commit-hash>
```

---

## 📞 Contact & Support

**Questions Git** : @Rick (chef de projet)
**Questions Module A** : @Gilles Kouebou
**Questions Module B** : @Miguel Onana
**Questions Module C** : @kayzeur dylann

**Canal Slack/Discord** : `#dev-git-support`

---

## 🎓 Ressources

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

---

**Dernière mise à jour** : 10 Octobre 2025
**Version** : 1.0
