# 🐺 Frontend Wendigo Game - React Application

## 📋 Vue d'ensemble

Le frontend Wendigo Game est une application React moderne construite avec TypeScript qui fournit une interface utilisateur intuitive et responsive pour le jeu de loup-garou hybride. L'application est conçue avec une approche mobile-first et utilise les dernières technologies web.

## 🚀 Fonctionnalités

### ✅ **Authentification Complète**
- Connexion et inscription utilisateur
- Gestion des tokens JWT
- Routes protégées
- Persistance de session

### ✅ **Dashboard Principal**
- Vue d'ensemble des statistiques utilisateur
- Liste des lobbys disponibles
- Création de nouveaux lobbys
- Rejoindre des parties existantes

### ✅ **Interface Responsive**
- Design mobile-first
- Compatible tablette et desktop
- Animations fluides
- Accessibilité optimisée

### ✅ **Communication Temps Réel**
- WebSocket pour les mises à jour en temps réel
- Reconnexion automatique
- Gestion des erreurs de connexion

## 🛠️ Technologies Utilisées

### **Core**
- **React 18** - Bibliothèque UI moderne
- **TypeScript** - Typage statique pour la robustesse
- **React Router v6** - Navigation côté client

### **État et Communication**
- **Context API** - Gestion d'état globale
- **WebSocket** - Communication temps réel
- **Axios** - Client HTTP pour les API

### **Styling**
- **CSS Modules** - Styles modulaires
- **CSS Grid & Flexbox** - Layout responsive
- **Animations CSS** - Transitions fluides

### **Outils de Développement**
- **Create React App** - Configuration de base
- **ESLint** - Linting du code
- **TypeScript** - Vérification de types

## 📁 Structure du Projet

```
frontend/
├── public/                 # Assets statiques
├── src/
│   ├── components/         # Composants React
│   │   ├── auth/          # Composants d'authentification
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Auth.css
│   │   ├── Dashboard.tsx  # Dashboard principal
│   │   └── Dashboard.css
│   ├── context/           # Contexts React
│   │   ├── AuthContext.tsx
│   │   └── GameContext.tsx
│   ├── services/          # Services API
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── types/             # Types TypeScript
│   │   └── index.ts
│   ├── App.tsx           # Composant principal
│   ├── App.css           # Styles globaux
│   └── index.tsx         # Point d'entrée
├── package.json
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+ 
- npm ou yarn
- Backend FastAPI en cours d'exécution

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WendigoGame/frontend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration environnement**
```bash
# Créer un fichier .env.local (optionnel)
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/api/v1/ws
```

4. **Démarrer l'application**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` dans le dossier `frontend/` :

```env
# URL de l'API backend
REACT_APP_API_URL=http://localhost:8000/api/v1

# URL WebSocket
REACT_APP_WS_URL=ws://localhost:8000/api/v1/ws

# Configuration de développement
REACT_APP_DEBUG=true
```

### Scripts Disponibles

```bash
# Démarrage en mode développement
npm start

# Build de production
npm run build

# Tests
npm test

# Linting
npm run lint

# Prévisualisation du build
npm run preview
```

## 🎨 Design System

### Palette de Couleurs
- **Primaire** : `#667eea` (Bleu)
- **Secondaire** : `#764ba2` (Violet)
- **Succès** : `#38a169` (Vert)
- **Avertissement** : `#d69e2e` (Orange)
- **Danger** : `#e53e3e` (Rouge)

### Typographie
- **Famille** : 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Hiérarchie** : H1 (2rem) → H6 (1rem)
- **Poids** : 400 (normal), 600 (semi-bold), 700 (bold)

### Composants UI
- **Boutons** : Gradient, hover effects, états disabled
- **Cartes** : Ombres, bordures arrondies, hover animations
- **Modales** : Overlay, animations d'entrée/sortie
- **Formulaires** : Validation visuelle, focus states

## 🔌 Intégration API

### Service API (`services/api.ts`)
```typescript
// Exemple d'utilisation
import apiService from '../services/api';

// Connexion
const response = await apiService.login({ username, password });

// Récupération des jeux
const games = await apiService.getGames();

// Création d'un jeu
const newGame = await apiService.createGame(gameData);
```

### Service WebSocket (`services/websocket.ts`)
```typescript
// Exemple d'utilisation
import websocketService from '../services/websocket';

// Connexion
await websocketService.connect(gameId, token);

// Envoi de message
websocketService.sendChatMessage("Hello!", "public");

// Écoute d'événements
websocketService.addEventListener('game_update', handleGameUpdate);
```

## 🎯 Architecture des Composants

### Contexts React

#### AuthContext
- Gestion de l'état d'authentification
- Fonctions de connexion/déconnexion
- Persistance des tokens

#### GameContext
- État de la partie en cours
- Gestion des WebSockets
- Actions de jeu

### Composants Principaux

#### Dashboard
- Vue d'ensemble des statistiques
- Liste des lobbys
- Création de nouveaux jeux

#### Login/Register
- Formulaires d'authentification
- Validation en temps réel
- Gestion des erreurs

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Approche Mobile-First
- Grilles CSS flexibles
- Navigation adaptative
- Boutons tactiles optimisés
- Textes lisibles sur petits écrans

## 🔒 Sécurité

### Authentification
- Tokens JWT stockés dans localStorage
- Intercepteurs Axios pour les headers
- Redirection automatique si non authentifié

### Validation
- Validation côté client avec TypeScript
- Sanitisation des inputs
- Protection contre les injections

## 🧪 Tests

### Structure des Tests
```
src/
├── __tests__/
│   ├── components/
│   ├── services/
│   └── utils/
```

### Exécution des Tests
```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

## 🚀 Déploiement

### Build de Production
```bash
npm run build
```

### Serveur de Production
```bash
npm install -g serve
serve -s build -l 3000
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Développement

### Standards de Code
- **TypeScript** : Typage strict
- **ESLint** : Règles de linting
- **Prettier** : Formatage automatique
- **Conventional Commits** : Messages de commit

### Workflow de Développement
1. **Feature Branch** : `feature/nom-fonctionnalite`
2. **Développement** : Composants + tests
3. **Review** : Pull Request
4. **Merge** : Intégration dans main

### Bonnes Pratiques
- **Composants fonctionnels** avec hooks
- **TypeScript strict** pour tous les fichiers
- **CSS modulaire** pour éviter les conflits
- **Tests unitaires** pour les composants critiques
- **Documentation** des props et fonctions

## 🐛 Débogage

### Outils de Développement
- **React Developer Tools**
- **Redux DevTools** (si applicable)
- **Network Tab** pour les requêtes API
- **Console** pour les logs WebSocket

### Logs de Débogage
```typescript
// Activation des logs de débogage
localStorage.setItem('debug', 'wendigo:*');

// Logs dans les services
console.log('API Response:', response);
console.log('WebSocket Message:', message);
```

## 📚 Ressources

### Documentation
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com/)

### Outils
- [Create React App](https://create-react-app.dev/)
- [Axios Documentation](https://axios-http.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le projet
2. **Créer** une branche feature
3. **Développer** avec les standards
4. **Tester** les fonctionnalités
5. **Soumettre** une Pull Request

### Checklist de Contribution
- [ ] Code TypeScript typé
- [ ] Tests unitaires ajoutés
- [ ] Documentation mise à jour
- [ ] Responsive design vérifié
- [ ] Accessibilité testée

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- **Issues GitHub** : Rapport de bugs et demandes de fonctionnalités
- **Documentation** : Guide complet dans `/docs`
- **Discord** : Communauté de développeurs

---

**Frontend Wendigo Game** - Une interface moderne et intuitive pour le jeu de loup-garou hybride ! 🐺✨
