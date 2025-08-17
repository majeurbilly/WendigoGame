# 🎮 WendiGame v2 - API Python

## 📋 Description du Projet

**WendiGame v2** est une API backend moderne développée en Python avec FastAPI, conçue pour gérer un système de jeu multijoueur avec des lobbies, un chat en temps réel et une gestion des joueurs. Cette version est une réécriture complète de l'ancienne version Java, offrant une architecture plus moderne et performante.

## 🏗️ Architecture du Projet

Le projet suit une architecture en couches bien définie :

```
WendiGame_v2/
├── main.py          # Point d'entrée principal avec FastAPI et WebSockets
├── controllers.py   # Contrôleurs API REST et logique métier
├── models.py        # Modèles de données Pydantic
├── services.py      # Services métier et logique applicative
├── config.py        # Configuration de l'application
├── requirements.txt # Dépendances Python
└── run.py          # Script de démarrage alternatif
```

## 🚀 Fonctionnalités Principales

### 1. **Gestion des Joueurs** 👥
- Création et gestion des comptes utilisateurs
- Suivi du statut en ligne/hors ligne
- Recherche par ID, nom d'utilisateur ou email
- Gestion des sessions et dernières connexions

### 2. **Système de Lobbies** 🎯
- Création de lobbies de jeu personnalisables
- Rejoindre/quitter des lobbies
- Limitation du nombre de joueurs par lobby
- Gestion des statuts de partie (en attente, en cours, terminée)

### 3. **Chat en Temps Réel** 💬
- Communication instantanée via WebSockets
- Messages par lobby
- Historique des conversations
- Notifications système (arrivée/départ de joueurs)

### 4. **API REST Complète** 🌐
- Endpoints CRUD pour tous les entités
- Gestion des erreurs et validation des données
- Réponses standardisées avec format JSON
- Documentation automatique avec FastAPI

### 5. **WebSockets** 🔌
- Connexions en temps réel
- Gestion des lobbies multiples
- Broadcast des messages
- Gestion automatique des déconnexions

## 🛠️ Technologies Utilisées

- **FastAPI** : Framework web moderne et rapide
- **Pydantic** : Validation et sérialisation des données
- **WebSockets** : Communication bidirectionnelle en temps réel
- **Uvicorn** : Serveur ASGI performant
- **Python 3.8+** : Langage de programmation

## 📦 Installation et Configuration

### Prérequis
- Python 3.8 ou supérieur
- pip (gestionnaire de paquets Python)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WendiGame_v2
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Lancer le serveur**
```bash
python main.py
```

Le serveur sera accessible sur `http://localhost:8000`

## 🔧 Configuration

Le fichier `config.py` permet de personnaliser :
- Port du serveur (défaut : 8000)
- Origines CORS autorisées
- Limites de messages et de joueurs
- Mode debug

## 📡 API Endpoints

### Joueurs
- `POST /api/joueurs` - Créer un joueur
- `GET /api/joueurs` - Lister tous les joueurs
- `GET /api/joueurs/{id}` - Récupérer un joueur
- `PUT /api/joueurs/{id}/status` - Mettre à jour le statut

### Lobbies
- `POST /api/lobbies` - Créer un lobby
- `GET /api/lobbies` - Lister tous les lobbies
- `POST /api/lobbies/{id}/join` - Rejoindre un lobby
- `POST /api/lobbies/{id}/leave` - Quitter un lobby

### Chat
- `GET /api/chat/{lobby_id}/messages` - Historique des messages
- `DELETE /api/chat/{lobby_id}/clear` - Effacer l'historique

### WebSockets
- `ws://localhost:8000/ws/{lobby_id}` - Connexion WebSocket par lobby
- `ws://localhost:8000/ws` - Connexion WebSocket simple

## 🎯 Utilisation

### 1. **Démarrer le Serveur**
```bash
python main.py
```

### 2. **Créer un Joueur**
```bash
curl -X POST "http://localhost:8000/api/joueurs" \
     -H "Content-Type: application/json" \
     -d '{"username": "Player1", "email": "player1@example.com"}'
```

### 3. **Créer un Lobby**
```bash
curl -X POST "http://localhost:8000/api/lobbies" \
     -H "Content-Type: application/json" \
     -d '{"name": "Mon Lobby", "created_by": "Player1", "max_players": 5}'
```

### 4. **Se Connecter en WebSocket**
```javascript
// Exemple côté client
const ws = new WebSocket('ws://localhost:8000/ws/mon_lobby_id');

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Message reçu:', message);
};

// Envoyer un message
ws.send(JSON.stringify({
    type: 'chat',
    sender: 'Player1',
    content: 'Bonjour tout le monde!'
}));
```

## 📊 Monitoring et Statistiques

- **Health Check** : `GET /health`
- **Statistiques** : `GET /api/stats`
- **Statut des connexions** : `GET /api/health`

## 🔍 Logs et Debug

Le serveur génère des logs détaillés avec des emojis pour faciliter la lecture :
- 🔌 Connexions/déconnexions WebSocket
- 💬 Messages de chat
- 👋 Arrivées/départs de joueurs
- 🎮 Création de lobbies
- ❌ Erreurs et exceptions

## 🚧 Limitations Actuelles

- **Stockage en mémoire** : Les données sont perdues au redémarrage
- **Authentification** : Pas de système d'auth implémenté
- **Persistance** : Pas de base de données
- **Scalabilité** : Serveur unique (pas de clustering)

## 🔮 Évolutions Futures

- [ ] Intégration d'une base de données (PostgreSQL/MongoDB)
- [ ] Système d'authentification JWT
- [ ] Clustering et load balancing
- [ ] Système de parties de jeu
- [ ] Notifications push
- [ ] Interface d'administration
- [ ] Tests automatisés
- [ ] Documentation OpenAPI complète

## 🤝 Contribution

Ce projet est ouvert aux contributions ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests
- Améliorer la documentation

## 📄 Licence

Ce projet est développé dans un cadre éducatif et de développement personnel.

## 👨‍💻 Auteur

Développé avec ❤️ pour le projet WendiGame

---

**Note** : Cette version Python est une réécriture complète de la version Java originale, offrant une architecture plus moderne et des performances améliorées grâce à FastAPI et aux WebSockets asynchrones.
