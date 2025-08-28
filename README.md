# 🐺 WendiGame - Jeu de Loup-Garou Évolué

## 📖 Description du Jeu

**WendiGame** est un jeu de loup-garou (werewolf) multijoueur en ligne où **tous les joueurs ont des pouvoirs uniques**. Contrairement au jeu classique, il n'y a **pas de villageois** - chaque participant a un rôle spécial avec des capacités distinctes.

### 🎯 Concept Principal
- **Deux équipes** : Les **Méchants** (Loups) vs Les **Villageois** (Défenseurs)
- **Tous les joueurs ont des pouvoirs** : Pas de rôles passifs
- **29 rôles uniques** : 23 Villageois + 6 Loups avec des capacités distinctes
- **Jeu d'équipe stratégique** : Communication et coordination essentielles
- **Équilibrage complexe** : Chaque rôle a ses forces et faiblesses

## 🏗️ Architecture du Projet

### Versions Existantes
- **v1** : Java Spring Boot + React (complexe)
- **v2** : Python FastAPI + WebSockets (intermédiaire)
- **v3** : **Version simplifiée** (objectif)

### Structure Actuelle
```
WendiGame/
├── WendiGame/          # v1 - Java Spring Boot
├── WendiGame_v2/       # v2 - Python FastAPI
├── FastAPIProject/     # Projet FastAPI séparé
└── README.md          # Ce fichier
```

## 🎮 Système de Jeu

### 👥 Rôles et Équipes

#### 🐺 **Équipe des Méchants (Loups)**
1. **Skinwalker** - Loup métamorphe
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

2. **Bouc Émissaire** - Loup sacrifié
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

3. **Warlord** - Chef de guerre
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

4. **Sbire** - Serviteur loyal
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

5. **Marchand de Sable** - Maître des rêves
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

6. **Pestiféré** - Loup maudit
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

#### 🛡️ **Équipe des Villageois (Défenseurs)**
1. **Voyante** - Détective
   - Pouvoir : Peut révéler l'identité d'un joueur
   - Capacité spéciale : Vision nocturne améliorée

2. **Épouvantail** - Protecteur des champs
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

3. **Corbeau** - Messager nocturne
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

4. **Renard** - Chasseur rusé
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

5. **Rêveur** - Voyant des songes
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

6. **Poltergeist** - Esprit perturbateur
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

7. **Coroner** - Expert médico-légal
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

8. **Psychopompe** - Guide des âmes
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

9. **Ensorceleuse** - Magicienne de charme
   - Pouvoir : [À compléter]
   - Capacité spéciale : [À compléter]

10. **Sorcière** - Guérisseuse
    - Pouvoir : Peut ressusciter un villageois mort
    - Capacité spéciale : Potion de protection

11. **Chaperon** - Protectrice des innocents
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

12. **Chasseur** - Combattant principal
    - Pouvoir : Peut tuer un loup par nuit
    - Capacité spéciale : Mort en martyr (tue un loup en mourant)

13. **Jumeaux** - Duo inséparable
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

14. **Insomniaque** - Veilleur nocturne
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

15. **Courtisane** - Séductrice
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

16. **Salvateur** - Sauveur de l'humanité
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

17. **Avocat du Diable** - Défenseur controversé
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

18. **Guerrier** - Combattant d'élite
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

19. **Curieux** - Investigateur
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

20. **Médium** - Communique avec les morts
    - Pouvoir : Peut recevoir des indices des joueurs morts
    - Capacité spéciale : Peut poser une question aux esprits

21. **Ancien** - Sage du village
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

22. **Garde du Corps** - Protecteur personnel
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

23. **Shérif** - Gardien de la loi
    - Pouvoir : [À compléter]
    - Capacité spéciale : [À compléter]

### 🌙 Phases de Jeu

#### **Phase 1 : Préparation**
- Création des lobbies
- Attribution des rôles
- Explication des règles

#### **Phase 2 : Nuit**
- Les loups choisissent leur victime
- Chaque joueur utilise son pouvoir
- Résolution des actions

#### **Phase 3 : Jour**
- Révélation des morts
- Discussion et débat
- Vote pour éliminer un joueur

#### **Phase 4 : Fin de Partie**
- Vérification des conditions de victoire
- Attribution des points

## 🚀 Plan de Développement - Version 3 Simplifiée

### 📋 **Étape 1 : Architecture de Base (1-2 semaines)**

#### 1.1 Structure du Projet
```
WendiGame_v3/
├── backend/
│   ├── main.py           # Serveur principal
│   ├── game/
│   │   ├── __init__.py
│   │   ├── models.py     # Modèles de jeu
│   │   ├── roles.py      # Définition des rôles
│   │   ├── game_logic.py # Logique de jeu
│   │   └── lobby.py      # Gestion des lobbies
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py     # Routes API
│   │   └── websocket.py  # WebSockets
│   └── config.py         # Configuration
├── frontend/
│   ├── index.html        # Page principale
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       ├── game.js       # Logique client
│       ├── lobby.js      # Gestion lobby
│       └── websocket.js  # Communication
└── README.md
```

#### 1.2 Technologies Simplifiées
- **Backend** : Python + FastAPI + WebSockets
- **Frontend** : HTML/CSS/JavaScript vanilla
- **Base de données** : Fichier JSON (pour commencer)
- **Déploiement** : Serveur local simple

### 📋 **Étape 2 : Modèles de Données (1 semaine)**

#### 2.1 Classes Principales
```python
# Joueur
class Player:
    id: str
    name: str
    role: Role
    is_alive: bool
    team: Team

# Rôle
class Role:
    name: str
    team: Team
    power: Power
    description: str

# Partie
class Game:
    id: str
    players: List[Player]
    phase: GamePhase
    current_turn: int
    winner: Team
```

#### 2.2 Système de Rôles
- Interface `Power` pour tous les pouvoirs
- Classes concrètes pour chaque rôle
- Système d'activation des pouvoirs

### 📋 **Étape 3 : Logique de Jeu (2-3 semaines)**

#### 3.1 Gestionnaire de Partie
```python
class GameManager:
    def start_game(self)
    def next_phase(self)
    def execute_powers(self)
    def check_win_conditions(self)
    def handle_vote(self)
```

#### 3.2 Système de Pouvoirs
- Interface commune pour tous les pouvoirs
- Résolution des conflits de pouvoirs
- Système de cooldown

#### 3.3 Phases de Jeu
- Automatisation des transitions
- Gestion des timers
- Notifications aux joueurs

### 📋 **Étape 4 : Interface Utilisateur (2 semaines)**

#### 4.1 Interface de Lobby
- Liste des joueurs
- Chat en temps réel
- Boutons de contrôle

#### 4.2 Interface de Jeu
- Affichage des phases
- Interface des pouvoirs
- Système de vote
- Chat de jeu

#### 4.3 Responsive Design
- Compatible mobile
- Interface intuitive
- Animations simples

### 📋 **Étape 5 : Communication Temps Réel (1 semaine)**

#### 5.1 WebSockets
- Connexions par lobby
- Messages de jeu
- Notifications système

#### 5.2 Synchronisation
- État de jeu partagé
- Actions en temps réel
- Gestion des déconnexions

### 📋 **Étape 6 : Tests et Optimisation (1 semaine)**

#### 6.1 Tests
- Tests unitaires des rôles
- Tests d'intégration
- Tests de charge

#### 6.2 Optimisation
- Performance des WebSockets
- Optimisation du code
- Gestion de la mémoire

## 🛠️ Technologies Recommandées

### Backend
- **FastAPI** : API moderne et rapide
- **WebSockets** : Communication temps réel
- **Pydantic** : Validation des données
- **Uvicorn** : Serveur ASGI

### Frontend
- **HTML5** : Structure
- **CSS3** : Styles et animations
- **JavaScript ES6+** : Logique client
- **WebSocket API** : Communication

### Outils de Développement
- **Git** : Versioning
- **Python venv** : Environnement virtuel
- **VS Code** : Éditeur
- **Postman** : Tests API

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

## 🎯 Objectifs de la V3

### Simplicité
- **Code minimal** : Moins de 2000 lignes
- **Dépendances réduites** : Maximum 5 packages
- **Déploiement facile** : Un seul fichier à lancer

### Fonctionnalité
- **Jeu complet** : Toutes les phases implémentées
- **29 rôles équilibrés** : Jeu équitable et varié
- **Interface claire** : Facile à comprendre
- **Système de rôles modulaire** : Facile d'ajout de nouveaux rôles

### Extensibilité
- **Ajout de rôles** : Architecture modulaire pour 29+ rôles
- **Nouvelles phases** : Système flexible
- **Personnalisation** : Configuration simple
- **Équilibrage dynamique** : Ajustement automatique selon le nombre de joueurs

## 🚀 Démarrage Rapide

### Installation
```bash
# Cloner le projet
git clone <repository>
cd WendiGame_v3

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install fastapi uvicorn websockets

# Lancer le serveur
python main.py
```

### Test
```bash
# Ouvrir dans le navigateur
http://localhost:8000
```

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

---

## 📞 Contact

Pour toute question ou suggestion concernant le projet WendiGame, n'hésitez pas à ouvrir une issue sur GitHub.

**Objectif final** : Créer un jeu de loup-garou moderne avec 29 rôles uniques, équilibré et amusant où chaque joueur a un rôle actif et des pouvoirs distincts ! 🎮✨

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
