## 🎯 **Vue d'ensemble de votre projet**

Votre projet est divisé en **2 parties principales** :
- **Frontend** (React/TypeScript) : L'interface utilisateur
- **Backend** (.NET/C#) : La logique serveur

## 📁 **Structure du Frontend - Explication simple**

### **Les dossiers principaux :**

1. **`node_modules/`** ❌ 
   - **Ne touchez JAMAIS ce dossier** 
   - Contient toutes les bibliothèques installées
   - Se régénère automatiquement avec `npm install`

2. **`public/`** 📁
   - Contient les fichiers **statiques** (images, icônes, etc.)
   - Accessibles directement par le navigateur
   - Exemple : `vite.svg` (l'icône de votre app)

3. **`src/`** �� **C'EST ICI QUE VOUS TRAVAILLEZ !**
   - Tout votre code React
   - C'est le cœur de votre application

### **Le point d'entrée : Comment ça démarre ?**

```
index.html → main.tsx → App.tsx
```

1. **`index.html`** : La page HTML de base
   - Contient `<div id="root"></div>` 
   - Charge `main.tsx`

2. **`main.tsx`** : Le point d'entrée React
   - Crée l'application React
   - Monte l'App dans le DOM

3. **`App.tsx`** : Votre composant principal
   - C'est votre "page d'accueil"
   - Contient toute la logique principale

   Parfait ! Je vais vous expliquer `main.tsx` et `App.tsx` de manière très simple et visuelle. Ce sont les deux fichiers les plus importants !

Read file: frontend/src/main.tsx
Read file: frontend/src/App.tsx
## 🎯 **Explication simple de `main.tsx` et `App.tsx`**

### **�� `main.tsx` - Le "Démarreur"**

Pensez à `main.tsx` comme au **bouton "ON"** de votre application !

```typescript
// main.tsx - Le démarreur
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Ce que fait `main.tsx` :**

1. **`import App from './App.tsx'`** → "Va chercher le composant App"
2. **`document.getElementById('root')`** → "Trouve la div dans index.html"
3. **`createRoot(...).render(<App />)`** → "Démarre React et affiche App"

**En français simple :**
> "Hey React, va chercher le composant App et affiche-le dans la div 'root' de ma page HTML"

### **🏠 `App.tsx` - La "Maison" de votre application**

`App.tsx` c'est comme la **maison principale** où tout se passe !

```typescript
// App.tsx - La maison principale
function App() {
  // 1. ÉTAT (les données qui changent)
  const [showModal, setShowModal] = useState(false);
  const [showChairSelector, setShowChairSelector] = useState(false);
  
  // 2. LOGIQUE (les fonctions)
  const {
    gameState,
    startGame,
    pauseGame,
    resumeGame
  } = useGameState();

  // 3. DONNÉES (exemples pour tester)
  const samplePlayers = [
    { id: '1', name: 'Alice', role: 'Villageois' },
    { id: '2', name: 'Bob', role: 'Loup' }
  ];

  // 4. INTERFACE (ce qu'on voit à l'écran)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <h1>�� Wendigo Game</h1>
      {/* Vos composants ici */}
    </div>
  );
}
```

## 🔄 **Comment ça marche ensemble ?**

```
1. index.html charge main.tsx
2. main.tsx dit à React : "Affiche App"
3. App.tsx dit : "Voici ce que je veux afficher"
4. React affiche tout ça dans le navigateur
```

## 📊 **Structure de `App.tsx` - Les 4 parties**

### **1. �� IMPORTS** (ce dont j'ai besoin)
```typescript
import React, { useState } from 'react';
import { Button, Card, Modal } from './components/common';
import { PhaseIndicator, PlayerCard } from './components/game';
```

### **2. 📊 ÉTAT** (les données qui changent)
```typescript
const [showModal, setShowModal] = useState(false);
const [showChairSelector, setShowChairSelector] = useState(false);
```
**Explication :** "Je veux savoir si la modal est ouverte ou fermée"

### **3. ⚙️ LOGIQUE** (les fonctions)
```typescript
const {
  gameState,
  startGame,
  pauseGame,
  resumeGame
} = useGameState();
```
**Explication :** "Je récupère les fonctions pour gérer le jeu"

### **4. �� INTERFACE** (ce qu'on voit)
```typescript
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
    <h1>�� Wendigo Game</h1>
    <Button onClick={startGame}>Démarrer</Button>
  </div>
);
```

## 🎯 **Analogie simple**

- **`main.tsx`** = Le **facteur** qui livre votre application
- **`App.tsx`** = La **maison** où tout se passe
- **Les composants** = Les **pièces** de la maison (cuisine, salon, etc.)

## 🔍 **Pourquoi cette structure ?**

1. **`main.tsx`** : Point d'entrée unique, ne change presque jamais
2. **`App.tsx`** : Composant principal, contient toute la logique
3. **Séparation** : Plus facile à maintenir et à comprendre



## 🔧 **Comment ça fonctionne avec le Backend ?**

### **Communication Frontend ↔ Backend :**

1. **HTTP Requests** (via `axios`)
   - Le frontend envoie des requêtes au backend
   - Exemple : "Créer une partie", "Voter pour un joueur"

2. **WebSocket** (via `socket.io-client`)
   - Communication en temps réel
   - Exemple : "Un joueur a voté", "La phase a changé"

### **Flux typique :**
```
Frontend → Envoie requête → Backend (.NET)
Backend → Traite → Renvoie réponse → Frontend
```

## 📂 **Structure de `src/` - Organisation intelligente**

```
src/
├── components/     # Composants réutilisables
│   ├── common/     # Boutons, cartes, modales
│   ├── game/       # Composants spécifiques au jeu
│   ├── lobby/      # Composants pour le lobby
│   └── auth/       # Composants d'authentification
├── hooks/          # Logique réutilisable
├── services/       # Communication avec le backend
├── types/          # Définitions TypeScript
├── utils/          # Fonctions utilitaires
├── assets/         # Images, styles, etc.
├── App.tsx         # Composant principal
└── main.tsx        # Point d'entrée
```

## �� **Comment démarrer et développer ?**

### **Commandes importantes :**
```bash
cd frontend
npm install          # Installe les dépendances
npm run dev          # Lance le serveur de développement
```

### **Où travailler :**
- **Pour l'interface** : `src/components/`
- **Pour la logique** : `src/hooks/` et `src/services/`
- **Pour les types** : `src/types/`

## �� **Conseils pour ne plus être perdu :**

1. **Commencez toujours par `App.tsx`** - c'est votre point de référence
2. **Regardez les imports** pour comprendre les dépendances
3. **Utilisez la recherche** dans votre éditeur (Ctrl+Shift+F)
4. **Un composant = un fichier** - c'est la règle React

## 🔍 **Voulez-vous que je vous montre :**

1. **Comment ajouter une nouvelle page ?**
2. **Comment communiquer avec le backend ?**
3. **Comment créer un nouveau composant ?**
4. **Comment déboguer quand ça ne marche pas ?**

Dites-moi ce qui vous intéresse le plus et je vous guiderai étape par étape ! 

**Ne vous inquiétez pas, c'est normal d'être perdu au début. Une fois que vous aurez compris cette structure, tout deviendra beaucoup plus clair !** 🎯