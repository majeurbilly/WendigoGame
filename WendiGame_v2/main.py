from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import json
import logging
from typing import List, Dict
from datetime import datetime
import uvicorn

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variables globales pour gérer les connexions WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.lobby_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, lobby_id: str = "default"):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if lobby_id not in self.lobby_connections:
            self.lobby_connections[lobby_id] = []
        self.lobby_connections[lobby_id].append(websocket)
        
        logger.info(f"🔌 Nouvelle connexion WebSocket dans le lobby {lobby_id}")
        logger.info(f"📊 Total connexions actives: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket, lobby_id: str = "default"):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if lobby_id in self.lobby_connections and websocket in self.lobby_connections[lobby_id]:
            self.lobby_connections[lobby_id].remove(websocket)
        
        logger.info(f"🔌 Déconnexion WebSocket du lobby {lobby_id}")
        logger.info(f"📊 Total connexions actives: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_lobby(self, message: str, lobby_id: str = "default"):
        if lobby_id in self.lobby_connections:
            for connection in self.lobby_connections[lobby_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"❌ Erreur envoi message: {e}")
                    # Supprimer la connexion défaillante
                    self.disconnect(connection, lobby_id)

# Instance globale du gestionnaire de connexions
manager = ConnectionManager()

# Configuration de l'application FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage
    logger.info("Démarrage du serveur WendiGame Python")
    yield
    # Arrêt
    logger.info("Arrêt du serveur WendiGame Python")

app = FastAPI(
    title="WendiGame API",
    description="API Python pour le jeu WendiGame avec WebSockets",
    version="2.0.0",
    lifespan=lifespan
)

# Configuration CORS pour permettre les connexions depuis React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic (équivalents de vos classes Java)
from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    sender: str
    content: str
    timestamp: Optional[datetime] = None
    lobby_id: str = "default"

class LobbyMessage(BaseModel):
    type: str
    content: str
    sender: str
    lobby_id: str = "default"

class Joueur(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    is_online: bool = False

# Importer les contrôleurs
from controllers import api_router

# Inclure les routes API
app.include_router(api_router)

# Routes API REST de base
@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API WendiGame Python !"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "active_connections": len(manager.active_connections),
        "lobbies": list(manager.lobby_connections.keys())
    }

# Endpoint WebSocket principal
@app.websocket("/ws/{lobby_id}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: str):
    await manager.connect(websocket, lobby_id)
    
    try:
        while True:
            # Recevoir le message du client
            data = await websocket.receive_text()
            
            try:
                # Parser le JSON reçu
                message_data = json.loads(data)
                message_type = message_data.get("type", "chat")
                
                if message_type == "chat":
                    # Traitement des messages de chat
                    chat_message = ChatMessage(
                        sender=message_data.get("sender", "Anonyme"),
                        content=message_data.get("content", ""),
                        lobby_id=lobby_id
                    )
                    
                    # Ajouter le timestamp
                    chat_message.timestamp = datetime.now()
                    
                    # Préparer le message à diffuser
                    broadcast_message = {
                        "type": "chat",
                        "sender": chat_message.sender,
                        "content": chat_message.content,
                        "timestamp": chat_message.timestamp.isoformat(),
                        "lobby_id": lobby_id
                    }
                    
                    # Diffuser à tous les clients du lobby
                    await manager.broadcast_to_lobby(
                        json.dumps(broadcast_message), 
                        lobby_id
                    )
                    
                    logger.info(f"💬 Message de {chat_message.sender} dans le lobby {lobby_id}: {chat_message.content}")
                
                elif message_type == "join_lobby":
                    # Notification d'arrivée dans le lobby
                    join_message = {
                        "type": "system",
                        "content": f"{message_data.get('sender', 'Un joueur')} a rejoint le lobby",
                        "timestamp": datetime.now().isoformat(),
                        "lobby_id": lobby_id
                    }
                    
                    await manager.broadcast_to_lobby(
                        json.dumps(join_message), 
                        lobby_id
                    )
                    
                    logger.info(f"👋 {message_data.get('sender', 'Un joueur')} a rejoint le lobby {lobby_id}")
                
                elif message_type == "leave_lobby":
                    # Notification de départ du lobby
                    leave_message = {
                        "type": "system",
                        "content": f"{message_data.get('sender', 'Un joueur')} a quitté le lobby",
                        "timestamp": datetime.now().isoformat(),
                        "lobby_id": lobby_id
                    }
                    
                    await manager.broadcast_to_lobby(
                        json.dumps(leave_message), 
                        lobby_id
                    )
                    
                    logger.info(f"👋 {message_data.get('sender', 'Un joueur')} a quitté le lobby {lobby_id}")
                
            except json.JSONDecodeError:
                logger.error(f"❌ Message JSON invalide reçu: {data}")
                await manager.send_personal_message(
                    json.dumps({"error": "Format JSON invalide"}), 
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, lobby_id)
        logger.info(f"🔌 WebSocket déconnecté du lobby {lobby_id}")

# Endpoint WebSocket simple (sans lobby)
@app.websocket("/ws")
async def websocket_simple(websocket: WebSocket):
    await manager.connect(websocket, "default")
    
    try:
        while True:
            data = await websocket.receive_text()
            # Traitement simple des messages
            await manager.broadcast_to_lobby(data, "default")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, "default")

if __name__ == "__main__":
    logger.info("🚀 Démarrage du serveur WendiGame...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
