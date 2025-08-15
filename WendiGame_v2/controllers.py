from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
import logging

from models import (
    Joueur, Lobby, ChatMessage, LobbyMessage, 
    CommandeDTO, APIResponse, PartieStatus
)
from services import joueur_service, lobby_service, chat_service
from main import manager

logger = logging.getLogger(__name__)

# Router principal
api_router = APIRouter(prefix="/api", tags=["API"])

# ==================== ROUTES JOUEUR ====================

@api_router.post("/joueurs", response_model=Joueur)
async def create_joueur(joueur_data: dict):
    """Créer un nouveau joueur (équivalent à JoueurController.java)"""
    try:
        username = joueur_data.get("username")
        email = joueur_data.get("email")
        
        if not username or not email:
            raise HTTPException(status_code=400, detail="Username et email requis")
        
        joueur = joueur_service.create_joueur(username, email)
        
        logger.info(f"✅ Nouveau joueur créé via API: {username}")
        return joueur
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Erreur création joueur: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.get("/joueurs", response_model=List[Joueur])
async def get_all_joueurs():
    """Récupérer tous les joueurs"""
    try:
        joueurs = joueur_service.get_all_joueurs()
        return joueurs
    except Exception as e:
        logger.error(f"❌ Erreur récupération joueurs: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.get("/joueurs/{joueur_id}", response_model=Joueur)
async def get_joueur_by_id(joueur_id: int):
    """Récupérer un joueur par son ID"""
    try:
        joueur = joueur_service.get_joueur_by_id(joueur_id)
        if not joueur:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")
        return joueur
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération joueur {joueur_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.get("/joueurs/username/{username}", response_model=Joueur)
async def get_joueur_by_username(username: str):
    """Récupérer un joueur par son nom d'utilisateur"""
    try:
        joueur = joueur_service.get_joueur_by_username(username)
        if not joueur:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")
        return joueur
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération joueur {username}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.put("/joueurs/{joueur_id}/status")
async def update_joueur_status(joueur_id: int, status_data: dict):
    """Mettre à jour le statut d'un joueur"""
    try:
        is_online = status_data.get("is_online", False)
        success = joueur_service.update_joueur_status(joueur_id, is_online)
        
        if not success:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")
        
        return APIResponse(
            success=True,
            message=f"Statut du joueur {joueur_id} mis à jour",
            data={"is_online": is_online}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour statut joueur {joueur_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

# ==================== ROUTES LOBBY ====================

@api_router.post("/lobbies", response_model=Lobby)
async def create_lobby(lobby_data: dict):
    """Créer un nouveau lobby (équivalent à LobbyController.java)"""
    try:
        name = lobby_data.get("name")
        created_by = lobby_data.get("created_by")
        max_players = lobby_data.get("max_players", 10)
        
        if not name or not created_by:
            raise HTTPException(status_code=400, detail="Nom et créateur requis")
        
        lobby = lobby_service.create_lobby(name, created_by, max_players)
        
        logger.info(f"✅ Nouveau lobby créé via API: {name}")
        return lobby
        
    except Exception as e:
        logger.error(f"❌ Erreur création lobby: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.get("/lobbies", response_model=List[Lobby])
async def get_all_lobbies():
    """Récupérer tous les lobbies"""
    try:
        lobbies = lobby_service.get_all_lobbies()
        return lobbies
    except Exception as e:
        logger.error(f"❌ Erreur récupération lobbies: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.get("/lobbies/{lobby_id}", response_model=Lobby)
async def get_lobby(lobby_id: str):
    """Récupérer un lobby par son ID"""
    try:
        lobby = lobby_service.get_lobby(lobby_id)
        if not lobby:
            raise HTTPException(status_code=404, detail="Lobby non trouvé")
        return lobby
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération lobby {lobby_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.post("/lobbies/{lobby_id}/join")
async def join_lobby(lobby_id: str, join_data: dict):
    """Rejoindre un lobby"""
    try:
        joueur_id = join_data.get("joueur_id")
        if not joueur_id:
            raise HTTPException(status_code=400, detail="ID du joueur requis")
        
        success = lobby_service.join_lobby(lobby_id, joueur_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Impossible de rejoindre le lobby")
        
        return APIResponse(
            success=True,
            message=f"Joueur {joueur_id} a rejoint le lobby {lobby_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur rejoindre lobby {lobby_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.post("/lobbies/{lobby_id}/leave")
async def leave_lobby(lobby_id: str, leave_data: dict):
    """Quitter un lobby"""
    try:
        joueur_id = leave_data.get("joueur_id")
        if not joueur_id:
            raise HTTPException(status_code=400, detail="ID du joueur requis")
        
        success = lobby_service.leave_lobby(lobby_id, joueur_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Impossible de quitter le lobby")
        
        return APIResponse(
            success=True,
            message=f"Joueur {joueur_id} a quitté le lobby {lobby_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur quitter lobby {lobby_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.get("/lobbies/{lobby_id}/players")
async def get_lobby_players(lobby_id: str):
    """Récupérer la liste des joueurs d'un lobby"""
    try:
        player_ids = lobby_service.get_lobby_players(lobby_id)
        players = []
        
        for player_id in player_ids:
            joueur = joueur_service.get_joueur_by_id(player_id)
            if joueur:
                players.append(joueur)
        
        return APIResponse(
            success=True,
            message=f"Joueurs du lobby {lobby_id}",
            data={"players": [p.dict() for p in players]}
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération joueurs lobby {lobby_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

# ==================== ROUTES CHAT ====================

@api_router.get("/chat/{lobby_id}/messages")
async def get_chat_messages(lobby_id: str, limit: int = 50):
    """Récupérer l'historique des messages d'un lobby"""
    try:
        messages = chat_service.get_lobby_messages(lobby_id, limit)
        return APIResponse(
            success=True,
            message=f"Messages du lobby {lobby_id}",
            data={"messages": [m.dict() for m in messages]}
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération messages lobby {lobby_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@api_router.delete("/chat/{lobby_id}/clear")
async def clear_chat_history(lobby_id: str):
    """Effacer l'historique du chat d'un lobby"""
    try:
        success = chat_service.clear_lobby_history(lobby_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Lobby non trouvé")
        
        return APIResponse(
            success=True,
            message=f"Historique du lobby {lobby_id} effacé"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur effacement historique lobby {lobby_id}: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

# ==================== ROUTES COMMANDES ====================

@api_router.post("/commandes")
async def process_commande(commande: CommandeDTO):
    """Traiter une commande (équivalent à CommandeDTO.java)"""
    try:
        logger.info(f"🎮 Commande reçue: {commande.type}")
        
        # Traitement des différents types de commandes
        if commande.type == "ping":
            return APIResponse(
                success=True,
                message="Pong!",
                data={"timestamp": commande.timestamp.isoformat()}
            )
        
        elif commande.type == "get_status":
            return APIResponse(
                success=True,
                message="Statut du serveur",
                data={
                    "active_connections": len(manager.active_connections),
                    "lobbies": len(lobby_service.get_all_lobbies()),
                    "joueurs": len(joueur_service.get_all_joueurs())
                }
            )
        
        else:
            return APIResponse(
                success=False,
                message=f"Type de commande non reconnu: {commande.type}"
            )
        
    except Exception as e:
        logger.error(f"❌ Erreur traitement commande: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

# ==================== ROUTES UTILITAIRES ====================

@api_router.get("/health")
async def health_check():
    """Vérification de l'état du serveur"""
    return APIResponse(
        success=True,
        message="Serveur WendiGame opérationnel",
        data={
            "active_connections": len(manager.active_connections),
            "lobbies_count": len(lobby_service.get_all_lobbies()),
            "joueurs_count": len(joueur_service.get_all_joueurs()),
            "online_joueurs_count": len(joueur_service.get_online_joueurs())
        }
    )

@api_router.get("/stats")
async def get_server_stats():
    """Statistiques du serveur"""
    try:
        return APIResponse(
            success=True,
            message="Statistiques du serveur",
            data={
                "connections": {
                    "total": len(manager.active_connections),
                    "lobbies": list(manager.lobby_connections.keys())
                },
                "lobbies": {
                    "total": len(lobby_service.get_all_lobbies()),
                    "details": [l.dict() for l in lobby_service.get_all_lobbies()]
                },
                "joueurs": {
                    "total": len(joueur_service.get_all_joueurs()),
                    "online": len(joueur_service.get_online_joueurs()),
                    "offline": len(joueur_service.get_all_joueurs()) - len(joueur_service.get_online_joueurs())
                }
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération stats: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
