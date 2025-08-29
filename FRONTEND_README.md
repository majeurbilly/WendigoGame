# 🎮 Frontend Wendigo Game

## 📋 Vue d'ensemble

Le frontend de Wendigo Game est une application React moderne avec TypeScript qui fournit une interface utilisateur complète et immersive pour le jeu de loup-garou hybride présentiel-numérique.

## 🚀 Fonctionnalités implémentées

### ✅ **Composants d'authentification**
- **Login** : Connexion utilisateur avec validation
- **Register** : Création de compte avec validation
- **ProtectedRoute** : Protection des routes privées

### ✅ **Dashboard principal**
- **Vue d'ensemble** : Statistiques utilisateur et parties disponibles
- **Création de lobby** : Interface pour créer de nouvelles parties
- **Rejoindre des parties** : Système de connexion aux lobbys existants

### ✅ **Système de lobby**
- **Sélection des chaises** : Interface visuelle pour choisir sa position
- **Gestion des joueurs** : Affichage des participants et de leur statut
- **Actions du lobby** : Prêt, démarrage de partie, quitter

### ✅ **Interface de jeu complète**
- **Plateau circulaire** : Affichage des joueurs disposés en cercle
- **Gestion des phases** : Nuit, jour, vote, accusation
- **Actions des rôles** : Interface pour utiliser les pouvoirs
- **Chat en temps réel** : Communication publique et privée
- **Informations du joueur** : Rôle, équipe, statistiques

### ✅ **Page d'accueil**
- **Présentation du jeu** : Explication des concepts et fonctionnalités
- **Guide d'utilisation** : Étapes pour commencer à jouer
- **Design responsive** : Interface adaptée à tous les écrans

## 🏗️ Architecture technique

### **Structure des composants**
```
src/components/
├── auth/           # Authentification
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ProtectedRoute.tsx
├── lobby/          # Gestion des lobbys
│   ├── Lobby.tsx
│   └── Lobby.css
├── game/           # Interface de jeu
│   ├── Game.tsx
│   ├── GameBoard.tsx
│   ├── GameActions.tsx
│   ├── GameInfo.tsx
│   ├── GameChat.tsx
│   └── *.css
├── Dashboard.tsx   # Tableau de bord principal
├── Home.tsx        # Page d'accueil
└── ui/             # Composants UI réutilisables
```

### **Technologies utilisées**
- **React 18** : Framework principal
- **TypeScript** : Typage statique
- **React Router** : Navigation entre pages
- **CSS Modules** : Styles modulaires et responsifs
- **Context API** : Gestion de l'état global

## 🎯 Fonctionnalités des rôles

### **🌙 Phase Nocturne**
- **Voyante** : Révéler l'identité d'un joueur
- **Épouvantail** : Protéger les joueurs adjacents
- **Corbeau** : Donner un vote supplémentaire
- **Renard** : Détecter les loups parmi 3 joueurs à gauche
- **Loups** : Voter pour tuer un joueur
- **Warlord/Sbire** : Protéger un loup d'une attaque

### **☀️ Phase Diurne**
- **Discussion libre** : Accusations et défense
- **Guerrier** : Provoquer un duel
- **Shérif** : Mettre un joueur en prison

### **🗳️ Phase de Vote**
- **Vote démocratique** : Élimination par majorité
- **Avocat du Diable** : Défendre un joueur (risqué)

## 🎨 Design et UX

### **Thème visuel**
- **Palette sombre** : Ambiance immersive et mystérieuse
- **Gradients colorés** : Accents visuels pour les actions
- **Animations fluides** : Transitions et micro-interactions
- **Responsive design** : Adaptation mobile-first

### **Accessibilité**
- **Contraste élevé** : Lisibilité optimale
- **Navigation clavier** : Support complet du clavier
- **Indicateurs visuels** : Statuts et actions clairement identifiés

## 🚀 Démarrage rapide

### **1. Installation des dépendances**
```bash
cd frontend
npm install
```

### **2. Démarrage en mode développement**
```bash
npm start
```

### **3. Build de production**
```bash
npm run build
```

## 🔧 Configuration

### **Variables d'environnement**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

### **Structure des types**
```typescript
interface Player {
  user_id: string;
  username: string;
  chair_number: number;
  is_ready: boolean;
  is_dead: boolean;
  role?: Role;
}

interface Game {
  id: string;
  name: string;
  description: string;
  status: string;
  min_players: number;
  max_players: number;
  creator_id: string;
}

interface GameState {
  phase: string;
  turn: number;
  phase_message?: string;
  winner_team?: string;
}
```

## 📱 Responsive Design

### **Breakpoints**
- **Desktop** : > 1200px
- **Tablet** : 768px - 1200px
- **Mobile** : < 768px
- **Small Mobile** : < 480px

### **Adaptations**
- **Layout flexible** : Grilles CSS adaptatives
- **Navigation mobile** : Menus et actions optimisés
- **Touch-friendly** : Boutons et interactions tactiles

## 🧪 Tests et qualité

### **Tests unitaires**
```bash
npm test
```

### **Linting et formatage**
```bash
npm run lint
npm run format
```

### **Build de vérification**
```bash
npm run build
npm run test:coverage
```

## 🔮 Roadmap

### **Phase 1 - MVP (✅ Complété)**
- [x] Authentification complète
- [x] Interface de lobby
- [x] Plateau de jeu basique
- [x] Actions des rôles principaux

### **Phase 2 - Améliorations (🔄 En cours)**
- [ ] Animations avancées
- [ ] Sons et effets audio
- [ ] Mode sombre/clair
- [ ] Thèmes personnalisables

### **Phase 3 - Fonctionnalités avancées (📋 Planifié)**
- [ ] Système de notifications push
- [ ] Mode spectateur
- [ ] Replays des parties
- [ ] Statistiques détaillées

## 🤝 Contribution

### **Guidelines de développement**
1. **TypeScript strict** : Utilisation complète du typage
2. **Composants fonctionnels** : Hooks React modernes
3. **CSS modulaire** : Styles encapsulés par composant
4. **Tests unitaires** : Couverture minimale de 80%

### **Structure des commits**
```
feat: ajouter la fonctionnalité X
fix: corriger le bug Y
docs: mettre à jour la documentation
style: améliorer le style du composant Z
refactor: refactoriser le code X
test: ajouter des tests pour Y
```

## 📚 Documentation API

### **Endpoints principaux**
- `POST /api/v1/users/register` - Création de compte
- `POST /api/v1/users/login` - Connexion
- `GET /api/v1/games/` - Liste des parties
- `POST /api/v1/games/` - Créer une partie
- `POST /api/v1/games/{id}/join` - Rejoindre une partie

### **WebSocket**
- `ws://localhost:8000/ws` - Communication en temps réel
- **Événements** : Mise à jour du jeu, chat, actions

## 🐛 Dépannage

### **Problèmes courants**

#### **Erreur de connexion API**
```bash
# Vérifier que le backend est démarré
curl http://localhost:8000/health

# Vérifier les variables d'environnement
echo $REACT_APP_API_URL
```

#### **Problèmes de build**
```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install

# Vérifier la version de Node.js
node --version  # Doit être >= 16
```

#### **Erreurs TypeScript**
```bash
# Vérifier la configuration
npx tsc --noEmit

# Mettre à jour les types
npm install @types/react @types/react-dom
```

## 📞 Support

### **Ressources utiles**
- **Documentation React** : https://react.dev/
- **TypeScript Handbook** : https://www.typescriptlang.org/docs/
- **CSS Grid Guide** : https://css-tricks.com/snippets/css/complete-guide-grid/

### **Contact**
- **Issues GitHub** : Signaler les bugs et demander des fonctionnalités
- **Discussions** : Questions et partage d'idées
- **Wiki** : Documentation détaillée et tutoriels

---

**🎯 Objectif** : Créer l'expérience de jeu la plus immersive et intuitive possible pour Wendigo Game !

**🚀 Statut** : MVP fonctionnel avec interface complète et moderne
