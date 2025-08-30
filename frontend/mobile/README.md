# 📱 Wendigo Game - Version Mobile

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS - macOS uniquement)

### Installation des dépendances
```bash
cd frontend/mobile
npm install
```

### Démarrage de l'application

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Démarrage du bundler Metro
```bash
npm start
```

## 🏗️ Architecture

### Structure des dossiers
```
src/
├── navigation/          # Navigation React Navigation
│   └── AppNavigator.tsx
├── screens/            # Écrans de l'application
│   ├── HomeScreen.tsx
│   └── BackendTestScreen.tsx
└── services/           # Services API
    └── api.ts
```

### Composants principaux

#### 🏠 HomeScreen
- Écran d'accueil avec présentation du jeu
- Boutons de navigation vers les différentes fonctionnalités
- Affichage des fonctionnalités principales

#### 🔧 BackendTestScreen
- Test de communication avec le backend C#
- Boutons de test de connexion et ping
- Affichage des réponses du backend

#### 🧭 AppNavigator
- Navigation principale de l'application
- Gestion des routes et de la navigation entre écrans
- Configuration des headers et styles

## 🔌 Communication Backend

### Service API
- **URL de base** : `https://localhost:7001`
- **Méthodes disponibles** : GET, POST, PUT, DELETE
- **Typage TypeScript** complet pour toutes les interfaces

### Endpoints testés
- `/api/test` - Test de connexion
- `/api/test/ping` - Test de ping

## 🎨 Interface Utilisateur

### Design System
- **Couleurs principales** : Bleu (#007AFF), Rouge (#e74c3c), Vert (#34C759)
- **Style** : Material Design avec ombres et bordures arrondies
- **Responsive** : Adaptation automatique aux différentes tailles d'écran

### Composants UI
- Boutons avec états (normal, disabled, loading)
- Cartes avec ombres et bordures
- Indicateurs de chargement
- Alertes et messages d'erreur

## 🚧 Fonctionnalités à développer

### Écrans en cours de développement
- 🎮 **GameScreen** : Interface de jeu principale
- 🏠 **LobbyScreen** : Gestion des lobbies et des joueurs
- 🔐 **LoginScreen** : Authentification des utilisateurs

### Fonctionnalités futures
- Gestion des rôles et des phases de jeu
- Système de chat en temps réel
- Gestion des parties multijoueur
- Notifications push

## 🔧 Configuration

### TypeScript
- Configuration stricte activée
- Support complet de React Native
- Types pour toutes les interfaces

### Navigation
- React Navigation v6
- Navigation par pile (Stack Navigator)
- Headers personnalisés

### API
- Fetch API native
- Gestion d'erreurs robuste
- Typage générique pour toutes les réponses

## 📱 Déploiement

### Android
1. Configurer Android Studio
2. Créer un APK de debug : `npm run android`
3. Tester sur émulateur ou appareil physique

### iOS
1. Configurer Xcode
2. Ouvrir le projet dans Xcode
3. Lancer sur simulateur ou appareil physique

## 🐛 Dépannage

### Problèmes courants
- **Metro bundler** : Redémarrer avec `npm start`
- **Dépendances** : Nettoyer avec `npm install --force`
- **Cache** : Nettoyer le cache Metro avec `npx react-native start --reset-cache`

### Logs
- Utiliser `console.log()` pour le débogage
- Logs visibles dans Metro bundler et console de développement

## 📚 Ressources

### Documentation
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)

### Support
- Vérifier la compatibilité des versions
- Consulter la documentation officielle
- Utiliser les outils de débogage intégrés

---

**🎯 Votre application mobile Wendigo Game est maintenant prête pour le développement !**
