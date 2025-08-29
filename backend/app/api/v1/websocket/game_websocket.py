"""
WebSocket pour la communication temps réel du jeu
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import json
import logging
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.models.game import Game
from app.models.player import Player
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Gestionnaire des connexions WebSocket"""
    
    def __init__(self):
        # Connexions par partie: {game_id: [WebSocket]}
        self.game_connections: Dict[str, List[WebSocket]] = {}
        # Connexions par utilisateur: {user_id: WebSocket}
        self.user_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, game_id: str, user_id: str):
        """Connecter un utilisateur à une partie"""
        await websocket.accept()
        
        # Ajouter à la liste des connexions de la partie
        if game_id not in self.game_connections:
            self.game_connections[game_id] = []
        self.game_connections[game_id].append(websocket)
        
        # Ajouter à la liste des connexions utilisateur
        self.user_connections[user_id] = websocket
        
        logger.info(f"User {user_id} connected to game {game_id}")
    
    def disconnect(self, websocket: WebSocket, game_id: str, user_id: str):
        """Déconnecter un utilisateur"""
        # Retirer de la liste des connexions de la partie
        if game_id in self.game_connections:
            if websocket in self.game_connections[game_id]:
                self.game_connections[game_id].remove(websocket)
            
            # Nettoyer la liste si vide
            if not self.game_connections[game_id]:
                del self.game_connections[game_id]
        
        # Retirer de la liste des connexions utilisateur
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        
        logger.info(f"User {user_id} disconnected from game {game_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Envoyer un message personnel à un utilisateur"""
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending personal message to {user_id}: {e}")
                # Nettoyer la connexion défaillante
                del self.user_connections[user_id]
    
    async def broadcast_to_game(self, message: dict, game_id: str, exclude_user: str = None):
        """Diffuser un message à tous les joueurs d'une partie"""
        if game_id not in self.game_connections:
            return
        
        disconnected = []
        for websocket in self.game_connections[game_id]:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to game {game_id}: {e}")
                disconnected.append(websocket)
        
        # Nettoyer les connexions défaillantes
        for websocket in disconnected:
            if game_id in self.game_connections:
                self.game_connections[game_id].remove(websocket)
        
        # Nettoyer la liste si vide
        if game_id in self.game_connections and not self.game_connections[game_id]:
            del self.game_connections[game_id]


# Instance globale du gestionnaire de connexions
manager = ConnectionManager()


def get_user_from_token(token: str, db: Session) -> Optional[User]:
    """Récupérer l'utilisateur à partir du token"""
    payload = verify_token(token)
    if payload is None:
        return None
    
    user_id = payload.get("sub")
    if user_id is None:
        return None
    
    return db.query(User).filter(User.id == user_id).first()


@router.websocket("/game/{game_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Endpoint WebSocket pour la communication temps réel du jeu"""
    
    # Authentification
    if not token:
        await websocket.close(code=4001, reason="Token manquant")
        return
    
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Token invalide")
        return
    
    # Vérifier que l'utilisateur est dans la partie
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == user.id
    ).first()
    
    if not player:
        await websocket.close(code=4003, reason="Utilisateur non autorisé dans cette partie")
        return
    
    # Connecter l'utilisateur
    await manager.connect(websocket, game_id, user.id)
    
    try:
        # Envoyer un message de bienvenue
        await manager.send_personal_message({
            "type": "connection",
            "message": "Connecté au jeu",
            "user_id": user.id,
            "username": user.username,
            "game_id": game_id,
            "timestamp": datetime.now().isoformat()
        }, user.id)
        
        # Notifier les autres joueurs
        await manager.broadcast_to_game({
            "type": "player_connected",
            "user_id": user.id,
            "username": user.username,
            "timestamp": datetime.now().isoformat()
        }, game_id, exclude_user=user.id)
        
        # Boucle principale de réception des messages
        while True:
            try:
                # Recevoir le message
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Traiter le message selon son type
                await handle_message(message, user, player, game_id, db)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Format de message invalide",
                    "timestamp": datetime.now().isoformat()
                }, user.id)
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Erreur lors du traitement du message",
                    "timestamp": datetime.now().isoformat()
                }, user.id)
    
    except WebSocketDisconnect:
        pass
    finally:
        # Déconnecter l'utilisateur
        manager.disconnect(websocket, game_id, user.id)
        
        # Notifier les autres joueurs
        await manager.broadcast_to_game({
            "type": "player_disconnected",
            "user_id": user.id,
            "username": user.username,
            "timestamp": datetime.now().isoformat()
        }, game_id, exclude_user=user.id)


async def handle_message(message: dict, user: User, player: Player, game_id: str, db: Session):
    """Traiter les messages reçus"""
    message_type = message.get("type")
    
    if message_type == "chat":
        await handle_chat_message(message, user, player, game_id, db)
    elif message_type == "action":
        await handle_action_message(message, user, player, game_id, db)
    elif message_type == "vote":
        await handle_vote_message(message, user, player, game_id, db)
    elif message_type == "ready":
        await handle_ready_message(message, user, player, game_id, db)
    elif message_type == "chair_selection":
        await handle_chair_selection_message(message, user, player, game_id, db)
    else:
        await manager.send_personal_message({
            "type": "error",
            "message": f"Type de message inconnu: {message_type}",
            "timestamp": datetime.now().isoformat()
        }, user.id)


async def handle_chat_message(message: dict, user: User, player: Player, game_id: str, db: Session):
    """Traiter les messages de chat"""
    chat_type = message.get("chat_type", "general")
    content = message.get("content", "")
    
    # Vérifier les permissions selon le type de chat
    if chat_type == "wolf" and not player.is_wolf:
        await manager.send_personal_message({
            "type": "error",
            "message": "Accès refusé au chat des loups",
            "timestamp": datetime.now().isoformat()
        }, user.id)
        return
    
    if chat_type == "ghost" and player.is_alive:
        await manager.send_personal_message({
            "type": "error",
            "message": "Seuls les fantômes peuvent utiliser le chat des fantômes",
            "timestamp": datetime.now().isoformat()
        }, user.id)
        return
    
    # Diffuser le message
    await manager.broadcast_to_game({
        "type": "chat",
        "chat_type": chat_type,
        "user_id": user.id,
        "username": user.username,
        "content": content,
        "timestamp": datetime.now().isoformat()
    }, game_id)


async def handle_action_message(message: dict, user: User, player: Player, game_id: str, db: Session):
    """Traiter les messages d'action (pouvoirs)"""
    action_type = message.get("action_type")
    target_id = message.get("target_id")
    
    # TODO: Implémenter la logique de traitement des actions
    # Cela nécessite l'implémentation du système de pouvoirs
    
    await manager.send_personal_message({
        "type": "action_response",
        "action_type": action_type,
        "success": True,
        "message": "Action traitée",
        "timestamp": datetime.now().isoformat()
    }, user.id)


async def handle_vote_message(message: dict, user: User, player: Player, game_id: str, db: Session):
    """Traiter les messages de vote"""
    vote_type = message.get("vote_type")
    target_id = message.get("target_id")
    
    # TODO: Implémenter la logique de traitement des votes
    # Cela nécessite l'implémentation du système de votes
    
    await manager.send_personal_message({
        "type": "vote_response",
        "vote_type": vote_type,
        "success": True,
        "message": "Vote enregistré",
        "timestamp": datetime.now().isoformat()
    }, user.id)


async def handle_ready_message(message: dict, user: User, player: Player, game_id: str, db: Session):
    """Traiter les messages de statut prêt"""
    ready = message.get("ready", False)
    
    player.is_ready = ready
    
    try:
        db.commit()
        
        # Notifier les autres joueurs
        await manager.broadcast_to_game({
            "type": "player_ready",
            "user_id": user.id,
            "username": user.username,
            "ready": ready,
            "timestamp": datetime.now().isoformat()
        }, game_id, exclude_user=user.id)
        
    except Exception as e:
        logger.error(f"Error updating player ready status: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": "Erreur lors de la mise à jour du statut",
            "timestamp": datetime.now().isoformat()
        }, user.id)


async def handle_chair_selection_message(message: dict, user: User, player: Player, game_id: str, db: Session):
    """Traiter les messages de sélection de chaise"""
    chair_position = message.get("chair_position")
    
    if chair_position is None:
        await manager.send_personal_message({
            "type": "error",
            "message": "Position de chaise manquante",
            "timestamp": datetime.now().isoformat()
        }, user.id)
        return
    
    # Vérifier que la chaise est disponible
    existing_player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.chair_position == chair_position
    ).first()
    
    if existing_player and existing_player.id != player.id:
        await manager.send_personal_message({
            "type": "error",
            "message": "Cette chaise est déjà occupée",
            "timestamp": datetime.now().isoformat()
        }, user.id)
        return
    
    player.select_chair(chair_position)
    
    try:
        db.commit()
        
        # Notifier les autres joueurs
        await manager.broadcast_to_game({
            "type": "chair_selected",
            "user_id": user.id,
            "username": user.username,
            "chair_position": chair_position,
            "timestamp": datetime.now().isoformat()
        }, game_id, exclude_user=user.id)
        
    except Exception as e:
        logger.error(f"Error selecting chair: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": "Erreur lors de la sélection de la chaise",
            "timestamp": datetime.now().isoformat()
        }, user.id)
