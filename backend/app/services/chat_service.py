"""
Service de gestion des chats Wendigo
Gère les différents types de chat et les communications entre joueurs
"""

import asyncio
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.chat import ChatMessage, ChatType
from app.models.player import Player
from app.models.role import Role
from app.models.team import Team
from app.exceptions import ChatError, PlayerError, GameError


class ChatService:
    """Service pour la gestion des chats et communications"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # ENVOI DE MESSAGES
    # =============================================================================
    
    def send_message(self, 
                    game_id: str,
                    sender_id: str,
                    message: str,
                    chat_type: ChatType,
                    target_id: Optional[str] = None) -> ChatMessage:
        """Envoyer un message dans un chat"""
        try:
            # Vérifier que l'expéditeur existe et est dans le jeu
            sender = self.db.query(Player).filter(Player.id == sender_id).first()
            if not sender or sender.game_id != game_id:
                raise PlayerError("Expéditeur non trouvé ou pas dans le jeu")
            
            # Vérifier les permissions selon le type de chat
            if not self._can_send_to_chat(sender, chat_type, target_id):
                raise ChatError("Permission refusée pour ce type de chat")
            
            # Créer le message
            chat_message = ChatMessage(
                game_id=game_id,
                sender_id=sender_id,
                message=message,
                chat_type=chat_type,
                target_id=target_id,
                timestamp=datetime.utcnow()
            )
            
            self.db.add(chat_message)
            self.db.commit()
            self.db.refresh(chat_message)
            
            return chat_message
            
        except Exception as e:
            self.db.rollback()
            raise ChatError(f"Erreur lors de l'envoi du message: {str(e)}")
    
    def send_public_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message public"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.PUBLIC
        )
    
    def send_private_message(self, game_id: str, sender_id: str, target_id: str, message: str) -> ChatMessage:
        """Envoyer un message privé"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.PRIVATE,
            target_id=target_id
        )
    
    def send_team_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message d'équipe"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.TEAM
        )
    
    def send_wolf_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message aux loups"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.WOLF
        )
    
    def send_ghost_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message aux fantômes"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.GHOST
        )
    
    def send_medium_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message au médium"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.MEDIUM
        )
    
    def send_twins_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message aux jumeaux"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.TWINS
        )
    
    def send_poltergeist_message(self, game_id: str, sender_id: str, message: str) -> ChatMessage:
        """Envoyer un message au poltergeist"""
        return self.send_message(
            game_id=game_id,
            sender_id=sender_id,
            message=message,
            chat_type=ChatType.POLTERGEIST
        )
    
    # =============================================================================
    # RÉCUPÉRATION DE MESSAGES
    # =============================================================================
    
    def get_messages(self, 
                    game_id: str,
                    player_id: str,
                    chat_type: ChatType,
                    limit: int = 50,
                    offset: int = 0) -> List[ChatMessage]:
        """Récupérer les messages d'un chat"""
        try:
            # Vérifier que le joueur existe et est dans le jeu
            player = self.db.query(Player).filter(Player.id == player_id).first()
            if not player or player.game_id != game_id:
                raise PlayerError("Joueur non trouvé ou pas dans le jeu")
            
            # Construire la requête selon le type de chat
            query = self.db.query(ChatMessage).filter(
                and_(
                    ChatMessage.game_id == game_id,
                    ChatMessage.chat_type == chat_type
                )
            )
            
            # Filtrer selon le type de chat
            if chat_type == ChatType.PRIVATE:
                # Messages privés envoyés ou reçus par le joueur
                query = query.filter(
                    or_(
                        ChatMessage.sender_id == player_id,
                        ChatMessage.target_id == player_id
                    )
                )
            elif chat_type == ChatType.TEAM:
                # Messages d'équipe (villageois ou loups)
                if player.team.name == "Loups":
                    query = query.filter(ChatMessage.chat_type == ChatType.WOLF)
                else:
                    query = query.filter(ChatMessage.chat_type == ChatType.TEAM)
            elif chat_type == ChatType.WOLF:
                # Vérifier que le joueur est un loup
                if player.team.name != "Loups":
                    raise ChatError("Accès refusé au chat des loups")
            elif chat_type == ChatType.GHOST:
                # Vérifier que le joueur est mort
                if player.is_alive:
                    raise ChatError("Seuls les morts peuvent accéder au chat des fantômes")
            elif chat_type == ChatType.MEDIUM:
                # Vérifier que le joueur est le médium
                if player.role.name != "Médium":
                    raise ChatError("Seul le médium peut accéder à ce chat")
            elif chat_type == ChatType.TWINS:
                # Vérifier que le joueur est un jumeau
                if player.role.name not in ["Jumeau A", "Jumeau B"]:
                    raise ChatError("Seuls les jumeaux peuvent accéder à ce chat")
            elif chat_type == ChatType.POLTERGEIST:
                # Vérifier que le joueur est le poltergeist
                if player.role.name != "Poltergeist":
                    raise ChatError("Seul le poltergeist peut accéder à ce chat")
            
            # Trier par timestamp et limiter
            messages = query.order_by(ChatMessage.timestamp.desc()).offset(offset).limit(limit).all()
            
            return messages
            
        except Exception as e:
            raise ChatError(f"Erreur lors de la récupération des messages: {str(e)}")
    
    def get_public_messages(self, game_id: str, player_id: str, limit: int = 50) -> List[ChatMessage]:
        """Récupérer les messages publics"""
        return self.get_messages(game_id, player_id, ChatType.PUBLIC, limit)
    
    def get_private_messages(self, game_id: str, player_id: str, limit: int = 50) -> List[ChatMessage]:
        """Récupérer les messages privés"""
        return self.get_messages(game_id, player_id, ChatType.PRIVATE, limit)
    
    def get_team_messages(self, game_id: str, player_id: str, limit: int = 50) -> List[ChatMessage]:
        """Récupérer les messages d'équipe"""
        return self.get_messages(game_id, player_id, ChatType.TEAM, limit)
    
    def get_wolf_messages(self, game_id: str, player_id: str, limit: int = 50) -> List[ChatMessage]:
        """Récupérer les messages des loups"""
        return self.get_messages(game_id, player_id, ChatType.WOLF, limit)
    
    def get_ghost_messages(self, game_id: str, player_id: str, limit: int = 50) -> List[ChatMessage]:
        """Récupérer les messages des fantômes"""
        return self.get_messages(game_id, player_id, ChatType.GHOST, limit)
    
    # =============================================================================
    # GESTION DES CHATS SPÉCIAUX
    # =============================================================================
    
    def get_available_chats(self, game_id: str, player_id: str) -> List[Dict[str, Any]]:
        """Obtenir la liste des chats disponibles pour un joueur"""
        try:
            player = self.db.query(Player).filter(Player.id == player_id).first()
            if not player or player.game_id != game_id:
                raise PlayerError("Joueur non trouvé ou pas dans le jeu")
            
            available_chats = [
                {
                    "type": ChatType.PUBLIC.value,
                    "name": "Chat Public",
                    "description": "Messages visibles par tous les joueurs",
                    "available": True
                }
            ]
            
            # Chat d'équipe
            if player.team.name == "Loups":
                available_chats.append({
                    "type": ChatType.WOLF.value,
                    "name": "Chat des Loups",
                    "description": "Messages privés entre loups",
                    "available": True
                })
            else:
                available_chats.append({
                    "type": ChatType.TEAM.value,
                    "name": "Chat Villageois",
                    "description": "Messages entre villageois",
                    "available": True
                })
            
            # Chat des fantômes (si mort)
            if not player.is_alive:
                available_chats.append({
                    "type": ChatType.GHOST.value,
                    "name": "Chat des Fantômes",
                    "description": "Messages entre joueurs morts",
                    "available": True
                })
            
            # Chats spéciaux selon le rôle
            if player.role.name == "Médium":
                available_chats.append({
                    "type": ChatType.MEDIUM.value,
                    "name": "Chat Médium",
                    "description": "Communication avec les fantômes",
                    "available": True
                })
            
            if player.role.name in ["Jumeau A", "Jumeau B"]:
                available_chats.append({
                    "type": ChatType.TWINS.value,
                    "name": "Chat des Jumeaux",
                    "description": "Communication entre jumeaux",
                    "available": True
                })
            
            if player.role.name == "Poltergeist":
                available_chats.append({
                    "type": ChatType.POLTERGEIST.value,
                    "name": "Chat Poltergeist",
                    "description": "Messages du poltergeist",
                    "available": True
                })
            
            return available_chats
            
        except Exception as e:
            raise ChatError(f"Erreur lors de la récupération des chats: {str(e)}")
    
    def get_chat_participants(self, game_id: str, chat_type: ChatType) -> List[Player]:
        """Obtenir la liste des participants d'un chat"""
        try:
            if chat_type == ChatType.PUBLIC:
                # Tous les joueurs du jeu
                return self.db.query(Player).filter(Player.game_id == game_id).all()
            
            elif chat_type == ChatType.TEAM:
                # Villageois vivants
                villager_team = self.db.query(Team).filter(Team.name == "Villageois").first()
                if villager_team:
                    return self.db.query(Player).filter(
                        and_(
                            Player.game_id == game_id,
                            Player.team_id == villager_team.id,
                            Player.is_alive == True
                        )
                    ).all()
            
            elif chat_type == ChatType.WOLF:
                # Loups vivants
                wolf_team = self.db.query(Team).filter(Team.name == "Loups").first()
                if wolf_team:
                    return self.db.query(Player).filter(
                        and_(
                            Player.game_id == game_id,
                            Player.team_id == wolf_team.id,
                            Player.is_alive == True
                        )
                    ).all()
            
            elif chat_type == ChatType.GHOST:
                # Joueurs morts
                return self.db.query(Player).filter(
                    and_(
                        Player.game_id == game_id,
                        Player.is_alive == False
                    )
                ).all()
            
            elif chat_type == ChatType.MEDIUM:
                # Médium vivant
                return self.db.query(Player).filter(
                    and_(
                        Player.game_id == game_id,
                        Player.role.has(name="Médium"),
                        Player.is_alive == True
                    )
                ).all()
            
            elif chat_type == ChatType.TWINS:
                # Jumeaux vivants
                return self.db.query(Player).filter(
                    and_(
                        Player.game_id == game_id,
                        Player.role.has(name__in=["Jumeau A", "Jumeau B"]),
                        Player.is_alive == True
                    )
                ).all()
            
            elif chat_type == ChatType.POLTERGEIST:
                # Poltergeist vivant
                return self.db.query(Player).filter(
                    and_(
                        Player.game_id == game_id,
                        Player.role.has(name="Poltergeist"),
                        Player.is_alive == True
                    )
                ).all()
            
            return []
            
        except Exception as e:
            raise ChatError(f"Erreur lors de la récupération des participants: {str(e)}")
    
    # =============================================================================
    # MODÉRATION ET FILTRAGE
    # =============================================================================
    
    def moderate_message(self, message: str) -> Tuple[bool, str]:
        """Modérer un message (vérifier le contenu)"""
        # Liste de mots interdits (à étendre)
        forbidden_words = [
            "insulte", "gros mot", "spam", "publicité"
        ]
        
        # Vérifier la longueur
        if len(message.strip()) == 0:
            return False, "Message vide"
        
        if len(message) > 500:
            return False, "Message trop long (max 500 caractères)"
        
        # Vérifier les mots interdits
        message_lower = message.lower()
        for word in forbidden_words:
            if word in message_lower:
                return False, f"Contenu inapproprié détecté"
        
        return True, "OK"
    
    def filter_message(self, message: str) -> str:
        """Filtrer un message (remplacer le contenu inapproprié)"""
        # Remplacer les mots interdits par des astérisques
        forbidden_words = [
            "insulte", "gros mot", "spam", "publicité"
        ]
        
        filtered_message = message
        for word in forbidden_words:
            filtered_message = filtered_message.replace(word, "*" * len(word))
        
        return filtered_message
    
    # =============================================================================
    # UTILITAIRES
    # =============================================================================
    
    def delete_message(self, message_id: str, player_id: str) -> bool:
        """Supprimer un message (seulement par l'expéditeur)"""
        try:
            message = self.db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
            if not message:
                raise ChatError("Message non trouvé")
            
            if message.sender_id != player_id:
                raise ChatError("Seul l'expéditeur peut supprimer le message")
            
            self.db.delete(message)
            self.db.commit()
            
            return True
            
        except Exception as e:
            self.db.rollback()
            raise ChatError(f"Erreur lors de la suppression: {str(e)}")
    
    def get_message_count(self, game_id: str, chat_type: ChatType) -> int:
        """Obtenir le nombre de messages dans un chat"""
        return self.db.query(ChatMessage).filter(
            and_(
                ChatMessage.game_id == game_id,
                ChatMessage.chat_type == chat_type
            )
        ).count()
    
    def get_recent_activity(self, game_id: str, minutes: int = 5) -> List[ChatMessage]:
        """Obtenir l'activité récente d'un jeu"""
        from datetime import timedelta
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        
        return self.db.query(ChatMessage).filter(
            and_(
                ChatMessage.game_id == game_id,
                ChatMessage.timestamp >= cutoff_time
            )
        ).order_by(ChatMessage.timestamp.desc()).all()
    
    # =============================================================================
    # MÉTHODES PRIVÉES
    # =============================================================================
    
    def _can_send_to_chat(self, player: Player, chat_type: ChatType, target_id: Optional[str] = None) -> bool:
        """Vérifier si un joueur peut envoyer un message dans un chat"""
        try:
            if chat_type == ChatType.PUBLIC:
                return True
            
            elif chat_type == ChatType.PRIVATE:
                # Vérifier que la cible existe et est dans le même jeu
                if not target_id:
                    return False
                target = self.db.query(Player).filter(Player.id == target_id).first()
                return target and target.game_id == player.game_id
            
            elif chat_type == ChatType.TEAM:
                # Villageois seulement
                return player.team.name == "Villageois"
            
            elif chat_type == ChatType.WOLF:
                # Loups seulement
                return player.team.name == "Loups"
            
            elif chat_type == ChatType.GHOST:
                # Joueurs morts seulement
                return not player.is_alive
            
            elif chat_type == ChatType.MEDIUM:
                # Médium seulement
                return player.role.name == "Médium"
            
            elif chat_type == ChatType.TWINS:
                # Jumeaux seulement
                return player.role.name in ["Jumeau A", "Jumeau B"]
            
            elif chat_type == ChatType.POLTERGEIST:
                # Poltergeist seulement
                return player.role.name == "Poltergeist"
            
            return False
            
        except Exception:
            return False


# Instance globale du service
def get_chat_service(db: Session) -> ChatService:
    """Obtenir une instance du service de chat"""
    return ChatService(db)
