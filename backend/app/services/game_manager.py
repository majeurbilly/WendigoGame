"""
Service principal de gestion du jeu Wendigo
Orchestre tous les services et gère le flux de jeu complet
"""

import asyncio
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.game import Game, GameStatus
from app.models.player import Player
from app.models.phase import Phase, PhaseType
from app.models.action import Action, ActionStatus
from app.models.vote import Vote, VoteResult
from app.models.chat import ChatMessage, ChatType
from app.exceptions import GameError, PlayerError, PhaseError, ActionError, VoteError


class GameManager:
    """Service principal pour la gestion complète du jeu"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # GESTION DU LOBBY
    # =============================================================================
    
    def create_game_lobby(self, creator_id: str, game_data: Dict[str, Any]) -> Game:
        """Créer un nouveau lobby de jeu"""
        try:
            from app.services.game_service import get_game_service
            from app.schemas.game import GameCreate
            
            game_service = get_game_service(self.db)
            
            # Créer l'objet GameCreate à partir des données
            game_create = GameCreate(
                name=game_data["name"],
                description=game_data.get("description", ""),
                min_players=game_data["min_players"],
                max_players=game_data["max_players"]
            )
            
            return game_service.create_game(
                game_data=game_create,
                creator_id=creator_id
            )
            
        except Exception as e:
            raise GameError(f"Erreur lors de la création du lobby: {str(e)}")
    
    def join_game_lobby(self, game_id: str, user_id: str) -> Player:
        """Rejoindre un lobby de jeu"""
        try:
            from app.services.game_service import get_game_service
            game_service = get_game_service(self.db)
            
            return game_service.join_game(game_id, user_id)
            
        except Exception as e:
            raise GameError(f"Erreur lors de la jointure du lobby: {str(e)}")
    
    def leave_game_lobby(self, game_id: str, user_id: str) -> bool:
        """Quitter un lobby de jeu"""
        try:
            from app.services.game_service import get_game_service
            game_service = get_game_service(self.db)
            
            return game_service.leave_game(game_id, user_id)
            
        except Exception as e:
            raise GameError(f"Erreur lors de la sortie du lobby: {str(e)}")
    
    def set_player_ready(self, game_id: str, player_id: str, is_ready: bool) -> Player:
        """Marquer un joueur comme prêt"""
        try:
            from app.services.game_service import get_game_service
            game_service = get_game_service(self.db)
            
            return game_service.set_player_ready(game_id, player_id, is_ready)
            
        except Exception as e:
            raise GameError(f"Erreur lors du changement de statut: {str(e)}")
    
    def select_chair(self, game_id: str, player_id: str, chair_number: int) -> Player:
        """Sélectionner une chaise"""
        try:
            from app.services.game_service import get_game_service
            game_service = get_game_service(self.db)
            
            return game_service.select_chair(game_id, player_id, chair_number)
            
        except Exception as e:
            raise GameError(f"Erreur lors de la sélection de chaise: {str(e)}")
    
    # =============================================================================
    # DÉMARRAGE DU JEU
    # =============================================================================
    
    def start_game(self, game_id: str) -> Dict[str, Any]:
        """Démarrer une partie"""
        try:
            from app.services.game_service import get_game_service
            from app.services.phase_service import get_phase_service
            
            game_service = get_game_service(self.db)
            phase_service = get_phase_service(self.db)
            
            # Vérifier que le jeu peut démarrer
            if not game_service.can_start_game(game_id):
                raise GameError("Le jeu ne peut pas démarrer")
            
            # Attribuer les rôles
            role_assignments = game_service.assign_roles(game_id)
            
            # Démarrer le jeu
            game = game_service.start_game(game_id)
            
            # Créer la première phase (JOUR)
            first_phase = phase_service.create_phase(
                game_id=game_id,
                phase_type=PhaseType.DAY,
                turn_number=1,
                duration_minutes=game.day_phase_duration,
                description="Début du jour - Discussion et accusations"
            )
            
            # Envoyer un message de début de partie
            self._send_game_start_message(game_id, role_assignments)
            
            return {
                "game": game,
                "phase": first_phase,
                "role_assignments": role_assignments,
                "message": "Partie démarrée avec succès"
            }
            
        except Exception as e:
            raise GameError(f"Erreur lors du démarrage de la partie: {str(e)}")
    
    # =============================================================================
    # GESTION DES PHASES
    # =============================================================================
    
    def advance_phase(self, game_id: str) -> Dict[str, Any]:
        """Passer à la phase suivante"""
        try:
            from app.services.phase_service import get_phase_service
            from app.services.action_service import get_action_service
            from app.services.vote_service import get_vote_service
            
            phase_service = get_phase_service(self.db)
            action_service = get_action_service(self.db)
            vote_service = get_vote_service(self.db)
            
            # Récupérer la phase actuelle
            current_phase = phase_service.get_active_phase(game_id)
            if not current_phase:
                raise PhaseError("Aucune phase active")
            
            # Résoudre les actions de la phase
            resolved_actions = action_service.resolve_phase_actions(
                game_id=game_id,
                phase=current_phase.phase_type.value
            )
            
            # Résoudre les votes de la phase
            if current_phase.phase_type == PhaseType.NIGHT:
                vote_result = vote_service.resolve_wolf_vote(
                    game_id=game_id,
                    phase=current_phase.phase_type.value,
                    turn_number=current_phase.turn_number
                )
            else:
                vote_result = vote_service.resolve_votes(
                    game_id=game_id,
                    phase=current_phase.phase_type.value,
                    turn_number=current_phase.turn_number
                )
            
            # Appliquer les résultats des actions et votes
            self._apply_phase_results(game_id, resolved_actions, vote_result)
            
            # Vérifier les conditions de fin de partie
            game_over = self._check_game_over_conditions(game_id)
            if game_over:
                return self._end_game(game_id, game_over["winner"])
            
            # Passer à la phase suivante
            next_phase = phase_service.advance_to_next_phase(game_id)
            
            # Envoyer les notifications de phase
            self._send_phase_notifications(game_id, next_phase, resolved_actions, vote_result)
            
            return {
                "previous_phase": current_phase,
                "next_phase": next_phase,
                "resolved_actions": resolved_actions,
                "vote_result": vote_result,
                "game_over": False
            }
            
        except Exception as e:
            raise GameError(f"Erreur lors du passage de phase: {str(e)}")
    
    def advance_turn(self, game_id: str) -> Dict[str, Any]:
        """Passer au tour suivant"""
        try:
            from app.services.phase_service import get_phase_service
            
            phase_service = get_phase_service(self.db)
            
            # Passer au tour suivant
            new_phase, new_turn = phase_service.advance_turn(game_id)
            
            # Envoyer les notifications de nouveau tour
            self._send_turn_notifications(game_id, new_turn)
            
            return {
                "new_phase": new_phase,
                "new_turn": new_turn,
                "message": f"Tour {new_turn} commencé"
            }
            
        except Exception as e:
            raise GameError(f"Erreur lors du passage de tour: {str(e)}")
    
    # =============================================================================
    # GESTION DES ACTIONS
    # =============================================================================
    
    def execute_player_action(self, 
                            game_id: str,
                            player_id: str,
                            action_type: str,
                            target_id: Optional[str] = None,
                            additional_data: Optional[Dict] = None) -> Action:
        """Exécuter une action de joueur"""
        try:
            from app.services.action_service import get_action_service
            from app.services.role_service import get_role_service
            
            action_service = get_action_service(self.db)
            role_service = get_role_service(self.db)
            
            # Vérifier que le joueur peut effectuer cette action
            player = self.db.query(Player).filter(Player.id == player_id).first()
            if not player or not player.is_alive:
                raise PlayerError("Joueur non trouvé ou mort")
            
            # Créer l'action selon le type
            if action_type == "KILL":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="KILL",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "PROTECT":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="PROTECT",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "INVESTIGATE":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="INVESTIGATE",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "HEAL":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="HEAL",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "CURSE":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="CURSE",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "CHARM":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="CHARM",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "DUEL":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="DUEL",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "SNEAK":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="SNEAK",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "SKIP_PHASE":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=None,
                    action_type="SKIP_PHASE",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            elif action_type == "CONTAMINATE":
                action = action_service.create_action(
                    game_id=game_id,
                    actor_id=player_id,
                    target_id=target_id,
                    action_type="CONTAMINATE",
                    phase=player.game.current_phase,
                    additional_data=additional_data or {}
                )
            else:
                raise ActionError(f"Type d'action non reconnu: {action_type}")
            
            return action
            
        except Exception as e:
            raise GameError(f"Erreur lors de l'exécution de l'action: {str(e)}")
    
    # =============================================================================
    # GESTION DES VOTES
    # =============================================================================
    
    def submit_vote(self, 
                   game_id: str,
                   voter_id: str,
                   vote_type: str,
                   target_id: Optional[str] = None) -> Vote:
        """Soumettre un vote"""
        try:
            from app.services.vote_service import get_vote_service
            
            vote_service = get_vote_service(self.db)
            
            # Créer le vote selon le type
            if vote_type == "ACCUSATION":
                vote = vote_service.create_accusation_vote(game_id, voter_id, target_id)
            elif vote_type == "CONDEMNATION":
                vote = vote_service.create_condemnation_vote(game_id, voter_id, target_id)
            elif vote_type == "WOLF_KILL":
                vote = vote_service.create_wolf_kill_vote(game_id, voter_id, target_id)
            elif vote_type == "LYNCH":
                vote = vote_service.create_lynch_vote(game_id, voter_id, target_id)
            else:
                raise VoteError(f"Type de vote non reconnu: {vote_type}")
            
            return vote
            
        except Exception as e:
            raise GameError(f"Erreur lors de la soumission du vote: {str(e)}")
    
    # =============================================================================
    # GESTION DES CHATS
    # =============================================================================
    
    def send_chat_message(self, 
                         game_id: str,
                         sender_id: str,
                         message: str,
                         chat_type: str,
                         target_id: Optional[str] = None) -> ChatMessage:
        """Envoyer un message de chat"""
        try:
            from app.services.chat_service import get_chat_service
            
            chat_service = get_chat_service(self.db)
            
            # Modérer le message
            is_valid, reason = chat_service.moderate_message(message)
            if not is_valid:
                raise GameError(f"Message rejeté: {reason}")
            
            # Filtrer le message
            filtered_message = chat_service.filter_message(message)
            
            # Envoyer le message selon le type
            if chat_type == "PUBLIC":
                chat_message = chat_service.send_public_message(game_id, sender_id, filtered_message)
            elif chat_type == "PRIVATE":
                chat_message = chat_service.send_private_message(game_id, sender_id, target_id, filtered_message)
            elif chat_type == "TEAM":
                chat_message = chat_service.send_team_message(game_id, sender_id, filtered_message)
            elif chat_type == "WOLF":
                chat_message = chat_service.send_wolf_message(game_id, sender_id, filtered_message)
            elif chat_type == "GHOST":
                chat_message = chat_service.send_ghost_message(game_id, sender_id, filtered_message)
            elif chat_type == "MEDIUM":
                chat_message = chat_service.send_medium_message(game_id, sender_id, filtered_message)
            elif chat_type == "TWINS":
                chat_message = chat_service.send_twins_message(game_id, sender_id, filtered_message)
            elif chat_type == "POLTERGEIST":
                chat_message = chat_service.send_poltergeist_message(game_id, sender_id, filtered_message)
            else:
                raise GameError(f"Type de chat non reconnu: {chat_type}")
            
            return chat_message
            
        except Exception as e:
            raise GameError(f"Erreur lors de l'envoi du message: {str(e)}")
    
    # =============================================================================
    # ÉTAT DU JEU
    # =============================================================================
    
    def get_game_state(self, game_id: str, player_id: str) -> Dict[str, Any]:
        """Obtenir l'état complet du jeu pour un joueur"""
        try:
            # Récupérer le jeu
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Récupérer le joueur
            player = self.db.query(Player).filter(Player.id == player_id).first()
            if not player or player.game_id != game_id:
                raise PlayerError("Joueur non trouvé ou pas dans le jeu")
            
            # Récupérer la phase actuelle
            from app.services.phase_service import get_phase_service
            phase_service = get_phase_service(self.db)
            current_phase = phase_service.get_active_phase(game_id)
            
            # Récupérer les joueurs
            players = self.db.query(Player).filter(Player.game_id == game_id).all()
            
            # Récupérer les messages récents
            from app.services.chat_service import get_chat_service
            chat_service = get_chat_service(self.db)
            recent_messages = chat_service.get_public_messages(game_id, player_id, limit=20)
            
            # Construire l'état
            state = {
                "game": {
                    "id": game.id,
                    "name": game.name,
                    "status": game.status.value,
                    "current_phase": game.current_phase,
                    "current_turn": game.current_turn,
                    "started_at": game.started_at,
                    "winner_team": game.winner_team_name
                },
                "phase": {
                    "type": current_phase.phase_type.value if current_phase else None,
                    "description": current_phase.description if current_phase else None,
                    "time_remaining": phase_service.get_time_remaining(game_id) if current_phase else None,
                    "is_expired": phase_service.is_phase_expired(game_id) if current_phase else None
                },
                "player": {
                    "id": player.id,
                    "username": player.user.username,
                    "role": player.role.name if player.role else None,
                    "team": player.team.name if player.team else None,
                    "is_alive": player.is_alive,
                    "chair_number": player.chair_number,
                    "is_ready": player.is_ready
                },
                "players": [
                    {
                        "id": p.id,
                        "username": p.user.username,
                        "is_alive": p.is_alive,
                        "chair_number": p.chair_number,
                        "is_ready": p.is_ready,
                        "role_visible": self._is_role_visible(player, p),
                        "team_visible": self._is_team_visible(player, p)
                    }
                    for p in players
                ],
                "recent_messages": [
                    {
                        "id": msg.id,
                        "sender": msg.sender.user.username,
                        "message": msg.message,
                        "timestamp": msg.timestamp,
                        "chat_type": msg.chat_type.value
                    }
                    for msg in recent_messages
                ],
                "available_actions": self._get_available_actions(player),
                "available_votes": self._get_available_votes(player),
                "available_chats": self._get_available_chats(game_id, player_id)
            }
            
            return state
            
        except Exception as e:
            raise GameError(f"Erreur lors de la récupération de l'état: {str(e)}")
    
    # =============================================================================
    # MÉTHODES PRIVÉES
    # =============================================================================
    
    def _send_game_start_message(self, game_id: str, role_assignments: Dict[str, str]):
        """Envoyer un message de début de partie"""
        try:
            from app.services.chat_service import get_chat_service
            chat_service = get_chat_service(self.db)
            
            # Message public de début
            chat_service.send_public_message(
                game_id=game_id,
                sender_id=None,  # Système
                message="🎮 La partie commence ! Les rôles ont été attribués."
            )
            
        except Exception:
            pass  # Ignorer les erreurs de chat
    
    def _apply_phase_results(self, game_id: str, actions: List[Action], vote_result: Dict[str, Any]):
        """Appliquer les résultats d'une phase"""
        try:
            # Appliquer les actions
            for action in actions:
                if action.status == ActionStatus.SUCCESS:
                    if action.action_type == "KILL":
                        target = self.db.query(Player).filter(Player.id == action.target_id).first()
                        if target:
                            target.is_alive = False
                            target.death_reason = f"Tué par {action.actor.user.username}"
                    elif action.action_type == "PROTECT":
                        # Protection appliquée
                        pass
                    elif action.action_type == "INVESTIGATE":
                        # Résultat d'investigation envoyé au joueur
                        pass
            
            # Appliquer les votes
            if vote_result.get("success") and vote_result.get("target_id"):
                target = self.db.query(Player).filter(Player.id == vote_result["target_id"]).first()
                if target:
                    target.is_alive = False
                    target.death_reason = "Condamné par vote"
            
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de l'application des résultats: {str(e)}")
    
    def _check_game_over_conditions(self, game_id: str) -> Optional[Dict[str, Any]]:
        """Vérifier les conditions de fin de partie"""
        try:
            # Compter les joueurs vivants par équipe
            players = self.db.query(Player).filter(Player.game_id == game_id).all()
            
            alive_villagers = [p for p in players if p.is_alive and p.team.name == "Villageois"]
            alive_wolves = [p for p in players if p.is_alive and p.team.name == "Loups"]
            
            # Conditions de victoire
            if len(alive_wolves) == 0:
                return {"winner": "Villageois", "reason": "Tous les loups ont été éliminés"}
            elif len(alive_wolves) >= len(alive_villagers):
                return {"winner": "Loups", "reason": "Les loups sont plus nombreux que les villageois"}
            
            return None
            
        except Exception:
            return None
    
    def _end_game(self, game_id: str, winner: str) -> Dict[str, Any]:
        """Terminer la partie"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Marquer la fin de partie
            game.status = GameStatus.FINISHED
            game.finished_at = datetime.utcnow()
            game.winner_team_name = winner
            
            # Récupérer l'équipe gagnante
            from app.models.team import Team
            winner_team = self.db.query(Team).filter(Team.name == winner).first()
            if winner_team:
                game.winner_team_id = winner_team.id
            
            self.db.commit()
            
            # Envoyer le message de fin
            self._send_game_end_message(game_id, winner)
            
            return {
                "game": game,
                "winner": winner,
                "game_over": True,
                "message": f"La partie est terminée ! {winner} remportent la victoire !"
            }
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de la fin de partie: {str(e)}")
    
    def _send_phase_notifications(self, game_id: str, phase: Phase, actions: List[Action], vote_result: Dict[str, Any]):
        """Envoyer les notifications de phase"""
        try:
            from app.services.chat_service import get_chat_service
            chat_service = get_chat_service(self.db)
            
            # Message de changement de phase
            chat_service.send_public_message(
                game_id=game_id,
                sender_id=None,
                message=f"🔄 {phase.description}"
            )
            
        except Exception:
            pass
    
    def _send_turn_notifications(self, game_id: str, turn_number: int):
        """Envoyer les notifications de tour"""
        try:
            from app.services.chat_service import get_chat_service
            chat_service = get_chat_service(self.db)
            
            chat_service.send_public_message(
                game_id=game_id,
                sender_id=None,
                message=f"🌅 Début du tour {turn_number}"
            )
            
        except Exception:
            pass
    
    def _send_game_end_message(self, game_id: str, winner: str):
        """Envoyer le message de fin de partie"""
        try:
            from app.services.chat_service import get_chat_service
            chat_service = get_chat_service(self.db)
            
            chat_service.send_public_message(
                game_id=game_id,
                sender_id=None,
                message=f"🏆 Fin de partie ! {winner} remportent la victoire !"
            )
            
        except Exception:
            pass
    
    def _is_role_visible(self, viewer: Player, target: Player) -> bool:
        """Vérifier si le rôle d'un joueur est visible"""
        # Le joueur voit toujours son propre rôle
        if viewer.id == target.id:
            return True
        
        # Les morts voient les rôles des autres morts
        if not viewer.is_alive and not target.is_alive:
            return True
        
        # Le médium peut voir les rôles des morts
        if viewer.role.name == "Médium" and not target.is_alive:
            return True
        
        return False
    
    def _is_team_visible(self, viewer: Player, target: Player) -> bool:
        """Vérifier si l'équipe d'un joueur est visible"""
        # Le joueur voit toujours sa propre équipe
        if viewer.id == target.id:
            return True
        
        # Les membres de la même équipe se voient
        if viewer.team_id == target.team_id:
            return True
        
        return False
    
    def _get_available_actions(self, player: Player) -> List[Dict[str, Any]]:
        """Obtenir les actions disponibles pour un joueur"""
        actions = []
        
        # Actions selon le rôle
        if player.role.name == "Loup":
            actions.append({
                "type": "KILL",
                "name": "Tuerie nocturne",
                "description": "Tuer un joueur la nuit",
                "available": player.is_alive and player.game.current_phase == "NIGHT"
            })
        elif player.role.name == "Voyante":
            actions.append({
                "type": "INVESTIGATE",
                "name": "Investigation",
                "description": "Découvrir le rôle d'un joueur",
                "available": player.is_alive and player.game.current_phase == "NIGHT"
            })
        elif player.role.name == "Sorcière":
            actions.extend([
                {
                    "type": "HEAL",
                    "name": "Soin",
                    "description": "Sauver un joueur",
                    "available": player.is_alive and player.game.current_phase == "NIGHT"
                },
                {
                    "type": "KILL",
                    "name": "Tuerie",
                    "description": "Tuer un joueur",
                    "available": player.is_alive and player.game.current_phase == "NIGHT"
                }
            ])
        
        return actions
    
    def _get_available_votes(self, player: Player) -> List[Dict[str, Any]]:
        """Obtenir les votes disponibles pour un joueur"""
        votes = []
        
        if player.game.current_phase == "DAY":
            votes.append({
                "type": "ACCUSATION",
                "name": "Accusation",
                "description": "Accuser un joueur",
                "available": player.is_alive
            })
        elif player.game.current_phase == "EVENING":
            votes.append({
                "type": "CONDEMNATION",
                "name": "Condamnation",
                "description": "Voter pour condamner",
                "available": player.is_alive
            })
        elif player.game.current_phase == "NIGHT" and player.team.name == "Loups":
            votes.append({
                "type": "WOLF_KILL",
                "name": "Vote de tuerie",
                "description": "Voter pour tuer",
                "available": player.is_alive
            })
        
        return votes
    
    def _get_available_chats(self, game_id: str, player_id: str) -> List[Dict[str, Any]]:
        """Obtenir les chats disponibles pour un joueur"""
        try:
            from app.services.chat_service import get_chat_service
            chat_service = get_chat_service(self.db)
            
            return chat_service.get_available_chats(game_id, player_id)
            
        except Exception:
            return []


# Instance globale du service
def get_game_manager(db: Session) -> GameManager:
    """Obtenir une instance du gestionnaire de jeu"""
    return GameManager(db)
