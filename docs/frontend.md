# 🎮 Frontend Wendigo Game - État Actuel et Instructions de Reconstruction

## ⚠️ **ATTENTION : Frontend Réinitialisé**

**Le frontend a été complètement réinitialisé** - tous les fichiers sont vides (0 bytes). Cette documentation décrit l'état actuel et fournit les instructions pour reconstruire le frontend.

## 📊 **État Actuel du Frontend**

### **Structure des Dossiers (Préservée)**
```
frontend/
├── shared/                    # Code partagé entre mobile et web
│   ├── components/
│   │   ├── common/           # Composants génériques (VIDES)
│   │   │   ├── Button.tsx    
│   │   │   ├── Card.tsx      
│   │   │   ├── Modal.tsx     
│   │   │   ├── Input.tsx     
│   │   │   ├── Badge.tsx     
│   │   │   └── index.ts      
│   │   ├── game/             # Composants de jeu (VIDES)
│   │   │   ├── PhaseIndicator.tsx  
│   │   │   ├── PlayerCard.tsx      
│   │   │   ├── ChairSelector.tsx   
│   │   │   ├── VoteSystem.tsx      
│   │   │   ├── ChatSystem.tsx      
│   │   │   ├── GameHistory.tsx     
│   │   │   └── index.ts      
│   │   ├── auth/             # Composants d'auth (VIDES)
│   │   │   ├── LoginForm.tsx 
│   │   │   ├── RegisterForm.tsx 
│   │   │   └── index.ts      
│   │   ├── lobby/            # Composants de lobby (VIDES)
│   │   │   ├── LobbyList.tsx 
│   │   │   ├── LobbyChat.tsx 
│   │   │   ├── PlayerList.tsx 
│   │   │   └── index.ts      
│   │   ├── types/            # Types TypeScript (VIDES)
│   │   ├── utils/            # Utilitaires (VIDES)
│   │   └── constants/        # Constantes (VIDES)
├── mobile/                    # Application React Native
│   ├── src/
│   │   ├── screens/          # Écrans (VIDE)
│   │   ├── navigation/       # Navigation (VIDE)
│   │   └── services/         # Services (VIDE)
│   ├── App.tsx               
│   └── package.json          
├── web/                       # Version web
│   ├── src/
│   │   ├── pages/            # Pages (VIDE)
│   │   └── services/         # Services (VIDE)
│   ├── App.tsx               
│   └── package.json          
└── package.json               
```

### **Fichiers Vides Identifiés**
- ✅ **Structure des dossiers** : Préservée
- ❌ **Tous les composants** : 0 bytes (vides)
- ❌ **Tous les fichiers de configuration** : 0 bytes (vides)
- ❌ **Tous les types et utilitaires** : 0 bytes (vides)

## 🚀 **Instructions de Reconstruction du Frontend**

### **Étape 1 : Initialisation du Projet**

```bash
# Naviguer vers le dossier frontend
cd frontend

# Initialiser le projet principal
npm init -y

# Installer les dépendances React Native
npm install react react-native react-native-web expo expo-cli

# Installer les dépendances de développement
npm install --save-dev @types/react @types/react-native typescript
```

### **Étape 2 : Configuration TypeScript**

Créer `tsconfig.json` dans `frontend/` :

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "shared/**/*",
    "mobile/**/*",
    "web/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### **Étape 3 : Configuration Expo**

Créer `app.json` dans `frontend/` :

```json
{
  "expo": {
    "name": "Wendigo Game",
    "slug": "wendigo-game",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e293b"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1e293b"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### **Étape 4 : Reconstruction des Composants**

#### **4.1 Composants Communs (`shared/components/common/`)**

**Button.tsx** - Bouton réutilisable avec variantes :
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  children,
  style,
  textStyle
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Variantes
  primary: {
    backgroundColor: '#dc2626',
  },
  secondary: {
    backgroundColor: '#475569',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  success: {
    backgroundColor: '#16a34a',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  // Tailles
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  // États
  disabled: {
    opacity: 0.5,
  },
  // Texte
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  dangerText: {
    color: '#ffffff',
  },
  successText: {
    color: '#ffffff',
  },
  ghostText: {
    color: '#64748b',
  },
});

export default Button;
```

**Card.tsx** - Conteneur avec variantes :
```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  variant?: 'elevated' | 'flat' | 'interactive';
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  style,
  onPress
}) => {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  elevated: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flat: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  interactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default Card;
```

#### **4.2 Types TypeScript (`shared/types/index.ts`)**

```typescript
// Types de base du jeu
export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isReady: boolean;
  selectedChair?: number;
  team: 'village' | 'wolves';
  color: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  team: 'village' | 'wolves';
  power: string;
  isActive: boolean;
}

export interface Game {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  phase: 'day' | 'night';
  timeRemaining: number;
  totalTime: number;
  players: Player[];
  currentPlayer?: Player;
  selectedChair?: number;
  round: number;
  maxRounds: number;
}

export interface Lobby {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'open' | 'full' | 'playing';
  hostId: string;
  players: Player[];
  settings: GameSettings;
}

export interface GameSettings {
  maxPlayers: number;
  timeLimit: number;
  allowSpectators: boolean;
  customRoles: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'lobby' | 'game' | 'wolves' | 'ghosts' | 'medium';
}

export interface Vote {
  id: string;
  voterId: string;
  targetId: string;
  type: 'accusation' | 'condemnation';
  timestamp: Date;
}
```

### **Étape 5 : Configuration des Applications**

#### **5.1 Application Mobile (`mobile/`)**

**package.json** :
```json
{
  "name": "wendigo-game-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "react-navigation": "^4.4.4",
    "react-navigation-stack": "^2.10.4",
    "@react-native-async-storage/async-storage": "1.21.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  }
}
```

**App.tsx** :
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### **5.2 Application Web (`web/`)**

**package.json** :
```json
{
  "name": "wendigo-game-web",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start --web",
    "build": "expo build --web",
    "serve": "npx serve web-build"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "react-native-web": "~0.19.6",
    "react-dom": "18.2.0",
    "react-router-dom": "^6.8.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@types/react-dom": "~18.2.17",
    "typescript": "^5.1.3"
  }
}
```

**App.tsx** :
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './src/pages/LoginPage';
import LobbyPage from './src/pages/LobbyPage';
import GamePage from './src/pages/GamePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </Router>
  );
}
```

## 🔧 **Scripts de Reconstruction Automatique**

### **Script PowerShell (Windows)**
```powershell
# reconstruction-frontend.ps1
Write-Host "🔧 Reconstruction du Frontend Wendigo Game..." -ForegroundColor Green

# Nettoyage des fichiers vides
Get-ChildItem -Path "frontend" -Recurse -File | Where-Object { $_.Length -eq 0 } | Remove-Item -Force

# Installation des dépendances
Set-Location frontend
npm install

# Installation des dépendances mobile
Set-Location mobile
npm install

# Installation des dépendances web
Set-Location ../web
npm install

# Retour au dossier racine
Set-Location ..

Write-Host "✅ Frontend reconstruit avec succès !" -ForegroundColor Green
```

### **Script Bash (Linux/Mac)**
```bash
#!/bin/bash
# reconstruction-frontend.sh

echo "🔧 Reconstruction du Frontend Wendigo Game..."

# Nettoyage des fichiers vides
find frontend -type f -size 0 -delete

# Installation des dépendances
cd frontend && npm install
cd mobile && npm install
cd ../web && npm install
cd ..

echo "✅ Frontend reconstruit avec succès !"
```

## 📋 **Checklist de Reconstruction**

- [ ] **Initialisation** : `npm init` dans `frontend/`
- [ ] **Dépendances principales** : React Native, Expo, TypeScript
- [ ] **Configuration TypeScript** : `tsconfig.json`
- [ ] **Configuration Expo** : `app.json`
- [ ] **Composants communs** : Button, Card, Modal, Input, Badge
- [ ] **Types TypeScript** : Interfaces Player, Game, Lobby, etc.
- [ ] **Application mobile** : Navigation, écrans, services
- [ ] **Application web** : Routes, pages, services
- [ ] **Tests** : Vérification du fonctionnement
- [ ] **Documentation** : Mise à jour des guides

## 🚨 **Prochaines Étapes**

1. **Exécuter les scripts de reconstruction**
2. **Vérifier que tous les composants fonctionnent**
3. **Tester sur mobile et web**
4. **Intégrer avec le backend .NET**
5. **Déployer la version web**

---

## 📚 **Ressources de Référence**

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://github.com/necolas/react-native-web)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**⚠️ Note importante** : Cette documentation reflète l'état actuel du frontend (réinitialisé). Tous les composants et configurations doivent être recréés selon les instructions ci-dessus.