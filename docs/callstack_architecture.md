# 🧩 Architecture Callstack - Wendigo Game

## 🎯 **Introduction à l'Architecture Callstack**

L'architecture **Callstack** est une approche moderne de développement de composants React qui privilégie la **réutilisabilité**, la **maintenabilité** et la **cohérence** dans les applications web. Pour Wendigo Game, cette architecture permet de créer des composants hautement modulaires et performants.

## 🏗️ **Principes Fondamentaux**

### **1. Composants Atomiques**
- Chaque composant a une **responsabilité unique** et bien définie
- Interface TypeScript stricte avec props flexibles
- Réutilisabilité maximale dans différents contextes

### **2. Design System Unifié**
- Variantes standardisées pour tous les composants
- Design tokens centralisés
- Cohérence visuelle dans toute l'application

### **3. Performance Optimisée**
- Composants légers avec React.memo
- Lazy loading facilité
- Bundle size réduit grâce à la réutilisation

## 📁 **Structure Callstack Recommandée**

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

## 🎨 **Composants Callstack Détaillés**

### **📦 Composants Communs (`common/`)**

#### **Button.tsx**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

**Variantes disponibles :**
- **primary** : Actions principales (rouge)
- **secondary** : Actions secondaires (gris)
- **danger** : Actions destructives (rouge foncé)
- **success** : Actions positives (vert)
- **ghost** : Actions discrètes (transparent)

#### **Card.tsx**
```typescript
interface CardProps {
  variant?: 'elevated' | 'flat' | 'interactive';
  interactive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

**Variantes disponibles :**
- **elevated** : Carte avec ombre portée
- **flat** : Carte plate sans ombre
- **interactive** : Carte cliquable avec hover

#### **Modal.tsx**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```

#### **Input.tsx**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}
```

#### **Badge.tsx**
```typescript
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}
```

### **🎮 Composants de Jeu (`game/`)**

#### **PhaseIndicator.tsx**
```typescript
interface PhaseIndicatorProps {
  phase: 'day' | 'night';
  timeRemaining: number;
  totalTime: number;
  className?: string;
}
```

#### **PlayerCard.tsx**
```typescript
interface PlayerCardProps {
  player: Player;
  showRole?: boolean;
  showVoteCount?: boolean;
  voteCount?: number;
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
}
```

#### **ChairSelector.tsx**
```typescript
interface ChairSelectorProps {
  chairs: Chair[];
  maxPlayers: number;
  onChairSelect: (chairId: number) => void;
  selectedChair?: number;
  className?: string;
}
```

#### **VoteSystem.tsx**
```typescript
interface VoteSystemProps {
  players: Player[];
  currentPhase: 'accusation' | 'condemnation';
  onVote: (playerId: string, vote: boolean) => void;
  voteHistory: Vote[];
  className?: string;
}
```

#### **ChatSystem.tsx**
```typescript
interface ChatSystemProps {
  chatType: 'lobby' | 'wolves' | 'ghosts' | 'medium';
  messages: Message[];
  onSendMessage: (message: string) => void;
  maxCharacters?: number;
  className?: string;
}
```

#### **GameHistory.tsx**
```typescript
interface GameHistoryProps {
  events: GameEvent[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onExport: () => void;
  className?: string;
}
```

### **🔐 Composants d'Authentification (`auth/`)**

#### **LoginForm.tsx**
```typescript
interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => void;
  onRegister: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}
```

#### **RegisterForm.tsx**
```typescript
interface RegisterFormProps {
  onRegister: (userData: RegisterData) => void;
  onLogin: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}
```

### **🏠 Composants de Lobby (`lobby/`)**

#### **LobbyList.tsx**
```typescript
interface LobbyListProps {
  lobbies: Lobby[];
  onJoinLobby: (lobbyId: string) => void;
  onCreateLobby: () => void;
  className?: string;
}
```

#### **LobbyChat.tsx**
```typescript
interface LobbyChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  players: Player[];
  className?: string;
}
```

#### **PlayerList.tsx**
```typescript
interface PlayerListProps {
  players: Player[];
  onPlayerClick?: (playerId: string) => void;
  showStatus?: boolean;
  className?: string;
}
```

## 🎨 **Design System Callstack**

### **Couleurs Principales**
```css
/* Rouge pour les actions principales */
--color-primary: #dc2626; /* red-600 */
--color-primary-hover: #b91c1c; /* red-700 */

/* Gris pour les arrière-plans */
--color-background: #0f172a; /* slate-900 */
--color-surface: #1e293b; /* slate-800 */
--color-border: #334155; /* slate-700 */

/* Vert pour les actions positives */
--color-success: #16a34a; /* green-600 */

/* Rouge foncé pour les actions destructives */
--color-danger: #dc2626; /* red-600 */
```

### **Variantes Standardisées**
Tous les composants suivent le même système de variantes :
- **primary** : Actions principales
- **secondary** : Actions secondaires
- **danger** : Actions destructives
- **success** : Actions positives
- **ghost** : Actions discrètes

## 🚀 **Utilisation de l'Architecture Callstack**

### **Import des Composants**
```typescript
// Import groupé (recommandé)
import { Button, Card, Modal, Input, Badge } from './components/common';
import { PhaseIndicator, PlayerCard, ChairSelector, VoteSystem, ChatSystem } from './components/game';
import { LoginForm, RegisterForm } from './components/auth';
import { LobbyList, LobbyChat, PlayerList } from './components/lobby';
```

### **Exemples d'Utilisation**
```typescript
// Bouton avec variante
<Button variant="primary" size="lg" onClick={handleStartGame}>
  Démarrer le Jeu
</Button>

// Carte interactive
<Card variant="elevated" interactive onClick={handleCardClick}>
  <h3>Titre de la carte</h3>
  <p>Contenu de la carte</p>
</Card>

// Système de vote
<VoteSystem
  players={players}
  currentPhase="accusation"
  onVote={handleVote}
  voteHistory={voteHistory}
/>
```

## 📋 **Bonnes Pratiques Callstack**

### **1. Props Flexibles**
- Toujours prévoir des props optionnelles avec valeurs par défaut
- Utiliser des valeurs par défaut sensées
- Permettre la personnalisation via `className`
- Interface TypeScript stricte et documentée

### **2. Accessibilité**
- Inclure les attributs ARIA nécessaires
- Gérer le focus et la navigation clavier
- Fournir des alternatives textuelles
- Tests d'accessibilité automatisés

### **3. Performance**
- Utiliser `React.memo()` pour tous les composants
- Éviter les re-renders inutiles
- Optimiser les callbacks avec `useCallback`
- Lazy loading des composants lourds

### **4. TypeScript**
- Interfaces claires et documentées
- Types stricts pour éviter les erreurs
- Props optionnelles bien définies
- Utilisation de `React.FC` avec génériques

### **5. Architecture Callstack**
- Composants atomiques avec responsabilité unique
- Réutilisabilité maximale
- Design system cohérent
- Tests unitaires pour chaque composant

## 🔄 **Évolution et Maintenance**

### **Ajouter de Nouvelles Variantes**
1. Modifier l'interface TypeScript
2. Ajouter les styles CSS avec Tailwind
3. Mettre à jour la documentation
4. Ajouter les tests unitaires

### **Créer un Nouveau Composant**
1. Créer le fichier avec interface TypeScript stricte
2. Implémenter le composant avec React.memo
3. Ajouter à l'index pour l'export
4. Documenter dans ce README
5. Ajouter les tests unitaires

## 🎯 **Avantages de l'Architecture Callstack**

### **Pour les Développeurs**
- **Développement rapide** avec composants prêts à l'emploi
- **Maintenance simplifiée** avec modifications centralisées
- **Cohérence visuelle** garantie par le design system
- **Tests facilités** avec composants isolés

### **Pour les Utilisateurs**
- **Interface cohérente** dans toute l'application
- **Performance optimisée** avec composants légers
- **Accessibilité améliorée** avec standards respectés
- **Expérience utilisateur fluide** et intuitive

---

*L'architecture Callstack permet de créer des composants hautement réutilisables et maintenables, garantissant une expérience utilisateur cohérente et performante pour Wendigo Game.*
