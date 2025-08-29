# 🧩 Composants Réutilisables - Wendigo Game

Ce dossier contient tous les composants réutilisables de l'application Wendigo Game, organisés par catégorie.

## 📁 Structure

```
components/
├── common/           # Composants génériques réutilisables
│   ├── Button.tsx    # Bouton avec variantes
│   ├── Card.tsx      # Conteneur avec variantes
│   ├── Modal.tsx     # Popup modal
│   └── index.ts      # Exports
├── game/             # Composants spécifiques au jeu
│   ├── PhaseIndicator.tsx  # Indicateur de phase jour/nuit
│   ├── PlayerCard.tsx      # Carte de joueur
│   ├── ChairSelector.tsx   # Sélecteur de chaises
│   └── index.ts      # Exports
├── auth/             # Composants d'authentification
├── lobby/            # Composants de lobby
└── README.md         # Cette documentation
```

## 🎯 Avantages de la Réutilisation

### 1. **Cohérence Visuelle**
- Tous les boutons ont le même style
- Les cartes suivent le même design
- Interface uniforme dans toute l'app

### 2. **Maintenance Simplifiée**
- Modifier un style dans un seul endroit
- Ajouter des fonctionnalités globalement
- Correction de bugs centralisée

### 3. **Développement Rapide**
- Composants prêts à l'emploi
- Props flexibles pour différents cas d'usage
- Réduction du code dupliqué

### 4. **Tests Facilités**
- Tests unitaires sur les composants de base
- Comportement prévisible
- Couverture de test améliorée

## 🚀 Utilisation

### Import des Composants

```typescript
// Import individuel
import Button from './components/common/Button';
import PlayerCard from './components/game/PlayerCard';

// Import groupé
import { Button, Card, Modal } from './components/common';
import { PhaseIndicator, PlayerCard, ChairSelector } from './components/game';
```

### Exemples d'Utilisation

#### Button avec Variantes
```typescript
<Button variant="primary" size="lg" onClick={handleClick}>
  Démarrer le Jeu
</Button>

<Button variant="danger" size="sm" disabled={isLoading}>
  Arrêter
</Button>
```

#### Card Interactive
```typescript
<Card variant="elevated" interactive onClick={handleCardClick}>
  <h3>Titre de la carte</h3>
  <p>Contenu de la carte</p>
</Card>
```

#### Modal
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

#### PhaseIndicator
```typescript
<PhaseIndicator
  phase="day"
  timeRemaining={300}
  totalTime={600}
  className="mb-4"
/>
```

#### PlayerCard
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

#### ChairSelector
```typescript
<ChairSelector
  chairs={chairsData}
  maxPlayers={8}
  onChairSelect={(chairId) => handleChairSelection(chairId)}
/>
```

## 🔧 Personnalisation

### Ajouter de Nouvelles Variantes

Pour ajouter une nouvelle variante à un composant existant :

1. **Modifier l'interface TypeScript**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'new-variant';
  // ...
}
```

2. **Ajouter les styles CSS**
```typescript
const variantClasses = {
  // ... variantes existantes
  'new-variant': 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white'
};
```

### Créer un Nouveau Composant

1. **Créer le fichier** : `components/game/NewComponent.tsx`
2. **Définir l'interface** avec des props flexibles
3. **Ajouter à l'index** : `components/game/index.ts`
4. **Documenter** dans ce README

## 📋 Bonnes Pratiques

### 1. **Props Flexibles**
- Toujours prévoir des props optionnelles
- Utiliser des valeurs par défaut sensées
- Permettre la personnalisation via `className`

### 2. **Accessibilité**
- Inclure les attributs ARIA nécessaires
- Gérer le focus et la navigation clavier
- Fournir des alternatives textuelles

### 3. **Performance**
- Utiliser `React.memo()` pour les composants lourds
- Éviter les re-renders inutiles
- Optimiser les callbacks avec `useCallback`

### 4. **TypeScript**
- Interfaces claires et documentées
- Types stricts pour éviter les erreurs
- Props optionnelles bien définies

## 🎨 Thème et Styles

Tous les composants utilisent Tailwind CSS avec un thème cohérent :

- **Couleurs principales** : Rouge (`red-600`) pour les actions principales
- **Arrière-plans** : Slate (`slate-800`, `slate-900`) pour le thème sombre
- **Bordures** : Slate (`slate-700`) pour la séparation
- **Transitions** : `transition-all duration-200` pour les animations

## 🔄 Évolution

Pour maintenir la réutilisabilité :

1. **Tests** : Ajouter des tests pour chaque composant
2. **Documentation** : Mettre à jour cette documentation
3. **Exemples** : Créer des exemples d'utilisation
4. **Feedback** : Collecter les retours des développeurs

---

*Cette architecture de composants réutilisables permet de développer rapidement et maintenir facilement l'interface utilisateur du jeu Wendigo.*
