"""
Service de gestion des jeux Wendigo
Gère la logique métier pour les lobbys, l'attribution des rôles et les phases de jeu
"""

import random
import asyncio
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.game import Game, GameStatus
from app.models.player import Player
from app.models.role import Role
from app.models.team import Team
from app.models.phase import Phase, PhaseType
from app.models.vote import Vote, VoteType
from app.models.action import Action, ActionType, ActionStatus
from app.core.database import get_db
from app.schemas.game import GameCreate, GameUpdate
from app.schemas.player import PlayerCreate
from app.exceptions import GameError, PlayerError, RoleError


class GameService:
    """Service principal pour la gestion des jeux Wendigo"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # GESTION DES LOBBYS
    # =============================================================================
    
    def create_game(self, game_data: GameCreate, creator_id: str) -> Game:
        """Créer un nouveau jeu"""
        try:
            # Vérifier s'il y a déjà un lobby actif (un seul lobby global)
            existing_game = self.db.query(Game).filter(
                Game.status == GameStatus.LOBBY
            ).first()
            
            if existing_game:
                raise GameError("Impossible de créer un nouveau lobby - Il y en a déjà un en cours !")
            
            # Vérifier les limites de joueurs
            if game_data.min_players < 8 or game_data.max_players > 29:
                raise GameError("Le nombre de joueurs doit être entre 8 et 29")
            
            if game_data.min_players > game_data.max_players:
                raise GameError("Le nombre minimum de joueurs ne peut pas dépasser le maximum")
            
            # Créer le jeu
            game = Game(
                name=game_data.name,
                description=game_data.description,
                min_players=game_data.min_players,
                max_players=game_data.max_players,
                created_by=creator_id,
                status=GameStatus.LOBBY,
                current_players=0
            )
            
            self.db.add(game)
            self.db.commit()
            self.db.refresh(game)
            
            return game
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de la création du jeu: {str(e)}")
    
    def join_game(self, game_id: str, user_id: str) -> Player:
        """Rejoindre un jeu"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Vérifier le statut du jeu
            if game.status != GameStatus.LOBBY:
                raise GameError("Impossible de rejoindre ce jeu")
            
            # Vérifier si le joueur est déjà dans le jeu
            existing_player = self.db.query(Player).filter(
                and_(Player.game_id == game_id, Player.user_id == user_id)
            ).first()
            
            if existing_player:
                raise PlayerError("Vous êtes déjà dans ce jeu")
            
            # Vérifier le nombre de joueurs
            if game.current_players >= game.max_players:
                raise GameError("Le jeu est complet")
            
            # Créer le joueur (rôle temporaire)
            player = Player(
                user_id=user_id,
                game_id=game_id,
                is_alive=True,
                is_ready=False,
                is_connected=True,
                has_selected_chair=False,
                power_usage_count=0
            )
            
            self.db.add(player)
            
            # Mettre à jour le nombre de joueurs
            game.current_players += 1
            
            self.db.commit()
            self.db.refresh(player)
            
            return player
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de la connexion au jeu: {str(e)}")
    
    def leave_game(self, game_id: str, user_id: str) -> bool:
        """Quitter un jeu"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Vérifier le statut du jeu
            if game.status != GameStatus.LOBBY:
                raise GameError("Impossible de quitter ce jeu")
            
            # Trouver le joueur
            player = self.db.query(Player).filter(
                and_(Player.game_id == game_id, Player.user_id == user_id)
            ).first()
            
            if not player:
                raise PlayerError("Joueur non trouvé dans ce jeu")
            
            # Supprimer le joueur
            self.db.delete(player)
            
            # Mettre à jour le nombre de joueurs
            game.current_players -= 1
            
            self.db.commit()
            
            return True
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de la déconnexion du jeu: {str(e)}")
    
    def set_player_ready(self, game_id: str, user_id: str, is_ready: bool) -> Player:
        """Définir le statut prêt d'un joueur"""
        try:
            player = self.db.query(Player).filter(
                and_(Player.game_id == game_id, Player.user_id == user_id)
            ).first()
            
            if not player:
                raise PlayerError("Joueur non trouvé")
            
            player.is_ready = is_ready
            self.db.commit()
            self.db.refresh(player)
            
            return player
            
        except Exception as e:
            self.db.rollback()
            raise PlayerError(f"Erreur lors de la mise à jour du statut: {str(e)}")
    
    def select_chair(self, game_id: str, user_id: str, chair_position: int) -> Player:
        """Sélectionner une chaise"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Vérifier le statut du jeu
            if game.status != GameStatus.LOBBY:
                raise GameError("Impossible de sélectionner une chaise à ce stade")
            
            # Vérifier la position de la chaise
            if chair_position < 1 or chair_position > game.max_players:
                raise GameError("Position de chaise invalide")
            
            # Vérifier si la chaise est disponible
            existing_player = self.db.query(Player).filter(
                and_(Player.game_id == game_id, Player.chair_position == chair_position)
            ).first()
            
            if existing_player:
                raise GameError("Cette chaise est déjà occupée")
            
            # Trouver le joueur
            player = self.db.query(Player).filter(
                and_(Player.game_id == game_id, Player.user_id == user_id)
            ).first()
            
            if not player:
                raise PlayerError("Joueur non trouvé")
            
            # Assigner la chaise
            player.chair_position = chair_position
            player.has_selected_chair = True
            
            self.db.commit()
            self.db.refresh(player)
            
            return player
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de la sélection de chaise: {str(e)}")
    
    # =============================================================================
    # ATTRIBUTION DES RÔLES
    # =============================================================================
    
    def assign_roles(self, game_id: str) -> Dict[str, str]:
        """Attribuer les rôles aux joueurs"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Récupérer tous les joueurs du jeu
            players = self.db.query(Player).filter(Player.game_id == game_id).all()
            
            if len(players) < game.min_players:
                raise GameError(f"Il faut au moins {game.min_players} joueurs pour démarrer")
            
            # Récupérer tous les rôles disponibles
            all_roles = self.db.query(Role).all()
            
            # Créer un pool de rôles basé sur le nombre de joueurs
            role_pool = self._create_role_pool(len(players), all_roles)
            
            # Mélanger les rôles et les joueurs
            random.shuffle(role_pool)
            random.shuffle(players)
            
            # Attribuer les rôles
            role_assignments = {}
            for i, player in enumerate(players):
                role = role_pool[i]
                player.role_id = role.id
                player.team_id = role.team_id
                role_assignments[player.user_id] = role.name
            
            # Mettre à jour le statut du jeu
            game.status = GameStatus.WAITING
            game.current_phase = "LOBBY"
            
            self.db.commit()
            
            return role_assignments
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors de l'attribution des rôles: {str(e)}")
    
    def _create_role_pool(self, player_count: int, all_roles: List[Role]) -> List[Role]:
        """Créer un pool de rôles équilibré pour le nombre de joueurs"""
        # Récupérer les équipes
        villager_team = self.db.query(Team).filter(Team.name == "Villageois").first()
        wolf_team = self.db.query(Team).filter(Team.name == "Loups").first()
        
        if not villager_team or not wolf_team:
            raise GameError("Équipes non trouvées")
        
        # Calculer la répartition équilibrée
        wolf_count = max(2, player_count // 4)  # Au moins 2 loups, max 25% des joueurs
        villager_count = player_count - wolf_count
        
        # Sélectionner les rôles de loups
        wolf_roles = self.db.query(Role).filter(Role.team_id == wolf_team.id).all()
        selected_wolf_roles = random.sample(wolf_roles, min(wolf_count, len(wolf_roles)))
        
        # Sélectionner les rôles de villageois
        villager_roles = self.db.query(Role).filter(Role.team_id == villager_team.id).all()
        selected_villager_roles = random.sample(villager_roles, min(villager_count, len(villager_roles)))
        
        # Combiner les rôles
        role_pool = selected_wolf_roles + selected_villager_roles
        
        # S'assurer qu'on a assez de rôles
        while len(role_pool) < player_count:
            # Ajouter des rôles de base si nécessaire
            if len(selected_wolf_roles) < wolf_count:
                additional_wolf = random.choice(wolf_roles)
                if additional_wolf not in selected_wolf_roles:
                    selected_wolf_roles.append(additional_wolf)
                    role_pool.append(additional_wolf)
            elif len(selected_villager_roles) < villager_count:
                additional_villager = random.choice(villager_roles)
                if additional_villager not in selected_villager_roles:
                    selected_villager_roles.append(additional_villager)
                    role_pool.append(additional_villager)
            else:
                break
        
        return role_pool[:player_count]
    
    # =============================================================================
    # DÉMARRAGE DU JEU
    # =============================================================================
    
    def start_game(self, game_id: str) -> Game:
        """Démarrer une partie"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Vérifier le statut
            if game.status != GameStatus.WAITING:
                raise GameError("Le jeu ne peut pas être démarré")
            
            # Vérifier que tous les joueurs sont prêts
            players = self.db.query(Player).filter(Player.game_id == game_id).all()
            not_ready_players = [p for p in players if not p.is_ready]
            
            if not_ready_players:
                raise GameError("Tous les joueurs doivent être prêts pour démarrer")
            
            # Vérifier que tous les joueurs ont sélectionné une chaise
            no_chair_players = [p for p in players if not p.has_selected_chair]
            
            if no_chair_players:
                raise GameError("Tous les joueurs doivent sélectionner une chaise")
            
            # Créer la première phase (Jour)
            first_phase = Phase(
                game_id=game_id,
                phase_type=PhaseType.DAY,
                turn_number=1,
                duration_seconds=game.day_phase_duration,
                started_at=datetime.utcnow(),
                is_active=True,
                description="Premier jour - Discussion générale"
            )
            
            self.db.add(first_phase)
            
            # Mettre à jour le statut du jeu
            game.status = GameStatus.PLAYING
            game.current_phase = "DAY"
            game.current_turn = 1
            game.started_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(game)
            
            return game
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors du démarrage du jeu: {str(e)}")
    
    # =============================================================================
    # GESTION DES PHASES
    # =============================================================================
    
    def get_current_phase(self, game_id: str) -> Optional[Phase]:
        """Récupérer la phase actuelle"""
        return self.db.query(Phase).filter(
            and_(Phase.game_id == game_id, Phase.is_active == True)
        ).first()
    
    def end_current_phase(self, game_id: str) -> Phase:
        """Terminer la phase actuelle et passer à la suivante"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            current_phase = self.get_current_phase(game_id)
            if not current_phase:
                raise GameError("Aucune phase active")
            
            # Terminer la phase actuelle
            current_phase.is_active = False
            current_phase.ended_at = datetime.utcnow()
            
            # Déterminer la phase suivante
            next_phase_type = self._get_next_phase_type(current_phase.phase_type)
            
            # Créer la nouvelle phase
            next_phase = Phase(
                game_id=game_id,
                phase_type=next_phase_type,
                turn_number=game.current_turn,
                duration_seconds=self._get_phase_duration(next_phase_type, game),
                started_at=datetime.utcnow(),
                is_active=True,
                description=self._get_phase_description(next_phase_type, game.current_turn)
            )
            
            self.db.add(next_phase)
            
            # Mettre à jour le jeu
            game.current_phase = next_phase_type.value
            if next_phase_type == PhaseType.DAY:
                game.current_turn += 1
            
            self.db.commit()
            self.db.refresh(next_phase)
            
            return next_phase
            
        except Exception as e:
            self.db.rollback()
            raise GameError(f"Erreur lors du changement de phase: {str(e)}")
    
    def _get_next_phase_type(self, current_phase: PhaseType) -> PhaseType:
        """Déterminer le type de phase suivant"""
        phase_sequence = [
            PhaseType.DAY,
            PhaseType.EVENING,
            PhaseType.NIGHT,
            PhaseType.REVEAL
        ]
        
        current_index = phase_sequence.index(current_phase)
        next_index = (current_index + 1) % len(phase_sequence)
        
        return phase_sequence[next_index]
    
    def _get_phase_duration(self, phase_type: PhaseType, game: Game) -> int:
        """Obtenir la durée d'une phase"""
        if phase_type == PhaseType.DAY:
            return game.day_phase_duration
        elif phase_type == PhaseType.NIGHT:
            return game.night_phase_duration
        elif phase_type == PhaseType.EVENING:
            return game.evening_phase_duration
        else:  # REVEAL
            return 60  # 1 minute pour les révélations
    
    def _get_phase_description(self, phase_type: PhaseType, turn_number: int) -> str:
        """Obtenir la description d'une phase"""
        if phase_type == PhaseType.DAY:
            return f"Jour {turn_number} - Discussion et vote"
        elif phase_type == PhaseType.EVENING:
            return f"Soir {turn_number} - Accusations et défenses"
        elif phase_type == PhaseType.NIGHT:
            return f"Nuit {turn_number} - Actions des rôles"
        else:  # REVEAL
            return f"Révélation {turn_number} - Résultats des actions"
    
    # =============================================================================
    # UTILITAIRES
    # =============================================================================
    
    def get_game_players(self, game_id: str, alive_only: bool = False) -> List[Player]:
        """Récupérer les joueurs d'un jeu"""
        query = self.db.query(Player).filter(Player.game_id == game_id)
        
        if alive_only:
            query = query.filter(Player.is_alive == True)
        
        return query.all()
    
    def get_player_by_id(self, player_id: str) -> Optional[Player]:
        """Récupérer un joueur par son ID"""
        return self.db.query(Player).filter(Player.id == player_id).first()
    
    def get_player_by_user_id(self, game_id: str, user_id: str) -> Optional[Player]:
        """Récupérer un joueur par son user_id dans un jeu"""
        return self.db.query(Player).filter(
            and_(Player.game_id == game_id, Player.user_id == user_id)
        ).first()
    
    def get_games(self, status_filter: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Game]:
        """Récupérer la liste des jeux disponibles"""
        try:
            query = self.db.query(Game)
            
            # Filtrer par statut si spécifié
            if status_filter:
                if status_filter.upper() == "CREATED":
                    query = query.filter(Game.status == GameStatus.LOBBY)
                elif status_filter.upper() == "WAITING":
                    query = query.filter(Game.status == GameStatus.WAITING)
                elif status_filter.upper() == "ACTIVE":
                    query = query.filter(Game.status == GameStatus.ACTIVE)
                elif status_filter.upper() == "FINISHED":
                    query = query.filter(Game.status == GameStatus.FINISHED)
            
            # Trier par date de création (plus récent en premier)
            query = query.order_by(Game.created_at.desc())
            
            # Limiter et paginer
            query = query.offset(offset).limit(limit)
            
            return query.all()
            
        except Exception as e:
            raise GameError(f"Erreur lors de la récupération des jeux: {str(e)}")
    
    def can_start_game(self, game_id: str) -> bool:
        """Vérifier si un jeu peut être démarré"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                return False
            
            if game.status != GameStatus.WAITING:
                return False
            
            players = self.get_game_players(game_id)
            
            # Vérifier le nombre de joueurs
            if len(players) < game.min_players:
                return False
            
            # Vérifier que tous les joueurs sont prêts
            not_ready = [p for p in players if not p.is_ready]
            if not_ready:
                return False
            
            # Vérifier que tous les joueurs ont une chaise
            no_chair = [p for p in players if not p.has_selected_chair]
            if no_chair:
                return False
            
            return True
            
        except Exception:
            return False


# Instance globale du service
def get_game_service(db: Session) -> GameService:
    """Obtenir une instance du service de jeu"""
    return GameService(db)
