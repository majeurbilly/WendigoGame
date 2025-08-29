# Wendigo Game Backend

Backend FastAPI pour Wendigo Game - Jeu de Loup-Garou Hybride

## Description

Ce backend gère toute la logique métier du jeu Wendigo Game, incluant :
- Authentification et gestion des utilisateurs
- Gestion des parties et des lobbies
- Logique de jeu et attribution des rôles
- Communication WebSocket en temps réel
- Base de données et persistance des données

## Technologies

- **FastAPI** : Framework web moderne et rapide
- **SQLAlchemy** : ORM pour la gestion de la base de données
- **Pydantic** : Validation des données et sérialisation
- **WebSockets** : Communication en temps réel
- **JWT** : Authentification sécurisée

## Installation

```bash
# Installer les dépendances
uv pip install .

# Lancer en mode développement
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API Documentation

Une fois le serveur lancé, accédez à :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## Structure du Projet

```
backend/
├── app/
│   ├── api/           # Endpoints API REST
│   ├── core/          # Configuration et utilitaires
│   ├── models/        # Modèles SQLAlchemy
│   ├── schemas/       # Schémas Pydantic
│   ├── services/      # Logique métier
│   └── websocket/     # Gestion WebSocket
├── data/              # Données initiales
└── pyproject.toml     # Configuration Python
```
