# 🧩 Architecture Callstack - Composants Réutilisables - Wendigo Game

Ce dossier contient tous les composants réutilisables de l'application Wendigo Game, organisés selon l'architecture **Callstack** pour une meilleure maintenabilité et réutilisabilité.

## 🎯 **Philosophie Callstack**

L'architecture Callstack repose sur des principes clés :
- **Composants atomiques** : Chaque composant a une responsabilité unique
- **Props flexibles** : Interface extensible pour différents cas d'usage
- **Réutilisabilité maximale** : Un composant peut être utilisé dans plusieurs contextes
- **Cohérence visuelle** : Design system unifié dans toute l'application
- **Performance optimisée** : Composants légers et efficaces

## 📁 Structure Callstack

```
components/
├── common/           # Composants génériques Callstack
│   ├── Button.tsx    # Bouton avec variantes (primary, secondary, danger, success, ghost)
│   ├── Card.tsx      # Conteneur avec variantes (elevated, flat, interactive)
│   ├── Modal.tsx     # Popup modal réutilisable
│   ├── Input.tsx     # Champs de saisie stylisés
│   ├── Badge.tsx     # Badges et étiquettes
│   └── index.ts      # Exports centralisés
├── game/             # Composants spécifiques au jeu
│   ├── PhaseIndicator.tsx  # Indicateur de phase jour/nuit
│   ├── PlayerCard.tsx      # Carte de joueur avec rôles
│   ├── ChairSelector.tsx   # Sélecteur de chaises en cercle
│   ├── VoteSystem.tsx      # Système de vote et bûcher
│   ├── ChatSystem.tsx      # Chat restreint (loups/fantômes)
│   ├── GameHistory.tsx     # Historique complet de partie
│   └── index.ts      # Exports centralisés
├── auth/             # Composants d'authentification
│   ├── LoginForm.tsx # Formulaire de connexion
│   ├── RegisterForm.tsx # Formulaire d'inscription
│   └── index.ts      # Exports centralisés
├── lobby/            # Composants de lobby
│   ├── LobbyList.tsx # Liste des lobbys disponibles
│   ├── LobbyChat.tsx # Chat de lobby
│   ├── PlayerList.tsx # Liste des joueurs dans le lobby
│   └── index.ts      # Exports centralisés
└── README.md         # Cette documentation
```

## 🎯 Avantages de l'Architecture Callstack

### 1. **Cohérence Visuelle**
- Tous les boutons ont le même style grâce aux variantes standardisées
- Les cartes suivent le même design system
- Interface uniforme dans toute l'application
- Design tokens centralisés et réutilisables

### 2. **Maintenance Simplifiée**
- Modifier un style dans un seul endroit (composant de base)
- Ajouter des fonctionnalités globalement via les props
- Correction de bugs centralisée
- Évolution du design system facilitée

### 3. **Développement Rapide**
- Composants prêts à l'emploi avec API claire
- Props flexibles pour différents cas d'usage
- Réduction du code dupliqué
- Intégration rapide de nouveaux composants

### 4. **Tests Facilités**
- Tests unitaires sur les composants de base
- Comportement prévisible grâce aux interfaces TypeScript
- Couverture de test améliorée
- Tests d'intégration simplifiés

### 5. **Performance Optimisée**
- Composants légers et efficaces
- Re-renders optimisés avec React.memo
- Bundle size réduit grâce à la réutilisation
- Lazy loading facilité

## 🚀 Utilisation de l'Architecture Callstack

### Import des Composants

```typescript
// Import individuel
import Button from './components/common/Button';
import PlayerCard from './components/game/PlayerCard';

// Import groupé (recommandé)
import { Button, Card, Modal, Input, Badge } from './components/common';
import { PhaseIndicator, PlayerCard, ChairSelector, VoteSystem, ChatSystem } from './components/game';
import { LoginForm, RegisterForm } from './components/auth';
import { LobbyList, LobbyChat, PlayerList } from './components/lobby';
```

### Exemples d'Utilisation Callstack

#### Button avec Variantes Callstack
```typescript
<Button variant="primary" size="lg" onClick={handleClick}>
  Démarrer le Jeu
</Button>

<Button variant="danger" size="sm" disabled={isLoading}>
  Arrêter
</Button>

<Button variant="ghost" size="md" onClick={handleNotes}>
  Notes
</Button>
```

#### Card Interactive Callstack
```typescript
<Card variant="elevated" interactive onClick={handleCardClick}>
  <h3>Titre de la carte</h3>
  <p>Contenu de la carte</p>
</Card>

<Card variant="flat" className="p-4">
  <Badge variant="success">En ligne</Badge>
  <p>Statut du joueur</p>
</Card>
```

#### Modal Callstack
```typescript
<Modal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)}
  title="Confirmation"
  size="md"
>
  <p>Êtes-vous sûr de vouloir continuer ?</p>
  <div className="flex justify-end space-x-2">
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Annuler
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirmer
    </Button>
  </div>
</Modal>
```

#### Input et Badge Callstack
```typescript
<Input 
  type="text" 
  placeholder="Nom du joueur"
  value={playerName}
  onChange={handleNameChange}
/>

<Badge variant="warning">En attente</Badge>
<Badge variant="success">Prêt</Badge>
```

#### PhaseIndicator Callstack
```typescript
<PhaseIndicator
  phase="day"
  timeRemaining={300}
  totalTime={600}
  className="mb-4"
/>
```

#### PlayerCard Callstack
```typescript
<PlayerCard
  player={playerData}
  showRole={true}
  showVoteCount={true}
  voteCount={3}
  onClick={() => handlePlayerClick(playerData.id)}
  interactive={true}
/>
```

#### ChairSelector Callstack
```typescript
<ChairSelector
  chairs={chairsData}
  maxPlayers={8}
  onChairSelect={(chairId) => handleChairSelection(chairId)}
/>
```

#### VoteSystem Callstack
```typescript
<VoteSystem
  players={players}
  currentPhase="accusation"
  onVote={handleVote}
  voteHistory={voteHistory}
/>
```

#### ChatSystem Callstack
```typescript
<ChatSystem
  chatType="wolves"
  messages={wolfMessages}
  onSendMessage={handleSendMessage}
  maxCharacters={15}
/>
```

## 🔧 Personnalisation Callstack

### Ajouter de Nouvelles Variantes

Pour ajouter une nouvelle variante à un composant existant selon l'architecture Callstack :

1. **Modifier l'interface TypeScript**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'new-variant';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

2. **Ajouter les styles CSS avec Tailwind**
```typescript
const variantClasses = {
  primary: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  secondary: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 text-white',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
  ghost: 'bg-transparent hover:bg-slate-700 text-slate-300',
  'new-variant': 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white'
};
```

### Créer un Nouveau Composant Callstack

1. **Créer le fichier** : `components/game/NewComponent.tsx`
2. **Définir l'interface** avec des props flexibles et TypeScript strict
3. **Implémenter le composant** avec React.memo pour les performances
4. **Ajouter à l'index** : `components/game/index.ts`
5. **Documenter** dans ce README
6. **Ajouter les tests** unitaires

### Exemple de Nouveau Composant Callstack

```typescript
// components/game/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  description?: string;
  variant?: 'default' | 'highlighted';
  onClick?: () => void;
  className?: string;
}

const NewComponent: React.FC<NewComponentProps> = React.memo(({
  title,
  description,
  variant = 'default',
  onClick,
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-slate-800 border-slate-700',
    highlighted: 'bg-red-900 border-red-700'
  };

  return (
    <div 
      className={`p-4 border rounded-lg ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-slate-300 mt-2">{description}</p>}
    </div>
  );
});

NewComponent.displayName = 'NewComponent';

export default NewComponent;
```

## 📋 Bonnes Pratiques Callstack

### 1. **Props Flexibles**
- Toujours prévoir des props optionnelles avec valeurs par défaut
- Utiliser des valeurs par défaut sensées
- Permettre la personnalisation via `className`
- Interface TypeScript stricte et documentée

### 2. **Accessibilité**
- Inclure les attributs ARIA nécessaires
- Gérer le focus et la navigation clavier
- Fournir des alternatives textuelles
- Tests d'accessibilité automatisés

### 3. **Performance**
- Utiliser `React.memo()` pour tous les composants
- Éviter les re-renders inutiles
- Optimiser les callbacks avec `useCallback`
- Lazy loading des composants lourds

### 4. **TypeScript**
- Interfaces claires et documentées
- Types stricts pour éviter les erreurs
- Props optionnelles bien définies
- Utilisation de `React.FC` avec génériques

### 5. **Architecture Callstack**
- Composants atomiques avec responsabilité unique
- Réutilisabilité maximale
- Design system cohérent
- Tests unitaires pour chaque composant

## 🎨 Thème et Styles Callstack

Tous les composants utilisent Tailwind CSS avec un thème cohérent selon l'architecture Callstack :

- **Couleurs principales** : Rouge (`red-600`) pour les actions principales
- **Arrière-plans** : Slate (`slate-800`, `slate-900`) pour le thème sombre
- **Bordures** : Slate (`slate-700`) pour la séparation
- **Transitions** : `transition-all duration-200` pour les animations
- **Design tokens** : Variables CSS centralisées pour la cohérence
- **Variantes standardisées** : Système de variantes cohérent dans tous les composants

## 🔄 Évolution Callstack

Pour maintenir la réutilisabilité selon l'architecture Callstack :

1. **Tests** : Ajouter des tests unitaires et d'intégration pour chaque composant
2. **Documentation** : Mettre à jour cette documentation avec les nouveaux composants
3. **Exemples** : Créer des exemples d'utilisation dans Storybook
4. **Feedback** : Collecter les retours des développeurs et utilisateurs
5. **Design System** : Maintenir la cohérence visuelle et fonctionnelle
6. **Performance** : Optimiser continuellement les composants existants

## 🚀 **Intégration avec Callstack**

L'architecture Callstack s'intègre parfaitement avec notre approche de développement :

- **Composants atomiques** : Chaque composant a une responsabilité unique
- **API cohérente** : Interface standardisée pour tous les composants
- **Réutilisabilité maximale** : Un composant peut être utilisé dans plusieurs contextes
- **Maintenance simplifiée** : Modifications centralisées et propagation automatique
- **Performance optimisée** : Composants légers et efficaces

---

*Cette architecture Callstack de composants réutilisables permet de développer rapidement et maintenir facilement l'interface utilisateur du jeu Wendigo, tout en garantissant une expérience utilisateur cohérente et performante.*
