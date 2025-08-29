# 🗺️ Roadmap Détaillée - Wendigo Game

## 📋 Vue d'Ensemble du Projet

**Objectif Final :** Créer un jeu de loup-garou hybride présentiel-numérique avec 29 rôles uniques, interface mobile-first et gestion automatique complète.

**Architecture Technique :** FastAPI (Backend) + React (Frontend) + WebSockets
**Durée Estimée :** 14-18 semaines (3.5-4.5 mois)
**Équipe Recommandée :** 2-3 développeurs (1 Backend FastAPI, 1 Frontend React, 1 Full-Stack)
**Priorité :** MVP fonctionnel d'abord, puis améliorations

## 🔄 **MISE À JOUR RÉCENTE - Rôles Clarifiés**

**Modifications apportées aux rôles :**
- **Marchand de Sable** : Peut sauter la phase d'accusation (Jour → Nuit direct)
- **Épouvantail** : Protège les 2 joueurs à sa gauche et à sa droite (1x/partie)
- **Renard** : Flaire les 3 joueurs à sa gauche (1x/partie)
- **Poltergeist** : Chat privé avec un joueur sélectionné (post-mortem)
- **Jumeaux** : Chat privé entre eux + reconnaissance mutuelle
- **Médium** : Accès anonyme au chat des fantômes
- **Guerrier** : Perte/récupération de pouvoir selon le résultat du duel
- **Avocat du Diable** : Risque de mort si protège un loup
- **Shérif** : Mise en prison (pas de vote, pas d'action nocturne)

**Nouvelles fonctionnalités à implémenter :**
- Système de position des chaises (voisins gauche/droite)
- Système de saut de phase (Marchand de Sable)
- Système de communication privée (Jumeaux, Poltergeist)
- Système de transformation d'équipe (Pestiféré, Sorcière)
- Système de duel et perte/récupération de pouvoir (Guerrier)

## 🚀 **MISE À JOUR ARCHITECTURE - FastAPI + React**

**Architecture technique mise à jour :**
- **Backend** : FastAPI avec architecture complète (SQLAlchemy, Pydantic, WebSockets)
- **Frontend** : React moderne avec TypeScript, Vite, React Router
- **Structure** : Architecture séparée backend/frontend avec Docker
- **Durée** : 14-18 semaines pour une architecture professionnelle
- **Équipe** : Spécialisation Backend/Frontend recommandée

---

## 🚀 **PHASE 1 : FONDATIONS & ARCHITECTURE (Semaines 1-3)**

### 📁 **1.1 Structure du Projet**
- [ ] **Créer l'arborescence des dossiers**
  - [ ] `backend/` - API FastAPI avec architecture complète
    - [ ] `app/` - Application principale
    - [ ] `api/` - Routes et endpoints
    - [ ] `core/` - Configuration et utilitaires
    - [ ] `models/` - Modèles Pydantic et SQLAlchemy
    - [ ] `schemas/` - Schémas de validation
    - [ ] `services/` - Logique métier
    - [ ] `dependencies/` - Dépendances FastAPI
    - [ ] `middleware/` - Middleware personnalisé
  - [ ] `frontend/` - Application React moderne
    - [ ] `src/` - Code source React
    - [ ] `public/` - Assets statiques
    - [ ] `components/` - Composants réutilisables
    - [ ] `hooks/` - Hooks personnalisés
    - [ ] `context/` - Context API React
    - [ ] `services/` - Services API
    - [ ] `utils/` - Utilitaires
  - [ ] `shared/` - Code partagé entre backend et frontend
  - [ ] `tests/` - Tests unitaires et d'intégration
  - [ ] `docs/` - Documentation technique
  - [ ] `scripts/` - Scripts de build et déploiement
  - [ ] `data/` - Données de jeu (rôles, règles)

- [ ] **Configurer l'environnement de développement**
  - [ ] **Backend Python/FastAPI**
    - [ ] Créer `pyproject.toml` avec dépendances FastAPI
    - [ ] Configurer `uv` pour la gestion des paquets
    - [ ] Créer environnement virtuel Python
    - [ ] Installer FastAPI, uvicorn, websockets, sqlalchemy, pydantic
  - [ ] **Frontend React**
    - [ ] Créer projet React avec Vite ou Create React App
    - [ ] Configurer TypeScript pour le typage
    - [ ] Installer dépendances : react-router-dom, axios, websocket
    - [ ] Configurer ESLint et Prettier
  - [ ] **Outils de développement**
    - [ ] Docker pour la conteneurisation
    - [ ] Docker Compose pour l'environnement local
    - [ ] Hot reload pour backend et frontend

### 🏗️ **1.2 Architecture Backend FastAPI**
- [ ] **Architecture FastAPI complète**
  - [ ] `app/main.py` - Application FastAPI avec configuration
  - [ ] `app/core/config.py` - Configuration avec Pydantic Settings
  - [ ] `app/core/security.py` - Authentification et autorisation
  - [ ] `app/core/database.py` - Configuration base de données
  - [ ] `app/middleware/` - Middleware personnalisé (CORS, logging, etc.)

- [ ] **Modèles de données avec Pydantic et SQLAlchemy**
  - [ ] `app/models/` - Modèles SQLAlchemy (base de données)
    - [ ] `player.py` - Modèle Joueur
    - [ ] `role.py` - Modèle Rôle
    - [ ] `game.py` - Modèle Partie
    - [ ] `phase.py` - Modèle Phase
    - [ ] `team.py` - Modèle Équipe
  - [ ] `app/schemas/` - Schémas Pydantic (validation API)
    - [ ] `player.py` - Schémas de requête/réponse
    - [ ] `role.py` - Schémas de validation
    - [ ] `game.py` - Schémas de partie
    - [ ] `auth.py` - Schémas d'authentification

- [ ] **Services et logique métier**
  - [ ] `app/services/` - Services FastAPI
    - [ ] `game_service.py` - Gestionnaire principal de partie
    - [ ] `role_service.py` - Gestion des rôles et pouvoirs
    - [ ] `phase_service.py` - Gestion des phases et timers
    - [ ] `vote_service.py` - Système de votes et accusations
    - [ ] `auth_service.py` - Service d'authentification

- [ ] **API Routes FastAPI**
  - [ ] `app/api/v1/` - Version 1 de l'API
    - [ ] `endpoints/` - Endpoints REST
    - [ ] `websocket/` - Endpoints WebSocket
    - [ ] `dependencies/` - Dépendances FastAPI

### 🔌 **1.3 Infrastructure WebSocket FastAPI**
- [ ] **WebSocket Manager FastAPI**
  - [ ] `app/api/v1/websocket/connection_manager.py` - Gestionnaire de connexions
  - [ ] `app/api/v1/websocket/lobby_manager.py` - Gestion des lobbys par partie
  - [ ] `app/api/v1/websocket/game_manager.py` - Gestion des parties en temps réel
  - [ ] Système de broadcast avec FastAPI WebSocket

- [ ] **Gestion des connexions avancée**
  - [ ] Authentification WebSocket avec tokens
  - [ ] Gestion des déconnexions/reconnexions
  - [ ] Heartbeat et ping/pong
  - [ ] Gestion des erreurs WebSocket

### 🎨 **1.4 Architecture Frontend React**
- [ ] **Structure React moderne**
  - [ ] `frontend/src/App.tsx` - Application principale
  - [ ] `frontend/src/main.tsx` - Point d'entrée
  - [ ] `frontend/src/router/` - Configuration React Router
  - [ ] `frontend/src/layouts/` - Layouts de base

- [ ] **Composants React organisés**
  - [ ] `frontend/src/components/ui/` - Composants UI de base
  - [ ] `frontend/src/components/game/` - Composants spécifiques au jeu
  - [ ] `frontend/src/components/lobby/` - Composants de lobby
  - [ ] `frontend/src/components/auth/` - Composants d'authentification

- [ ] **Hooks et Context React**
  - [ ] `frontend/src/hooks/useWebSocket.ts` - Hook WebSocket personnalisé
  - [ ] `frontend/src/hooks/useGame.ts` - Hook de gestion du jeu
  - [ ] `frontend/src/context/GameContext.tsx` - Context du jeu
  - [ ] `frontend/src/context/AuthContext.tsx` - Context d'authentification

- [ ] **Services API React**
  - [ ] `frontend/src/services/api.ts` - Client API avec Axios
  - [ ] `frontend/src/services/websocket.ts` - Service WebSocket
  - [ ] `frontend/src/services/auth.ts` - Service d'authentification

---

## 🎮 **PHASE 2 : SYSTÈME DE JEU CORE (Semaines 3-5)**

### 👥 **2.1 Système de Rôles**
- [ ] **Implémenter les 29 rôles uniques avec leurs fonctionnalités spécifiques**

  - [ ] **Équipe des Méchants (6 rôles)**
    - [ ] **Skinwalker** - Loup métamorphe
      - [ ] Interface de vote nocturne avec les loups
      - [ ] Synchronisation avec le vote unanime des loups
      - [ ] Phase d'action : La nuit
    - [ ] **Bouc Émissaire** - Loup sacrifié
      - [ ] Interface de visualisation des autres loups
      - [ ] Pas de participation au vote nocturne
      - [ ] Phase d'action : La nuit
    - [ ] **Warlord** - Chef de guerre
      - [ ] Interface de protection d'un loup (1x/partie)
      - [ ] Visualisation de l'identité des loups
      - [ ] Phase d'action : Le jour
    - [ ] **Sbire** - Serviteur loyal
      - [ ] Interface de protection d'un loup (1x/partie)
      - [ ] Pas d'action nocturne
      - [ ] Phase d'action : Aucune
    - [ ] **Marchand de Sable** - Maître des rêves
      - [ ] Interface d'activation du pouvoir (1x/partie)
      - [ ] Logique de saut de phase d'accusation
      - [ ] Activation la nuit, effet au prochain tour
      - [ ] Phase d'action : La nuit
    - [ ] **Pestiféré** - Loup maudit
      - [ ] Interface de sélection de cible
      - [ ] Système de contamination en 2 nuits
      - [ ] Logique de transformation d'équipe
      - [ ] Phase d'action : La nuit

  - [ ] **Équipe des Villageois (23 rôles)**
    - [ ] **Voyante** - Détective
      - [ ] Interface de révélation d'identité
      - [ ] Affichage du rôle révélé
      - [ ] Phase d'action : La nuit
    - [ ] **Épouvantail** - Protecteur des champs
      - [ ] Interface de protection des voisins gauche/droite
      - [ ] Logique de protection basée sur la position des chaises
      - [ ] Protection unique par partie
      - [ ] Phase d'action : La nuit
    - [ ] **Corbeau** - Messager nocturne
      - [ ] Interface de désignation de joueur
      - [ ] Système de vote supplémentaire automatique
      - [ ] Phase d'action : La nuit
    - [ ] **Renard** - Chasseur rusé
      - [ ] Interface de flair des 3 joueurs à gauche
      - [ ] Logique de détection basée sur la position des chaises
      - [ ] Usage unique par partie
      - [ ] Phase d'action : La nuit
    - [ ] **Rêveur** - Voyant des songes
      - [ ] Interface de visualisation de la cible des loups
      - [ ] Affichage de l'information chaque nuit
      - [ ] Phase d'action : Le jour
    - [ ] **Poltergeist** - Esprit perturbateur
      - [ ] Interface de sélection de joueur pour chat privé
      - [ ] Système de chat privé post-mortem
      - [ ] Communication anonyme avec le joueur sélectionné
      - [ ] Phase d'action : Le jour
    - [ ] **Coroner** - Expert médico-légal
      - [ ] Interface d'analyse de cause de mort
      - [ ] Usage unique par partie
      - [ ] Détermination Méchant vs Villageois
      - [ ] Phase d'action : Le jour
    - [ ] **Psychopompe** - Guide des âmes
      - [ ] Interface de sélection aléatoire de pouvoir mort
      - [ ] Système de copie de pouvoir
      - [ ] Usage unique par partie
      - [ ] Phase d'action : La nuit
    - [ ] **Ensorceleuse** - Magicienne de charme
      - [ ] Interface de hantise de joueur
      - [ ] Logique de blocage de pouvoir
      - [ ] Phase d'action : La nuit
    - [ ] **Sorcière** - Guérisseuse
      - [ ] Interface de choix début de partie
      - [ ] Choix entre Potion (Villageois) et Poison (Méchant)
      - [ ] Changement d'équipe automatique
      - [ ] Phase d'action : La nuit
    - [ ] **Chaperon** - Protectrice des innocents
      - [ ] Système d'immunité automatique
      - [ ] Vérification de l'état du Chasseur
      - [ ] Perte d'immunité si Chasseur meurt
      - [ ] Phase d'action : Aucune
    - [ ] **Chasseur** - Combattant principal
      - [ ] Interface de sélection de cible à sa mort
      - [ ] Action immédiate post-mortem
      - [ ] Phase d'action : À sa mort
    - [ ] **Jumeaux** - Duo inséparable
      - [ ] Système de reconnaissance mutuelle
      - [ ] Chat privé entre jumeaux
      - [ ] Communication anonyme
      - [ ] Phase d'action : Aucune
    - [ ] **Insomniaque** - Veilleur nocturne
      - [ ] Interface d'espionnage de joueur
      - [ ] Détection d'utilisation de pouvoir
      - [ ] Immunité aux endormissements
      - [ ] Phase d'action : La nuit
    - [ ] **Courtisane** - Séductrice
      - [ ] Interface de sélection de voisin
      - [ ] Logique de protection ou mort
      - [ ] Détection automatique du type de voisin
      - [ ] Phase d'action : La nuit
    - [ ] **Salvateur** - Sauveur de l'humanité
      - [ ] Interface de résurrection de joueur
      - [ ] Usage unique par partie
      - [ ] Logique de retour à la vie
      - [ ] Phase d'action : La nuit
    - [ ] **Avocat du Diable** - Défenseur controversé
      - [ ] Interface de protection de joueur
      - [ ] Annulation des votes contre la cible
      - [ ] Risque de mort si cible est loup
      - [ ] Phase d'action : La nuit
    - [ ] **Guerrier** - Combattant d'élite
      - [ ] Interface de défi en duel
      - [ ] Logique de duel nocturne
      - [ ] Système de perte/récupération de pouvoir
      - [ ] Phase d'action : La nuit
    - [ ] **Curieux** - Investigateur
      - [ ] Interface de révélation de rôle exact
      - [ ] Usage unique par partie
      - [ ] Affichage du rôle complet
      - [ ] Phase d'action : Le jour
    - [ ] **Médium** - Communique avec les morts
      - [ ] Accès anonyme au chat des fantômes
      - [ ] Interface de communication anonyme
      - [ ] Pas de révélation d'identité
      - [ ] Phase d'action : Aucune
    - [ ] **Ancien** - Sage du village
      - [ ] Affichage du nombre de méchants
      - [ ] Perte d'information à la mort
      - [ ] Information de début de partie
      - [ ] Phase d'action : Aucune
    - [ ] **Garde du Corps** - Protecteur personnel
      - [ ] Interface de protection totale
      - [ ] Protection contre toute attaque
      - [ ] Usage unique par partie
      - [ ] Phase d'action : La nuit
    - [ ] **Shérif** - Gardien de la loi
      - [ ] Interface de mise en prison
      - [ ] Logique de privation de vote et d'action
      - [ ] Usage quotidien
      - [ ] Phase d'action : Le jour

  - [ ] **Rôle Post-Mortem**
    - [ ] **Fantôme** - Esprit du village
      - [ ] Transformation automatique à la mort
      - [ ] Accès au chat des fantômes
      - [ ] Conservation de l'équipe d'origine
      - [ ] Participation continue malgré la mort

### ⏰ **2.2 Système de Phases**
- [ ] **Implémenter la boucle de jeu**
  - [ ] Phase Jour (10 minutes) - Discussion et sélection de chaises
  - [ ] Phase Soir - Accusations et bûcher
  - [ ] Phase Nuit - Actions des rôles
  - [ ] Phase Réveil - Annonce des morts

- [ ] **Système de sélection de chaises**
  - [ ] Interface de chaises numérotées (0-8 min : non-sélectionnables)
  - [ ] Fenêtre de sélection (8-10 min : 2 minutes seulement)
  - [ ] Chaises exclusives (une fois sélectionnée, indisponible)
  - [ ] Conséquences de non-sélection (exclusion du vote d'accusation)

### 🗳️ **2.3 Système de Votes**
- [ ] **Vote d'accusation**
  - [ ] Interface de vote en temps réel
  - [ ] Bûcher automatique (joueur le plus voté)
  - [ ] Défense de l'accusé (1 minute)
  - [ ] Vote de condamnation (tuer/épargner)

- [ ] **Vote unanime des loups**
  - [ ] Chat limité (1 message/jour, max 15 caractères)
  - [ ] Coordination obligatoire
  - [ ] Échec si votes divergents

---

## 📱 **PHASE 3 : INTERFACE UTILISATEUR REACT (Semaines 7-10)**

### 🎨 **3.1 Design System React**
- [ ] **Créer la charte graphique**
  - [ ] Palette de couleurs (Jour/Nuit/Soir)
  - [ ] Typographie et hiérarchie visuelle
  - [ ] Icônes et émojis pour les rôles
  - [ ] Composants UI réutilisables avec React

- [ ] **Responsive Design Mobile-First**
  - [ ] Breakpoints pour mobile, tablette, desktop
  - [ ] Grille flexible et adaptative avec CSS Grid/Flexbox
  - [ ] Boutons et zones tactiles optimisés
  - [ ] Navigation intuitive avec React Router

- [ ] **Système de composants React**
  - [ ] Composants UI de base (Button, Input, Modal, etc.)
  - [ ] Composants de jeu (PhaseDisplay, Timer, VoteInterface)
  - [ ] Composants de lobby (PlayerList, Chat, LobbySettings)
  - [ ] Composants de partie (GameBoard, RoleDisplay, ActionMenu)

### 🏠 **3.2 Interface de Lobby React**
- [ ] **Page d'accueil et connexion**
  - [ ] `LoginForm.tsx` - Formulaire de connexion/création de compte
  - [ ] `AuthContext.tsx` - Gestion des sessions utilisateur
  - [ ] `Dashboard.tsx` - Page d'accueil avec statistiques
  - [ ] `ProtectedRoute.tsx` - Protection des routes privées

- [ ] **Système de lobby React**
  - [ ] `LobbyList.tsx` - Liste des lobbys disponibles
  - [ ] `CreateLobby.tsx` - Création de lobby personnalisé
  - [ ] `JoinLobby.tsx` - Rejoindre un lobby existant
  - [ ] `LobbyChat.tsx` - Chat en temps réel avec WebSocket
  - [ ] `ReadyButton.tsx` - Bouton "Prêt" et confirmation
  - [ ] `PlayerList.tsx` - Liste des joueurs dans le lobby

### 🎯 **3.3 Interface de Partie React**
- [ ] **Écran principal de jeu**
  - [ ] `GameHeader.tsx` - Header avec logo et menu hamburger
  - [ ] `PhaseDisplay.tsx` - Zone centrale avec phase actuelle et timer
  - [ ] `ActionButtons.tsx` - Boutons principaux (Notes, Fiche, Règles, Action)
  - [ ] `PhaseIndicator.tsx` - Indicateurs visuels de phase

- [ ] **Système de sélection de chaises React**
  - [ ] `ChairSelection.tsx` - Affichage des chaises en cercle
  - [ ] `ChairInterface.tsx` - Interface de sélection (8-10 min)
  - [ ] `ChairAvailability.tsx` - Indicateurs de disponibilité
  - [ ] `ChairConfirmation.tsx` - Confirmation visuelle

- [ ] **Système de bûcher et votes React**
  - [ ] `VoteInterface.tsx` - Interface de vote d'accusation
  - [ ] `VoteDisplay.tsx` - Affichage des votes en temps réel
  - [ ] `DefenseZone.tsx` - Zone de défense de l'accusé
  - [ ] `CondemnationVote.tsx` - Interface de vote de condamnation

### 🍔 **3.4 Menu et Navigation React**
- [ ] **Menu hamburger complet**
  - [ ] `HamburgerMenu.tsx` - Menu principal avec navigation
  - [ ] `GameRules.tsx` - Règles du jeu
  - [ ] `PlayerNotes.tsx` - Notes personnelles
  - [ ] `PlayerProfiles.tsx` - Fiches joueurs
  - [ ] `GameHistory.tsx` - Historique de partie
  - [ ] `GameStats.tsx` - Statistiques
  - [ ] `PowerButton.tsx` - Bouton pouvoir
  - [ ] `LogoutButton.tsx` - Déconnexion

- [ ] **Système de notes avancé React**
  - [ ] `NoteSelector.tsx` - Sélection de joueur
  - [ ] `NoteEditor.tsx` - Zone de notes personnelles
  - [ ] `RoleSelector.tsx` - Sélecteur de rôle suspecté
  - [ ] `AutoSave.tsx` - Sauvegarde automatique

---

## 🌙 **PHASE 4 : SYSTÈME NOCTURNE (Semaines 9-10)**

### 📱 **4.1 Système de Vibration Séquentielle**
- [ ] **Réveil aléatoire des joueurs**
  - [ ] Ordre aléatoire de réveil
  - [ ] Vibration haptique (si supporté)
  - [ ] Écran qui s'illumine
  - [ ] Timer de 15 secondes pour l'action

- [ ] **Interface d'action nocturne**
  - [ ] Boutons d'action selon le rôle
  - [ ] Sélection de cible
  - [ ] Bouton "Continuer" si pas d'action
  - [ ] Transition de 5 secondes

### ⚡ **4.2 Résolution des Actions**
- [ ] **Système de priorité des actions**
  - [ ] Actions de Contrôle (Priorité 1)
    - [ ] Marchand de Sable - Endort sa cible
    - [ ] Ensorceleuse - Hante sa cible
    - [ ] Shérif - Met en prison
  - [ ] Actions de Protection (Priorité 2)
    - [ ] Épouvantail - Protège ses voisins gauche/droite
    - [ ] Garde du Corps - Protection totale
    - [ ] Warlord - Protection d'un loup
    - [ ] Sbire - Protection d'un loup
  - [ ] Actions d'Attaque (Priorité 3)
    - [ ] Guerrier - Duel nocturne
    - [ ] Courtisane - Dormir chez un voisin
  - [ ] Actions des Loups (Priorité 4)
    - [ ] Vote unanime requis
    - [ ] Skinwalker - Vote avec les loups
    - [ ] Pestiféré - Contamination
  - [ ] Actions d'Information (Priorité 5)
    - [ ] Voyante - Révèle l'identité
    - [ ] Renard - Flaire les voisins
    - [ ] Rêveur - Voir la cible des loups
    - [ ] Insomniaque - Espionne l'activité
    - [ ] Curieux - Révèle le rôle exact
  - [ ] Actions de Support (Priorité 6)
    - [ ] Corbeau - Vote supplémentaire
    - [ ] Psychopompe - Copie un pouvoir mort
  - [ ] Actions de Résurrection (Priorité 7)
    - [ ] Salvateur - Ramène à la vie
  - [ ] Actions Post-Mortem (Priorité 8)
    - [ ] Coroner - Analyse la cause de mort
    - [ ] Poltergeist - Communication post-mortem

- [ ] **Gestion des conflits**
  - [ ] Résolution automatique selon les priorités
  - [ ] Gestion des protections vs attaques
  - [ ] Logique des pouvoirs spéciaux
  - [ ] Gestion des transformations d'équipe (Pestiféré, Sorcière)
  - [ ] Résolution des duels et défis

---

## 👻 **PHASE 5 : SYSTÈMES AVANCÉS (Semaines 11-12)**

### 💬 **5.1 Chat Restreint**
- [ ] **Chat des loups**
  - [ ] Accès exclusif pendant la phase Jour
  - [ ] Limite de 1 message/jour
  - [ ] Limite de 15 caractères
  - [ ] Coordination pour vote unanime

- [ ] **Chat des fantômes**
  - [ ] Accès pour joueurs morts
  - [ ] Communication avec le Médium
  - [ ] Influence indirecte sur les vivants

### 📚 **5.2 Historique Complet**
- [ ] **Enregistrement des événements**
  - [ ] Actions des rôles
  - [ ] Votes et accusations
  - [ ] Phases de jeu
  - [ ] Morts et transformations
  - [ ] Chats et communications

- [ ] **Interface d'historique**
  - [ ] Timeline interactive
  - [ ] Filtres avancés
  - [ ] Statistiques en temps réel
  - [ ] Export et partage

### 🎭 **5.3 Système de Fantômes**
- [ ] **Transformation automatique**
  - [ ] Changement de rôle à la mort
  - [ ] Conservation de l'équipe
  - [ ] Accès au chat restreint
  - [ ] Participation continue

### 🔐 **5.4 Systèmes de Communication Privée**
- [ ] **Chat des Jumeaux**
  - [ ] Communication anonyme entre jumeaux
  - [ ] Interface de chat privé
  - [ ] Reconnaissance mutuelle automatique
- [ ] **Chat du Poltergeist**
  - [ ] Sélection de joueur pour chat privé
  - [ ] Communication post-mortem
  - [ ] Anonymat maintenu
- [ ] **Chat des Fantômes**
  - [ ] Accès pour tous les joueurs morts
  - [ ] Communication anonyme
  - [ ] Accès spécial pour le Médium

### 🪑 **5.5 Système de Position des Chaises**
- [ ] **Logique de positionnement**
  - [ ] Calcul automatique des voisins gauche/droite
  - [ ] Gestion des positions pour l'Épouvantail
  - [ ] Gestion des positions pour le Renard
  - [ ] Gestion des positions pour la Courtisane
- [ ] **Interface de sélection**
  - [ ] Affichage des chaises en cercle
  - [ ] Indicateurs de voisins
  - [ ] Validation des positions

---

## 🧪 **PHASE 6 : TESTS & OPTIMISATION (Semaines 13-14)**

### 🎯 **6.0 Tests Spécialisés par Rôle**
- [ ] **Tests des rôles complexes**
  - [ ] **Marchand de Sable** - Test du saut de phase d'accusation
  - [ ] **Pestiféré** - Test de contamination en 2 nuits
  - [ ] **Épouvantail** - Test de protection des voisins
  - [ ] **Renard** - Test de flair des voisins
  - [ ] **Courtisane** - Test de détection de type de voisin
  - [ ] **Guerrier** - Test de duel et perte/récupération de pouvoir
  - [ ] **Avocat du Diable** - Test de protection et risque de mort
  - [ ] **Sorcière** - Test de changement d'équipe
  - [ ] **Chaperon** - Test d'immunité conditionnelle
  - [ ] **Chasseur** - Test d'action post-mortem
  - [ ] **Jumeaux** - Test de reconnaissance et chat privé
  - [ ] **Poltergeist** - Test de chat privé post-mortem
  - [ ] **Médium** - Test d'anonymat dans le chat des fantômes

- [ ] **Tests des systèmes spéciaux**
  - [ ] Système de transformation d'équipe
  - [ ] Système de position des chaises
  - [ ] Système de communication privée
  - [ ] Système de vote unanime des loups
  - [ ] Système de fantômes et chat restreint

## 🧪 **PHASE 6 : TESTS & OPTIMISATION (Semaines 13-14)**

### ✅ **6.1 Tests Unitaires**
- [ ] **Tests des modèles**
  - [ ] Tests des classes Player, Role, Game
  - [ ] Tests des systèmes de vote
  - [ ] Tests des phases de jeu

- [ ] **Tests des services**
  - [ ] Tests du GameManager
  - [ ] Tests du RoleManager
  - [ ] Tests du VoteManager

### 🔄 **6.2 Tests d'Intégration**
- [ ] **Tests de partie complète**
  - [ ] Simulation d'une partie de 8 joueurs
  - [ ] Test des transitions de phase
  - [ ] Test des systèmes de vote

- [ ] **Tests WebSocket**
  - [ ] Connexions multiples
  - [ ] Gestion des déconnexions
  - [ ] Synchronisation temps réel

### ⚡ **6.3 Optimisation**
- [ ] **Performance**
  - [ ] Optimisation des WebSockets
  - [ ] Gestion de la mémoire
  - [ ] Latence minimale

- [ ] **Code Quality**
  - [ ] Refactoring si nécessaire
  - [ ] Documentation des fonctions
  - [ ] Gestion des erreurs

---

## 🚀 **PHASE 7 : DÉPLOIEMENT & FINALISATION (Semaines 15-16)**

### 🌐 **7.1 Préparation au Déploiement**
- [ ] **Configuration de production**
  - [ ] Variables d'environnement
  - [ ] Configuration serveur
  - [ ] Base de données (si migration depuis JSON)

- [ ] **Documentation utilisateur**
  - [ ] Guide de démarrage rapide
  - [ ] Manuel des règles
  - [ ] FAQ et dépannage

### 🎯 **7.2 Tests Finaux**
- [ ] **Tests de charge**
  - [ ] Simulation de 29 joueurs
  - [ ] Test de stabilité
  - [ ] Gestion des erreurs

- [ ] **Tests utilisateur**
  - [ ] Session de test avec vrais joueurs
  - [ ] Feedback et ajustements
  - [ ] Validation des fonctionnalités

### 🎉 **7.3 Lancement**
- [ ] **Déploiement en production**
  - [ ] Mise en ligne du serveur
  - [ ] Tests de production
  - [ ] Monitoring et alertes

- [ ] **Communication et support**
  - [ ] Annonce du lancement
  - [ ] Support utilisateur
  - [ ] Collecte de feedback

---

## 📊 **MÉTRIQUES DE SUCCÈS**

### 🎮 **Fonctionnelles**
- [ ] Jeu fonctionnel avec 8-29 joueurs
- [ ] 29 rôles uniques implémentés
- [ ] Communication temps réel stable
- [ ] Interface utilisable sur mobile
- [ ] Équilibrage des rôles validé

### 🛠️ **Techniques**
- [ ] Code maintenable et documenté
- [ ] Tests avec coverage > 80%
- [ ] Déploiement simple et automatisé
- [ ] Performance acceptable (< 100ms latence)

### 👥 **Utilisateur**
- [ ] Interface intuitive sans formation
- [ ] Expérience immersive et engageante
- [ ] Règles claires et équitables
- [ ] Support multi-plateforme

---

## 🚨 **RISQUES ET MITIGATIONS**

### ⚠️ **Risques Techniques**
- **WebSockets instables** → Fallback HTTP polling
- **Performance avec 29 joueurs** → Optimisation et tests de charge
- **Synchronisation complexe** → Tests intensifs et gestion d'erreurs

### ⚠️ **Risques Fonctionnels**
- **Équilibrage des rôles** → Tests avec différents nombres de joueurs
- **Règles trop complexes** → Simplification progressive
- **Interface confuse** → Tests utilisateur précoces

### ⚠️ **Risques de Planning**
- **Délais dépassés** → Phases prioritaires et MVP
- **Scope creep** → Backlog strict et validation des fonctionnalités
- **Dépendances externes** → Solutions alternatives et plan B

---

## 📅 **PLANNING DÉTAILLÉ PAR SEMAINE**

### **Semaine 1-3 : Fondations FastAPI + React**
- **Objectif :** Architecture complète backend et frontend
- **Livrable :** Backend FastAPI + Frontend React qui démarrent
- **Critère de succès :** API fonctionnelle + App React qui compile

### **Semaine 4-6 : Core Game Backend**
- **Objectif :** Système de jeu fonctionnel côté serveur
- **Livrable :** API FastAPI avec logique de jeu
- **Critère de succès :** Backend gère une partie de 8 joueurs

### **Semaine 7-10 : Interface React**
- **Objectif :** Interface utilisateur React complète
- **Livrable :** Application React responsive avec WebSocket
- **Critère de succès :** Interface utilisable sur mobile + connexion WebSocket

### **Semaine 9-10 : Système Nocturne**
- **Objectif :** Phases de nuit et pouvoirs
- **Livrable :** Système de vibration et actions
- **Critère de succès :** Tous les rôles peuvent agir la nuit

### **Semaine 11-12 : Fonctionnalités Avancées**
- **Objectif :** Chat, historique, fantômes
- **Livrable :** Jeu complet avec toutes les fonctionnalités
- **Critère de succès :** Expérience de jeu complète

### **Semaine 13-14 : Tests**
- **Objectif :** Stabilité et qualité
- **Livrable :** Code testé et optimisé
- **Critère de succès :** Tests passent et performance acceptable

### **Semaine 15-16 : Déploiement**
- **Objectif :** Mise en production
- **Livrable :** Application déployée et fonctionnelle
- **Critère de succès :** Jeu accessible publiquement

---

## 🎯 **CHECKLIST DE VALIDATION FINALE**

### **Fonctionnalités Core**
- [ ] Lobby et connexion
- [ ] Attribution des rôles
- [ ] Phases de jeu (Jour/Soir/Nuit)
- [ ] Système de sélection de chaises
- [ ] Votes et accusations
- [ ] Actions nocturnes
- [ ] Transformation en fantômes
- [ ] Conditions de victoire

### **Validation des Rôles Spéciaux**
- [ ] **Rôles avec transformation d'équipe**
  - [ ] Pestiféré - Contamination fonctionne en 2 nuits
  - [ ] Sorcière - Choix début de partie et changement d'équipe
- [ ] **Rôles avec position des chaises**
  - [ ] Épouvantail - Protection des voisins gauche/droite
  - [ ] Renard - Flair des 3 joueurs à gauche
  - [ ] Courtisane - Détection du type de voisin
- [ ] **Rôles avec communication privée**
  - [ ] Jumeaux - Reconnaissance mutuelle et chat
  - [ ] Poltergeist - Chat privé post-mortem
  - [ ] Médium - Anonymat dans le chat des fantômes
- [ ] **Rôles avec mécaniques uniques**
  - [ ] Marchand de Sable - Saut de phase d'accusation
  - [ ] Guerrier - Duel et perte/récupération de pouvoir
  - [ ] Avocat du Diable - Protection et risque de mort
  - [ ] Chaperon - Immunité conditionnelle
  - [ ] Chasseur - Action post-mortem

### **Interface Utilisateur**
- [ ] Design responsive mobile-first
- [ ] Navigation intuitive
- [ ] Feedback visuel clair
- [ ] Accessibilité de base
- [ ] Performance acceptable

### **Technique**
- [ ] Code documenté
- [ ] Tests automatisés
- [ ] Gestion d'erreurs
- [ ] Monitoring de base
- [ ] Déploiement automatisé

---

## 🚀 **PROCHAINES ÉTAPES APRÈS MVP**

### **Fonctionnalités Spéciales des Rôles - Détail Technique**
- [ ] **Système de transformation d'équipe**
  - [ ] Logique du Pestiféré (contamination en 2 nuits)
  - [ ] Logique de la Sorcière (choix début de partie)
  - [ ] Gestion des changements d'équipe en cours de partie

- [ ] **Système de position des chaises**
  - [ ] Calcul automatique des voisins gauche/droite
  - [ ] Logique de protection de l'Épouvantail
  - [ ] Logique de flair du Renard
  - [ ] Logique de la Courtisane

- [ ] **Système de communication privée**
  - [ ] Chat des Jumeaux (reconnaissance mutuelle)
  - [ ] Chat du Poltergeist (sélection de joueur)
  - [ ] Chat des Fantômes (anonymat)

- [ ] **Système de vote unanime des loups**
  - [ ] Coordination obligatoire
  - [ ] Chat limité (1 message/jour, 15 caractères)
  - [ ] Échec si votes divergents

- [ ] **Système de duel et défis**
  - [ ] Logique du Guerrier
  - [ ] Perte et récupération de pouvoir
  - [ ] Résolution des conflits

- [ ] **Système de saut de phase**
  - [ ] Marchand de Sable - Saut de phase d'accusation
  - [ ] Activation la nuit, effet au prochain tour
  - [ ] Gestion des transitions de phase

## 🚀 **PROCHAINES ÉTAPES APRÈS MVP**

### **Version 1.1 (Mois 5-6)**
- [ ] Système de statistiques avancé
- [ ] Mode spectateur
- [ ] Replays de parties
- [ ] Personnalisation des rôles

### **Version 1.2 (Mois 7-8)**
- [ ] Application mobile native
- [ ] Système de tournois
- [ ] Intégration vocale
- [ ] Mode campagne

### **Version 2.0 (Mois 9-12)**
- [ ] Nouveaux rôles et variantes
- [ ] Mode multilingue
- [ ] API publique
- [ ] Communauté et mods

---

## 🏗️ **ARCHITECTURE TECHNIQUE DÉTAILLÉE**

### **Backend FastAPI - Architecture Professionnelle**
- [ ] **Structure FastAPI complète**
  - [ ] `app/main.py` - Application principale avec middleware
  - [ ] `app/core/config.py` - Configuration avec Pydantic Settings
  - [ ] `app/core/database.py` - Base de données avec SQLAlchemy
  - [ ] `app/core/security.py` - JWT et authentification
  - [ ] `app/api/v1/` - API versionnée avec OpenAPI

- [ ] **Modèles et schémas**
  - [ ] Modèles SQLAlchemy pour la persistance
  - [ ] Schémas Pydantic pour la validation API
  - [ ] Relations entre modèles (Joueur, Rôle, Partie)
  - [ ] Migrations avec Alembic

- [ ] **Services et logique métier**
  - [ ] Services FastAPI pour la logique de jeu
  - [ ] Gestion des WebSockets avec FastAPI
  - [ ] Système de cache et optimisation
  - [ ] Logging et monitoring

### **Frontend React - Architecture Moderne**
- [ ] **Structure React organisée**
  - [ ] Composants fonctionnels avec hooks
  - [ ] Context API pour la gestion d'état global
  - [ ] React Router pour la navigation
  - [ ] Composants réutilisables et modulaires

- [ ] **Gestion d'état et communication**
  - [ ] Context pour l'état du jeu
  - [ ] Hooks personnalisés pour WebSocket
  - [ ] Services API avec Axios
  - [ ] Gestion des erreurs et loading states

- [ ] **Performance et UX**
  - [ ] Lazy loading des composants
  - [ ] Optimisation des re-renders
  - [ ] Responsive design mobile-first
  - [ ] Accessibilité et UX

### **Communication Backend-Frontend**
- [ ] **API REST FastAPI**
  - [ ] Endpoints CRUD pour les entités
  - [ ] Validation avec Pydantic
  - [ ] Documentation automatique OpenAPI
  - [ ] Gestion des erreurs et codes HTTP

- [ ] **WebSockets temps réel**
  - [ ] Connexions WebSocket authentifiées
  - [ ] Broadcast des événements de jeu
  - [ ] Gestion des déconnexions
  - [ ] Heartbeat et monitoring

---

## 💡 **CONSEILS DE DÉVELOPPEMENT**

### **Priorités**
1. **Fonctionnalité avant beauté** - Un jeu qui marche est mieux qu'un beau jeu qui ne marche pas
2. **Stabilité avant performance** - Un jeu stable est plus important qu'un jeu rapide
3. **Simplicité avant complexité** - Commencer simple, complexifier progressivement

### **Bonnes Pratiques**
- **Tests précoces** - Tester dès la semaine 3
- **Feedback utilisateur** - Intégrer des joueurs dès que possible
- **Itérations courtes** - Livrer quelque chose chaque semaine
- **Documentation continue** - Documenter au fur et à mesure

### **Outils Recommandés**
- **Backend :** VS Code, Python, FastAPI, SQLAlchemy, Pydantic
- **Frontend :** VS Code, React, TypeScript, Vite, React Router
- **Tests :** pytest (backend), Jest + React Testing Library (frontend)
- **Déploiement :** Docker, Docker Compose, GitHub Actions
- **Monitoring :** Sentry, Logs structurés, FastAPI monitoring
- **Base de données :** PostgreSQL (production), SQLite (développement)

---

## 🎮 **OBJECTIF FINAL**

**Créer un jeu de loup-garou moderne, immersif et entièrement automatisé où :**

- ✅ **Chaque joueur a un rôle unique et des pouvoirs distincts**
- ✅ **L'interface est intuitive et mobile-first**
- ✅ **La technologie gère automatiquement toutes les phases**
- ✅ **L'expérience sociale reste authentique et engageante**
- ✅ **Le jeu est équilibré et équitable pour 8-29 joueurs**

**Résultat attendu :** Un jeu qui révolutionne l'expérience du loup-garou en combinant le meilleur du présentiel et du numérique ! 🐺✨

---

*Cette roadmap est un guide flexible. Ajustez les priorités et délais selon vos ressources et contraintes.*
