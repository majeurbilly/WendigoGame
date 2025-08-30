# 🎮 Frontend Wendigo Game - Architecture Callstack

## 🎯 **Vue d'ensemble de votre Frontend Wendigo Game avec Callstack**

Votre frontend doit être une **application web responsive mobile-first** utilisant l'architecture **Callstack** pour les composants réutilisables, avec les caractéristiques suivantes :

### �� **Interface Mobile-First**
- **Optimisé pour téléphones** via navigateur
- **Design moderne** avec animations fluides
- **Boutons larges** et facilement cliquables
- **Interface intuitive** sans formation préalable

### 🏗️ **Architecture Frontend avec Callstack**

#### **1. Page de Connexion - Composants Callstack**
- **`LoginForm`** : Formulaire de connexion avec validation
- **`RegisterForm`** : Formulaire d'inscription avec validation
- **`Button`** (variante primary) : Boutons d'action
- **`Card`** (variante elevated) : Conteneur du formulaire
- **`Input`** : Champs de saisie stylisés
- Design épuré et accueillant

#### **2. Système de Lobby - Composants Callstack**
- **`LobbyList`** : Affichage des lobbys disponibles avec statut
- **`LobbyChat`** : Chat en temps réel dans le lobby
- **`PlayerList`** : Liste des joueurs avec statut "Prêt"
- **`Button`** (variantes) : Créer lobby, rejoindre, confirmer prêt
- **`Card`** (variante interactive) : Cartes de lobby cliquables
- **`Modal`** : Configuration des paramètres de lobby
- **`Badge`** : Indicateurs de statut (ouvert, fermé, plein)
- Remplissage progressif en temps réel
- Système de confirmation "Prêt"
- Redirection automatique vers le jeu

#### **3. Interface de Partie - Écran Principal - Composants Callstack**

**Header Épuré :**
- Logo du jeu (coin supérieur gauche)
- Menu hamburger discret (≡) en haut à droite avec **`Modal`** pour le menu

**Zone Centrale :**
- **`PlayerCard`** : Nom du joueur affiché clairement
- **`PhaseIndicator`** : Phase actuelle avec indicateur visuel :
  - **Jour** (10:00) - Interface claire et lumineuse
  - 🌙 **Nuit** (30s) - Interface sombre et bleutée
- **Compteur de phase** avec barre de progression
- **`ChairSelector`** : Disposition des chaises en cercle avec numérotation
- **Emplacement des joueurs** qui ont sélectionné leur chaise :
  - Affichage du nom du joueur sur sa chaise sélectionnée
  - Indicateur visuel de la chaise occupée
  - Chaises disponibles vs occupées clairement distinguées

**Boutons Principaux :**
- **`Button`** (variante ghost) : Zone Notes - Notes personnelles sur les joueurs
- **`Button`** (variante secondary) : Fiche Personnelle - Informations du joueur (nom, rôle, équipe, couleur)
- **`Button`** (variante secondary) : Règles du Jeu - Guide complet et accessible
- **`Button`** (variante primary/danger) : Bouton Action - Utilisation des pouvoirs selon la phase

#### **4. Système de Sélection de Chaises - Composants Callstack**
- **`ChairSelector`** : Interface de chaises numérotées disposées en cercle
- Sélection de chaise (disponible à partir de 8 minutes de la phase Jour)
- Chaises exclusives (une fois sélectionnée, indisponible pour les autres)
- Timer de sélection (2 dernières minutes)
- Indicateur de disponibilité

#### **5. Système de Bûcher et Votes - Composants Callstack**
- **`VoteSystem`** : Phase du conseil avec une seule accusation par phase jour
- **Vote d'accusation** : Tous les joueurs votent pour qui ils veulent voir sur le bûcher
- **Sélection du condamné** : Le joueur avec le plus de votes va plaider son innocence
- **Plaidoirie** : Le condamné a 1 minute pour plaider son innocence avec **`Modal`**
- **Vote de condamnation** : Les joueurs votent pour tuer ou épargner le condamné avec **`Button`** (variantes primary/danger)
- **Fin de phase** : Après le vote, la nuit tombe et les joueurs commettent leurs actions
- **Historique des votes** et résultats

#### **6. Système de Chat Restreint - Composants Callstack**
- **`ChatSystem`** : Gestion centralisée de tous les types de chat
- Chat des vivants : Désactivé pendant la partie
- Chat des loups : Accessible uniquement aux loups pendant la phase Jour (1 message/jour, max 15 caractères)
- Chat des fantômes : Accessible uniquement aux joueurs morts
- Chat du médium : Communication avec les Fantômes

#### **7. Système de Vibration Séquentielle - Composants Callstack**
- Réveil aléatoire des joueurs la nuit
- Vibration haptique + écran qui s'illumine
- 15 secondes pour agir ou cliquer "Continuer" avec **`Button`** (variante primary)
- 5 secondes d'attente entre chaque joueur
- Ordre aléatoire pour tous les joueurs

#### **8. Menu Hamburger Complet - Composants Callstack**
- **`Modal`** : Conteneur principal du menu hamburger
- **`Button`** (variante ghost) : Règles du jeu
- **`Button`** (variante ghost) : Notes personnelles
- **`Button`** (variante ghost) : Fiches joueurs
- **`Button`** (variante ghost) : Historique de partie
- **`Button`** (variante ghost) : Statistiques
- **`Button`** (variante primary) : Bouton pouvoir
- **`Button`** (variante danger) : Déconnexion

#### **9. Système d'Historique Complet - Composants Callstack**
- **`GameHistory`** : Journal des événements en temps réel
- Timeline interactive avec filtres avancés utilisant **`Input`** et **`Badge`**
- Détails contextuels pour chaque action
- Statistiques dynamiques
- Export de partie avec **`Button`** (variante secondary)

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

### 🚀 **Technologies Recommandées avec Callstack**

D'après votre documentation, vous utilisez actuellement :
- **React** avec **TypeScript**
- **Vite** comme bundler
- **Tailwind CSS** pour les styles
- **Architecture Callstack** pour les composants réutilisables

## 🧩 **Architecture Callstack - Composants Réutilisables**

### **📁 Structure Callstack Recommandée**

```
src/
├── components/
│   ├── common/           # Composants génériques Callstack
│   │   ├── Button.tsx    # Bouton avec variantes (primary, secondary, danger, success, ghost)
│   │   ├── Card.tsx      # Conteneur avec variantes (elevated, flat, interactive)
│   │   ├── Modal.tsx     # Popup modal réutilisable
│   │   ├── Input.tsx     # Champs de saisie stylisés
│   │   ├── Badge.tsx     # Badges et étiquettes
│   │   └── index.ts      # Exports centralisés
│   ├── game/             # Composants spécifiques au jeu
│   │   ├── PhaseIndicator.tsx  # Indicateur de phase jour/nuit
│   │   ├── PlayerCard.tsx      # Carte de joueur avec rôles
│   │   ├── ChairSelector.tsx   # Sélecteur de chaises en cercle
│   │   ├── VoteSystem.tsx      # Système de vote et bûcher
│   │   ├── ChatSystem.tsx      # Chat restreint (loups/fantômes)
│   │   ├── GameHistory.tsx     # Historique complet de partie
│   │   └── index.ts      # Exports centralisés
│   ├── auth/             # Composants d'authentification
│   │   ├── LoginForm.tsx # Formulaire de connexion
│   │   ├── RegisterForm.tsx # Formulaire d'inscription
│   │   └── index.ts      # Exports centralisés
│   └── lobby/            # Composants de lobby
│       ├── LobbyList.tsx # Liste des lobbys disponibles
│       ├── LobbyChat.tsx # Chat de lobby
│       ├── PlayerList.tsx # Liste des joueurs dans le lobby
│       └── index.ts      # Exports centralisés
├── hooks/                # Logique réutilisable
├── services/             # Services API
└── types/                # Types TypeScript
```

### **🎯 Avantages de l'Architecture Callstack**

- **Composants atomiques** : Chaque composant a une responsabilité unique
- **Props flexibles** : Interface extensible pour différents cas d'usage
- **Réutilisabilité maximale** : Un composant peut être utilisé dans plusieurs contextes
- **Cohérence visuelle** : Design system unifié dans toute l'application
- **Performance optimisée** : Composants légers et efficaces

Voulez-vous que je commence par implémenter une partie spécifique de cette interface avec l'architecture Callstack ? Par exemple :
1. **La page de connexion et système de lobby**
2. **L'interface principale de jeu avec les phases**
3. **Le système de sélection de chaises**
4. **Le système de bûcher et votes**
5. **Le menu hamburger et les fonctionnalités secondaires**

---

## 🎮 **Votre Frontend Wendigo Game - Explication Complète avec Callstack**

### **📁 Structure du Projet**

Votre frontend est une application React moderne avec TypeScript qui utilise l'architecture **Callstack** :

- **Vite** comme bundler (très rapide)
- **React 19** (dernière version)
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Socket.io** pour la communication temps réel
- **Framer Motion** pour les animations
- **Architecture Callstack** pour les composants réutilisables

### **🏗️ Architecture des Composants avec Callstack**

Votre frontend est organisé selon l'architecture **Callstack** de manière modulaire :

```
src/
├── components/
│   ├── common/          # Composants génériques Callstack
│   │   ├── Button.tsx   # Boutons avec variantes (primary, secondary, danger, success, ghost)
│   │   ├── Card.tsx     # Cartes conteneurs avec variantes (elevated, flat, interactive)
│   │   ├── Modal.tsx    # Modales réutilisables
│   │   ├── Input.tsx    # Champs de saisie stylisés
│   │   ├── Badge.tsx    # Badges et étiquettes
│   │   └── index.ts     # Exports centralisés
│   ├── game/            # Composants spécifiques au jeu
│   │   ├── PhaseIndicator.tsx  # Indicateur jour/nuit
│   │   ├── PlayerCard.tsx      # Cartes des joueurs avec rôles
│   │   ├── ChairSelector.tsx   # Sélecteur de chaises en cercle
│   │   ├── VoteSystem.tsx      # Système de vote et bûcher
│   │   ├── ChatSystem.tsx      # Chat restreint (loups/fantômes)
│   │   ├── GameHistory.tsx     # Historique complet de partie
│   │   └── index.ts     # Exports centralisés
│   ├── auth/            # Authentification
│   │   ├── LoginForm.tsx # Formulaire de connexion
│   │   ├── RegisterForm.tsx # Formulaire d'inscription
│   │   └── index.ts     # Exports centralisés
│   └── lobby/           # Salle d'attente
│       ├── LobbyList.tsx # Liste des lobbys disponibles
│       ├── LobbyChat.tsx # Chat de lobby
│       ├── PlayerList.tsx # Liste des joueurs dans le lobby
│       └── index.ts     # Exports centralisés
├── hooks/               # Logique réutilisable
│   ├── useGameState.ts  # Gestion de l'état du jeu
│   └── useWebSocket.ts  # Communication WebSocket
└── services/            # Services API
```

### **�� Composants Principaux**

#### **1. Composants Communs (`common/`) - Architecture Callstack**
- **`Button`** : Boutons avec 5 variantes (primary, secondary, danger, success, ghost)
- **`Card`** : Conteneurs avec différentes variantes (elevated, flat, interactive)
- **`Modal`** : Fenêtres modales réutilisables
- **`Input`** : Champs de saisie stylisés avec validation
- **`Badge`** : Badges et étiquettes avec variantes (success, warning, danger, info)

#### **2. Composants de Jeu (`game/`) - Architecture Callstack**
- **`PhaseIndicator`** : Affiche la phase actuelle (jour/nuit) avec timer
- **`PlayerCard`** : Cartes des joueurs avec rôles et statuts
- **`ChairSelector`** : Interface pour choisir sa place à table en cercle
- **`VoteSystem`** : Système de vote et bûcher complet
- **`ChatSystem`** : Chat restreint pour loups et fantômes
- **`GameHistory`** : Historique complet de partie avec filtres

#### **3. Composants d'Authentification (`auth/`) - Architecture Callstack**
- **`LoginForm`** : Formulaire de connexion avec validation
- **`RegisterForm`** : Formulaire d'inscription avec validation

#### **4. Composants de Lobby (`lobby/`) - Architecture Callstack**
- **`LobbyList`** : Liste des lobbys disponibles avec statuts
- **`LobbyChat`** : Chat en temps réel dans le lobby
- **`PlayerList`** : Liste des joueurs avec statut "Prêt"

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