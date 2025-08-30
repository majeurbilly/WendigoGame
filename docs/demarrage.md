# 🚀 GUIDE DE DÉMARRAGE - WENDIGO GAME

## 📋 Prérequis

Avant de démarrer, assurez-vous d'avoir installé :
- **.NET 8.0 SDK** : [Télécharger .NET 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** : [Télécharger Node.js](https://nodejs.org/)
- **npm** (inclus avec Node.js)

## 🎯 Démarrage Rapide

### 1. **Démarrer le Backend (.NET API)**

**Pourquoi commencer par le backend ?** 
Le backend est le "cerveau" de votre application. Il gère la logique métier, la base de données, et expose les APIs que vos frontends utiliseront. Sans lui, vos interfaces ne peuvent pas communiquer avec vos données.

**Comment procéder étape par étape :**

```bash
# Étape 1 : Naviguer vers le dossier backend
cd backend/Wendigame.API
# Pourquoi : dotnet run doit être exécuté depuis le dossier contenant le fichier .csproj

# Étape 2 : Restaurer les packages NuGet
dotnet restore
# Pourquoi : Télécharge et installe toutes les dépendances externes (Entity Framework, SignalR, etc.)
# Quand : À chaque fois que vous modifiez le fichier .csproj ou après un clone du projet

# Étape 3 : Compiler le projet
dotnet build
# Pourquoi : Vérifie que votre code compile sans erreurs avant de le lancer
# Quand : À chaque modification du code C# ou après dotnet restore

# Étape 4 : Lancer l'API
dotnet run
# Pourquoi : Démarre le serveur web qui écoute les requêtes HTTP
# Résultat : Votre API sera accessible sur http://localhost:5000
```

**Résultat attendu :**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**URLs du Backend :**
- API : http://localhost:5000
- Swagger : http://localhost:5000/swagger

### 2. **Démarrer le Frontend Web (React)**

**Pourquoi un nouveau terminal ?** 
React et .NET sont deux processus séparés qui doivent tourner en parallèle. Le backend gère les données, le frontend gère l'interface utilisateur. Ils communiquent via HTTP.

**Comment procéder étape par étape :**

```bash
# Étape 1 : Ouvrir un NOUVEAU terminal (important !)
# Pourquoi : Le terminal du backend doit rester actif pour maintenir l'API en marche
# Comment : Ctrl+Shift+T (nouvel onglet) ou nouvelle fenêtre PowerShell

# Étape 2 : Naviguer vers le frontend web
cd frontend/web
# Pourquoi : npm start doit être exécuté depuis le dossier contenant package.json

# Étape 3 : Installer les dépendances (première fois uniquement)
npm install
# Pourquoi : Télécharge React, TypeScript et toutes les bibliothèques nécessaires
# Quand : Seulement la première fois, ou après avoir modifié package.json
# Résultat : Crée le dossier node_modules avec toutes les dépendances

# Étape 4 : Lancer l'application React
npm start
# Pourquoi : Démarre le serveur de développement React avec rechargement automatique
# Résultat : Votre interface sera accessible sur http://localhost:3000
# Bonus : Le code se recharge automatiquement quand vous modifiez les fichiers
```

**Résultat attendu :**
```
Compiled successfully!

You can now view wendigo-game-web in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**URL du Frontend :**
- Interface Web : http://localhost:3000

## 🔧 Commandes Utiles

### Backend (.NET)
```bash
# Vérifier la version .NET
dotnet --version

# Restaurer les packages
dotnet restore

# Compiler
dotnet build

# Lancer en mode développement
dotnet run

# Lancer avec des URLs spécifiques
dotnet run --urls "http://localhost:5000"

# Arrêter le serveur
Ctrl+C
```

### Frontend Web (React)
```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Construire pour la production
npm run build

# Lancer les tests
npm test

# Arrêter le serveur
Ctrl+C
```

## 📁 Structure des Dossiers et Pourquoi

**Pourquoi cette organisation ?** 
Votre projet suit l'architecture "Backend + Frontend" moderne. Le backend (.NET) et le frontend (React) sont séparés pour permettre à plusieurs équipes de travailler en parallèle et pour faciliter le déploiement.

```
WendigoGame/
├── backend/
│   └── Wendigame.API/          # ← Démarrer ici (port 5000)
│       ├── Controllers/         # Gère les requêtes HTTP (GET, POST, etc.)
│       ├── Models/              # Définit la structure de vos données (Player, Game, etc.)
│       ├── Data/                # Connexion à la base de données
│       └── Program.cs           # Point d'entrée de l'application
├── frontend/
│   ├── web/                    # ← Démarrer ici (port 3000)
│   │   ├── src/                # Code source React (composants, pages)
│   │   ├── package.json        # Liste des dépendances et scripts
│   │   └── public/             # Fichiers statiques (HTML, images)
│   └── mobile/                 # Version mobile React Native
└── docs/                       # Documentation du projet
```

**Pourquoi des ports différents ?**
- **Port 5000** : Backend .NET (API et données)
- **Port 3000** : Frontend React (interface utilisateur)
- **Séparation** : Permet de développer et déboguer chaque partie indépendamment

## 🌐 Vérification du Démarrage

**Pourquoi vérifier ?** 
Même si vos terminaux semblent fonctionner, il faut s'assurer que les services écoutent réellement sur les bons ports. Un service peut "démarrer" mais échouer silencieusement.

### 1. **Vérifier le Backend**
```bash
# Dans un terminal
netstat -an | findstr :5000
```
**Résultat attendu :**
```
TCP    [::1]:5000             [::1]:xxxxx            LISTENING
```
**Que signifie ce résultat ?**
- `[::1]:5000` : Votre backend écoute sur le port 5000
- `LISTENING` : Le service est actif et prêt à recevoir des connexions
- Si vous ne voyez rien : Le backend n'a pas démarré correctement

### 2. **Vérifier le Frontend**
```bash
# Dans un terminal
netstat -an | findstr :3000
```
**Résultat attendu :**
```
TCP    127.0.0.1:3000        0.0.0.0:0              LISTENING
```
**Que signifie ce résultat ?**
- `127.0.0.1:3000` : Votre frontend React écoute sur le port 3000
- `LISTENING` : Le serveur de développement est actif
- Si vous ne voyez rien : React n'a pas démarré ou a échoué

### 3. **Tester l'API**
```bash
# Tester l'endpoint Swagger
curl http://localhost:5000/swagger
# ou ouvrir dans le navigateur : http://localhost:5000/swagger
```
**Pourquoi tester Swagger ?**
- **Swagger** est l'interface de test de votre API
- **Vérification** : Confirme que votre backend répond aux requêtes HTTP
- **Documentation** : Vous montre tous les endpoints disponibles
- **Test** : Permet de tester vos APIs directement depuis le navigateur

### 4. **Tester le Frontend**
- Ouvrir http://localhost:3000 dans votre navigateur
- Vous devriez voir l'interface React de Wendigo Game

**Pourquoi tester le frontend ?**
- **Vérification visuelle** : Confirme que React compile et s'affiche correctement
- **Interface utilisateur** : Vérifie que tous les composants se chargent
- **Communication** : Teste que le frontend peut communiquer avec le backend
- **Développement** : Confirme que le rechargement automatique fonctionne

## ⚠️ Dépannage

### Problème : "Couldn't find a project to run"
**Solution :** Assurez-vous d'être dans le bon dossier
```bash
cd backend/Wendigame.API
dotnet run
```

### Problème : "npm start Missing script"
**Solution :** Assurez-vous d'être dans le bon dossier
```bash
cd frontend/web
npm start
```

### Problème : Port déjà utilisé
**Solution :** Arrêter le processus ou changer le port
```bash
# Voir les processus sur le port
netstat -ano | findstr :5000

# Tuer le processus (remplacer XXXX par le PID)
taskkill /PID XXXX /F
```

### Problème : Erreur de compilation .NET
**Solution :** Nettoyer et reconstruire
```bash
dotnet clean
dotnet restore
dotnet build
```

## 🎮 Démarrage Automatique (Optionnel)

### Script PowerShell pour Windows
Créer un fichier `start-wendigo.ps1` à la racine :

```powershell
# Démarrer le Backend
Start-Process powershell -ArgumentList "-Command", "cd 'backend\Wendigame.API'; dotnet run"

# Attendre 5 secondes
Start-Sleep -Seconds 5

# Démarrer le Frontend
Start-Process powershell -ArgumentList "-Command", "cd 'frontend\web'; npm start"

# Ouvrir les URLs
Start-Process "http://localhost:5000/swagger"
Start-Process "http://localhost:3000"
```

**Utilisation :**
```bash
.\start-wendigo.ps1
```

## 🚀 Résumé des Commandes de Démarrage

**Ordre d'exécution et pourquoi :**

```bash
# Terminal 1 - Backend (DÉMARRER EN PREMIER)
cd backend/Wendigame.API
dotnet run
# Pourquoi en premier : Le frontend a besoin du backend pour fonctionner
# Attendre : Jusqu'à voir "Now listening on: http://localhost:5000"

# Terminal 2 - Frontend Web (DÉMARRER EN DEUXIÈME)
cd frontend/web
npm start
# Pourquoi en deuxième : Une fois le backend prêt, on peut tester la communication
# Attendre : Jusqu'à voir "Compiled successfully!" et l'URL http://localhost:3000

# Terminal 3 - Frontend Mobile (optionnel, nouveau terminal)
cd frontend/mobile
npm install          # Première fois uniquement
npm start            # Démarre Metro bundler
npm run android      # Lance sur Android
npm run ios          # Lance sur iOS (macOS uniquement)
# Pourquoi en dernier : Le mobile peut utiliser le même backend que le web
```

**Séquence logique :**
1. **Backend** → Fournit les données et APIs
2. **Frontend Web** → Teste la communication et l'interface
3. **Frontend Mobile** → Vérifie la compatibilité cross-platform

## ✅ Vérification Finale

**Comment savoir que tout fonctionne ?**

Votre projet Wendigo Game est correctement démarré quand :

**Backend (.NET) :**
- ✅ **Terminal** : Affiche "Now listening on: http://localhost:5000"
- ✅ **Port** : `netstat -an | findstr :5000` montre LISTENING
- ✅ **Swagger** : http://localhost:5000/swagger s'ouvre dans le navigateur

**Frontend Web (React) :**
- ✅ **Terminal** : Affiche "Compiled successfully!" et http://localhost:3000
- ✅ **Port** : `netstat -an | findstr :3000` montre LISTENING
- ✅ **Navigateur** : L'interface Wendigo Game s'affiche sans erreurs

**Frontend Mobile (optionnel) :**
- ✅ **Compilation** : Aucune erreur TypeScript
- ✅ **Metro** : Bundler démarré et prêt

**Communication :**
- ✅ **Test Backend** : Les boutons de test fonctionnent
- ✅ **Pas d'erreurs** : Aucun message d'erreur dans les terminaux

## 📱 Frontend Mobile (Optionnel)

**Pourquoi développer en mobile ?**
- **Accessibilité** : Les joueurs peuvent jouer depuis leur téléphone
- **Expérience native** : Interface optimisée pour les écrans tactiles
- **Déploiement** : Peut être distribué via App Store et Google Play
- **Technologie** : React Native permet de partager le code avec la version web

### Installation et démarrage
```bash
cd frontend/mobile
npm install          # Installe React Native et toutes les dépendances
npm start            # Démarre Metro bundler (serveur de développement mobile)
```

### Lancement sur appareil
- **Android** : `npm run android` (nécessite Android Studio)
- **iOS** : `npm run ios` (macOS uniquement, nécessite Xcode)

### Fonctionnalités disponibles
- 🏠 **Écran d'accueil** : Navigation et présentation du jeu
- 🔧 **Test Backend** : Même fonctionnalités que la version web
- 🎨 **Interface native** : Composants React Native optimisés
- 📱 **Support mobile** : Gestion des gestes et de la navigation tactile

### Pourquoi utiliser le même backend ?
- **Économie** : Pas besoin de développer deux APIs
- **Cohérence** : Même logique métier sur toutes les plateformes
- **Maintenance** : Un seul endroit pour corriger les bugs
- **Développement** : L'équipe backend peut se concentrer sur les fonctionnalités

**🎯 Vous êtes maintenant prêt à développer votre jeu Wendigo sur Web ET Mobile !**
