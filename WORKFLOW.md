# 🔄 Workflow de Collaboration - Base de Données

Guide rapide pour travailler en équipe sur ce projet avec une base de données synchronisée.

---

## 📌 Règle d'Or

**TOUJOURS utiliser les migrations Prisma pour modifier la base de données.**
Ne JAMAIS modifier directement la base de données via SQL ou pgAdmin sans créer une migration.

---

## 🚀 Workflow Standard

### 1️⃣ Commencer à travailler (tous les jours)

Avant de coder, synchronisez votre base de données:

```bash
git pull                    # Récupérer les derniers changements
npx prisma migrate dev      # Appliquer les nouvelles migrations (si il y en a)
npx prisma generate         # Regénérer le client Prisma
npm run dev                 # Démarrer l'application
```

### 2️⃣ Modifier le schéma de la base de données

**Étape 1:** Modifiez `prisma/schema.prisma`

Exemple: Ajouter un champ `phone` au modèle User:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  phone     String?  // ← Nouveau champ
  // ...
}
```

**Étape 2:** Créez une migration

```bash
npx prisma migrate dev --name add_phone_to_user
```

Prisma va:
- Créer un fichier SQL dans `prisma/migrations/`
- Appliquer automatiquement la migration sur votre base locale
- Régénérer le client Prisma

**Étape 3:** Committez ET poussez

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add phone field to User model"
git push
```

### 3️⃣ Récupérer les modifications d'un coéquipier

Quand un coéquipier modifie le schéma:

```bash
git pull                    # Récupérer les changements
npx prisma migrate dev      # Appliquer les nouvelles migrations
```

C'est tout! Votre base est maintenant à jour.

---

## ⚠️ Situations Courantes

### Conflit de migration

Si deux développeurs créent des migrations différentes en même temps:

```bash
# Option 1: Réinitialiser votre base locale (perte de données locales)
npx prisma migrate reset
npx prisma migrate dev

# Option 2: Résoudre manuellement
# 1. Supprimez votre migration locale non pushée
# 2. git pull
# 3. Créez une nouvelle migration si nécessaire
```

### Erreur "Database schema is not in sync"

```bash
npx prisma migrate dev      # Applique les migrations manquantes
```

### Voir l'état de votre base de données

```bash
npx prisma studio           # Interface graphique sur localhost:5555
```

---

## 📝 Commandes Utiles

| Commande | Description |
|----------|-------------|
| `npx prisma migrate dev` | Crée et applique une migration (développement) |
| `npx prisma migrate deploy` | Applique les migrations (production) |
| `npx prisma migrate reset` | Réinitialise la base et réapplique tout |
| `npx prisma studio` | Ouvre l'interface graphique de la base |
| `npx prisma generate` | Régénère le client Prisma |
| `npx prisma db push` | Synchronise sans créer de migration (prototypage) |
| `npx prisma db pull` | Récupère le schéma d'une base existante |

---

## ✅ Checklist Quotidienne

Avant de commencer à coder:
- [ ] `git pull`
- [ ] `npx prisma migrate dev` (si migrations)
- [ ] `npm install` (si package.json modifié)
- [ ] `npm run dev`

Avant de commit une modification du schéma:
- [ ] La migration a été créée avec `npx prisma migrate dev --name xxx`
- [ ] Le dossier `prisma/migrations/` est inclus dans le commit
- [ ] Le fichier `prisma/schema.prisma` est inclus dans le commit
- [ ] Le projet compile sans erreurs

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

- Toujours nommer vos migrations de façon descriptive:
  ```bash
  npx prisma migrate dev --name add_user_role
  npx prisma migrate dev --name create_invoice_table
  npx prisma migrate dev --name remove_old_field
  ```

- Committer les migrations immédiatement après création

- Tester vos migrations avant de push:
  ```bash
  npx prisma migrate dev      # Applique la migration
  npm run dev                 # Vérifie que tout fonctionne
  git push                    # Push seulement si tout marche
  ```

- Communiquer avec l'équipe avant de gros changements de schéma

### ❌ À ÉVITER

- ❌ Modifier la base de données directement via SQL
- ❌ Utiliser `db push` en production
- ❌ Supprimer des fichiers de migration une fois pushés
- ❌ Modifier des fichiers de migration déjà pushés
- ❌ Committer le fichier `.env` (contient des secrets)

---

## 🆘 En Cas de Problème

### Ma base locale est cassée

```bash
npx prisma migrate reset    # Repart de zéro
```

### Le client Prisma ne reconnaît pas mes changements

```bash
npx prisma generate
```

### J'ai des données de test à partager

Créez un fichier seed:

1. Créez `prisma/seed.ts`
2. Ajoutez vos données de test
3. Exécutez: `npx prisma db seed`

---

## 📞 Contact

En cas de doute, demandez à l'équipe avant de:
- Supprimer des colonnes
- Renommer des tables
- Faire des migrations complexes

**Mieux vaut demander que de casser la base de production!**
