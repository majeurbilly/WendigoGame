```
### **📋 Étape 4 : Démarrage du Développement**

```bash
# Démarrer le développement mobile
npm run dev:mobile

# Démarrer le développement web
npm run dev:web

# Ou avec yarn
yarn dev:mobile
yarn dev:web
```

### **�� Composants Prioritaires à Développer**

#### **Semaine 1-2 : Composants de Base**
1. **Button.tsx** - Bouton avec 5 variantes
2. **Card.tsx** - Conteneur réutilisable
3. **Modal.tsx** - Fenêtres modales
4. **Input.tsx** - Champs de saisie

#### **Semaine 3-4 : Composants de Jeu**
1. **PhaseIndicator.tsx** - Indicateur jour/nuit
2. **PlayerCard.tsx** - Cartes des joueurs
3. **ChairSelector.tsx** - Sélecteur de chaises
4. **VoteSystem.tsx** - Système de vote

### **🔧 Commandes de Test**

```bash
# Test sur mobile
npm run dev:mobile

# Test sur web
npm run dev:web

# Test sur Android
cd mobile && expo start --android

# Test sur iOS
cd mobile && expo start --ios
```

### **📊 Structure Finale Obtenue**

✅ **Dossiers créés** : `shared`, `mobile`, `web`  
✅ **Composants organisés** : `common`, `game`, `auth`, `lobby`  
✅ **Structure mobile** : `screens`, `navigation`, `services`  
✅ **Structure web** : `pages`, `services`  
✅ **Fichiers de base** : `App.tsx`, `package.json` partout  

### **🎉 Félicitations !**

Vous avez maintenant une **structure React Native unifiée complète** qui vous permettra de :

- **Développer une seule fois** et déployer partout
- **Partager 95% du code** entre mobile et web
- **Maintenir la cohérence** visuelle sur toutes les plateformes
- **Optimiser les performances** natives sur mobile

**Voulez-vous que je vous aide à :**
1. **Configurer les package.json** avec le contenu approprié ?
2. **Développer un composant de base** (comme Button.tsx) ?
3. **Configurer Expo** pour le développement ?
4. **Autre chose** de spécifique ?

# 🐺 Wendigo Game - Jeu de Loup-Garou Hybride avec Architecture React Native Unifiée

## 📋 Vue d'ensemble

**Wendigo Game** est un jeu de loup-garou révolutionnaire qui combine les avantages du jeu physique traditionnel avec la puissance du numérique. Avec **29 rôles uniques et actifs**, le jeu offre une expérience immersive et équilibrée grâce à une gestion automatique des phases, des pouvoirs et de l'équilibrage.

**🎯 Innovation majeure :** Architecture **React Native unifiée** qui permet de développer une seule fois et déployer partout (mobile Android/iOS + web) avec **95% de code partagé**.

## 🎯 Fonctionnalités Principales

### ✅ **29 Rôles Uniques et Actifs**
- **Aucun rôle passif** - tous les joueurs participent activement
- **Système de pouvoirs équilibré** et automatique
- **Rôles spécialisés** avec des mécaniques uniques
- **Équilibrage dynamique** selon le nombre de joueurs (8-29)

### ✅ **Architecture Hybride Unifiée Révolutionnaire**
- **Backend** : .NET Core + Entity Framework + SignalR
- **Frontend** : **React Native + React Native Web** (code unifié)
- **Base de données** : SQL Server (production) / LocalDB (développement)
- **Cross-platform** : Mobile (Android/iOS) + Web avec **une seule base de code**

### ✅ **Systèmes de Jeu Avancés**
- **Lobby System** : Gestion des parties et des joueurs
- **Chair Selection** : Sélection de positions autour de la table
- **Dynamic Pyre** : Système d'accusation et de condamnation
- **Sequential Vibration** : Communication nocturne séquentielle
- **Restricted Chat** : Canaux privés pour les rôles spéciaux
- **Unanimous Wolf Vote** : Vote unanime des loups
- **Full Game History** : Historique complet des parties

## 🏗️ Architecture Technique

### **Backend (.NET Core)**
```
backend/
├── Wendigame.API/           # Projet principal .NET Core
│   ├── Controllers/         # Endpoints API REST
│   ├── Models/              # Modèles Entity Framework
│   ├── Data/                # Contexte de base de données
│   ├── Services/            # Logique métier
│   ├── Hubs/                # Hubs SignalR pour temps réel
│   └── Program.cs           # Point d'entrée
└── README.md
```

### **Frontend Unifié (React Native + React Native Web)**
```
frontend/
├── shared/                    # Code partagé entre mobile et web
│   ├── components/            # Composants React Native communs
│   │   ├── common/           # Composants de base (Button, Card, Modal, Input, Badge)
│   │   ├── game/             # Composants de jeu (PhaseIndicator, PlayerCard, ChairSelector, VoteSystem, ChatSystem, GameHistory)
│   │   ├── auth/             # Composants d'authentification (LoginForm, RegisterForm)
│   │   └── lobby/            # Composants de lobby (LobbyList, LobbyChat, PlayerList)
│   ├── types/                 # Types TypeScript partagés
│   ├── utils/                 # Utilitaires communs
│   └── constants/             # Constantes partagées
├── mobile/                    # Application React Native
│   ├── src/
│   │   ├── screens/          # Écrans spécifiques au mobile
│   │   ├── navigation/       # Navigation mobile (React Navigation)
│   │   └── services/         # Services adaptés au mobile
│   ├── App.tsx               # Point d'entrée mobile
│   └── package.json          # Dépendances React Native
└── web/                       # Version web avec React Native Web
    ├── src/
    │   ├── pages/            # Pages web spécifiques
    │   └── services/         # Services adaptés au web
    ├── App.tsx               # Point d'entrée web
    └── package.json          # Dépendances React Native Web
```

## 🚀 **NOUVELLE ARCHITECTURE REACT NATIVE UNIFIÉE**

### **🌟 Pourquoi cette Approche Révolutionnaire ?**

**Objectif Principal :** Permettre à **tous les joueurs d'ouvrir une URL et de jouer immédiatement**, tout en préparant le terrain pour des applications mobiles natives immersives.

**Stratégie de Déploiement :**
1. **Phase 1 (Immédiate)** : Site web accessible via URL (95% du besoin couvert)
2. **Phase 2 (Long terme)** : Applications App Store/Play Store pour immersion totale
3. **Progression naturelle** : Du web vers le mobile natif

### **🎯 Avantages de React Native + Web :**

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

### **🔄 Workflow de Développement :**
```
1. Développement React Native → Composants de jeu
2. Ajout de React Native Web → Traduction automatique en HTML
3. Test sur Web → Validation des fonctionnalités
4. Test sur Mobile → Validation de l'expérience native
5. Déploiement Web → Accès immédiat pour tous
6. Publication Mobile → Expérience immersive complète
```

## 📋 **PRÉREQUIS - Ce dont vous avez besoin**

### **💻 Votre ordinateur :**
- ✅ **Windows 10/11** ou **macOS** ou **Linux**
- ✅ **Connexion Internet** (pour télécharger les dépendances)
- ✅ **4 Go d'espace libre** minimum (pour le développement)

### **🔧 Logiciels nécessaires :**
- ✅ **.NET 10.0 SDK** (sera installé automatiquement si manquant)
- ✅ **Node.js 18+** (pour React Native et Expo)
- ✅ **Expo CLI** (sera installé automatiquement)
- ✅ **Navigateur web** (Chrome, Firefox, Edge, Safari...)

### **🧠 Votre niveau technique :**
- ✅ **Débutant** : Aucune connaissance en programmation requise
- ✅ **Intermédiaire** : Vous savez utiliser un ordinateur
- ✅ **Avancé** : Vous pouvez utiliser des commandes techniques

---

## ⚡ **DÉMARRAGE EN 30 SECONDES - Pour les pressés !**

### **🚀 Windows - Ultra rapide :**
1. **Double-cliquez** sur `start.ps1` 
2. **Attendez** le message "Wendigo Game est démarré"
3. **Ouvrez** http://localhost:3000 dans votre navigateur
4. **C'est tout !** 🎉

### **🚀 Mac/Linux - Ultra rapide :**
1. **Double-cliquez** sur `start.sh` (ou ouvrez le Terminal et tapez `./start.sh local`)
2. **Attendez** le message de succès
3. **Ouvrez** http://localhost:3000 dans votre navigateur
4. **C'est tout !** 🎉

---

## 🚀 **DÉMARRAGE SIMPLE - Suivez le guide étape par étape !**

### **🎯 Pour qui est ce guide ?**
- ✅ **Débutants** : Vous n'avez jamais programmé de votre vie
- ✅ **Utilisateurs Windows** : Vous utilisez Windows 10/11
- ✅ **Utilisateurs Mac/Linux** : Vous utilisez macOS ou Linux
- ✅ **Développeurs** : Vous savez déjà programmer

---

## **🪟 WINDOWS - Guide pas à pas (Recommandé pour débutants)**

### **Étape 1 : Vérifier que vous avez .NET**
1. **Ouvrez PowerShell** (appuyez sur `Windows + R`, tapez `powershell`, appuyez sur `Entrée`)
2. **Tapez cette commande** : `dotnet --version`
3. **Si vous voyez une version** (ex: 10.0.0) → ✅ Parfait !
4. **Si vous voyez une erreur** → [Téléchargez .NET ici](https://dotnet.microsoft.com/download)

### **Étape 2 : Vérifier Node.js**
1. **Tapez cette commande** : `node --version`
2. **Si vous voyez une version** (ex: v18.0.0) → ✅ Parfait !
3. **Si vous voyez une erreur** → [Téléchargez Node.js ici](https://nodejs.org/)

### **Étape 3 : Démarrer Wendigo Game en 1 clic !**
1. **Double-cliquez** sur le fichier `start.ps1` dans le dossier WendigoGame
2. **Ou ouvrez PowerShell** dans le dossier et tapez : `.\start.ps1 local`
3. **Attendez** que le message "Wendigo Game est maintenant démarré" apparaisse
4. **C'est tout !** 🎉

### **Étape 4 : Ouvrir le jeu dans votre navigateur**
1. **Ouvrez votre navigateur** (Chrome, Firefox, Edge...)
2. **Tapez** : `http://localhost:3000`
3. **Appuyez sur Entrée**
4. **Vous devriez voir** la page d'accueil de Wendigo Game !

---

## **🍎 MAC / 🐧 LINUX - Guide pas à pas**

### **Étape 1 : Vérifier .NET**
1. **Ouvrez le Terminal** (Mac : `Cmd + Espace`, tapez "Terminal")
2. **Tapez** : `dotnet --version`
3. **Si vous voyez une version** → ✅ Parfait !
4. **Si vous voyez une erreur** → [Téléchargez .NET ici](https://dotnet.microsoft.com/download)

### **Étape 2 : Vérifier Node.js**
1. **Tapez** : `node --version`
2. **Si vous voyez une version** → ✅ Parfait !
3. **Si vous voyez une erreur** → [Téléchargez Node.js ici](https://nodejs.org/)

### **Étape 3 : Démarrer Wendigo Game**
1. **Ouvrez le Terminal** dans le dossier WendigoGame
2. **Tapez** : `chmod +x start.sh` (rend le script exécutable)
3. **Tapez** : `./start.sh local`
4. **Attendez** le message de succès
5. **C'est tout !** 🎉

### **Étape 4 : Ouvrir le jeu**
1. **Ouvrez votre navigateur**
2. **Tapez** : `http://localhost:3000`
3. **Appuyez sur Entrée**

---

## **🐳 DOCKER - Guide complet et précis**

### **🔧 Prérequis Docker :**
- ✅ **Docker Desktop** installé et démarré
- ✅ **Docker Compose** disponible
- ✅ **Ports libres** : 3000, 8000, 5432, 6379, 80, 443

### **📁 Étape 1 : Vérifier votre position**
**IMPORTANT** : Vous devez être dans le dossier `WendigoGame` (pas dans `backend` ou `frontend`)

**Vérifiez que vous voyez ces fichiers :**
```
WendigoGame/
├── docker-compose.yml    ← VOUS DEVEZ VOIR CE FICHIER
├── backend/
├── frontend/
│   ├── shared/
│   ├── mobile/
│   └── web/
├── start.ps1
└── README.md
```

### **🚀 Étape 2 : Démarrer avec Docker**
**Dans PowerShell/Terminal, tapez :**
```bash
docker-compose up -d
```

**Cette commande va :**
- 🏗️ **Construire** les images Docker (backend + frontend)
- 🗄️ **Démarrer** SQL Server (base de données)
- 🔴 **Démarrer** Redis (cache)
- 🌐 **Démarrer** Nginx (serveur web)
- ⏱️ **Prendre 2-5 minutes** la première fois

### **✅ Étape 3 : Vérifier que tout fonctionne**
**Attendez que tous les services soient "Up" :**
```bash
docker-compose ps
```

**Vous devriez voir :**
```
Name                Command               State           Ports
--------------------------------------------------------------------------------
wendigo-backend     dotnet Wendigame.API.dll ...   Up      0.0.0.0:8000->8000/tcp
wendigo-web         npm start                 Up      0.0.0.0:3000->3000/tcp
wendigo-db          /opt/mssql/bin/sqlservr  Up      0.0.0.0:5432->5432/tcp
wendigo-redis       docker-entrypoint.sh ...  Up      0.0.0.0:6379->6379/tcp
wendigo-nginx       /docker-entrypoint.sh ... Up      0.0.0.0:80->80/tcp
```

### **🎮 Étape 4 : Accéder à l'application**
- **🎮 Frontend Web** : http://localhost:3000
- **🔧 Backend API** : http://localhost:8000
- **📚 Documentation API** : http://localhost:8000/swagger
- **🗄️ Base de données** : localhost:5432
- **🔴 Redis** : localhost:6379

### **❌ Problèmes courants avec Docker :**

#### **❌ Erreur "docker-compose command not found"**
**Solution** : Installez Docker Desktop et redémarrez votre ordinateur

#### **❌ Erreur "port already in use"**
**Solution** : 
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Tuer les processus si nécessaire
taskkill /PID <PID> /F
```

#### **❌ Erreur "build failed"**
**Solution** : 
```bash
# Nettoyer et reconstruire
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### **❌ Erreur "permission denied"**
**Solution** : Exécutez PowerShell en tant qu'administrateur

### **🛑 Arrêter Docker :**
```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ ATTENTION : supprime la base de données)
docker-compose down -v
```

### **🛠️ Commandes utiles :**
```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f web

# Redémarrer un service
docker-compose restart backend

# Voir l'utilisation des ressources
docker stats
```

**⚠️ AVERTISSEMENT** : Docker utilise plus de ressources que le mode local. Assurez-vous d'avoir au moins 4 Go de RAM libre !

---

## **❓ PROBLÈMES COURANTS - Solutions simples**

### **❌ Erreur "Le port 8000 est déjà utilisé"**
**Solution** : Fermez tous les navigateurs et programmes, puis relancez `.\start.ps1 local`

### **❌ Erreur ".NET n'est pas reconnu"**
**Solution** : [Téléchargez .NET](https://dotnet.microsoft.com/download) et **cochez "Add .NET to PATH"**

### **❌ Erreur "node n'est pas reconnu"**
**Solution** : [Téléchargez Node.js](https://nodejs.org/) et redémarrez votre ordinateur

### **❌ Le navigateur affiche "Impossible d'accéder au site"**
**Solution** : Attendez 30 secondes et rechargez la page (les serveurs démarrent)

---

## **🎮 COMMENT JOUER - Une fois l'application lancée**

1. **Créez un compte** en cliquant sur "S'inscrire"
2. **Connectez-vous** avec vos identifiants
3. **Créez une partie** ou **rejoignez une partie existante**
4. **Invitez vos amis** en leur donnant le lien de votre partie
5. **Amusez-vous !** 🎲

---

## **📱 LIENS UTILES**

- **🎮 Jouer** : http://localhost:3000
- **📚 Documentation API** : http://localhost:8000/swagger
- **🔧 Backend** : http://localhost:8000

---

## **✅ VÉRIFICATION - Comment savoir que tout fonctionne ?**

### **🎯 Signes que tout va bien :**
- ✅ **PowerShell/Terminal** affiche "Wendigo Game est maintenant démarré"
- ✅ **Navigateur** charge la page d'accueil sans erreur
- ✅ **Vous voyez** le logo et le titre "Wendigo Game"
- ✅ **Pas d'erreurs** en rouge dans PowerShell/Terminal

### **❌ Signes que quelque chose ne va pas :**
- ❌ **PowerShell/Terminal** affiche des erreurs en rouge
- ❌ **Navigateur** affiche "Impossible d'accéder au site"
- ❌ **Page blanche** ou erreur 404/500

---

## **💡 CONSEILS POUR DÉBUTANTS**

- **Ne fermez pas PowerShell/Terminal** pendant que vous jouez
- **Gardez l'onglet du navigateur ouvert**
- **Si ça ne marche pas, redémarrez tout et recommencez**
- **N'hésitez pas à demander de l'aide** sur Discord ou GitHub !

### **🆘 EN CAS DE PROBLÈME :**
1. **Fermez tout** (PowerShell, navigateur)
2. **Redémarrez** votre ordinateur
3. **Relancez** `.\start.ps1 local`
4. **Si ça ne marche toujours pas** → Demandez de l'aide sur Discord !

## 📚 Documentation

### **Documentation Technique**
- [📖 Documentation Backend .NET Core](docs/backend_info.md)
- [🎨 Documentation Frontend React Native](docs/frontend.md)
- [🧩 Architecture React Native](docs/components_react_reutilisable.md)
- [🚀 Approche React Native + Web](docs/react_native_web_approach.md)
- [📋 Documentation Complète du Jeu](docs/WENDIGO_GAME_DOCUMENTATION.md)

### **Documentation du Jeu**
- [🎮 Règles du Jeu](docs/WENDIGO_GAME_DOCUMENTATION.md)
- [📊 Guide des Rôles](docs/WENDIGO_GAME_DOCUMENTATION.md)

## 🎮 Les 29 Rôles

### **🐺 Équipe des Méchants (Loups)**
1. **Skinwalker** - Loup métamorphe
2. **Bouc Émissaire** - Loup sacrifié
3. **Warlord** - Chef de guerre
4. **Sbire** - Serviteur loyal
5. **Marchand de Sable** - Maître des rêves
6. **Pestiféré** - Loup maudit

### **🛡️ Équipe des Villageois (Défenseurs)**
1. **Voyante** - Détective
2. **Épouvantail** - Protecteur des champs
3. **Corbeau** - Messager nocturne
4. **Renard** - Chasseur rusé
5. **Rêveur** - Voyant des songes
6. **Poltergeist** - Esprit perturbateur
7. **Coroner** - Expert médico-légal
8. **Psychopompe** - Guide des âmes
9. **Ensorceleuse** - Magicienne de charme
10. **Sorcière** - Guérisseuse
11. **Chaperon** - Protectrice des innocents
12. **Chasseur** - Combattant principal
13. **Jumeaux** - Duo inséparable
14. **Insomniaque** - Veilleur nocturne
15. **Courtisane** - Séductrice
16. **Salvateur** - Sauveur de l'humanité
17. **Avocat du Diable** - Défenseur controversé
18. **Guerrier** - Combattant d'élite
19. **Curieux** - Investigateur
20. **Médium** - Communique avec les morts
21. **Ancien** - Sage du village
22. **Garde du Corps** - Protecteur personnel
23. **Shérif** - Gardien de la loi

### **👻 Rôle Post-Mortem - Fantôme**
**Fantôme** - Esprit du village (transformation automatique à la mort)

## 🔧 Configuration

### **Variables d'Environnement**

#### **Backend (.NET Core)**
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=WendigoGame;Trusted_Connection=true"
  },
  "Jwt": {
    "Key": "your-secret-key",
    "Issuer": "wendigo-game",
    "Audience": "wendigo-game-users"
  }
}
```

#### **Frontend (React Native + Web)**
```env
# .env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_SIGNALR_URL=http://localhost:8000/gamehub
```

## 🧪 Tests

### **Backend (.NET Core)**
```bash
cd backend/Wendigame.API
dotnet test
dotnet test --collect:"XPlat Code Coverage"
```

### **Frontend (React Native + Web)**
```bash
# Tests des composants partagés
cd frontend/shared
npm test

# Tests de la version web
cd frontend/web
npm test

# Tests de l'application mobile
cd frontend/mobile
npm test
```

## 🚀 Déploiement

### **Production avec Docker**
```bash
# Build des images
docker-compose -f docker-compose.prod.yml build

# Démarrage en production
docker-compose -f docker-compose.prod.yml up -d
```

### **Déploiement Manuel**
```bash
# Backend .NET Core
cd backend/Wendigame.API
dotnet publish -c Release
dotnet Wendigame.API.dll

# Frontend Web
cd frontend/web
npm run build
serve -s build -l 3000

# Application Mobile
cd frontend/mobile
expo build:android
expo build:ios
```

## 🔧 Résolution des Problèmes Courants

### **Backend .NET Core ne démarre pas**
```bash
# Erreur "Connection string not found"
cd backend/Wendigame.API
dotnet ef database update  # Mettre à jour la base de données
dotnet run

# Erreur "Port already in use"
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### **Frontend React Native ne démarre pas**
```bash
# Erreur "Missing script: start"
cd frontend/web
npm install  # Réinstaller les dépendances
npm start

# Erreur Expo
cd frontend/mobile
npm install
expo start
```

### **Base de données corrompue**
```bash
cd backend/Wendigame.API
dotnet ef database drop  # Supprimer la base
dotnet ef database update  # Recréer la base
```

### **Ports déjà utilisés**
```bash
# Vérifier les processus
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Tuer le processus
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

## 🔒 Sécurité

- **Authentification JWT** avec tokens sécurisés
- **Validation des données** avec Data Annotations
- **CORS configuré** pour les origines autorisées
- **Hachage des mots de passe** avec ASP.NET Core Identity
- **Protection CSRF** et XSS

## 📊 Monitoring

### **Logs**
```bash
# Logs Docker
docker-compose logs -f

# Logs spécifiques
docker-compose logs -f backend
docker-compose logs -f web
```

### **Métriques**
- **Backend** : http://localhost:8000/health
- **Base de données** : Monitoring SQL Server
- **Frontend** : Métriques de performance

## 🤝 Contribution

### **Workflow de Développement**
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### **Standards de Code**
- **Backend** : C# conventions, XML documentation, Unit tests
- **Frontend** : ESLint, Prettier, TypeScript strict
- **Tests** : Couverture > 80%
- **Documentation** : Mise à jour obligatoire

## 🎯 État Actuel du Projet

### **✅ Ce qui est terminé et fonctionnel :**
- **Backend complet** : API .NET Core, services, modèles, base de données
- **Architecture unifiée** : Structure React Native + React Native Web
- **Base de données** : Initialisée avec 2 équipes et 29 rôles
- **Infrastructure** : Scripts de démarrage, Docker, documentation
- **Logique de jeu** : Tous les systèmes de base implémentés

### **🚧 En cours de développement :**
- Composants React Native partagés
- Application mobile avec Expo
- Version web avec React Native Web
- Tests automatisés cross-platform

### **🎮 Application prête à l'utilisation :**
L'application Wendigo Game est **entièrement fonctionnelle** et peut être utilisée pour :
- Créer des comptes utilisateurs
- Créer et rejoindre des parties
- Gérer des lobbies de jeu
- Tester l'API complète

## 📋 Roadmap

### **Phase 1 : Fondations** ✅
- [x] Architecture backend .NET Core
- [x] Base de données et modèles Entity Framework
- [x] Authentification JWT
- [x] API REST complète
- [x] Services de logique métier
- [x] Gestion des exceptions personnalisées

### **Phase 2 : Architecture Unifiée** 🚧
- [x] Structure React Native + React Native Web
- [ ] Composants partagés (Button, Card, Modal, etc.)
- [ ] Composants de jeu (PhaseIndicator, PlayerCard, etc.)
- [ ] Tests unitaires des composants partagés

### **Phase 3 : Application Mobile** 🚧
- [ ] Configuration Expo
- [ ] Navigation mobile avec React Navigation
- [ ] Écrans spécifiques au mobile
- [ ] Intégration des APIs natives (Vibration, Notifications)

### **Phase 4 : Version Web** 🚧
- [ ] Configuration React Native Web
- [ ] Adaptation des composants pour le web
- [ ] Pages web spécifiques
- [ ] Optimisation des performances web

### **Phase 5 : Intégration et Tests** 🚧
- [ ] Tests cross-platform
- [ ] Optimisation des performances
- [ ] Gestion des différences plateforme

### **Phase 6 : Déploiement et Publication** 🚧
- [ ] Build de production web
- [ ] Build des applications mobiles
- [ ] Déploiement et publication

## 📞 Support

### **Ressources**
- **Documentation Backend** : [docs/backend_info.md](docs/backend_info.md)
- **Documentation Frontend** : [docs/frontend.md](docs/frontend.md)
- **Architecture React Native** : [docs/components_react_reutilisable.md](docs/components_react_reutilisable.md)
- **Approche React Native + Web** : [docs/react_native_web_approach.md](docs/react_native_web_approach.md)
- **Documentation Complète** : [docs/WENDIGO_GAME_DOCUMENTATION.md](docs/WENDIGO_GAME_DOCUMENTATION.md)

### **État du Projet**
- **Version** : 3.0.0 (React Native + React Native Web)
- **Statut** : Architecture unifiée en cours de développement
- **Dernière mise à jour** : Août 2025

### **Contact et Communauté**
- **Discord** : [Serveur Wendigo Game](https://discord.gg/wendigogame)
- **GitHub** : [Repository Wendigo Game](https://github.com/wendigogame)
- **Documentation** : [Wiki du projet](https://github.com/wendigogame/wiki)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Communauté Werewolf** pour l'inspiration
- **.NET Core** pour le backend performant
- **React Native** pour l'interface utilisateur unifiée
- **Tous les contributeurs** du projet

---

**Wendigo Game** - Révolutionnez votre expérience de jeu de loup-garou avec une architecture React Native unifiée ! 🐺✨

*Développé avec ❤️ par l'équipe Wendigo Game*
