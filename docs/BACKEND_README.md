# 🎮 Backend Wendigo Game - Documentation Technique

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Structure du Projet](#structure-du-projet)
4. [Technologies Utilisées](#technologies-utilisées)
5. [Installation et Configuration](#installation-et-configuration)
6. [Base de Données](#base-de-données)
7. [API Endpoints](#api-endpoints)
8. [WebSockets](#websockets)
9. [Sécurité](#sécurité)
10. [Développement](#développement)
11. [Tests](#tests)
12. [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

Le backend Wendigo Game est une API RESTful construite avec FastAPI qui gère toute la logique métier du jeu hybride physique-digital. Il supporte 29 rôles uniques, des parties en temps réel, et une architecture scalable basée sur les principes SOLID.

### Fonctionnalités Principales

- ✅ **Authentification JWT** complète
- ✅ **Gestion des utilisateurs** avec statistiques
- ✅ **Système de jeux** avec phases et tours
- ✅ **29 rôles uniques** avec pouvoirs spécifiques
- ✅ **Communication WebSocket** en temps réel
- ✅ **Base de données SQLite/PostgreSQL**
- ✅ **API RESTful** documentée
- ✅ **Architecture SOLID** et extensible

## 🏗️ Architecture

### Architecture Générale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Base de       │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Données       │
│                 │    │                 │    │   (SQLite)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   WebSockets    │
                       │   (Temps réel)  │
                       └─────────────────┘
```

### Principes SOLID Appliqués

1. **Single Responsibility Principle (SRP)**
   - Chaque module a une responsabilité unique
   - Séparation claire entre modèles, schémas, et endpoints

2. **Open/Closed Principle (OCP)**
   - Architecture extensible pour ajouter de nouveaux rôles
   - Système de plugins pour les pouvoirs

3. **Liskov Substitution Principle (LSP)**
   - Polymorphisme pour les rôles et équipes
   - Interfaces communes pour les actions

4. **Interface Segregation Principle (ISP)**
   - Interfaces granulaires pour les pouvoirs
   - Séparation des responsabilités d'authentification

5. **Dependency Inversion Principle (DIP)**
   - Injection de dépendances pour les services
   - Couplage faible entre les composants

## 📁 Structure du Projet

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── api.py                 # Routeur principal API v1
│   │       ├── endpoints/             # Endpoints REST
│   │       │   ├── auth.py           # Authentification
│   │       │   ├── users.py          # Gestion utilisateurs
│   │       │   ├── games.py          # Gestion jeux
│   │       │   ├── players.py        # Gestion joueurs
│   │       │   ├── roles.py          # Gestion rôles
│   │       │   └── teams.py          # Gestion équipes
│   │       └── websocket/
│   │           └── game_websocket.py  # WebSocket temps réel
│   ├── core/
│   │   ├── config.py                 # Configuration application
│   │   ├── database.py               # Configuration base de données
│   │   └── security.py               # Utilitaires sécurité
│   ├── models/                       # Modèles SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py                   # Modèle utilisateur
│   │   ├── game.py                   # Modèle jeu
│   │   ├── player.py                 # Modèle joueur
│   │   ├── role.py                   # Modèle rôle
│   │   ├── team.py                   # Modèle équipe
│   │   ├── vote.py                   # Modèle vote
│   │   ├── action.py                 # Modèle action
│   │   └── phase.py                  # Modèle phase
│   ├── schemas/                      # Schémas Pydantic
│   │   ├── __init__.py
│   │   ├── auth.py                   # Schémas authentification
│   │   ├── user.py                   # Schémas utilisateur
│   │   ├── game.py                   # Schémas jeu
│   │   ├── player.py                 # Schémas joueur
│   │   ├── role.py                   # Schémas rôle
│   │   └── team.py                   # Schémas équipe
│   ├── services/                     # Logique métier (à implémenter)
│   ├── middleware/                   # Middleware personnalisé
│   └── main.py                       # Point d'entrée application
├── data/
│   └── initial_data.py               # Données initiales
├── tests/                            # Tests (à implémenter)
├── pyproject.toml                    # Configuration projet
└── README.md                         # Documentation projet
```

## 🛠️ Technologies Utilisées

### Backend Principal
- **FastAPI** (v0.104+) : Framework web moderne et rapide
- **Uvicorn** : Serveur ASGI pour FastAPI
- **SQLAlchemy** (v2.0+) : ORM pour la base de données
- **Pydantic** (v2.5+) : Validation et sérialisation des données
- **Alembic** : Migrations de base de données

### Base de Données
- **SQLite** : Base de données de développement
- **PostgreSQL** : Base de données de production (prévu)

### Sécurité
- **python-jose** : Gestion des tokens JWT
- **passlib** : Hachage des mots de passe (bcrypt)
- **python-multipart** : Gestion des formulaires

### Communication Temps Réel
- **WebSockets** : Communication bidirectionnelle
- **asyncio** : Programmation asynchrone

### Outils de Développement
- **pytest** : Tests unitaires
- **black** : Formatage de code
- **isort** : Tri des imports
- **mypy** : Vérification de types

## ⚙️ Installation et Configuration

### Prérequis
- Python 3.11+
- pip ou uv

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WendigoGame/backend
```

2. **Installer les dépendances**
```bash
# Avec pip
pip install -e .

# Ou avec uv
uv sync
```

3. **Configuration environnement**
```bash
# Créer un fichier .env (optionnel)
cp .env.example .env
# Modifier les variables selon vos besoins
```

4. **Initialiser la base de données**
```bash
python data/initial_data.py
```

5. **Démarrer le serveur**
```bash
# Mode développement
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Mode production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Variables d'Environnement

```env
# Configuration API
API_V1_STR=/api/v1
PROJECT_NAME=Wendigo Game
VERSION=0.1.0

# Base de données
DATABASE_URL=sqlite:///./wendigo_game.db

# Sécurité
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Configuration jeu
MIN_PLAYERS=8
MAX_PLAYERS=29
DAY_PHASE_DURATION=600
NIGHT_PHASE_DURATION=300

# WebSocket
WEBSOCKET_PING_INTERVAL=20
WEBSOCKET_PING_TIMEOUT=20

# Logging
DEBUG=true
LOG_LEVEL=INFO
```

## 🗄️ Base de Données

### Modèles Principaux

#### User
- Gestion des comptes utilisateurs
- Statistiques de jeu (parties jouées, gagnées, score)
- Authentification et autorisation

#### Game
- État des parties (création, en cours, terminée)
- Phases et tours actuels
- Limites de joueurs et durée

#### Player
- Joueurs dans une partie
- État (vivant/mort, prêt, connecté)
- Position de chaise et notes personnelles

#### Role
- 29 rôles uniques avec pouvoirs spécifiques
- Appartenance à une équipe (Villageois/Loups)
- Limites d'utilisation et phases d'action

#### Team
- Équipes du jeu (Villageois, Loups)
- Couleurs et descriptions

#### Vote
- Système de vote (accusation, condamnation, loup)
- Résultats et comptage

#### Action
- Actions des rôles (pouvoirs)
- Statut d'exécution et messages

#### Phase
- Phases de jeu (jour, soir, nuit)
- Durée et événements

### Relations

```
User (1) ──── (N) Player
Game (1) ──── (N) Player
Game (1) ──── (N) Phase
Game (1) ──── (N) Vote
Game (1) ──── (N) Action
Team (1) ──── (N) Role
Role (1) ──── (N) Player
Player (1) ──── (N) Vote (voter)
Player (1) ──── (N) Vote (target)
Player (1) ──── (N) Action (actor)
Player (1) ──── (N) Action (target)
```

## 🔌 API Endpoints

### Authentification
```
POST   /api/v1/auth/register     # Inscription utilisateur
POST   /api/v1/auth/login        # Connexion utilisateur
GET    /api/v1/auth/me           # Informations utilisateur actuel
POST   /api/v1/auth/logout       # Déconnexion (client-side)
```

### Utilisateurs
```
GET    /api/v1/users/            # Liste utilisateurs (admin)
GET    /api/v1/users/me          # Profil utilisateur actuel
PUT    /api/v1/users/me          # Modifier profil
GET    /api/v1/users/me/stats    # Statistiques utilisateur
GET    /api/v1/users/{user_id}   # Détails utilisateur
```

### Jeux
```
GET    /api/v1/games/            # Liste des jeux
POST   /api/v1/games/            # Créer un nouveau jeu
GET    /api/v1/games/{game_id}   # Détails d'un jeu
POST   /api/v1/games/{game_id}/join    # Rejoindre un jeu
POST   /api/v1/games/{game_id}/start   # Démarrer un jeu
GET    /api/v1/games/{game_id}/status  # Statut d'un jeu
```

### Joueurs
```
GET    /api/v1/players/game/{game_id}           # Joueurs d'un jeu
GET    /api/v1/players/game/{game_id}/me        # Mon profil dans le jeu
PUT    /api/v1/players/game/{game_id}/ready     # Se marquer comme prêt
PUT    /api/v1/players/game/{game_id}/chair     # Sélectionner une chaise
PUT    /api/v1/players/game/{game_id}/notes     # Modifier notes personnelles
GET    /api/v1/players/game/{game_id}/neighbors # Voisins (gauche/droite)
GET    /api/v1/players/game/{game_id}/left-neighbors # N voisins à gauche
```

### Rôles
```
GET    /api/v1/roles/                    # Liste des rôles
GET    /api/v1/roles/{role_id}           # Détails d'un rôle
GET    /api/v1/roles/team/{team_name}    # Rôles par équipe
```

### Équipes
```
GET    /api/v1/teams/            # Liste des équipes
GET    /api/v1/teams/{team_id}   # Détails d'une équipe
```

### Utilitaires
```
GET    /health                   # Santé de l'API
GET    /info                     # Informations API
GET    /docs                     # Documentation Swagger
GET    /redoc                    # Documentation ReDoc
```

## 🔄 WebSockets

### Endpoint
```
WS /api/v1/ws/game/{game_id}
```

### Authentification
- Token JWT requis dans l'en-tête `Authorization`
- Vérification automatique de l'appartenance au jeu

### Types de Messages

#### Chat
```json
{
  "type": "chat",
  "data": {
    "message": "Hello world!",
    "chat_type": "public" // public, wolf, ghost, medium, twins, poltergeist
  }
}
```

#### Actions
```json
{
  "type": "action",
  "data": {
    "action_type": "use_power",
    "target_id": "player-uuid",
    "additional_data": {}
  }
}
```

#### Votes
```json
{
  "type": "vote",
  "data": {
    "vote_type": "accusation",
    "target_id": "player-uuid"
  }
}
```

#### Prêt
```json
{
  "type": "ready",
  "data": {
    "is_ready": true
  }
}
```

#### Sélection de Chaise
```json
{
  "type": "chair_selection",
  "data": {
    "chair_position": 5
  }
}
```

### Messages de Broadcast

#### Mise à jour de jeu
```json
{
  "type": "game_update",
  "data": {
    "game_id": "game-uuid",
    "status": "playing",
    "current_phase": "day",
    "current_turn": 1
  }
}
```

#### Message de chat
```json
{
  "type": "chat_message",
  "data": {
    "player_id": "player-uuid",
    "username": "PlayerName",
    "message": "Hello!",
    "chat_type": "public",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## 🔒 Sécurité

### Authentification JWT
- **Algorithme** : HS256
- **Durée de vie** : 30 minutes (configurable)
- **Refresh tokens** : À implémenter

### Hachage des Mots de Passe
- **Algorithme** : bcrypt
- **Rounds** : 12 (par défaut)
- **Salt** : Automatique

### CORS
- **Origines autorisées** : Configurables
- **Méthodes** : GET, POST, PUT, DELETE, OPTIONS
- **Headers** : Authorization, Content-Type

### Validation des Données
- **Pydantic** : Validation automatique des schémas
- **SQLAlchemy** : Validation au niveau base de données
- **Sanitisation** : Protection contre les injections

## 🚀 Développement

### Structure des Services

Les services suivants sont à implémenter selon l'architecture SOLID :

```
app/services/
├── __init__.py
├── auth_service.py          # Logique d'authentification
├── game_service.py          # Logique de jeu
├── player_service.py        # Logique des joueurs
├── role_service.py          # Logique des rôles
├── power_service.py         # Système de pouvoirs
├── vote_service.py          # Système de vote
├── phase_service.py         # Gestion des phases
├── websocket_service.py     # Gestion WebSocket
└── notification_service.py  # Notifications temps réel
```

### Patterns de Conception

#### Factory Pattern (Rôles)
```python
class RoleFactory:
    @staticmethod
    def create_role(role_name: str, player: Player) -> BaseRole:
        # Création dynamique des rôles
        pass
```

#### Repository Pattern (Données)
```python
class UserRepository:
    def get_by_id(self, user_id: str) -> Optional[User]:
        pass
    
    def create(self, user: UserCreate) -> User:
        pass
```

#### Strategy Pattern (Pouvoirs)
```python
class PowerStrategy(ABC):
    @abstractmethod
    def execute(self, actor: Player, target: Player, game: Game) -> ActionResult:
        pass
```

### Logique de Jeu à Implémenter

1. **Système de Phases**
   - Gestion automatique des transitions
   - Timers et notifications
   - Événements de phase

2. **Système de Pouvoirs**
   - Exécution des actions de rôles
   - Priorité et résolution des conflits
   - Effets et conséquences

3. **Système de Vote**
   - Vote d'accusation (jour)
   - Vote de condamnation (soir)
   - Vote des loups (nuit)

4. **Système de Victoire**
   - Conditions de victoire par équipe
   - Détection automatique de fin de partie
   - Calcul des scores

## 🧪 Tests

### Structure des Tests
```
tests/
├── __init__.py
├── conftest.py              # Configuration pytest
├── unit/                    # Tests unitaires
│   ├── test_models.py
│   ├── test_schemas.py
│   └── test_services.py
├── integration/             # Tests d'intégration
│   ├── test_api.py
│   ├── test_database.py
│   └── test_websocket.py
└── fixtures/                # Données de test
    ├── users.py
    ├── games.py
    └── players.py
```

### Exécution des Tests
```bash
# Tests unitaires
pytest tests/unit/

# Tests d'intégration
pytest tests/integration/

# Tous les tests avec couverture
pytest --cov=app tests/

# Tests avec rapport HTML
pytest --cov=app --cov-report=html tests/
```

## 🚀 Déploiement

### Docker

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install -e .

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/wendigo
    depends_on:
      - db
    volumes:
      - ./backend:/app

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=wendigo
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Production

#### Variables d'Environnement Production
```env
DATABASE_URL=postgresql://user:pass@host:5432/wendigo
SECRET_KEY=your-super-secret-production-key
DEBUG=false
LOG_LEVEL=WARNING
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
```

#### Gunicorn
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📊 Monitoring et Logging

### Logging
- **Format** : JSON structuré
- **Niveaux** : DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Rotation** : Par taille et date

### Métriques
- **Prometheus** : Métriques d'application
- **Grafana** : Tableaux de bord
- **Health checks** : Endpoint `/health`

### Alerting
- **Erreurs 5xx** : Alertes immédiates
- **Latence élevée** : Alertes de performance
- **Disponibilité** : Monitoring continu

## 🤝 Contribution

### Standards de Code
- **Black** : Formatage automatique
- **isort** : Tri des imports
- **mypy** : Vérification de types
- **flake8** : Linting

### Pré-commit Hooks
```bash
pre-commit install
pre-commit run --all-files
```

### Workflow Git
1. **Feature branch** : `feature/nom-fonctionnalite`
2. **Pull Request** : Revue de code obligatoire
3. **Tests** : Passage obligatoire
4. **Merge** : Après approbation

## 📚 Ressources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)

### Architecture SOLID
- [Principes SOLID](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)

### Sécurité
- [OWASP Guidelines](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## 🎯 Prochaines Étapes

1. **Implémentation des services** selon l'architecture SOLID
2. **Système de pouvoirs** pour les 29 rôles
3. **Logique de jeu complète** (phases, votes, victoire)
4. **Tests automatisés** (unitaires et intégration)
5. **Frontend React** avec interface utilisateur
6. **Déploiement Docker** et CI/CD
7. **Monitoring et observabilité**
8. **Documentation utilisateur**

---

*Documentation mise à jour le : 28 août 2025*
*Version : 0.1.0*
