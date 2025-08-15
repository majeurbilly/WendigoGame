# 🐍 WendiGame - Migration Java → Python

## 🚀 **Migration Complète de Spring Boot vers FastAPI**

Ce projet remplace votre serveur Java/Spring Boot par une solution Python moderne et plus simple à maintenir.

## 📋 **Ce qui a été migré**

### **Backend Java → Python**
- ✅ **Spring Boot** → **FastAPI** (plus rapide, plus simple)
- ✅ **WebSocket STOMP** → **WebSocket natif** (plus direct)
- ✅ **Controllers Java** → **Routes FastAPI** (plus clair)
- ✅ **Services Java** → **Services Python** (plus lisible)
- ✅ **Modèles Java** → **Modèles Pydantic** (validation automatique)

### **Fonctionnalités conservées**
- 🔄 **WebSockets** pour le chat en temps réel
- 🎮 **Gestion des lobbies** et des joueurs
- 💬 **Système de chat** avec historique
- 👥 **Gestion des utilisateurs** et connexions
- 📊 **API REST** complète

## 🏗️ **Architecture Python Simplifiée**

```
WendiGame_v2/
├── main.py              # 🚀 Point d'entrée FastAPI + WebSockets
├── models.py            # 📝 Modèles Pydantic (équivalents Java)
├── services.py          # ⚙️ Services métier (équivalents Java)
├── controllers.py       # 🎮 Routes API REST (équivalents Java)
├── config.py            # ⚙️ Configuration simplifiée
├── run.py               # ▶️ Script de démarrage
├── requirements.txt     # 📦 Dépendances Python (simplifiées)
└── README_PYTHON.md     # 📚 Ce fichier
```

## 🚀 **Installation et Démarrage**

### **1. Installer Python 3.8+**
```bash
# Vérifier la version
python --version
# ou
python3 --version
```

### **2. Installer les dépendances**
```bash
pip install -r requirements.txt
# ou
pip3 install -r requirements.txt
```

### **3. Démarrer le serveur**
```bash
# Option 1: Script de démarrage
python run.py

# Option 2: Directement avec uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### **4. Accéder à l'application**
- 🌐 **Serveur**: http://localhost:8000
- 📚 **Documentation API**: http://localhost:8000/docs
- 🔧 **Interface interactive**: http://localhost:8000/redoc

## 🔄 **Migration des WebSockets**

### **Avant (Java/Spring Boot)**
```java
@MessageMapping("/lobby")
@SendTo("/topic/lobby")
public ChatMessage handleLobby(ChatMessage message) {
    // Logique Java
}
```

### **Après (Python/FastAPI)**
```python
@app.websocket("/ws/{lobby_id}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: str):
    await manager.connect(websocket, lobby_id)
    # Logique Python asynchrone
```

## 📡 **Endpoints WebSocket**

### **Connexion WebSocket**
- **URL**: `ws://localhost:8000/ws/{lobby_id}`
- **Exemple**: `ws://localhost:8000/ws/lobby_1`

### **Types de messages supportés**
```json
{
  "type": "chat",
  "sender": "NomJoueur",
  "content": "Message du chat",
  "lobby_id": "lobby_1"
}
```

```json
{
  "type": "join_lobby",
  "sender": "NomJoueur",
  "lobby_id": "lobby_1"
}
```

## 🎮 **API REST**

### **Joueurs**
- `POST /api/joueurs` - Créer un joueur
- `GET /api/joueurs` - Liste des joueurs
- `GET /api/joueurs/{id}` - Détails d'un joueur
- `PUT /api/joueurs/{id}/status` - Mettre à jour le statut

### **Lobbies**
- `POST /api/lobbies` - Créer un lobby
- `GET /api/lobbies` - Liste des lobbies
- `GET /api/lobbies/{id}` - Détails d'un lobby
- `POST /api/lobbies/{id}/join` - Rejoindre un lobby
- `POST /api/lobbies/{id}/leave` - Quitter un lobby

### **Chat**
- `GET /api/chat/{lobby_id}/messages` - Historique des messages
- `DELETE /api/chat/{lobby_id}/clear` - Effacer l'historique

## 🔧 **Adaptation du Frontend React**

### **Modifier la connexion WebSocket**
```javascript
// Avant (Java/Spring Boot)
const socket = new SockJS('http://localhost:8080/ws-endpoint');

// Après (Python/FastAPI)
const socket = new WebSocket('ws://localhost:8000/ws/lobby_1');
```

### **Exemple de connexion simple**
```javascript
// Connexion WebSocket native (plus besoin de SockJS/STOMP)
const ws = new WebSocket('ws://localhost:8000/ws/lobby_1');

ws.onopen = () => {
    console.log('Connecté au serveur Python');
    
    // Envoyer un message de chat
    ws.send(JSON.stringify({
        type: 'chat',
        sender: 'MonNom',
        content: 'Bonjour tout le monde!',
        lobby_id: 'lobby_1'
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Message reçu:', message);
};
```

## 📊 **Avantages de la migration**

### **Performance**
- ⚡ **FastAPI** est plus rapide que Spring Boot
- 🚀 **WebSockets natifs** sans overhead STOMP
- 💾 **Moins de mémoire** utilisée

### **Développement**
- 🐍 **Python** plus simple que Java
- 📝 **Moins de code** pour la même fonctionnalité
- 🔍 **Validation automatique** avec Pydantic
- 📚 **Documentation automatique** de l'API

### **Maintenance**
- 🧹 **Code plus lisible** et maintenable
- 🐛 **Moins de bugs** grâce à la validation
- 🔄 **Déploiement plus simple**

## 🧪 **Tests et Validation**

### **Tester l'API**
```bash
# Test de santé
curl http://localhost:8000/health

# Test des WebSockets
# Utiliser un client WebSocket ou wscat
wscat -c ws://localhost:8000/ws/test
```

### **Tester les routes API**
```bash
# Créer un joueur
curl -X POST "http://localhost:8000/api/joueurs" \
     -H "Content-Type: application/json" \
     -d '{"username": "test", "email": "test@test.com"}'

# Créer un lobby
curl -X POST "http://localhost:8000/api/lobbies" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Lobby", "created_by": "test"}'
```

## 🚨 **Dépannage**

### **Erreurs communes**
1. **Port déjà utilisé**: Changer le port dans `config.py`
2. **CORS**: Vérifier les origines autorisées dans `config.py`
3. **Dépendances**: Réinstaller avec `pip install -r requirements.txt`
4. **Encodage Windows**: Les emojis ont été remplacés par du texte simple

### **Logs**
- 📝 **Console**: Logs en temps réel
- 📄 **Fichier**: `wendigame.log` pour l'historique

## 🔮 **Évolutions futures**

- 🗄️ **Base de données** SQLite/PostgreSQL
- 🔐 **Authentification** JWT
- 📱 **WebSocket sécurisé** (WSS)
- 🧪 **Tests unitaires** avec pytest
- 🐳 **Dockerisation** pour le déploiement

## 📞 **Support**

Si vous rencontrez des problèmes :
1. 📖 Vérifier ce README
2. 🔍 Consulter les logs du serveur
3. 📚 Consulter la documentation FastAPI
4. 🐛 Signaler les bugs avec les logs

---

**🎉 Félicitations ! Votre serveur Java est maintenant en Python ! 🐍**
