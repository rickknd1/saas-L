# 🔐 Messages de Sécurité & Notifications UX - Companion Legal SaaS

## 📋 Table des matières
1. [Authentification & Sécurité](#authentification--sécurité)
2. [Gestion des Documents](#gestion-des-documents)
3. [Collaboration & Partage](#collaboration--partage)
4. [Paramètres & Compte](#paramètres--compte)
5. [Paiement & Abonnement](#paiement--abonnement)
6. [Notifications Système](#notifications-système)

---

## 1️⃣ AUTHENTIFICATION & SÉCURITÉ

### 📍 Page: `/login` (Connexion)

#### ✅ Messages de succès
- **Après connexion réussie:**
  - Toast: "✓ Connexion réussie. Bienvenue Jean !"
  - Durée: 3 secondes

#### ⚠️ Messages d'erreur
- **Échec d'authentification:**
  - Alert inline: "⚠️ Email ou mot de passe incorrect. Veuillez réessayer."
  - Après 3 tentatives: "🔒 Pour votre sécurité, votre compte sera temporairement bloqué après 5 tentatives échouées."
  - Après 5 tentatives: "🚫 Compte temporairement verrouillé pour 30 minutes. Contactez le support si nécessaire."

- **Connexion depuis nouveau device:**
  - Email envoyé: "🔔 Nouvelle connexion détectée depuis [Device] à [Location]"
  - Dans l'app: Notification "Nouvelle connexion depuis [Device]. Était-ce vous ?"

#### 🔐 Messages de sécurité
- **Après 30 jours sans connexion:**
  - Modal au login: "ℹ️ Cela fait longtemps ! Pour votre sécurité, veuillez vérifier votre email."

- **Connexion depuis VPN/IP suspecte:**
  - Modal: "⚡ Connexion depuis une nouvelle localisation détectée. Nous avons envoyé un code de vérification à votre email."

---

### 📍 Page: `/register` (Inscription)

#### ✅ Messages de succès
- **Après création compte:**
  - Modal de bienvenue: "🎉 Bienvenue dans Companion ! Votre compte est créé."
  - Email de confirmation envoyé
  - Redirection vers `/onboarding`

#### ⚠️ Messages de validation
- **Mot de passe faible:**
  - Indicateur en temps réel: "🔴 Faible" / "🟡 Moyen" / "🟢 Fort"
  - Tooltip: "Utilisez au moins 8 caractères, une majuscule, un chiffre et un caractère spécial"

- **Email déjà utilisé:**
  - Alert: "⚠️ Cet email est déjà associé à un compte. <a>Se connecter ?</a>"

#### 🔐 Messages de confidentialité
- **Avant soumission du formulaire:**
  - Checkbox obligatoire avec lien: "En créant un compte, vous acceptez notre Politique de confidentialité et nos CGU"
  - Info bulle: "🔒 Vos données sont chiffrées de bout en bout et hébergées en France (conformité RGPD)"

---

### 📍 Page: `/forgot-password` (Mot de passe oublié)

#### ✅ Messages de succès
- **Email envoyé:**
  - Alert success: "✉️ Email de réinitialisation envoyé à [email]. Vérifiez votre boîte de réception (et spam)."
  - Timer: "Renvoyer l'email dans 60 secondes"

#### 🔐 Sécurité
- **Pour protection:**
  - Message générique même si email n'existe pas: "Si cet email existe, vous recevrez un lien de réinitialisation."

---

## 2️⃣ GESTION DES DOCUMENTS

### 📍 Page: `/dashboard/documents`

#### 🔐 Messages de sécurité avant actions

##### **Upload de document:**
- **Modal de confirmation:**
  ```
  🔒 Sécurité et confidentialité

  Avant de télécharger votre document :
  • Les documents sont chiffrés automatiquement (AES-256)
  • Stockage sécurisé en France (conformité RGPD)
  • Audit trail complet de toutes les actions
  • Seuls les membres autorisés peuvent y accéder

  Taille max: 50 MB | Formats acceptés: PDF, DOCX, DOC

  [Annuler] [Télécharger le document]
  ```

##### **Partage de document:**
- **Modal d'avertissement:**
  ```
  ⚠️ Partage de document confidentiel

  Vous vous apprêtez à partager :
  📄 "Contrat de prestation - Client ABC.pdf"

  Ce document contient des informations juridiques sensibles.

  Partager avec: [Select: Membres de l'équipe / Lien externe]

  🔐 Niveau de sécurité:
  • Lien expire après: [7 jours ▾]
  • Mot de passe requis: [ON/OFF]
  • Autoriser le téléchargement: [ON/OFF]
  • Filigrane sur le document: [ON/OFF]

  ⚡ Notification: Les destinataires recevront un email sécurisé

  [Annuler] [Partager en toute sécurité]
  ```

##### **Suppression de document:**
- **Modal de confirmation critique:**
  ```
  🗑️ Supprimer définitivement ce document ?

  📄 "Contrat de prestation - Client ABC.pdf"

  ⚠️ ATTENTION - Cette action est IRRÉVERSIBLE :
  • Le document sera supprimé de tous les projets
  • L'historique et les versions seront perdus
  • Les commentaires associés seront supprimés
  • Cette action sera enregistrée dans les logs d'audit

  Pour confirmer, tapez le nom du document :
  [                                        ]

  [Annuler] [Supprimer définitivement]
  ```

##### **Téléchargement de document:**
- **Toast de sécurité:**
  ```
  📥 Téléchargement en cours...

  🔒 Ce téléchargement est enregistré dans les logs d'audit
  Téléchargé par: Jean Dupont
  Date: 09/10/2025 à 14:32

  [Voir les logs]
  ```

##### **Modification de document:**
- **Notification avant édition:**
  ```
  ℹ️ Modification en cours

  🔒 Audit Trail activé:
  • Toutes les modifications sont enregistrées
  • Version automatiquement sauvegardée
  • Horodatage certifié des changements

  Dernière modification: Marie Dubois, il y a 2h

  [Continuer l'édition]
  ```

---

### 📍 Page: `/dashboard/compare` (Comparaison)

#### 🔐 Messages avant comparaison
- **Modal d'information:**
  ```
  🔍 Comparaison de versions - Sécurité

  Vous allez comparer deux versions d'un document confidentiel.

  📄 Document: "Contrat de prestation.pdf"
  Version A: v2.1 (10/09/2025)
  Version B: v3.0 (09/10/2025)

  ⚡ Cette action génèrera un rapport de comparaison qui sera :
  • Stocké dans l'historique du projet
  • Accessible uniquement aux membres autorisés
  • Enregistré dans les logs d'audit

  [Annuler] [Lancer la comparaison]
  ```

---

## 3️⃣ COLLABORATION & PARTAGE

### 📍 Page: `/dashboard/team`

#### 🔐 Invitation de membres

##### **Modal d'invitation:**
```
👥 Inviter un nouveau membre

Email: [                                    ]

Rôle: [Administrateur ▾]

🔐 Permissions:
☑ Voir tous les documents
☑ Modifier les documents
☐ Supprimer les documents
☑ Inviter des membres
☐ Gérer la facturation

⚠️ Important:
• L'invitation expirera dans 7 jours
• Le nouveau membre recevra un email sécurisé
• Il devra vérifier son email avant d'accéder
• Cette action sera enregistrée dans les logs

[Annuler] [Envoyer l'invitation]
```

#### ⚠️ Retrait d'un membre

##### **Modal de confirmation:**
```
🚫 Retirer un membre de l'équipe

Êtes-vous sûr de vouloir retirer Marie Dubois ?

⚠️ Conséquences:
• Perte immédiate de l'accès à tous les documents
• Les documents partagés par Marie resteront accessibles
• Les commentaires de Marie seront préservés
• Cette action est enregistrée dans les logs

Transférer les documents de Marie à:
[Jean Dupont ▾]

[Annuler] [Retirer le membre]
```

---

### 📍 Page: `/dashboard/projects/[id]`

#### 🔐 Messages de confidentialité

##### **Bannière de projet confidentiel:**
```
🔒 PROJET CONFIDENTIEL

Ce projet contient des informations juridiques sensibles.
Toutes les actions sont enregistrées et tracées.

Niveau de confidentialité: [Élevé ▾]
Accès restreint à: 3 membres

[Voir les logs d'accès] [Gérer les permissions]
```

##### **Notification de membre ajouté:**
```
Toast: "👥 Marie Dubois a rejoint le projet"
Toast: "🔒 Marie a désormais accès à tous les documents de ce projet"
```

---

## 4️⃣ PARAMÈTRES & COMPTE

### 📍 Page: `/dashboard/settings` - Onglet Sécurité

#### 🔐 Changement de mot de passe

##### **Après changement réussi:**
```
✅ Mot de passe modifié avec succès

🔒 Pour votre sécurité:
• Vous avez été déconnecté de tous vos appareils
• Un email de confirmation a été envoyé
• Vous devez vous reconnecter

[Se reconnecter maintenant]
```

##### **Email envoyé automatiquement:**
```
Objet: 🔐 Votre mot de passe a été modifié

Bonjour Jean,

Votre mot de passe a été modifié le 09/10/2025 à 14:32.

Appareil: Chrome sur Windows
Localisation: Paris, France

Si ce n'est pas vous, cliquez ici immédiatement: [Sécuriser mon compte]

L'équipe Companion
```

#### 🔐 Activation de 2FA

##### **Modal de configuration:**
```
🔐 Activer l'authentification à deux facteurs (2FA)

Renforcez la sécurité de votre compte avec 2FA.

Étape 1: Scanner le QR code
[QR CODE]

Étape 2: Entrez le code de vérification
[   ] [   ] [   ] [   ] [   ] [   ]

⚡ Codes de secours (à sauvegarder):
XXXX-XXXX-XXXX
XXXX-XXXX-XXXX
XXXX-XXXX-XXXX

⚠️ Conservez ces codes en lieu sûr !

[Télécharger les codes] [Activer 2FA]
```

##### **Après activation:**
```
Toast success: "✅ 2FA activé avec succès"
Modal: "🎉 Votre compte est maintenant mieux protégé !"
Email: "🔒 2FA activé sur votre compte Companion"
```

#### 🔐 Révocation de sessions

##### **Modal de confirmation:**
```
🚪 Révoquer cette session ?

Appareil: Safari sur iPhone
Localisation: Paris, France
Dernière activité: Il y a 2 heures

⚠️ Cette action:
• Déconnectera immédiatement cet appareil
• Nécessitera une nouvelle connexion
• Sera enregistrée dans les logs

[Annuler] [Révoquer la session]
```

#### 🔐 Suppression de compte

##### **Modal de confirmation critique:**
```
🗑️ SUPPRIMER DÉFINITIVEMENT LE COMPTE

⚠️ ATTENTION - DANGER - IRRÉVERSIBLE

Cette action supprimera DÉFINITIVEMENT:
• Tous vos documents et projets
• Tout l'historique et les versions
• Toutes vos données personnelles
• Tous les partages et collaborations

📧 Délai de grâce: 30 jours
Vous pourrez annuler cette action pendant 30 jours.

Pour confirmer, tapez "SUPPRIMER MON COMPTE":
[                                              ]

☐ Je comprends que cette action est irréversible

[Annuler] [Supprimer définitivement]
```

---

### 📍 Page: `/dashboard/settings` - Onglet Notifications

#### ⚠️ Désactivation des notifications critiques

##### **Modal d'avertissement:**
```
⚠️ Désactiver les notifications critiques ?

Vous êtes sur le point de désactiver les notifications pour:
• Accès inhabituels à votre compte
• Modifications de documents importants
• Invitations de nouveaux membres

🔒 Recommandation de sécurité:
Nous vous conseillons fortement de garder ces notifications actives
pour la sécurité de vos données juridiques.

Êtes-vous sûr de vouloir continuer ?

[Annuler] [Désactiver quand même]
```

---

## 5️⃣ PAIEMENT & ABONNEMENT

### 📍 Page: `/dashboard/upgrade` (Mise à niveau)

#### 💳 Saisie des informations de paiement

##### **Banner de sécurité:**
```
🔒 Paiement 100% sécurisé

• Chiffrement SSL/TLS
• Conformité PCI DSS
• Aucune donnée bancaire stockée
• Traitement par Stripe (certifié)

Nous ne conservons jamais vos informations de carte bancaire.
```

##### **Après paiement réussi:**
```
Modal de succès:
🎉 Bienvenue dans le plan Standard !

✅ Votre paiement a été accepté
✅ Votre plan a été mis à jour
✅ Toutes les fonctionnalités sont maintenant disponibles

📧 Facture envoyée à: jean.dupont@cabinet.fr

[Voir ma facture] [Découvrir les nouvelles fonctionnalités]
```

##### **Email de confirmation:**
```
Objet: ✅ Bienvenue dans le plan Standard - Facture jointe

Bonjour Jean,

Merci d'avoir choisi le plan Standard de Companion !

Votre abonnement:
• Plan: Standard - 23€/mois
• Prochaine facturation: 09/11/2025
• Facture: INV-2025-010 (voir pièce jointe)

[Voir mon abonnement] [Télécharger la facture]

L'équipe Companion
```

#### ⚠️ Échec de paiement

##### **Modal d'erreur:**
```
❌ Échec du paiement

Votre paiement n'a pas pu être traité.

Raison: Carte refusée

🔄 Actions possibles:
• Vérifier les informations de votre carte
• Utiliser une autre carte
• Contacter votre banque

Votre compte reste sur le plan Freemium.

[Réessayer] [Utiliser une autre carte] [Contacter le support]
```

#### 🚫 Annulation d'abonnement

##### **Modal de confirmation:**
```
😢 Vous souhaitez annuler votre abonnement ?

Nous serions tristes de vous voir partir !

En annulant, vous perdrez:
• Projets illimités (retour à 5 max)
• Intelligence juridique IA
• Support prioritaire 24/7
• Fonctionnalités avancées

📅 Votre abonnement reste actif jusqu'au: 09/11/2025

Pourquoi annulez-vous ? (optionnel)
[Trop cher ▾]

[Rester sur Standard] [Confirmer l'annulation]
```

##### **Après annulation:**
```
Toast: "✓ Abonnement annulé. Actif jusqu'au 09/11/2025"
Email: "Votre abonnement Standard sera annulé le 09/11/2025"
```

---

## 6️⃣ NOTIFICATIONS SYSTÈME

### 🔔 Types de notifications en temps réel

#### 📍 Barre de notifications (top-right)

##### **Sécurité & Confidentialité:**
1. **Nouvelle connexion détectée**
   ```
   🔐 Nouvelle connexion
   Appareil: Chrome sur Windows
   Localisation: Paris, France
   Il y a 5 min

   [Était-ce vous ?] [Sécuriser mon compte]
   ```

2. **Document accédé par quelqu'un**
   ```
   👁️ Document consulté
   Marie Dubois a ouvert "Contrat ABC.pdf"
   Il y a 2 min

   [Voir l'activité]
   ```

3. **Partage externe créé**
   ```
   🔗 Lien de partage créé
   "Contrat ABC.pdf" partagé via lien sécurisé
   Expire dans: 7 jours

   [Voir le lien] [Révoquer]
   ```

4. **Tentative d'accès bloquée**
   ```
   🚫 Accès bloqué
   Tentative d'accès à "Contrat confidentiel.pdf"
   Utilisateur: externe@domain.com

   [Voir les détails] [Accorder l'accès]
   ```

##### **Activité de l'équipe:**
1. **Nouveau commentaire**
   ```
   💬 Nouveau commentaire
   Pierre Martin: "Clause à vérifier page 5"
   Sur: Contrat ABC.pdf

   [Répondre] [Voir le document]
   ```

2. **Mention**
   ```
   @ Vous avez été mentionné
   Marie Dubois vous a mentionné dans un commentaire
   "Contrat de prestation - Client ABC.pdf"

   [Voir le commentaire]
   ```

3. **Document modifié**
   ```
   📝 Document modifié
   Sophie Laurent a modifié "CGV 2025.pdf"
   Version: v3.2 → v3.3

   [Voir les changements]
   ```

4. **Nouveau membre ajouté**
   ```
   👥 Nouveau membre
   Thomas Dubois a rejoint votre équipe
   Rôle: Collaborateur

   [Voir le profil]
   ```

##### **Limites & Quota:**
1. **Limite de projets atteinte (Freemium)**
   ```
   ⚠️ Limite atteinte
   Vous avez utilisé 5/5 projets
   Passez au plan Standard pour projets illimités

   [Mettre à niveau]
   ```

2. **Stockage presque plein**
   ```
   📦 Stockage: 90% utilisé
   4.5 GB / 5 GB utilisés
   Libérez de l'espace ou passez au Standard (100 GB)

   [Gérer le stockage] [Mettre à niveau]
   ```

##### **Système:**
1. **Maintenance programmée**
   ```
   🔧 Maintenance programmée
   Companion sera indisponible le 15/10 de 2h à 4h (GMT+1)
   pour maintenance de sécurité

   [En savoir plus]
   ```

2. **Mise à jour de sécurité**
   ```
   🔒 Mise à jour de sécurité appliquée
   Vos données sont maintenant encore mieux protégées
   Version: 2.5.1

   [Voir les notes de version]
   ```

---

### 📧 Emails automatiques de sécurité

#### 🔐 Emails critiques

1. **Changement de mot de passe**
   - Objet: 🔐 Votre mot de passe a été modifié
   - Envoi: Immédiat
   - Contenu: Détails de la modification + bouton "Ce n'était pas moi"

2. **Activation 2FA**
   - Objet: ✅ 2FA activé sur votre compte
   - Envoi: Immédiat
   - Contenu: Confirmation + codes de secours

3. **Nouvelle connexion**
   - Objet: 🔔 Nouvelle connexion à votre compte
   - Envoi: Immédiat
   - Contenu: Device, localisation, IP + bouton sécurité

4. **Tentative de connexion suspecte**
   - Objet: ⚠️ Tentative de connexion inhabituelle détectée
   - Envoi: Immédiat
   - Contenu: Détails + bouton "Sécuriser mon compte"

5. **Document partagé externement**
   - Objet: 🔗 Document partagé via lien externe
   - Envoi: Immédiat
   - Contenu: Document partagé, durée du lien, sécurité

6. **Membre ajouté à l'équipe**
   - Objet: 👥 Nouveau membre ajouté à votre équipe
   - Envoi: Immédiat
   - Contenu: Qui a été ajouté, par qui, avec quels droits

7. **Échec de paiement**
   - Objet: ⚠️ Échec du paiement - Action requise
   - Envoi: Immédiat + Rappel J+3 et J+7
   - Contenu: Raison, actions à faire

8. **Annulation d'abonnement**
   - Objet: 😢 Confirmation d'annulation
   - Envoi: Immédiat
   - Contenu: Date de fin, ce qui sera perdu, offre de réactivation

---

### 🎯 Toasts (Notifications éphémères)

#### ✅ Succès (Vert)
- "✓ Document téléchargé avec succès"
- "✓ Modifications enregistrées"
- "✓ Projet créé avec succès"
- "✓ Membre invité"
- "✓ Paramètres mis à jour"

#### ⚠️ Avertissement (Orange)
- "⚠️ Document non sauvegardé. Sauvegarder maintenant ?"
- "⚠️ Limite de stockage presque atteinte (90%)"
- "⚠️ Ce lien expire dans 24 heures"
- "⚠️ Session expirée. Reconnexion requise dans 5 min"

#### ❌ Erreur (Rouge)
- "❌ Échec du téléchargement. Réessayer"
- "❌ Impossible de supprimer ce document"
- "❌ Connexion perdue. Reconnexion..."
- "❌ Fichier trop volumineux (Max 50 MB)"

#### ℹ️ Information (Bleu)
- "ℹ️ Document en cours de traitement..."
- "ℹ️ Comparaison en cours. Cela peut prendre quelques minutes"
- "ℹ️ Synchronisation en cours..."
- "ℹ️ Version automatiquement sauvegardée"

---

## 🎨 Composants UI à créer

### 1. Toast Component
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}
```

### 2. Modal de confirmation
```typescript
interface ConfirmModalProps {
  title: string
  description: string
  severity: 'info' | 'warning' | 'danger'
  confirmText: string
  cancelText: string
  requiresInput?: { placeholder: string; expectedValue: string }
  onConfirm: () => void
  onCancel: () => void
}
```

### 3. Security Banner
```typescript
interface SecurityBannerProps {
  level: 'low' | 'medium' | 'high' | 'critical'
  message: string
  actions?: Array<{ label: string; onClick: () => void }>
}
```

### 4. Notification Bell
```typescript
interface NotificationItem {
  id: string
  type: 'security' | 'activity' | 'system' | 'team'
  title: string
  description: string
  timestamp: Date
  read: boolean
  actions?: Array<{ label: string; onClick: () => void }>
}
```

---

## 📊 Résumé par priorité

### 🔴 PRIORITÉ CRITIQUE (Sécurité)
1. Nouvelle connexion détectée
2. Changement de mot de passe
3. Tentative d'accès suspecte
4. Suppression de document
5. Partage externe de document
6. Ajout/Retrait de membre

### 🟡 PRIORITÉ HAUTE (UX Important)
7. Upload de document
8. Modification de document
9. Téléchargement de document
10. Activation 2FA
11. Révocation de session
12. Échec de paiement

### 🟢 PRIORITÉ MOYENNE (Confort UX)
13. Limite de projets atteinte
14. Stockage presque plein
15. Nouveau commentaire
16. Mention
17. Maintenance programmée

### 🔵 PRIORITÉ BASSE (Informationnel)
18. Document modifié par quelqu'un
19. Nouveau membre ajouté
20. Mise à jour système

---

## 📝 Notes d'implémentation

### Librairies recommandées
- **Toasts:** `sonner` ou `react-hot-toast`
- **Modals:** `@radix-ui/react-dialog` (déjà dans shadcn/ui)
- **Notifications:** Custom component avec `@radix-ui/react-popover`
- **Emails:** `react-email` + `nodemailer`

### Bonnes pratiques
1. **Toujours logger les actions sensibles** dans un audit trail
2. **Envoyer des emails** pour les actions critiques de sécurité
3. **Demander confirmation** pour toute action irréversible
4. **Utiliser des délais** (rate limiting) pour les actions sensibles
5. **Afficher des indicateurs de sécurité** partout où c'est pertinent

---

## 🎯 Prochaines étapes

1. ✅ Document créé - Liste complète des messages
2. ⏳ Créer les composants UI (Toast, Modal, Banner)
3. ⏳ Implémenter les notifications en temps réel
4. ⏳ Configurer les emails automatiques
5. ⏳ Ajouter les logs d'audit
6. ⏳ Tester tous les flows de sécurité

---

**Date de création:** 09/10/2025
**Dernière mise à jour:** 09/10/2025
**Version:** 1.0
