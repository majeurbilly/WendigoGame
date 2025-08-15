import json
import logging
from typing import List, Dict, Optional
from datetime import datetime
from models import Joueur, Lobby, ChatMessage, LobbyMessage, PartieStatus

logger = logging.getLogger(__name__)

class JoueurService:
    """Service de gestion des joueurs (équivalent à JoueurService.java)"""
    
    def __init__(self):
        # Stockage en mémoire (remplacera une base de données)
        self.joueurs: Dict[int, Joueur] = {}
        self.joueurs_by_username: Dict[str, Joueur] = {}
        self.joueurs_by_email: Dict[str, Joueur] = {}
        self.next_id = 1
    
    def create_joueur(self, username: str, email: str) -> Joueur:
        """Créer un nouveau joueur"""
        # Vérifier si le username ou email existe déjà
        if username in self.joueurs_by_username:
            raise ValueError(f"Le nom d'utilisateur '{username}' existe déjà")
        
        if email in self.joueurs_by_email:
            raise ValueError(f"L'email '{email}' est déjà utilisé")
        
        # Créer le nouveau joueur
        joueur = Joueur(
            id=self.next_id,
            username=username,
            email=email,
            is_online=False,
            created_at=datetime.now()
        )
        
        # Stocker le joueur
        self.joueurs[joueur.id] = joueur
        self.joueurs_by_username[username] = joueur
        self.joueurs_by_email[email] = joueur
        
        self.next_id += 1
        
        logger.info(f"✅ Nouveau joueur créé: {username} (ID: {joueur.id})")
        return joueur
    
    def get_joueur_by_id(self, joueur_id: int) -> Optional[Joueur]:
        """Récupérer un joueur par son ID"""
        return self.joueurs.get(joueur_id)
    
    def get_joueur_by_username(self, username: str) -> Optional[Joueur]:
        """Récupérer un joueur par son nom d'utilisateur"""
        return self.joueurs_by_username.get(username)
    
    def get_joueur_by_email(self, email: str) -> Optional[Joueur]:
        """Récupérer un joueur par son email"""
        return self.joueurs_by_email.get(email)
    
    def update_joueur_status(self, joueur_id: int, is_online: bool) -> bool:
        """Mettre à jour le statut de connexion d'un joueur"""
        joueur = self.get_joueur_by_id(joueur_id)
        if joueur:
            joueur.is_online = is_online
            joueur.last_seen = datetime.now()
            logger.info(f"🔄 Statut du joueur {joueur.username} mis à jour: {'en ligne' if is_online else 'hors ligne'}")
            return True
        return False
    
    def get_all_joueurs(self) -> List[Joueur]:
        """Récupérer tous les joueurs"""
        return list(self.joueurs.values())
    
    def get_online_joueurs(self) -> List[Joueur]:
        """Récupérer tous les joueurs en ligne"""
        return [j for j in self.joueurs.values() if j.is_online]

class LobbyService:
    """Service de gestion des lobbies (équivalent à LobbyController.java)"""
    
    def __init__(self):
        # Stockage en mémoire des lobbies
        self.lobbies: Dict[str, Lobby] = {}
        self.lobby_players: Dict[str, List[int]] = {}  # lobby_id -> [joueur_ids]
    
    def create_lobby(self, name: str, created_by: str, max_players: int = 10) -> Lobby:
        """Créer un nouveau lobby"""
        lobby_id = f"lobby_{len(self.lobbies) + 1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        lobby = Lobby(
            id=lobby_id,
            name=name,
            max_players=max_players,
            created_by=created_by,
            created_at=datetime.now()
        )
        
        self.lobbies[lobby_id] = lobby
        self.lobby_players[lobby_id] = []
        
        logger.info(f"🎮 Nouveau lobby créé: {name} (ID: {lobby_id}) par {created_by}")
        return lobby
    
    def get_lobby(self, lobby_id: str) -> Optional[Lobby]:
        """Récupérer un lobby par son ID"""
        return self.lobbies.get(lobby_id)
    
    def get_all_lobbies(self) -> List[Lobby]:
        """Récupérer tous les lobbies"""
        return list(self.lobbies.values())
    
    def join_lobby(self, lobby_id: str, joueur_id: int) -> bool:
        """Rejoindre un lobby"""
        lobby = self.get_lobby(lobby_id)
        if not lobby:
            logger.warning(f"❌ Tentative de rejoindre un lobby inexistant: {lobby_id}")
            return False
        
        if lobby.current_players >= lobby.max_players:
            logger.warning(f"❌ Lobby {lobby_id} plein, impossible de rejoindre")
            return False
        
        if joueur_id in self.lobby_players.get(lobby_id, []):
            logger.warning(f"❌ Le joueur {joueur_id} est déjà dans le lobby {lobby_id}")
            return False
        
        # Ajouter le joueur au lobby
        if lobby_id not in self.lobby_players:
            self.lobby_players[lobby_id] = []
        
        self.lobby_players[lobby_id].append(joueur_id)
        lobby.current_players = len(self.lobby_players[lobby_id])
        
        logger.info(f"👋 Joueur {joueur_id} a rejoint le lobby {lobby_id}")
        return True
    
    def leave_lobby(self, lobby_id: str, joueur_id: int) -> bool:
        """Quitter un lobby"""
        if lobby_id in self.lobby_players and joueur_id in self.lobby_players[lobby_id]:
            self.lobby_players[lobby_id].remove(joueur_id)
            
            lobby = self.get_lobby(lobby_id)
            if lobby:
                lobby.current_players = len(self.lobby_players[lobby_id])
            
            logger.info(f"👋 Joueur {joueur_id} a quitté le lobby {lobby_id}")
            return True
        
        return False
    
    def get_lobby_players(self, lobby_id: str) -> List[int]:
        """Récupérer la liste des joueurs d'un lobby"""
        return self.lobby_players.get(lobby_id, [])
    
    def update_lobby_status(self, lobby_id: str, status: PartieStatus) -> bool:
        """Mettre à jour le statut d'un lobby"""
        lobby = self.get_lobby(lobby_id)
        if lobby:
            lobby.status = status
            logger.info(f"🔄 Statut du lobby {lobby_id} mis à jour: {status}")
            return True
        return False

class ChatService:
    """Service de gestion du chat (équivalent à ChatController.java)"""
    
    def __init__(self):
        # Stockage des messages (en mémoire pour l'instant)
        self.chat_history: Dict[str, List[ChatMessage]] = {}  # lobby_id -> [messages]
        self.max_history = 100  # Nombre maximum de messages conservés par lobby
    
    def add_message(self, message: ChatMessage) -> ChatMessage:
        """Ajouter un message au chat"""
        lobby_id = message.lobby_id
        
        if lobby_id not in self.chat_history:
            self.chat_history[lobby_id] = []
        
        # Ajouter le message
        self.chat_history[lobby_id].append(message)
        
        # Limiter l'historique
        if len(self.chat_history[lobby_id]) > self.max_history:
            self.chat_history[lobby_id] = self.chat_history[lobby_id][-self.max_history:]
        
        logger.info(f"💬 Message ajouté au lobby {lobby_id}: {message.sender}: {message.content}")
        return message
    
    def get_lobby_messages(self, lobby_id: str, limit: int = 50) -> List[ChatMessage]:
        """Récupérer les messages d'un lobby"""
        messages = self.chat_history.get(lobby_id, [])
        return messages[-limit:] if limit > 0 else messages
    
    def clear_lobby_history(self, lobby_id: str) -> bool:
        """Effacer l'historique d'un lobby"""
        if lobby_id in self.chat_history:
            self.chat_history[lobby_id].clear()
            logger.info(f"🗑️ Historique du lobby {lobby_id} effacé")
            return True
        return False

# Instances globales des services
joueur_service = JoueurService()
lobby_service = LobbyService()
chat_service = ChatService()
