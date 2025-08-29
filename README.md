# 🐺 Wendigo Game - Jeu de Loup-Garou Hybride

## 📋 Vue d'ensemble

Wendigo Game est un jeu de loup-garou innovant qui combine les avantages du jeu physique traditionnel avec la puissance du numérique. Avec 29 rôles uniques et actifs, le jeu offre une expérience immersive et équilibrée grâce à une gestion automatique des phases, des pouvoirs et de l'équilibrage.

## 🎯 Fonctionnalités Principales

### ✅ **29 Rôles Uniques et Actifs**
- Aucun rôle passif - tous les joueurs participent activement
- Système de pouvoirs équilibré et automatique
- Rôles spécialisés avec des mécaniques uniques

### ✅ **Architecture Hybride**
- **Backend** : FastAPI + SQLAlchemy + WebSockets
- **Frontend** : React + TypeScript + WebSockets
- **Base de données** : PostgreSQL (production) / SQLite (développement)
- **Containerisation** : Docker + Docker Compose

### ✅ **Systèmes de Jeu Avancés**
- **Lobby System** : Gestion des parties et des joueurs
- **Chair Selection** : Sélection de positions autour de la table
- **Dynamic Pyre** : Système d'accusation et de condamnation
- **Sequential Vibration** : Communication nocturne séquentielle
- **Restricted Chat** : Canaux privés pour les rôles spéciaux
- **Unanimous Wolf Vote** : Vote unanime des loups
- **Full Game History** : Historique complet des parties

## 🏗️ Architecture Technique

### **Backend (FastAPI)**
```
backend/
├── app/
│   ├── api/v1/           # Endpoints API REST
│   ├── core/             # Configuration et utilitaires
│   ├── models/           # Modèles SQLAlchemy
│   ├── schemas/          # Schémas Pydantic
│   ├── services/         # Logique métier
│   └── websocket/        # Gestion WebSocket
├── data/                 # Données initiales
└── pyproject.toml        # Configuration Python
```

### **Frontend (React)**
```
frontend/
├── src/
│   ├── components/       # Composants React
│   ├── context/          # Contexts React
│   ├── services/         # Services API et WebSocket
│   ├── types/            # Types TypeScript
│   └── App.tsx           # Application principale
├── public/               # Assets statiques
└── package.json          # Configuration Node.js
```

## 📋 **PRÉREQUIS - Ce dont vous avez besoin**

### **💻 Votre ordinateur :**
- ✅ **Windows 10/11** ou **macOS** ou **Linux**
- ✅ **Connexion Internet** (pour télécharger les dépendances)
- ✅ **2 Go d'espace libre** minimum

### **🔧 Logiciels nécessaires :**
- ✅ **Python 3.8+** (sera installé automatiquement si manquant)
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

### **Étape 1 : Vérifier que vous avez Python**
1. **Ouvrez PowerShell** (appuyez sur `Windows + R`, tapez `powershell`, appuyez sur `Entrée`)
2. **Tapez cette commande** : `python --version`
3. **Si vous voyez une version** (ex: Python 3.11.0) → ✅ Parfait !
4. **Si vous voyez une erreur** → [Téléchargez Python ici](https://www.python.org/downloads/)

### **Étape 2 : Démarrer Wendigo Game en 1 clic !**
1. **Double-cliquez** sur le fichier `start.ps1` dans le dossier WendigoGame
2. **Ou ouvrez PowerShell** dans le dossier et tapez : `.\start.ps1 local`
3. **Attendez** que le message "Wendigo Game est maintenant démarré" apparaisse
4. **C'est tout !** 🎉

### **Étape 3 : Ouvrir le jeu dans votre navigateur**
1. **Ouvrez votre navigateur** (Chrome, Firefox, Edge...)
2. **Tapez** : `http://localhost:3000`
3. **Appuyez sur Entrée**
4. **Vous devriez voir** la page d'accueil de Wendigo Game !

---

## **🍎 MAC / 🐧 LINUX - Guide pas à pas**

### **Étape 1 : Vérifier Python**
1. **Ouvrez le Terminal** (Mac : `Cmd + Espace`, tapez "Terminal")
2. **Tapez** : `python3 --version`
3. **Si vous voyez une version** → ✅ Parfait !
4. **Si vous voyez une erreur** → [Téléchargez Python ici](https://www.python.org/downloads/)

### **Étape 2 : Démarrer Wendigo Game**
1. **Ouvrez le Terminal** dans le dossier WendigoGame
2. **Tapez** : `chmod +x start.sh` (rend le script exécutable)
3. **Tapez** : `./start.sh local`
4. **Attendez** le message de succès
5. **C'est tout !** 🎉

### **Étape 3 : Ouvrir le jeu**
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
- 🗄️ **Démarrer** PostgreSQL (base de données)
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
wendigo-backend     uvicorn app.main:app ...   Up      0.0.0.0:8000->8000/tcp
wendigo-frontend    npm start                 Up      0.0.0.0:3000->3000/tcp
wendigo-db          docker-entrypoint.sh ...  Up      0.0.0.0:5432->5432/tcp
wendigo-redis       docker-entrypoint.sh ...  Up      0.0.0.0:6379->6379/tcp
wendigo-nginx       /docker-entrypoint.sh ... Up      0.0.0.0:80->80/tcp
```

### **🎮 Étape 4 : Accéder à l'application**
- **🎮 Frontend** : http://localhost:3000
- **🔧 Backend API** : http://localhost:8000
- **📚 Documentation API** : http://localhost:8000/docs
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
docker-compose logs -f frontend

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

### **❌ Erreur "Python n'est pas reconnu"**
**Solution** : [Téléchargez Python](https://www.python.org/downloads/) et **cochez "Add Python to PATH"**

### **❌ Erreur "npm n'est pas reconnu"**
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
- **📚 Documentation API** : http://localhost:8000/docs
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
- [📖 Documentation Backend](docs/BACKEND_README.md)
- [🎨 Documentation Frontend](frontend/README.md)
- [🏗️ Architecture SOLID](docs/ARCHITECTURE_SOLID_IMPLEMENTATION.md)
- [📋 Roadmap Détaillée](docs/ROADMAP_DETAILED.md)

### **Documentation du Jeu**
- [🎮 Règles du Jeu](docs/WENDIGO_GAME_DOCUMENTATION.md)
- [📊 Guide des Rôles](docs/ROLES_GUIDE.md)

## 🎮 Les 29 Rôles

### **Équipe Villageois**
1. **Villageois** - Rôle de base
2. **Voyante** - Voir les rôles la nuit
3. **Sorcière** - Potions de vie et de mort
4. **Chasseur** - Action post-mortem
5. **Petite Fille** - Peut espionner les loups
6. **Salvateur** - Protège un joueur chaque nuit
7. **Cupidon** - Lie deux joueurs
8. **Voleur** - Échange de rôle
9. **Idiot du Village** - Survit à une condamnation
10. **Ancien** - Résiste à une attaque
11. **Berger** - Protège un joueur
12. **Chevrier** - Détecte les loups
13. **Enfant Sauvage** - Se transforme en loup
14. **Garde** - Protection renforcée
15. **Médium** - Communique avec les morts

### **Équipe Loups**
16. **Loup-Garou** - Rôle de base
17. **Loup Blanc** - Tue un loup par nuit
18. **Grand Méchant Loup** - Tue deux joueurs
19. **Loup-Garou Alpha** - Contrôle les votes
20. **Loup-Garou Omega** - Invisible aux pouvoirs

### **Rôles Neutres**
21. **Loup Solitaire** - Joue seul
22. **Renard** - Détecte les loups
23. **Guerrier** - Duel à mort
24. **Avocat du Diable** - Protection risquée
25. **Chaperon Rouge** - Immunité conditionnelle
26. **Jumeaux** - Communication privée
27. **Poltergeist** - Chat privé avec les morts
28. **Marchand de Sable** - Skip de phase
29. **Pestiféré** - Contamination

## 🔧 Configuration

### **Variables d'Environnement**

#### **Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost/wendigo_game
SECRET_KEY=your-secret-key
DEBUG=true
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

#### **Frontend (.env.local)**
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/api/v1/ws
```

## 🧪 Tests

### **Backend**
```bash
cd backend
pytest
pytest --cov=app
```

### **Frontend**
```bash
cd frontend
npm test
npm test -- --coverage
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
# Backend
cd backend
pip install -r requirements.txt
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd frontend
npm run build
serve -s build -l 3000
```

## 🔧 Résolution des Problèmes Courants

### **Backend ne démarre pas**
```bash
# Erreur "ModuleNotFoundError: No module named 'app'"
cd backend
python init_db.py  # Initialiser la base de données
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### **Frontend ne démarre pas**
```bash
# Erreur "Missing script: start"
cd frontend
npm install  # Réinstaller les dépendances
npm start
```

### **Base de données corrompue**
```bash
cd backend
del wendigo_game.db  # Supprimer la base
python init_db.py    # Recréer la base
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
- **Validation des données** avec Pydantic
- **CORS configuré** pour les origines autorisées
- **Hachage des mots de passe** avec bcrypt
- **Protection CSRF** et XSS

## 📊 Monitoring

### **Logs**
```bash
# Logs Docker
docker-compose logs -f

# Logs spécifiques
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Métriques**
- **Backend** : http://localhost:8000/health
- **Base de données** : Monitoring PostgreSQL
- **Frontend** : Métriques de performance

## 🤝 Contribution

### **Workflow de Développement**
1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### **Standards de Code**
- **Backend** : PEP 8, Type hints, Docstrings
- **Frontend** : ESLint, Prettier, TypeScript strict
- **Tests** : Couverture > 80%
- **Documentation** : Mise à jour obligatoire

## 🎯 État Actuel du Projet

### **✅ Ce qui est terminé et fonctionnel :**
- **Backend complet** : API REST, services, modèles, base de données
- **Frontend complet** : Interface React, authentification, dashboard
- **Base de données** : Initialisée avec 2 équipes et 29 rôles
- **Infrastructure** : Scripts de démarrage, Docker, documentation
- **Logique de jeu** : Tous les systèmes de base implémentés

### **🚧 En cours de développement :**
- Tests automatisés
- Optimisations de performance
- Déploiement production

### **🎮 Application prête à l'utilisation :**
L'application Wendigo Game est **entièrement fonctionnelle** et peut être utilisée pour :
- Créer des comptes utilisateurs
- Créer et rejoindre des parties
- Gérer des lobbies de jeu
- Tester l'API complète

## 📋 Roadmap

### **Phase 1 : Fondations** ✅
- [x] Architecture backend FastAPI
- [x] Base de données et modèles SQLAlchemy
- [x] Authentification JWT
- [x] API REST complète
- [x] Services de logique métier
- [x] Gestion des exceptions personnalisées

### **Phase 2 : Frontend** ✅
- [x] Application React TypeScript
- [x] Interface d'authentification (Login/Register)
- [x] Dashboard principal
- [x] Design responsive et moderne
- [x] Services API et WebSocket
- [x] Contexts React pour la gestion d'état

### **Phase 3 : Logique de Jeu** ✅
- [x] Système de lobby et gestion des parties
- [x] Attribution des rôles (29 rôles uniques)
- [x] Gestion des phases (Jour, Soir, Nuit)
- [x] Système de pouvoirs et d'actions
- [x] Gestion des votes et accusations
- [x] Système de chat et communications

### **Phase 4 : Infrastructure** ✅
- [x] Base de données initialisée avec données de base
- [x] Scripts de démarrage automatisés
- [x] Configuration Docker et Docker Compose
- [x] Structure de projet complète
- [x] Documentation technique détaillée

### **Phase 5 : Tests et Déploiement** 🚧
- [ ] Tests automatisés (unitaires, intégration)
- [ ] CI/CD pipeline
- [ ] Déploiement production
- [ ] Monitoring et observabilité
- [ ] Optimisations de performance

## 📞 Support

### **Ressources**
- **Documentation Backend** : [docs/BACKEND_README.md](docs/BACKEND_README.md)
- **Documentation Frontend** : [frontend/README.md](frontend/README.md)
- **Documentation Architecture** : [docs/ARCHITECTURE_SOLID_IMPLEMENTATION.md](docs/ARCHITECTURE_SOLID_IMPLEMENTATION.md)
- **Issues GitHub** : Rapport de bugs et demandes de fonctionnalités

### **État du Projet**
- **Version** : 1.0.0 (Beta)
- **Statut** : Application fonctionnelle et prête à l'utilisation
- **Dernière mise à jour** : Août 2025

### **Contact et Communauté**
- **Discord** : [Serveur Wendigo Game](https://discord.gg/wendigogame)
- **GitHub** : [Repository Wendigo Game](https://github.com/wendigogame)
- **Documentation** : [Wiki du projet](https://github.com/wendigogame/wiki)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Communauté Werewolf** pour l'inspiration
- **FastAPI** pour le backend performant
- **React** pour l'interface utilisateur
- **Tous les contributeurs** du projet

---

**Wendigo Game** - Révolutionnez votre expérience de jeu de loup-garou ! 🐺✨

*Développé avec ❤️ par l'équipe Wendigo Game*
