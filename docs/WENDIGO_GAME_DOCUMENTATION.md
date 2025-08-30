# 🐺 Wendigo Game - Jeu de Loup-Garou Évolué & Immersif

## 📖 Description du Jeu

**Wendigo Game** est un jeu de loup-garou (werewolf) **hybride présentiel-numérique** où **tous les joueurs ont des pouvoirs uniques**. Contrairement au jeu classique, il n'y a **pas de villageois** - chaque participant a un rôle spécial avec des capacités distinctes.

**🎯 Concept Unique :** 8 à 29 personnes se réunissent **physiquement dans la même pièce**, ouvrent leurs navigateurs sur la même URL, et jouent ensemble en utilisant la technologie comme support au jeu social traditionnel.

### 🌟 **Pourquoi ce Concept Hybride ?**

**Avantages du Présentiel :**
- **Communication naturelle** : Discussions en face à face, langage corporel, expressions
- **Ambiance immersive** : Tension palpable, rires partagés, émotions collectives
- **Stratégie sociale** : Observation directe des comportements et réactions

**Avantages du Numérique :**
- **Gestion automatique** : Phases, timers, résolution des pouvoirs
- **Interface claire** : Affichage des rôles, chat structuré, votes organisés
- **Équilibrage parfait** : Attribution automatique des rôles selon le nombre de joueurs
- **📱 Système de vibration séquentielle** : Réveil aléatoire des joueurs la nuit
- **🪑 Système de sélection de chaises** : Interface numérique pour valider la position physique

**Résultat :** Le meilleur des deux mondes - la richesse sociale du jeu de table avec la précision et l'organisation du numérique !

### 🎯 Concept Principal
- **Deux équipes** : Les **Méchants** (Loups) vs Les **Villageois** (Défenseurs)
- **Tous les joueurs ont des pouvoirs** : Pas de rôles passifs
- **29 rôles uniques** : 23 Villageois + 6 Loups avec des capacités distinctes
- **Jeu d'équipe stratégique** : Communication et coordination essentielles
- **Équilibrage complexe** : Chaque rôle a ses forces et faiblesses

## 🏗️ Architecture du Projet

### 🚨 **ATTENTION : Frontend Réinitialisé**

**Le frontend a été complètement réinitialisé** - tous les fichiers sont vides (0 bytes). La structure des dossiers est préservée mais tous les composants et configurations doivent être recréés.

### **État Actuel du Frontend**

```
frontend/
├── shared/                    # Code partagé entre mobile et web
│   ├── components/           # Tous les composants sont VIDES (0 bytes)
│   ├── types/                # Types TypeScript VIDES
│   ├── utils/                # Utilitaires VIDES
│   └── constants/            # Constantes VIDES
├── mobile/                    # Application React Native
│   ├── src/                  # Dossiers vides
│   ├── App.tsx               # 0 bytes
│   └── package.json          # 0 bytes
├── web/                       # Version web
│   ├── src/                  # Dossiers vides
│   ├── App.tsx               # 0 bytes
│   └── package.json          # 0 bytes
└── package.json               # 0 bytes
```

### **Approche Prévue : React Native + React Native Web**

**Objectif** : Créer une solution unifiée qui couvre à la fois les applications mobiles (Android + iOS) et le web avec une seule base de code.

#### **🎯 Avantages de React Native + Web :**

**1. Codebase Unique :**
- **Un seul codebase** pour développer les composants de jeu
- **Partage de code** entre mobile et web (95% de code commun)
- **Développement centralisé** : Une seule équipe, une seule base de code

**2. Écosystème Riche :**
- **React Native Web** traduit automatiquement les composants RN en HTML
- **Expo** gère Android, iOS et Web avec le même projet
- **Libraries compatibles** : Callstack, UI kits, etc.

**3. Expérience Native :**
- **API Vibration** native pour le système de réveil séquentiel
- **Performance native** : Pas de WebView lourd comme Cordova
- **Rendu natif** : Interface fluide et responsive

**4. Stratégie de Déploiement :**
- **Objectif immédiat** : Site web accessible via URL (95% du besoin couvert)
- **Objectif long terme** : Applications App Store/Play Store pour immersion totale
- **Progression naturelle** : Du web vers le mobile natif

### **Versions Existantes**
- **v1** : Java Spring Boot + React (complexe)
- **v2** : Python FastAPI + WebSockets (intermédiaire)
- **v3** : **React Native + React Native Web** (nouvelle approche unifiée) - **EN COURS DE RECONSTRUCTION**

### **Structure Prévue (Après Reconstruction)**
```
WendiGame/
├── backend/              # API .NET Core (inchangée)
├── shared/               # Code partagé entre mobile et web
│   ├── components/       # Composants React Native communs
│   ├── types/            # Types TypeScript partagés
│   └── utils/            # Utilitaires communs
├── mobile/               # Application React Native
│   ├── src/
│   │   ├── screens/      # Écrans de l'application
│   │   ├── navigation/   # Navigation mobile
│   │   └── services/     # Services et API
│   ├── App.tsx           # Point d'entrée mobile
│   └── package.json      # Dépendances React Native
├── web/                  # Version web avec React Native Web
│   ├── src/
│   │   ├── pages/        # Pages web spécifiques
│   │   └── services/     # Services adaptés au web
│   ├── App.tsx           # Point d'entrée web
│   └── package.json      # Dépendances React Native Web
└── shared/               # Code partagé entre mobile et web
    ├── components/       # Composants communs
    ├── types/            # Types TypeScript partagés
    └── utils/            # Utilitaires communs
```

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

## 🎮 Système de Jeu

### 👥 Rôles et Équipes

#### 🐺 **Équipe des Méchants (Loups)**
1. **Skinwalker** - Loup métamorphe *old*
   - Pouvoir : Peut voter avec les autres loups pour tuer un joueur la nuit.
   - Phase d'action : La nuit

2. **Bouc Émissaire** - Loup sacrifié *old*
   - Pouvoir : Connaît l'identité des autres loups mais ne peut pas voter avec eux.
   - Phase d'action : La nuit

3. **Warlord** - Chef de guerre *old*
   - Ne fait pas partie du groupe des Loups mais gagne avec eux. Peut une fois par partie protéger un Loup d'une attaque, et connaît l'identité des Loups.
   - Phase d'action : Le jour

4. **Sbire** - Serviteur loyal *new*
   - Pouvoir : Ne fait pas partie du groupe des loups mais gagne avec eux. Peut une fois par partie protéger un loup d'une attaque.
   - Phase d'action : Aucune

5. **Marchand de Sable** - Maître des rêves *new*
   - Pouvoir : Peut endormir le village et passé pardessus la phase d'accusation. Donc on passe de la phase de jour a la phase de nuit directement. Une fois activé durant la nuit le pouvoir sera actif au prochain tour.
   - Phase d'action : La nuit

6. **Pestiféré** - Loup maudit *old*
   - Pouvoir : Sa morsure contamine : si sa cible decide de ne pas ce suicidé, elle devient infectée et rejoint les loups au bout de 2 nuits.
   - Phase d'action : La nuit

#### 🛡️ **Équipe des Villageois (Défenseurs)**
1. **Voyante** - Détective *old*
   - Pouvoir : Peut révéler l'identité d'un joueur et la connaitre
   - Phase d'action : La nuit

2. **Épouvantail** - Protecteur des champs *old*
   - Pouvoir : Peut protéger une fois par partie les deux joueur assit a sa gauche et a sa droite contre une attaque.       
   - Phase d'action : La nuit


3. **Corbeau** - Messager nocturne *old*
   - Pouvoir : Peut désigner un joueur chaque nuit ; ce joueur reçoit un vote supplémentaire automatique au prochain conseil.
   - Phase d'action : La nuit


4. **Renard** - Chasseur rusé *old*
   - Pouvoir : Peut flairer les 3 joueurs a sa gauche 1 fois durant la partie pour savoir si un loup est parmi eux.
   - Phase d'action : La nuit


5. **Rêveur** - Voyant des songes *old*
   - Chaque nuit, peut voir quel joueur est désigné par les Loups comme cible.
   - Phase d'action : Le jour

6. **Poltergeist** - Esprit perturbateur *old*
   - Il peut dessigner un joueur et ouvrir un chat privé avec cette personne tout le long de la partie, mais une fois mort.
   - Phase d'action : La jour

7. **Coroner** - Expert médico-légal *old*
   - Pouvoir : Une fois par partie, lorsqu'un joueur meurt, il peut déterminer si la mort a été causée par un Méchant ou un Villageois.
   - Phase d'action : La jour

8. **Psychopompe** - Guide des âmes *old*
   - Pouvoir : Une fois par partie, peut prendre aléatoirement le pouvoir d'un joueur mort et l'utiliser pendant la nuit suivante.
   - Phase d'action : La nuit

9. **Ensorceleuse** - Magicienne de charme *erreur*
   - Pouvoir : Peut hanter un joueur chaque nuit, ce qui empêche son pouvoir de fonctionner.
   - Phase d'action : La nuit

10. **Sorcière** - Guérisseuse *old*
    - Pouvoir : Au début de la partie, choisit Potion de protection (devient Villageois) ou Poison (devient Méchant).
    - Phase d'action : La nuit

11. **Chaperon** - Protectrice des innocents *old*
    - Pouvoir : Ne peut pas mourir tant que le Chasseur est en vie. Si le Chasseur meurt, elle perd cette immunité.
    - Phase d'action : Aucune

12. **Chasseur** - Combattant principal *old*
    - Pouvoir : Quand il est tué (par les loups ou par vote), il peut immédiatement abattre un joueur de son choix.
    - Phase d'action : A sa mort

13. **Jumeaux** - Duo inséparable *old*
    - Pouvoir : Les deux connaissent leur identité mutuelle dès le début. Et on un chat privé ensemble.
    - Phase d'action : Aucune

14. **Insomniaque** - Veilleur nocturne *old*
    - Pouvoir : Peut espionner un joueur chaque nuit pour savoir si cette personne a utilisé son pouvoir (active) ou non (inactive) durant cette nuit. Insensible aux pouvoirs qui endorment (ex. Marchand de sable)
    - Phase d'action : La nuit

15. **Courtisane** - Séductrice *old*
    - Pouvoir : Chaque nuit, peut dormir chez un joueur voisin ; si ce joueur est un Loup elle meurt, sinon elle est protégée si les Loups la ciblent.
    - Phase d'action : La nuit

16. **Salvateur** - Sauveur de l'humanité *old* 
    - Pouvoir : Une fois par partie, peut ramener un joueur à la vie.
    - Phase d'action : La nuit

17. **Avocat du Diable** - Défenseur controversé *new*
    - Pouvoir : Peut choisir un joueur par jour et annuler les votes contre lui. Si le joueur protégé est un loup, il meurt lui-même à la place.
    - Phase d'action : La nuit

18. **Guerrier** - Combattant d'élite *new*
    - Pouvoir : Peut défier un joueur en duel (la nuit). Si c'est un loup, le loup meurt. S'il échoue, il tuera un villageois et perdera son pouvoir. Si il reussit il retrouvera son pouvoir.
    - Phase d'action : La nuit

19. **Curieux** - Investigateur *erreur*
    - Pouvoir : Peut une fois par partie obtenir directement le rôle exact d'un joueur.
    - Phase d'action : La jour

20. **Médium** - Communique avec les morts *old*
    - Pouvoir : Peut avoir acces au chat des fantome de facon anonyme. Les autres dans le chat ne seront pas qui est le joueur.
    - Phase d'action : Aucune

21. **Ancien** - Sage du village *old*
    - Pouvoir : Connaît au début de la partie le nombre exact de joueurs Méchants vivants, et perd cette information une fois mort.
    - Phase d'action : Aucune

22. **Garde du Corps** - Protecteur personnel *new*
    - Pouvoir : Peut protéger un joueur contre toute attaque une fois par partie.
    - Phase d'action : La nuit

23. **Shérif** - Gardien de la loi *new*
    - Pouvoir : Peut désigner un joueur par jour et le mettre en prison (ne vote pas, ne joue pas la nuit).
    - Phase d'action : La jour

#### 👻 **Rôle Post-Mortem - Fantôme**
**Fantôme** - Esprit du village *new*
- **Transformation automatique** : Tous les joueurs morts deviennent automatiquement des Fantômes
- **Conservation de l'équipe** : Le joueur reste dans son équipe d'origine (Méchant ou Villageois)
- **Accès au chat** : Seuls les Fantômes et le Médium peuvent utiliser le chat pendant la partie
- **Communication stratégique** : Les Fantômes peuvent discuter entre eux et avec le Médium
- **Influence indirecte** : Participation aux discussions pour influencer les joueurs vivants
- **Rôle unique** : Premier rôle qui se transforme automatiquement selon l'état du joueur

### 🌙 Comment se déroule une partie

Une partie de WendiGame suit une boucle précise qui transforme le jeu classique en véritable drame social.

#### **Phase Pré-Jeu : Connexion et Lobby**

**🏠 Préparation de la Session**
- **Réunion physique** : 8 à 29 joueurs se réunissent dans la même pièce
- **Connexion simultanée** : Chacun ouvre son navigateur et tape l'URL du jeu
- **Équipement** : Ordinateurs portables, tablettes ou smartphones (WiFi requis)

**1. Authentification**
- **Connexion** : Le joueur se connecte avec son compte existant
- **Création de compte** : Ou crée un nouveau compte s'il n'en a pas
- **Profil** : Accès à son historique de parties et statistiques

**2. Accès aux Lobbys**
- **Liste des lobbys** : Affichage de tous les lobbys disponibles
- **Création de lobby** : Chaque joueur peut créer son propre lobby
- **Paramètres du lobby** : Définition du nombre min/max de joueurs
- **Rejoindre un lobby** : Possibilité de rejoindre n'importe quel lobby ouvert

**3. Préparation de la Partie**
- **Attente des joueurs** : Le lobby se remplit progressivement
- **Bouton "Prêt"** : Chaque joueur confirme qu'il est prêt à jouer
- **Vérification des conditions** : Le système vérifie que le nombre de joueurs est dans la plage min/max
- **Démarrage automatique** : La partie commence dès que toutes les conditions sont remplies

**4. Transition vers le Jeu**
- **Sortie du lobby** : Tous les joueurs quittent automatiquement le lobby
- **Interface de jeu** : Redirection vers l'interface de partie
- **Attribution des rôles** : Distribution aléatoire des 29 rôles selon le nombre de joueurs
- **Système de chaises** : Les joueurs doivent sélectionner la chaise où ils sont physiquement assis

#### **La boucle de base**
```
Tant qu'il reste des loups ET des villageois → Le jeu continue
Sinon → Fin de Partie
```

#### **Phase Jour (Social) - 10 minutes**
**Système de Sélection de Chaises :**
- **Disposition physique** : Les chaises sont disposées en cercle dans la pièce
- **Nombre de chaises** : Exactement le même nombre que de joueurs vivants
- **Sélection de chaise** : Chaque joueur doit sélectionner la chaise où il est physiquement assis
- **Interface numérique** : Les chaises sont numérotées et affichées à l'écran
- **Sélection unique** : Un joueur ne peut sélectionner qu'une seule chaise à la fois
- **Timing de sélection** : Les chaises ne deviennent sélectionnables qu'à partir de 8 minutes de la phase Jour
- **Chaises exclusives** : Une fois qu'un joueur sélectionne une chaise, elle devient indisponible pour les autres joueurs
- **Défaut de sélection** : Si un joueur n'a pas sélectionné sa chaise dans les 2 dernières minutes, il est exclu de la phase d'accusation mais peut toujours être mis sur le bûcher

**Processus de Sélection :**
1. **Arrivée physique** : Les joueurs s'assoient sur les chaises disposées en cercle
2. **Connexion numérique** : Chaque joueur se connecte et rejoint le lobby
3. **Attente de sélection** : Les chaises ne sont pas encore sélectionnables (0-8 minutes)
4. **Ouverture de sélection** : À 8 minutes, les chaises deviennent sélectionnables
5. **Sélection de chaise** : Le joueur sélectionne le numéro de la chaise où il est assis
6. **Confirmation et verrouillage** : La sélection est validée, la chaise devient indisponible pour les autres
7. **Fin de sélection** : À 10 minutes, toutes les sélections sont définitives

**Conséquences de la Non-Sélection :**
- **Exclusion du vote d'accusation** : Le joueur ne peut pas voter pour accuser quelqu'un
- **Vulnérabilité au bûcher** : Il peut toujours être accusé et mis sur le bûcher par les autres
- **Participation limitée** : Il peut discuter mais pas participer activement aux accusations

**Avantages de ce Système :**
- **Lien physique-numérique** : Connexion directe entre l'espace physique et l'interface
- **Stratégie de placement** : Les joueurs peuvent choisir leur position stratégiquement
- **Gestion des absences** : Les chaises vides correspondent aux joueurs morts
- **Immersion renforcée** : L'espace physique devient partie intégrante du jeu
- **Course contre la montre** : Les 2 dernières minutes créent une tension stratégique
- **Choix irréversible** : Une fois sélectionnée, la chaise est verrouillée pour les autres
- **Coordination d'équipe** : Les joueurs doivent se coordonner pour ne pas se bloquer mutuellement

#### **Phase Soir (Conseil du Village)**
**Système de vote d'accusation :**
- **Phase du conseil** : Une seule accusation par phase jour
- **Vote d'accusation** : Tous les joueurs votent pour qui ils veulent voir sur le bûcher
- **Sélection du condamné** : Le joueur avec le plus de votes va plaider son innocence
- **Plaidoirie** : Le condamné a **1 minute** pour plaider son innocence devant tout le village
- **Vote de condamnation** : Après la plaidoirie, tous les joueurs votent pour **tuer** ou **épargner**
- **Fin de phase** : Après le vote de condamnation, la nuit tombe et les joueurs commettent leurs actions
- **Historique des votes** : Tous les votes sont conservés et affichés dans un historique accessible

**Avantages de ce système :**
- **Justice équitable** : Une seule accusation par jour, chaque accusé a sa chance de se défendre
- **Stratégie collective** : Les joueurs doivent coordonner leurs votes pour une seule accusation
- **Tension dramatique** : Le conseil du village devient un moment crucial et unique
- **Plaidoirie structurée** : 1 minute de défense pour chaque accusé
- **Transparence totale** : Tous les votes sont visibles et traçables
- **Transition claire** : Après le conseil, la nuit tombe automatiquement

#### **Phase Nuit - Système de Vibration Séquentielle**
**Réveil aléatoire des joueurs :**
- **Vibration séquentielle** : Chaque joueur reçoit une vibration un après l'autre de façon aléatoire
- **Réveil individuel** : Le téléphone du joueur vibré s'illumine et vibre
- **Temps d'action** : Le joueur a **15 secondes** pour réaliser son action
- **Bouton "Continuer"** : Si le joueur n'a pas d'action, un simple bouton "Continuer" s'affiche
- **Transition** : Après les 15 secondes, **5 secondes d'attente** avant le prochain joueur
- **Ordre aléatoire** : Tous les joueurs jouent leur action dans un ordre complètement aléatoire
- **Priorisation finale** : À la fin, le programme applique les actions selon l'ordre de priorité logique

#### **Phase Jour - Chat des Loups (Nouveau)**
**Communication limitée des loups :**
- **Chat exclusif** : Seuls les loups peuvent accéder au chat pendant la phase Jour
- **Un message par jour** : Chaque loup a droit à un seul message par phase Jour
- **Limite de caractères** : Maximum 15 caractères par message
- **Coordination stratégique** : Les loups doivent se coordonner pour voter unanimement
- **Vote unanime requis** : Tous les loups doivent voter pour la même victime pour tuer
- **Échec du meurtre** : Si les votes divergent, aucune victime n'est tuée

**Processus complet :**
1. **Vibration aléatoire** → Un joueur est réveillé
2. **Réveil et action** → 15 secondes pour agir ou cliquer "Continuer"
3. **Transition** → 5 secondes d'attente
4. **Prochain joueur** → Vibration du joueur suivant (ordre aléatoire)
5. **Répétition** → Jusqu'à ce que tous les joueurs aient joué
6. **Résolution** → Application des actions selon l'ordre de priorité

##### **Ordre de Priorité pour la Résolution des Actions :**
**1. Actions de Contrôle (Priorité 1)**
- Marchand de Sable - Endort sa cible
- Ensorceleuse - Hante sa cible
- Shérif - Met en prison

**2. Actions de Protection (Priorité 2)**
- Épouvantail - Protège sa cible
- Garde du Corps - Protection unique
- Warlord - Protection d'un loup
- Sbire - Protection d'un loup

**3. Actions d'Attaque (Priorité 3)**
- Guerrier - Duel nocturne
- Courtisane - Dormir chez un voisin

**4. Actions des Loups (Priorité 4)**
- **Vote unanime requis** : Tous les loups doivent voter pour la même victime
- **Coordination via chat** : Communication limitée (1 message/jour, max 15 caractères)
- **Échec si divergence** : Aucune victime tuée si les votes ne sont pas unanimes
- **Skinwalker** - Vote avec les loups (doit s'aligner avec la majorité)
- **Pestiféré** - Contamination (si la victime survit)

**5. Actions d'Information (Priorité 5)**
- Voyante - Révèle l'identité
- Renard - Flaire les loups
- Rêveur - Voir la cible des loups
- Insomniaque - Espionne l'activité
- Curieux - Révèle le rôle exact

**6. Actions de Support (Priorité 6)**
- Corbeau - Vote supplémentaire
- Psychopompe - Copie un pouvoir mort

**7. Actions de Résurrection (Priorité 7)**
- Salvateur - Ramène à la vie

**8. Actions Post-Mortem (Priorité 8)**
- Coroner - Analyse la cause de mort
- Poltergeist - Communication post-mortem

#### **Phase Réveil**
On annonce les morts de la nuit. Le village se réorganise avec les nouvelles informations.

### 🏠 **Système de Lobby Avancé**

### 🔥 **Système de Bûcher Dynamique**

### 👻 **Système de Fantômes et Chat Restreint**

### 🐺 **Système de Vote Unanime des Loups**

### 📚 **Système d'Historique Complet de Partie**

#### **Fonctionnalités de l'Historique**
- **Enregistrement automatique** : Tous les événements sont capturés en temps réel
- **Timeline interactive** : Navigation fluide dans l'historique chronologique
- **Filtres avancés** : Recherche et tri par multiples critères
- **Détails contextuels** : Chaque action avec son contexte complet
- **Statistiques dynamiques** : Compteurs et métriques en temps réel
- **Export flexible** : Sauvegarde et partage de l'historique complet

#### **Avantages de l'Historique Complet**
- **Transparence totale** : Tous les joueurs peuvent revoir ce qui s'est passé
- **Analyse stratégique** : Comprendre les décisions et leurs conséquences
- **Apprentissage** : Améliorer sa stratégie en analysant les parties passées
- **Justice équitable** : Vérifier que toutes les règles ont été respectées
- **Engagement continu** : Les joueurs restent impliqués même après la partie
- **Partage d'expérience** : Discuter des moments clés avec d'autres joueurs
- **Archivage** : Conserver l'histoire des parties mémorables
- **Débogage** : Identifier et corriger les problèmes techniques

#### **Fonctionnalités du Vote Unanime**
- **Coordination obligatoire** : Tous les loups doivent voter pour la même victime
- **Chat limité** : 1 message par jour, maximum 15 caractères
- **Communication stratégique** : Les loups doivent se coordonner efficacement
- **Vote unanime requis** : Aucun meurtre si les votes divergent
- **Échec du meurtre** : Si un seul loup vote différemment, la victime survit
- **Stratégie d'équipe** : Les loups doivent former une alliance cohérente

#### **Avantages du Système de Vote Unanime**
- **Stratégie profonde** : Les loups doivent vraiment se coordonner
- **Communication limitée** : Évite le spam et garde le jeu équilibré
- **Tension accrue** : Chaque vote compte et peut faire échouer le meurtre
- **Équilibrage naturel** : Rendre le meurtre plus difficile pour les loups
- **Alliance nécessaire** : Les loups doivent vraiment travailler ensemble
- **Suspense maintenu** : Le village ne sait jamais si un meurtre va réussir

#### **Fonctionnalités des Fantômes**
- **Transformation automatique** : Changement de rôle instantané à la mort
- **Conservation de l'équipe** : Maintien de l'allégeance d'origine
- **Accès exclusif au chat** : Seuls les Fantômes et le Médium peuvent chatter
- **Communication stratégique** : Discussions entre Fantômes et avec le Médium
- **Influence indirecte** : Participation aux débats sans pouvoir voter
- **Rôle post-mortem** : Premier système de transformation automatique de rôle

#### **Avantages du Système de Fantômes**
- **Engagement continu** : Les joueurs morts restent actifs dans la partie
- **Stratégie post-mortem** : Les Fantômes peuvent influencer les vivants
- **Communication restreinte** : Évite le spam et garde le chat organisé
- **Rôle du Médium renforcé** : Seul lien entre vivants et morts
- **Équilibrage maintenu** : Les morts ne peuvent pas voter ou agir directement
- **Immersion accrue** : Sentiment de "vie après la mort" dans le jeu

#### **Fonctionnalités du Bûcher**
- **Vote d'accusation unique** : Une seule accusation par phase jour
- **Affichage des votes** : Compteur visible pour chaque joueur accusé
- **Sélection du condamné** : Le joueur le plus voté va plaider son innocence
- **Zone de plaidoirie** : Interface dédiée pour la défense de l'accusé (1 minute)
- **Vote de condamnation** : Système de vote final (tuer/épargner)
- **Historique complet** : Tous les votes conservés et accessibles
- **Transition automatique** : Après le vote, la nuit tombe automatiquement

#### **Avantages du Système de Bûcher**
- **Justice équitable** : Une seule accusation par jour, chaque accusé a sa chance de se défendre
- **Stratégie collective** : Les joueurs doivent coordonner leurs votes pour une seule accusation
- **Tension dramatique** : Le conseil du village devient un moment crucial et unique
- **Plaidoirie structurée** : 1 minute de défense pour chaque accusé
- **Transparence totale** : Tous les votes sont visibles et traçables
- **Transition claire** : Après le conseil, la nuit tombe automatiquement

#### **Fonctionnalités du Lobby**
- **Chat en temps réel** : Communication entre joueurs avant la partie
- **Liste des joueurs** : Affichage de tous les participants avec leur statut
- **Paramètres de partie** : Configuration du nombre min/max de joueurs
- **Règles personnalisées** : Options pour activer/désactiver certains rôles
- **Temps d'attente** : Compteur pour encourager les joueurs à se préparer

#### **Gestion des Rôles**
- **Distribution automatique** : Attribution aléatoire des rôles selon le nombre de joueurs
- **Équilibrage dynamique** : Ajustement automatique pour maintenir l'équilibre
- **Rôles optionnels** : Possibilité d'exclure certains rôles pour des parties plus simples
- **Variantes** : Différentes configurations selon le nombre de joueurs (8-29)

### 🎯 **Pourquoi ce système ?**

**Justice sociale** : Chaque accusation a sa défense. Pas de lynchage sans débat équitable.

**Stratégie profonde** : Le temps de préparation (10 min) + le temps de décision (1 min) + le temps de débat (30+1 min) créent des choix tactiques complexes.

**Engagement constant** : Pas de temps mort. Chaque phase a son importance et son rythme.

**Dynamisme social** : Les accusations créent des alliances temporaires et révèlent des informations cachées.

**Équilibrage naturel** : Le système d'ordre de priorité garantit que les protections peuvent contrer les attaques.

### 🎭 **Expérience de Jeu Hybride**

#### **Pendant la Phase Jour (Social)**
- **Discussions physiques** : Les joueurs parlent, débattent et s'accusent en face à face
- **Interface numérique** : Utilisée pour afficher les informations, chronométrer les phases
- **Stratégie mixte** : Communication verbale + utilisation des outils numériques
- **Chat des loups** : Communication limitée entre loups (1 message/jour, max 15 caractères)
- **Coordination secrète** : Les loups doivent se coordonner pour voter unanimement

#### **Pendant la Phase Soir (Conseil du Village)**
- **Vote d'accusation unique** : Interface numérique pour voter contre un joueur (une seule accusation par jour)
- **Sélection du condamné** : Le joueur le plus voté va plaider son innocence
- **Plaidoirie orale** : L'accusé se défend pendant 1 minute devant tout le village
- **Vote de condamnation** : Interface numérique pour tuer ou épargner
- **Historique des votes** : Tous les votes conservés et accessibles
- **Transition automatique** : Après le vote, la nuit tombe automatiquement

#### **Pendant la Phase Nuit**
- **Silence physique** : Les joueurs ferment les yeux et attendent leur vibration
- **Réveil aléatoire** : Chaque joueur est réveillé individuellement par vibration
- **Action privée** : 15 secondes pour agir ou cliquer "Continuer"
- **Gestion automatique** : Le système résout les conflits selon l'ordre de priorité

#### **Système de Fantômes**
- **Transformation automatique** : Changement de rôle à la mort
- **Chat restreint** : Seuls les Fantômes et le Médium peuvent communiquer
- **Influence indirecte** : Les Fantômes observent et influencent les vivants
- **Stratégie post-mortem** : Participation continue malgré la mort

#### **Avantages de cette Approche**
- **Social authentique** : Vraies interactions humaines, pas de messages tapés
- **Technologie utile** : Gestion des règles complexes sans maître de jeu
- **Accessibilité** : Même les joueurs moins technophiles peuvent participer
- **Flexibilité** : Possibilité de jouer avec ou sans certains aspects numériques
- **Historique complet** : Traçabilité totale de tous les événements de la partie
- **Analyse post-partie** : Possibilité de revoir et analyser les moments clés
- **Immersion physique** : L'espace et le placement deviennent partie intégrante du jeu
- **Stratégie spatiale** : Les joueurs peuvent choisir leur position pour des avantages tactiques
- **Tension temporelle** : Les 2 dernières minutes créent une course contre la montre stratégique
- **Coordination d'équipe** : Les joueurs doivent se coordonner pour ne pas se bloquer mutuellement

## 📱 Interface Frontend - React Native + React Native Web

### 🎯 **Vue d'ensemble de l'Interface**

Wendigo Game est conçu comme une **application React Native unifiée** qui s'adapte automatiquement aux plateformes mobile (Android + iOS) et web grâce à **React Native Web**. Cette approche nous permet d'offrir une expérience de jeu immersive et intuitive sur tous les appareils.

### 🧩 **Architecture React Native Unifiée**

Notre frontend utilise **React Native** comme base commune, avec **React Native Web** pour la traduction automatique en HTML. Cette approche nous permet de :

- **Développer une seule fois** les composants de jeu
- **Partager 95% du code** entre mobile et web
- **Maintenir la cohérence** visuelle sur toutes les plateformes
- **Optimiser les performances** natives sur mobile

#### **Structure React Native Unifiée**
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

### 🚀 **Architecture de l'Interface avec Callstack**

#### **1. Page de Connexion - Composants Callstack**
- **`LoginForm`** : Formulaire de connexion avec validation
- **`RegisterForm`** : Formulaire d'inscription avec validation
- **`Button`** (variante primary) : Boutons d'action
- **`Card`** (variante elevated) : Conteneur du formulaire
- **`Input`** : Champs de saisie stylisés
- Design épuré et accueillant

#### **2. Système de Lobby - Composants Callstack**
- **`LobbyList`** : Affichage des lobbys disponibles avec statut (ouvert/fermé)
- **`LobbyChat`** : Chat en temps réel dans le lobby
- **`PlayerList`** : Liste des joueurs avec statut "Prêt"
- **`Button`** (variantes) : Créer lobby, rejoindre, confirmer prêt
- **`Card`** (variante interactive) : Cartes de lobby cliquables
- **`Modal`** : Configuration des paramètres de lobby
- **`Badge`** : Indicateurs de statut (ouvert, fermé, plein)
- **Remplissage progressif** du lobby en temps réel
- **Système de confirmation** : chaque joueur confirme qu'il est prêt
- **Vérification automatique** des conditions de début de partie
- **Redirection automatique** vers l'interface de partie

### 🎯 **Interface de Partie - Écran Principal avec Callstack**

#### **Header Épuré - Composants Callstack**
- **Logo du jeu** (coin supérieur gauche)
- **Menu hamburger discret** (≡) en haut à droite avec **`Modal`** pour le menu
- Design minimaliste et professionnel

#### **Zone Centrale - Cœur du Jeu - Composants Callstack**
- **`PlayerCard`** : Affichage du nom du joueur et informations personnelles
- **`PhaseIndicator`** : Phase actuelle avec indicateur visuel :
  - 🌞 **Jour** (10:00) - Interface claire et lumineuse
  - 🌙 **Nuit** (30s) - Interface sombre et bleutée
- **Compteur de phase** :
  - Barre de progression visible
  - Chiffres en temps réel
  - Animation de décompte avec changement de couleur

#### **Boutons Principaux - Interface Mobile-First - Composants Callstack**
- **`Button`** (variante ghost) : Zone Notes - Accès aux notes personnelles sur les joueurs
- **`Button`** (variante secondary) : Fiche Personnelle - Informations du joueur (nom, rôle, équipe, couleur)
- **`Button`** (variante secondary) : Règles du Jeu - Guide complet et accessible
- **`Button`** (variante primary/danger) : Bouton Action - Utilisation des pouvoirs selon la phase
  - **Bloqué** : Pouvoir non disponible (affichage visuel)
  - **Actif** : Pouvoir utilisable
  - **Cooldown** : Pouvoir en recharge

#### **Système de Sélection de Chaises - Composants Callstack**
- **`ChairSelector`** : Interface de chaises numérotées disposées en cercle
- **Sélection de chaise** : Interface pour choisir la chaise où le joueur est physiquement assis
- **Timing de sélection** : Les chaises ne deviennent sélectionnables qu'à partir de 8 minutes de la phase Jour
- **Chaises exclusives** : Une fois sélectionnée, une chaise devient indisponible pour les autres joueurs
- **Validation de sélection** : Confirmation visuelle de la chaise sélectionnée
- **Gestion des conflits** : Prévention de la sélection de la même chaise par plusieurs joueurs
- **Timer de sélection** : Compte à rebours des 2 dernières minutes pour finaliser la sélection
- **Indicateur de disponibilité** : Affichage visuel des chaises disponibles/occupées

#### **Système de Bûcher et Votes - Composants Callstack**
- **`VoteSystem`** : Bûcher d'accusation avec affichage en temps réel des votes
- **Vote d'accusation unique** : Interface pour voter contre un joueur (une seule accusation par jour)
- **Plaidoirie** : Zone de plaidoirie pour le joueur sur le bûcher (1 minute) avec **`Modal`**
- **Vote de condamnation** : Interface pour tuer ou épargner avec **`Button`** (variantes primary/danger)
- **Historique des votes** : Accès à tous les votes passés et présents

#### **Système de Chat Restreint - Composants Callstack**
- **`ChatSystem`** : Gestion centralisée de tous les types de chat
- **Chat des vivants** : Désactivé pendant la partie (seulement en lobby)
- **Chat des loups** : Accessible uniquement aux loups pendant la phase Jour (1 message/jour, max 15 caractères)
- **Chat des fantômes** : Accessible uniquement aux joueurs morts (Fantômes)
- **Chat du médium** : Le Médium peut communiquer avec les Fantômes
- **Communication stratégique** : Les Fantômes peuvent discuter entre eux
- **Influence indirecte** : Les Fantômes peuvent observer et influencer les vivants

#### **Système d'Historique Complet de Partie - Composants Callstack**
- **`GameHistory`** : Journal des événements avec tous les coups, actions et événements enregistrés
- **Timeline interactive** : Navigation chronologique dans l'historique de la partie
- **Filtres intelligents** : Recherche par phase, joueur, type d'action ou résultat avec **`Input`** et **`Badge`**
- **Détails complets** : Chaque action avec son contexte, timing et impact
- **Statistiques en temps réel** : Compteurs de votes, actions réussies/échouées
- **Export de partie** : Possibilité de sauvegarder l'historique complet avec **`Button`** (variante secondary)

### 🍔 **Menu Hamburger Complet - Composants Callstack**

#### **Navigation Principale - Composants Callstack**
- **`Modal`** : Conteneur principal du menu hamburger
- **`Button`** (variante ghost) : Règles du jeu - Guide complet et détaillé
- **`Button`** (variante ghost) : Notes personnelles - Système de prise de notes avancé
- **`Button`** (variante ghost) : Fiches joueurs - Profils détaillés de tous les participants
- **`Button`** (variante ghost) : Historique de partie - Timeline complète des événements et actions
- **`Button`** (variante ghost) : Statistiques - Métriques et compteurs en temps réel
- **`Button`** (variante primary) : Bouton pouvoir - Accès rapide aux capacités
- **`Button`** (variante danger) : Déconnexion - Sortie sécurisée du jeu

#### **Système de Notes Avancé - Composants Callstack**
- **`Input`** : Nom complet du joueur sélectionné
- **`Input`** (textarea) : Zone de notes personnelles (champ texte libre)
- **Sélecteur de rôle suspecté** avec émojis utilisant **`Badge`** :
  - 👨‍🌾 Villageois
  - 🧛 Loup-Garou
  - 🔮 Voyante
  - 🛡️ Garde
  - 🧪 Sorcière
  - Et autres rôles...
- **`Button`** (variante success) : Sauvegarde automatique des notes
- **Persistance** : les notes restent même si la phase change

## 📱 **Système de Vibration Séquentielle - Réveil Aléatoire des Joueurs**

### **Caractéristiques du Système de Vibration**
- **Vibration séquentielle** : Chaque joueur est réveillé un après l'autre de façon aléatoire
- **Réveil individuel** : Le téléphone du joueur vibré s'illumine et vibre
- **Temps d'action** : 15 secondes pour réaliser son action ou cliquer "Continuer"
- **Transition fluide** : 5 secondes d'attente entre chaque joueur
- **Ordre aléatoire** : Séquence complètement imprévisible pour tous les joueurs

### **Phases de Réveil Automatisées**
- **🌙 Début de nuit** : "La nuit tombe. Les joueurs ferment les yeux."
- **📱 Vibration aléatoire** : Un joueur est réveillé pour son tour
- **⏱️ Action** : 15 secondes pour agir ou cliquer "Continuer"
- **⏳ Transition** : 5 secondes d'attente
- **🔄 Prochain joueur** : Vibration du joueur suivant (ordre aléatoire)
- **🏁 Fin de nuit** : "La nuit se termine. Tout le monde se réveille."

### **Synchronisation Vibration + Interface**
- **Changements visuels** selon la phase :
  - Jour : Interface claire et lumineuse
  - Nuit : Interface sombre et bleutée
  - Réveil : Écran s'illumine avec vibration
  - Action : Interface d'action avec compte à rebours
- **Transitions fluides** entre les phases

### **🎯 Immersion et Tension**

#### **Expérience Nocturne Authentique**
- **Silence physique** : Les joueurs gardent les yeux fermés
- **Réveil individuel** : Chaque joueur vit son moment de tension personnel
- **Temps limité** : 15 secondes créent une pression authentique
- **Ordre imprévisible** : Personne ne sait quand son tour arrivera

#### **Effets Visuels et Haptiques**
- **Vibration haptique** : Sensation tactile de réveil
- **Écran qui s'illumine** : Transition visuelle claire
- **Compte à rebours** : Barre de progression visible
- **Interface d'action** : Boutons et options clairement affichés

### **📱 Responsive Design et Accessibilité**

#### **Mobile-First Design**
- **Tous les éléments** pensés pour mobile en premier
- **Adaptabilité** aux tablettes et grands écrans
- **Boutons larges** et facilement cliquables
- **Zones de texte scrollables** si nécessaire

#### **Accessibilité**
- **Infobulles** sur les icônes et boutons
- **Navigation intuitive** sans formation préalable
- **Feedback visuel** clair pour toutes les actions
- **Contraste optimal** pour la lisibilité

### **⚡ Fonctionnalités Techniques Avancées**

#### **Synchronisation Temps Réel**
- **WebSockets** pour la communication instantanée
- **Actions synchronisées** entre tous les joueurs
- **Phases et notes** mises à jour en temps réel
- **Pas de décalage** entre les appareils

#### **Persistance des Données**
- **Notes persistantes** même en cas de déconnexion
- **Sauvegarde automatique** des informations
- **Historique des parties** conservé
- **Progression sauvegardée** automatiquement

#### **Gestion Automatique du Jeu**
- **Aucun maître de jeu** nécessaire
- **Programme automatisé** pour toutes les phases
- **Timing précis** et respecté par tous
- **Règles appliquées** automatiquement

#### **Système de Reconnexion**
- **Déconnexion temporaire** : Le joueur peut quitter via le bouton de déconnexion
- **Reconnexion possible** : Retour dans la partie si :
  - Le lobby est encore actif
  - La partie est toujours en cours
  - Le joueur était présent au lancement de la partie
- **Continuité de jeu** : Le joueur reprend exactement où il en était
- **Pas de pénalité** : Aucune sanction pour les déconnexions temporaires

#### **Système d'Historique Complet de Partie**
- **Journal détaillé** : Enregistrement automatique de tous les événements
- **Timeline interactive** : Navigation chronologique avec filtres avancés
- **Types d'événements** :
  - **Actions des rôles** : Pouvoirs utilisés, cibles, résultats
  - **Votes et accusations** : Tous les votes avec leurs résultats
  - **Phases de jeu** : Transitions, timers, annonces
  - **Morts et transformations** : Changements d'état des joueurs
  - **Chats et communications** : Messages des loups et fantômes
- **Filtres intelligents** :
  - Par joueur (vivant/mort, rôle, équipe)
  - Par phase (Jour, Soir, Nuit, Réveil)
  - Par type d'action (vote, pouvoir, communication)
  - Par résultat (réussi/échoué, impact)
- **Statistiques en temps réel** :
  - Compteurs de votes par joueur
  - Actions réussies/échouées par rôle
  - Temps passé dans chaque phase
  - Historique des accusations et défenses
- **Export et partage** :
  - Sauvegarde de l'historique complet
  - Partage pour analyse post-partie
  - Format JSON/CSV pour traitement externe

### **🎯 Avantages du Système de Vibration Séquentielle**

#### **Pour les Joueurs**
- **Expérience immersive** et authentique
- **Tension nocturne réelle** avec réveil aléatoire
- **Temps d'action limité** qui crée de la pression
- **Interface intuitive** et accessible

#### **Pour l'Organisation**
- **Aucun animateur** requis
- **Parties fluides** et bien structurées
- **Gestion automatique** des phases
- **Expérience cohérente** à chaque partie

## 🚀 Plan de Développement - React Native + Web

### 📋 **Étape 1 : Architecture de Base (2-3 semaines)**

#### 1.1 Structure du Projet
```
WendiGame/
├── backend/              # API .NET Core (déjà existante)
├── shared/               # Code partagé entre mobile et web
│   ├── components/       # Composants React Native communs
│   ├── types/            # Types TypeScript partagés
│   ├── utils/            # Utilitaires communs
│   └── constants/        # Constantes partagées
├── mobile/               # Application React Native
│   ├── src/
│   │   ├── screens/      # Écrans de l'application
│   │   ├── navigation/   # Navigation mobile
│   │   └── services/     # Services adaptés au mobile
│   ├── App.tsx           # Point d'entrée mobile
│   └── package.json      # Dépendances React Native
├── web/                  # Version web avec React Native Web
│   ├── src/
│   │   ├── pages/        # Pages web spécifiques
│   │   └── services/     # Services adaptés au web
│   ├── App.tsx           # Point d'entrée web
│   └── package.json      # Dépendances React Native Web
└── README.md
```

#### 1.2 Technologies Unifiées
- **Frontend** : React Native + React Native Web
- **Framework** : Expo pour le développement unifié
- **Gestion des dépendances** : npm/yarn avec workspaces
- **Base de données** : API .NET Core existante
- **Déploiement** : Expo pour mobile, Vercel/Netlify pour web

### 📋 **Étape 2 : Composants Partagés (2-3 semaines)**

#### 2.1 Composants de Base
```typescript
// Composants React Native partagés
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  onPress: () => void;
  children: React.ReactNode;
}

interface CardProps {
  variant: 'elevated' | 'flat' | 'interactive';
  children: React.ReactNode;
  onPress?: () => void;
}
```

#### 2.2 Composants de Jeu
- **PhaseIndicator** : Affichage des phases jour/nuit
- **PlayerCard** : Cartes des joueurs avec rôles
- **ChairSelector** : Sélecteur de chaises en cercle
- **VoteSystem** : Système de vote et bûcher
- **ChatSystem** : Chat restreint pour loups et fantômes

### 📋 **Étape 3 : Application Mobile (3-4 semaines)**

#### 3.1 Navigation Mobile
- **React Navigation** pour la navigation entre écrans
- **Stack Navigator** pour les écrans de jeu
- **Tab Navigator** pour les sections principales

#### 3.2 Écrans Spécifiques
- **LobbyScreen** : Gestion des lobbys
- **GameScreen** : Interface principale de jeu
- **RoleScreen** : Affichage des rôles et pouvoirs
- **ChatScreen** : Communication en temps réel

#### 3.3 Fonctionnalités Natives
- **API Vibration** pour le système de réveil séquentiel
- **Notifications push** pour les alertes importantes
- **Stockage local** pour les préférences utilisateur

### 📋 **Étape 4 : Version Web (2-3 semaines)**

#### 4.1 React Native Web
- **Configuration** de React Native Web
- **Adaptation** des composants pour le web
- **Optimisation** des performances web

#### 4.2 Pages Web Spécifiques
- **Page d'accueil** responsive
- **Interface de jeu** adaptée au navigateur
- **Gestion des événements** clavier/souris

#### 4.3 Déploiement Web
- **Build** de la version web
- **Déploiement** sur Vercel/Netlify
- **Tests** de compatibilité navigateur

### 📋 **Étape 5 : Intégration et Tests (2 semaines)**

#### 5.1 Tests Unifiés
- **Tests unitaires** des composants partagés
- **Tests d'intégration** mobile et web
- **Tests de compatibilité** cross-platform

#### 5.2 Optimisation
- **Performance** des composants React Native
- **Bundle size** de la version web
- **Gestion de la mémoire** sur mobile

### 📋 **Étape 6 : Déploiement et Publication (1-2 semaines)**

#### 6.1 Déploiement Web
- **Build** de production
- **Déploiement** sur plateforme cloud
- **Configuration** des domaines et SSL

#### 6.2 Publication Mobile
- **Build** des applications Android/iOS
- **Soumission** sur App Store/Play Store
- **Configuration** des métadonnées et descriptions

## 🛠️ Technologies Recommandées

### Backend (Inchangé)
- **.NET Core** : API robuste et performante
- **Entity Framework** : ORM pour la base de données
- **SignalR** : Communication temps réel
- **SQL Server** : Base de données relationnelle

### Frontend Unifié
- **React Native** : Base commune pour mobile et web
- **React Native Web** : Traduction automatique en HTML
- **Expo** : Framework de développement unifié
- **TypeScript** : Typage statique et sécurité du code

### Gestion des Dépendances
- **npm/yarn** : Gestionnaire de paquets Node.js
- **Expo CLI** : Outils de développement et build
- **Metro** : Bundler React Native
- **Webpack** : Bundler pour la version web

### Outils de Développement
- **Git** : Versioning
- **VS Code** : Éditeur avec extensions React Native
- **Expo DevTools** : Développement et debugging
- **React Native Debugger** : Debugging avancé
- **Flipper** : Inspection et debugging des apps

## 📊 Métriques de Succès

### Fonctionnelles
- ✅ Jeu fonctionnel avec 8-29 joueurs
- ✅ 29 rôles uniques implémentés
- ✅ Communication temps réel
- ✅ Interface utilisable
- ✅ Équilibrage des rôles

### Techniques
- ✅ Code maintenable
- ✅ Documentation complète
- ✅ Tests de base
- ✅ Déploiement simple

## 🎯 Objectifs de la V3 - React Native + Web

### Unification
- **Codebase unique** : 95% de code partagé entre mobile et web
- **Développement centralisé** : Une seule équipe, une seule base de code
- **Cohérence visuelle** : Interface identique sur toutes les plateformes

### Fonctionnalité
- **Jeu complet** : Toutes les phases implémentées
- **29 rôles équilibrés** : Jeu équitable et varié
- **Interface native** : Expérience optimale sur mobile
- **Version web accessible** : Jeu jouable sur navigateur

### Extensibilité
- **Ajout de rôles** : Architecture modulaire pour 29+ rôles
- **Nouvelles phases** : Système flexible
- **Personnalisation** : Configuration simple
- **Équilibrage dynamique** : Ajustement automatique selon le nombre de joueurs
- **Nouvelles plateformes** : Facile d'ajout de nouvelles plateformes

## 🚀 Démarrage Rapide

Voir le [README principal](../README.md) pour les instructions de démarrage.

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le projet
2. **Créer** une branche feature
3. **Implémenter** les changements
4. **Tester** le code
5. **Soumettre** une pull request

### Standards de Code
- **Python** : PEP 8
- **JavaScript** : ESLint
- **Documentation** : Docstrings
- **Tests** : Coverage > 80%

## 📝 Notes de Développement

### Priorités
1. **Fonctionnalité de base** avant beauté
2. **Stabilité** avant performance
3. **Simplicité** avant complexité

### Éviter
- ❌ Over-engineering
- ❌ Dépendances inutiles
- ❌ Interface complexe
- ❌ Code non documenté

### Favoriser
- ✅ Code simple et lisible
- ✅ Tests automatisés
- ✅ Documentation claire
- ✅ Interface intuitive

## 🔄 Flow de Jeu Complet

1. **Connexion** → Page d'accueil
2. **Lobby** → Création ou rejoindre
3. **Préparation** → Confirmation des joueurs
4. **Début de partie** → Redirection automatique
5. **Phase Jour** → Discussion et préparation des accusations
6. **Phase Soir (Conseil du Village)** → Vote d'accusation unique → Plaidoirie (1 min) → Vote de condamnation → Nuit
7. **Phase Nuit** → Actions des rôles spéciaux
8. **Transformation en Fantôme** → Les joueurs morts deviennent des Fantômes avec accès au chat
9. **Répétition** → Tant qu'il reste des loups ET des villageois
10. **Fin de partie** → Déclaration du vainqueur

---

## 📝 **Guide de Complétion des Rôles**

Pour compléter les descriptions des rôles, remplacez les `[À compléter]` par :

### Format Suggéré pour Chaque Rôle :
```
- Pouvoir : Description claire et concise du pouvoir principal
- Capacité spéciale : Description de l'aptitude unique du rôle
```

### Exemples de Pouvoirs :
- **Attaque** : Tuer, blesser, neutraliser
- **Protection** : Sauvegarder, immuniser, soigner
- **Information** : Révéler, espionner, détecter
- **Manipulation** : Contrôler, influencer, transformer
- **Support** : Améliorer, assister, coordonner

### Exemples de Capacités Spéciales :
- **Passives** : Immunités, résistances, bonus
- **Actives** : Actions uniques, transformations
- **Conditionnelles** : Déclenchement sur événements
- **Limitées** : Usage unique, cooldown, conditions

---

## 📞 Contact

Pour toute question ou suggestion concernant le projet WendiGame, n'hésitez pas à ouvrir une issue sur GitHub.

**Objectif final** : Créer un jeu de loup-garou moderne avec 29 rôles uniques, équilibré et amusant où chaque joueur a un rôle actif et des pouvoirs distincts, le tout orchestré par une interface mobile-first immersive avec une voix maîtresse automatisée ! 🎮✨🎙️

---

*Wendigo Game - Une expérience de Loup-Garou moderne, immersive et entièrement automatisée.*
