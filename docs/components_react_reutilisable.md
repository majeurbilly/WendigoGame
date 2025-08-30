# 🧩 Architecture React Native - Composants Réutilisables - Wendigo Game

Ce dossier contient tous les composants réutilisables de l'application Wendigo Game, organisés selon l'architecture **React Native** pour une meilleure maintenabilité et réutilisabilité sur toutes les plateformes (mobile et web).

## 🎯 **Philosophie React Native**

L'architecture React Native repose sur des principes clés :
- **Composants atomiques** : Chaque composant a une responsabilité unique
- **Props flexibles** : Interface extensible pour différents cas d'usage
- **Réutilisabilité maximale** : Un composant peut être utilisé sur mobile et web
- **Cohérence visuelle** : Design system unifié dans toute l'application
- **Performance optimisée** : Composants légers et efficaces
- **Cross-platform** : Même code sur Android, iOS et web

## 📁 Structure React Native

```
shared/                    # Code partagé entre mobile et web
├── components/
│   ├── common/           # Composants génériques React Native
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
├── types/                 # Types TypeScript partagés
├── utils/                 # Utilitaires communs
└── constants/             # Constantes partagées

mobile/                    # Application React Native
├── src/
│   ├── screens/          # Écrans spécifiques au mobile
│   ├── navigation/       # Navigation mobile (React Navigation)
│   └── services/         # Services adaptés au mobile
└── App.tsx               # Point d'entrée mobile

web/                       # Version web avec React Native Web
├── src/
│   ├── pages/            # Pages web spécifiques
│   └── services/         # Services adaptés au web
└── App.tsx               # Point d'entrée web
```

## 🎯 Avantages de l'Architecture React Native

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

### 6. **Cross-Platform**
- Même code sur Android, iOS et web
- Réduction drastique du code dupliqué
- Cohérence des fonctionnalités
- Développement centralisé

## 🚀 Utilisation de l'Architecture React Native

### Import des Composants

```typescript
// Import individuel
import Button from './shared/components/common/Button';
import PlayerCard from './shared/components/game/PlayerCard';

// Import groupé (recommandé)
import { Button, Card, Modal, Input, Badge } from './shared/components/common';
import { PhaseIndicator, PlayerCard, ChairSelector, VoteSystem, ChatSystem } from './shared/components/game';
import { LoginForm, RegisterForm } from './shared/components/auth';
import { LobbyList, LobbyChat, PlayerList } from './shared/components/lobby';
```

### Exemples d'Utilisation React Native

#### Button avec Variantes React Native
```typescript
<Button variant="primary" size="lg" onPress={handlePress}>
  Démarrer le Jeu
</Button>

<Button variant="danger" size="sm" disabled={isLoading}>
  Arrêter
</Button>

<Button variant="ghost" size="md" onPress={handleNotes}>
  Notes
</Button>
```

#### Card Interactive React Native
```typescript
<Card variant="elevated" interactive onPress={handleCardPress}>
  <Text style={styles.title}>Titre de la carte</Text>
  <Text style={styles.content}>Contenu de la carte</Text>
</Card>

<Card variant="flat" style={styles.container}>
  <Badge variant="success">En ligne</Badge>
  <Text style={styles.status}>Statut du joueur</Text>
</Card>
```

#### Modal React Native
```typescript
<Modal 
  isVisible={showModal} 
  onClose={() => setShowModal(false)}
  title="Confirmation"
  size="md"
>
  <Text style={styles.message}>Êtes-vous sûr de vouloir continuer ?</Text>
  <View style={styles.buttonContainer}>
    <Button variant="secondary" onPress={() => setShowModal(false)}>
      Annuler
    </Button>
    <Button variant="primary" onPress={handleConfirm}>
      Confirmer
    </Button>
  </View>
</Modal>
```

#### Input et Badge React Native
```typescript
<Input 
  placeholder="Nom du joueur"
  value={playerName}
  onChangeText={handleNameChange}
  style={styles.input}
/>

<Badge variant="warning">En attente</Badge>
<Badge variant="success">Prêt</Badge>
```

#### PhaseIndicator React Native
```typescript
<PhaseIndicator
  phase="day"
  timeRemaining={300}
  totalTime={600}
  style={styles.indicator}
/>
```

#### PlayerCard React Native
```typescript
<PlayerCard
  player={playerData}
  showRole={true}
  showVoteCount={true}
  voteCount={3}
  onPress={() => handlePlayerPress(playerData.id)}
  interactive={true}
/>
```

#### ChairSelector React Native
```typescript
<ChairSelector
  chairs={chairsData}
  maxPlayers={8}
  onChairSelect={(chairId) => handleChairSelection(chairId)}
/>
```

#### VoteSystem React Native
```typescript
<VoteSystem
  players={players}
  currentPhase="accusation"
  onVote={handleVote}
  voteHistory={voteHistory}
/>
```

#### ChatSystem React Native
```typescript
<ChatSystem
  chatType="wolves"
  messages={wolfMessages}
  onSendMessage={handleSendMessage}
  maxCharacters={15}
/>
```

## 🔧 Personnalisation React Native

### Ajouter de Nouvelles Variantes

Pour ajouter une nouvelle variante à un composant existant selon l'architecture React Native :

1. **Modifier l'interface TypeScript**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'new-variant';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
```

2. **Ajouter les styles avec StyleSheet**
```typescript
const variantStyles = {
  primary: { backgroundColor: '#dc2626' },
  secondary: { backgroundColor: '#475569' },
  danger: { backgroundColor: '#dc2626' },
  success: { backgroundColor: '#16a34a' },
  ghost: { backgroundColor: 'transparent' },
  'new-variant': { backgroundColor: '#9333ea' }
};
```

### Créer un Nouveau Composant React Native

1. **Créer le fichier** : `shared/components/game/NewComponent.tsx`
2. **Définir l'interface** avec des props flexibles et TypeScript strict
3. **Implémenter le composant** avec React.memo pour les performances
4. **Ajouter à l'index** : `shared/components/game/index.ts`
5. **Documenter** dans ce README
6. **Ajouter les tests** unitaires

### Exemple de Nouveau Composant React Native

```typescript
// shared/components/game/NewComponent.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface NewComponentProps {
  title: string;
  description?: string;
  variant?: 'default' | 'highlighted';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const NewComponent: React.FC<NewComponentProps> = React.memo(({
  title,
  description,
  variant = 'default',
  onPress,
  style
}) => {
  const variantStyles = {
    default: styles.default,
    highlighted: styles.highlighted
  };

  return (
    <Pressable 
      style={[styles.container, variantStyles[variant], style]}
      onPress={onPress}
    >
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#475569'
  },
  default: {
    backgroundColor: '#1e293b'
  },
  highlighted: {
    backgroundColor: '#7f1d1d',
    borderColor: '#dc2626'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff'
  },
  description: {
    color: '#cbd5e1',
    marginTop: 8
  }
});

NewComponent.displayName = 'NewComponent';

export default NewComponent;
```

## 📋 Bonnes Pratiques React Native

### 1. **Props Flexibles**
- Toujours prévoir des props optionnelles avec valeurs par défaut
- Utiliser des valeurs par défaut sensées
- Permettre la personnalisation via `style`
- Interface TypeScript stricte et documentée

### 2. **Accessibilité**
- Inclure les attributs `accessibilityLabel` et `accessibilityHint`
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

### 5. **Architecture React Native**
- Composants atomiques avec responsabilité unique
- Réutilisabilité maximale sur toutes les plateformes
- Design system cohérent
- Tests unitaires pour chaque composant

### 6. **Cross-Platform**
- Utiliser des composants React Native compatibles web
- Éviter les APIs spécifiques à une plateforme
- Tester sur toutes les plateformes cibles
- Utiliser React Native Web pour la compatibilité

## 🎨 Thème et Styles React Native

Tous les composants utilisent StyleSheet avec un thème cohérent selon l'architecture React Native :

- **Couleurs principales** : Rouge (`#dc2626`) pour les actions principales
- **Arrière-plans** : Slate (`#1e293b`, `#0f172a`) pour le thème sombre
- **Bordures** : Slate (`#475569`) pour la séparation
- **Transitions** : `Animated` pour les animations
- **Design tokens** : Variables centralisées pour la cohérence
- **Variantes standardisées** : Système de variantes cohérent dans tous les composants

## 🔄 Évolution React Native

Pour maintenir la réutilisabilité selon l'architecture React Native :

1. **Tests** : Ajouter des tests unitaires et d'intégration pour chaque composant
2. **Documentation** : Mettre à jour cette documentation avec les nouveaux composants
3. **Exemples** : Créer des exemples d'utilisation dans Storybook
4. **Feedback** : Collecter les retours des développeurs et utilisateurs
5. **Design System** : Maintenir la cohérence visuelle et fonctionnelle
6. **Performance** : Optimiser continuellement les composants existants
7. **Cross-Platform** : S'assurer de la compatibilité sur toutes les plateformes

## 🚀 **Intégration avec React Native Web**

L'architecture React Native s'intègre parfaitement avec React Native Web :

- **Composants unifiés** : Même composants sur mobile et web
- **API cohérente** : Interface standardisée pour toutes les plateformes
- **Réutilisabilité maximale** : Un composant peut être utilisé sur mobile et web
- **Maintenance simplifiée** : Modifications centralisées et propagation automatique
- **Performance optimisée** : Composants légers et efficaces
- **Développement rapide** : Une seule base de code pour toutes les plateformes

---

*Cette architecture React Native de composants réutilisables permet de développer rapidement et maintenir facilement l'interface utilisateur du jeu Wendigo sur toutes les plateformes, tout en garantissant une expérience utilisateur cohérente et performante.*
