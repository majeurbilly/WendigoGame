Je vais lire les fichiers de documentation dans le dossier `docs` pour comprendre ce que vous voulez pour votre frontend.

Ran tool
Maintenant, je vais lire chaque fichier de documentation pour comprendre vos besoins pour le frontend :

Read file: docs/WENDIGO_GAME_DOCUMENTATION.md
Read file: docs/backend_info.md
Read file: docs/deploiment.md
Read file: docs/description_dependances.md
Parfait ! J'ai maintenant une compréhension complète de votre projet Wendigo Game. D'après la documentation, voici ce que vous voulez pour votre frontend :

## 🎯 **Vue d'ensemble de votre Frontend Wendigo Game**

Votre frontend doit être une **application web responsive mobile-first** avec les caractéristiques suivantes :

### �� **Interface Mobile-First**
- **Optimisé pour téléphones** via navigateur
- **Design moderne** avec animations fluides
- **Boutons larges** et facilement cliquables
- **Interface intuitive** sans formation préalable

### 🏗️ **Architecture Frontend**

#### **1. Page de Connexion**
- Bouton de connexion pour utilisateurs existants
- Bouton de création de compte pour nouveaux joueurs
- Design épuré et accueillant

#### **2. Système de Lobby**
- Affichage des lobbys disponibles avec statut
- Création de lobby personnalisé (min/max joueurs)
- Rejoindre n'importe quel lobby ouvert
- Remplissage progressif en temps réel
- Système de confirmation "Prêt"
- Redirection automatique vers le jeu

#### **3. Interface de Partie - Écran Principal**

**Header Épuré :**
- Logo du jeu (coin supérieur gauche)
- Menu hamburger discret (≡) en haut à droite

**Zone Centrale :**
- **Nom du joueur** affiché clairement
- **Phase actuelle** avec indicateur visuel :
  - **Jour** (10:00) - Interface claire et lumineuse
  - 🌙 **Nuit** (30s) - Interface sombre et bleutée
- **Compteur de phase** avec barre de progression
- **Disposition des chaises** en cercle avec numérotation
- **Emplacement des joueurs** qui ont sélectionné leur chaise :
  - Affichage du nom du joueur sur sa chaise sélectionnée
  - Indicateur visuel de la chaise occupée
  - Chaises disponibles vs occupées clairement distinguées

**Boutons Principaux :**
- **Zone Notes** : Notes personnelles sur les joueurs
- **Fiche Personnelle** : Informations du joueur (nom, rôle, équipe, couleur)
- **Règles du Jeu** : Guide complet et accessible
- **Bouton Action** : Utilisation des pouvoirs selon la phase

#### **4. Système de Sélection de Chaises**
- Interface de chaises numérotées disposées en cercle
- Sélection de chaise (disponible à partir de 8 minutes de la phase Jour)
- Chaises exclusives (une fois sélectionnée, indisponible pour les autres)
- Timer de sélection (2 dernières minutes)
- Indicateur de disponibilité

#### **5. Système de Bûcher et Votes**
- **Phase du conseil** : Une seule accusation par phase jour
- **Vote d'accusation** : Tous les joueurs votent pour qui ils veulent voir sur le bûcher
- **Sélection du condamné** : Le joueur avec le plus de votes va plaider son innocence
- **Plaidoirie** : Le condamné a 1 minute pour plaider son innocence
- **Vote de condamnation** : Les joueurs votent pour tuer ou épargner le condamné
- **Fin de phase** : Après le vote, la nuit tombe et les joueurs commettent leurs actions
- **Historique des votes** et résultats

#### **6. Système de Chat Restreint**
- Chat des vivants : Désactivé pendant la partie
- Chat des loups : Accessible uniquement aux loups pendant la phase Jour (1 message/jour, max 15 caractères)
- Chat des fantômes : Accessible uniquement aux joueurs morts
- Chat du médium : Communication avec les Fantômes

#### **7. Système de Vibration Séquentielle**
- Réveil aléatoire des joueurs la nuit
- Vibration haptique + écran qui s'illumine
- 15 secondes pour agir ou cliquer "Continuer"
- 5 secondes d'attente entre chaque joueur
- Ordre aléatoire pour tous les joueurs

#### **8. Menu Hamburger Complet**
- Règles du jeu
- Notes personnelles
- Fiches joueurs
- Historique de partie
- Statistiques
- Bouton pouvoir
- Déconnexion

#### **9. Système d'Historique Complet**
- Journal des événements en temps réel
- Timeline interactive avec filtres avancés
- Détails contextuels pour chaque action
- Statistiques dynamiques
- Export de partie

### �� **Design et UX**

#### **Responsive Design**
- Tous les éléments pensés pour mobile en premier
- Adaptabilité aux tablettes et grands écrans
- Zones de texte scrollables si nécessaire

#### **Accessibilité**
- Infobulles sur les icônes et boutons
- Navigation intuitive
- Feedback visuel clair
- Contraste optimal

#### **Synchronisation Temps Réel**
- WebSockets pour communication instantanée
- Actions synchronisées entre tous les joueurs
- Phases et notes mises à jour en temps réel
- Pas de décalage entre les appareils

### 🚀 **Technologies Recommandées**

D'après votre documentation, vous utilisez actuellement :
- **React** avec **TypeScript**
- **Vite** comme bundler
- **CSS** pour les styles

Voulez-vous que je commence par implémenter une partie spécifique de cette interface ? Par exemple :
1. **La page de connexion et système de lobby**
2. **L'interface principale de jeu avec les phases**
3. **Le système de sélection de chaises**
4. **Le système de bûcher et votes**
5. **Le menu hamburger et les fonctionnalités secondaires**

---

Je vais vous aider à comprendre votre frontend ! Laissez-moi d'abord examiner la structure et le code pour vous expliquer comment il fonctionne.

Read file: frontend/package.json
Read file: frontend/src/App.tsx
Read file: frontend/src/hooks/useGameState.ts
Ran tool
Read file: frontend/src/components/common/index.ts
Read file: frontend/src/components/game/index.ts
Read file: frontend/src/components/common/Button.tsx
Parfait ! Maintenant je peux vous expliquer votre frontend. Voici une explication complète de l'architecture et du fonctionnement :

## 🎮 **Votre Frontend Wendigo Game - Explication Complète**

### **📁 Structure du Projet**

Votre frontend est une application React moderne avec TypeScript qui utilise :

- **Vite** comme bundler (très rapide)
- **React 19** (dernière version)
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Socket.io** pour la communication temps réel
- **Framer Motion** pour les animations

### **🏗️ Architecture des Composants**

Votre frontend est organisé de manière modulaire :

```
src/
├── components/
│   ├── common/          # Composants réutilisables
│   │   ├── Button.tsx   # Boutons stylisés
│   │   ├── Card.tsx     # Cartes conteneurs
│   │   └── Modal.tsx    # Modales
│   ├── game/            # Composants spécifiques au jeu
│   │   ├── PhaseIndicator.tsx  # Indicateur jour/nuit
│   │   ├── PlayerCard.tsx      # Cartes des joueurs
│   │   └── ChairSelector.tsx   # Sélecteur de chaises
│   ├── auth/            # Authentification
│   └── lobby/           # Salle d'attente
├── hooks/               # Logique réutilisable
│   ├── useGameState.ts  # Gestion de l'état du jeu
│   └── useWebSocket.ts  # Communication WebSocket
└── services/            # Services API
```

### **�� Composants Principaux**

#### **1. Composants Communs (`common/`)**
- **`Button`** : Boutons avec 5 variantes (primary, secondary, danger, success, ghost)
- **`Card`** : Conteneurs avec différentes variantes
- **`Modal`** : Fenêtres modales réutilisables

#### **2. Composants de Jeu (`game/`)**
- **`PhaseIndicator`** : Affiche la phase actuelle (jour/nuit) avec timer
- **`PlayerCard`** : Cartes des joueurs avec rôles et statuts
- **`ChairSelector`** : Interface pour choisir sa place à table

### **⚡ Hook useGameState - Le Cerveau du Jeu**

Ce hook gère tout l'état du jeu :

```typescript
interface GameState {
  phase: 'day' | 'night';           // Phase actuelle
  timeRemaining: number;            // Temps restant
  totalTime: number;                // Temps total de la phase
  players: Player[];                // Liste des joueurs
  currentPlayer: Player | null;     // Joueur actuel
  selectedChair: number | null;     // Chaise sélectionnée
  gameStatus: 'waiting' | 'playing' | 'finished'; // Statut du jeu
}
```

**Fonctionnalités principales :**
- ⏱️ **Timer automatique** qui change de phase (10min jour, 30s nuit)
- �� **Contrôles de jeu** (start, pause, resume)
- 👥 **Gestion des joueurs** (ajouter, supprimer, modifier)
- 🪑 **Sélection de chaises**

### **🎨 Interface Utilisateur**

L'interface utilise un design moderne avec :
- **Gradient sombre** (slate-900 à slate-800)
- **Couleurs thématiques** (rouge pour les actions principales)
- **Responsive design** (mobile-first)
- **Animations fluides** avec Framer Motion

### **🔌 Communication Temps Réel**

Le frontend est préparé pour communiquer avec votre backend via :
- **Socket.io** pour les mises à jour en temps réel
- **Axios** pour les appels API REST

### **🚀 Comment ça Fonctionne**

1. **Page d'accueil** : Démonstration de tous les composants
2. **Gestion d'état** : Le hook `useGameState` centralise toute la logique
3. **Composants modulaires** : Chaque composant a une responsabilité spécifique
4. **Style cohérent** : Tailwind CSS assure une apparence uniforme

### **💡 Points Forts de Votre Architecture**

✅ **Modulaire** : Composants réutilisables et bien organisés  
✅ **Type-safe** : TypeScript pour éviter les erreurs  
✅ **Performant** : Vite + React 19  
✅ **Maintenable** : Hooks personnalisés pour la logique  
✅ **Scalable** : Structure prête pour l'expansion  

Votre frontend est bien structuré et suit les bonnes pratiques React ! Avez-vous des questions spécifiques sur une partie particulière ?