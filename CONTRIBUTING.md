# 🤝 Guide de Contribution - Companion Legal SaaS

Bienvenue dans le projet **Companion Legal SaaS** ! Ce guide vous aidera à contribuer efficacement.

## 📚 Avant de Commencer

1. Lire le [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) pour comprendre l'organisation Git
2. Lire le [SETUP_GUIDE.md](./SETUP_GUIDE.md) pour configurer votre environnement
3. Lire le [QUICK_START.md](./QUICK_START.md) pour démarrer rapidement

## 👥 Répartition des Responsabilités

| Module | Développeur | Branche | Semaine |
|--------|-------------|---------|---------|
| **Socle Commun** | Rick & Miguel | `main` | Semaine 1 ✅ |
| **Module A** - Projets & Documents | @Gilles Kouebou | `module-a/gilles` | Semaine 2 |
| **Module B** - Collaboration & Chat | @Miguel Onana | `module-b/miguel` | Semaine 3 |
| **Module C** - Paiement & RGPD | @kayzeur dylann | `module-c/kayzeur` | Semaine 4 |

## 🚀 Quick Start pour Chaque Développeur

### 1. Cloner le Projet
```bash
git clone https://github.com/sden-engineering/lawyer-saas.git
cd lawyer-saas
```

### 2. Installer les Dépendances
```bash
npm install
# ou
pnpm install
```

### 3. Configurer l'Environnement
```bash
# Copier le fichier .env.example
cp .env.example .env

# Éditer le .env avec vos valeurs
# Voir SETUP_GUIDE.md pour les détails
```

### 4. Créer Votre Branche de Module

**Gilles** :
```bash
git checkout develop
git checkout -b module-a/gilles
git push -u origin module-a/gilles
```

**Miguel** :
```bash
git checkout develop
git checkout -b module-b/miguel
git push -u origin module-b/miguel
```

**Kayzeur** :
```bash
git checkout develop
git checkout -b module-c/kayzeur
git push -u origin module-c/kayzeur
```

### 5. Commencer à Coder
```bash
# Toujours vérifier qu'on est sur la bonne branche
git branch

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

## 📝 Conventions de Code

### TypeScript
- Utiliser TypeScript strict
- Typer toutes les fonctions et variables
- Pas de `any` sauf exception justifiée

```typescript
// ✅ Bon
interface Project {
  id: string
  name: string
  createdAt: Date
}

async function getProject(id: string): Promise<Project> {
  return await prisma.project.findUnique({ where: { id } })
}

// ❌ Mauvais
function getProject(id: any): any {
  return prisma.project.findUnique({ where: { id } })
}
```

### React Components
- Utiliser des composants fonctionnels
- Préférer `const` avec des arrow functions
- Utiliser les hooks React (useState, useEffect, etc.)

```typescript
// ✅ Bon
export const ProjectCard = ({ project }: { project: Project }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card>
      <CardHeader>{project.name}</CardHeader>
    </Card>
  )
}

// ❌ Mauvais
export function ProjectCard(props) {
  return <div>{props.project.name}</div>
}
```

### Naming Conventions
- **Fichiers** : kebab-case (`project-card.tsx`, `use-projects.ts`)
- **Composants** : PascalCase (`ProjectCard`, `DocumentViewer`)
- **Fonctions** : camelCase (`getProjects`, `uploadDocument`)
- **Constants** : UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)

### Structure des Fichiers
```
app/
  └── dashboard/
      └── projects/
          ├── page.tsx              # Page principale
          ├── loading.tsx           # Loading state
          └── [id]/
              └── page.tsx          # Page détail

components/
  └── projects/
      ├── project-card.tsx         # Composant UI
      ├── create-project-modal.tsx # Modal de création
      └── project-list.tsx         # Liste de projets

lib/
  └── projects.ts                  # Logique métier / helpers

app/api/
  └── projects/
      ├── route.ts                 # GET /api/projects, POST /api/projects
      └── [id]/
          └── route.ts             # GET/PATCH/DELETE /api/projects/[id]
```

## 🎨 UI & Design System

### Utiliser Shadcn/ui
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const MyComponent = () => {
  return (
    <Card>
      <CardHeader>Titre</CardHeader>
      <CardContent>
        <Input placeholder="Email" />
        <Button>Envoyer</Button>
      </CardContent>
    </Card>
  )
}
```

### Tailwind CSS
- Utiliser les classes Tailwind
- Respecter le design system existant
- Utiliser les couleurs définies dans `tailwind.config.ts`

```typescript
// ✅ Bon
<div className="flex items-center gap-4 p-6">
  <Button variant="default" size="lg">
    Créer un projet
  </Button>
</div>

// ❌ Éviter les styles inline
<div style={{ display: 'flex', padding: '24px' }}>
  <button style={{ color: 'blue' }}>Créer un projet</button>
</div>
```

## 🗄️ Base de Données & Prisma

### Modifier le Schéma Prisma
⚠️ **ATTENTION** : Le fichier `prisma/schema.prisma` est partagé par tous !

1. **Prévenir l'équipe** sur le chat avant de modifier
2. Faire la modification
3. Générer la migration
```bash
npx prisma migrate dev --name add_document_version
```
4. Committer **immédiatement** et pousser
5. **Prévenir l'équipe** que la migration est prête

### Utiliser Prisma Client
```typescript
import { prisma } from "@/lib/prisma"

// ✅ Bon - Avec gestion d'erreurs
export async function getProjects(userId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: 'desc' }
    })
    return projects
  } catch (error) {
    console.error("Error fetching projects:", error)
    throw new Error("Failed to fetch projects")
  }
}

// ❌ Mauvais - Sans gestion d'erreurs
export async function getProjects(userId: string) {
  return await prisma.project.findMany({ where: { userId } })
}
```

## 🔒 Sécurité & Authentification

### Protéger les Routes
```typescript
// app/dashboard/projects/page.tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Code de la page...
}
```

### Sécuriser les API Routes
```typescript
// app/api/projects/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Logique API...
}
```

## ✅ Avant de Créer une Pull Request

### Checklist
- [ ] Code fonctionne localement sans erreurs
- [ ] Tests manuels effectués
- [ ] Pas de `console.log` oubliés
- [ ] Types TypeScript corrects (pas de `any`)
- [ ] Code formaté (Prettier)
- [ ] Commentaires pour les parties complexes
- [ ] Branche à jour avec `develop`
```bash
git pull origin develop
git merge develop
```
- [ ] Pas de conflits
- [ ] Commit messages respectent les conventions

### Créer la PR
1. Sur GitHub : **Pull Requests** > **New Pull Request**
2. **Base** : `develop` ← **Compare** : `module-X/nom`
3. **Titre** : `[Module X] Description claire`
4. **Description** : Checklist + Comment tester
5. **Reviewers** : Assigner les autres membres
6. **Labels** : `module-x`, `ready-for-review`

### Template de PR
```markdown
## 📋 Changements

- Ajout de la fonctionnalité X
- Correction du bug Y
- Amélioration de Z

## ✅ Checklist

- [x] Code testé localement
- [x] Pas de conflits avec develop
- [x] Types TypeScript corrects
- [x] Documentation mise à jour

## 🧪 Comment Tester

1. Lancer `npm run dev`
2. Aller sur `/dashboard/projects`
3. Créer un nouveau projet
4. Vérifier que...

## 📸 Screenshots (optionnel)

[Ajouter des captures d'écran si pertinent]
```

## 🐛 Rapporter un Bug

Utiliser les **GitHub Issues** avec le template suivant :

```markdown
## 🐛 Description du Bug

[Description claire et concise]

## 🔄 Étapes pour Reproduire

1. Aller sur '...'
2. Cliquer sur '...'
3. Observer l'erreur

## ✅ Comportement Attendu

[Ce qui devrait se passer]

## ❌ Comportement Actuel

[Ce qui se passe réellement]

## 🖼️ Screenshots

[Si applicable]

## 🌐 Environnement

- OS: [e.g. Windows 11]
- Navigateur: [e.g. Chrome 120]
- Node version: [e.g. 20.10.0]
```

## 📞 Communication

### Canaux
- **GitHub Discussions** : Questions techniques
- **GitHub Issues** : Bugs et features requests
- **Slack/Discord** : Communication quotidienne
- **Stand-up quotidien** : Synchronisation équipe (optionnel)

### Messages Importants
**Prévenir l'équipe quand** :
- ✋ Vous modifiez un fichier partagé (`schema.prisma`, `layout.tsx`, etc.)
- 🔧 Vous créez une nouvelle migration de BDD
- 🚀 Vous mergez votre branche dans `develop`
- 🐛 Vous trouvez un bug bloquant
- ❓ Vous avez besoin d'aide

## 🆘 Besoin d'Aide ?

1. **Lire la doc** : [GIT_WORKFLOW.md](./GIT_WORKFLOW.md), [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **GitHub Discussions** : Poser votre question
3. **Contacter** :
   - Questions Git : @Rick
   - Questions Module A : @Gilles Kouebou
   - Questions Module B : @Miguel Onana
   - Questions Module C : @kayzeur dylann

## 🎓 Ressources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Merci de contribuer au projet ! 🚀**

*Dernière mise à jour : 10 Octobre 2025*
