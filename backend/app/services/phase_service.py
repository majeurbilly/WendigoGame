"""
Service de gestion des phases Wendigo
Gère les transitions de phases, le temps restant et les événements de phase
"""

import asyncio
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.phase import Phase, PhaseType
from app.models.game import Game, GameStatus
from app.models.player import Player
from app.models.action import Action, ActionStatus
from app.models.vote import Vote, VoteResult
from app.exceptions import PhaseError, GameError, ActionError, VoteError


class PhaseService:
    """Service pour la gestion des phases de jeu"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # CRÉATION ET GESTION DES PHASES
    # =============================================================================
    
    def create_phase(self, 
                    game_id: str,
                    phase_type: PhaseType,
                    turn_number: int,
                    duration_minutes: int,
                    description: str = None) -> Phase:
        """Créer une nouvelle phase"""
        try:
            # Vérifier qu'il n'y a pas déjà une phase active
            active_phase = self.get_active_phase(game_id)
            if active_phase:
                raise PhaseError("Une phase est déjà active")
            
            # Créer la phase
            phase = Phase(
                game_id=game_id,
                phase_type=phase_type,
                turn_number=turn_number,
                start_time=datetime.utcnow(),
                end_time=datetime.utcnow() + timedelta(minutes=duration_minutes),
                duration_minutes=duration_minutes,
                description=description or self._get_default_description(phase_type),
                is_active=True
            )
            
            self.db.add(phase)
            self.db.commit()
            self.db.refresh(phase)
            
            return phase
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors de la création de la phase: {str(e)}")
    
    def end_current_phase(self, game_id: str) -> Phase:
        """Terminer la phase actuelle"""
        try:
            current_phase = self.get_active_phase(game_id)
            if not current_phase:
                raise PhaseError("Aucune phase active")
            
            # Marquer la phase comme terminée
            current_phase.is_active = False
            current_phase.end_time = datetime.utcnow()
            current_phase.actual_duration_minutes = (
                current_phase.end_time - current_phase.start_time
            ).total_seconds() / 60
            
            # Mettre à jour le jeu
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if game:
                game.current_phase = None
            
            self.db.commit()
            self.db.refresh(current_phase)
            
            return current_phase
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors de la fin de phase: {str(e)}")
    
    def advance_to_next_phase(self, game_id: str) -> Phase:
        """Passer à la phase suivante"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Terminer la phase actuelle si elle existe
            current_phase = self.get_active_phase(game_id)
            if current_phase:
                self.end_current_phase(game_id)
            
            # Déterminer le type de phase suivant
            next_phase_type = self._get_next_phase_type(game.current_phase)
            
            # Déterminer la durée
            duration = self._get_phase_duration(next_phase_type, game)
            
            # Créer la nouvelle phase
            new_phase = self.create_phase(
                game_id=game_id,
                phase_type=next_phase_type,
                turn_number=game.current_turn,
                duration_minutes=duration,
                description=self._get_default_description(next_phase_type)
            )
            
            # Mettre à jour le jeu
            game.current_phase = next_phase_type.value
            self.db.commit()
            
            return new_phase
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors du passage à la phase suivante: {str(e)}")
    
    def advance_turn(self, game_id: str) -> Tuple[Phase, int]:
        """Passer au tour suivant"""
        try:
            game = self.db.query(Game).filter(Game.id == game_id).first()
            if not game:
                raise GameError("Jeu non trouvé")
            
            # Terminer la phase actuelle
            current_phase = self.get_active_phase(game_id)
            if current_phase:
                self.end_current_phase(game_id)
            
            # Incrémenter le tour
            game.current_turn += 1
            
            # Créer la première phase du nouveau tour (JOUR)
            new_phase = self.create_phase(
                game_id=game_id,
                phase_type=PhaseType.DAY,
                turn_number=game.current_turn,
                duration_minutes=game.day_phase_duration,
                description="Début du jour - Discussion et accusations"
            )
            
            # Mettre à jour le jeu
            game.current_phase = PhaseType.DAY.value
            self.db.commit()
            
            return new_phase, game.current_turn
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors du passage au tour suivant: {str(e)}")
    
    # =============================================================================
    # RÉSOLUTION DES PHASES
    # =============================================================================
    
    def resolve_phase_actions(self, game_id: str, phase_id: str) -> List[Action]:
        """Résoudre toutes les actions d'une phase"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            phase = self.db.query(Phase).filter(Phase.id == phase_id).first()
            if not phase:
                raise PhaseError("Phase non trouvée")
            
            # Résoudre les actions selon leur priorité
            resolved_actions = action_service.resolve_phase_actions(
                game_id=game_id,
                phase=phase.phase_type.value
            )
            
            return resolved_actions
            
        except Exception as e:
            raise PhaseError(f"Erreur lors de la résolution des actions: {str(e)}")
    
    def resolve_phase_votes(self, game_id: str, phase_id: str) -> Dict[str, Any]:
        """Résoudre tous les votes d'une phase"""
        try:
            from app.services.vote_service import get_vote_service
            vote_service = get_vote_service(self.db)
            
            phase = self.db.query(Phase).filter(Phase.id == phase_id).first()
            if not phase:
                raise PhaseError("Phase non trouvée")
            
            # Résoudre les votes selon le type de phase
            if phase.phase_type == PhaseType.NIGHT:
                # Vote des loups (unanime)
                result = vote_service.resolve_wolf_vote(
                    game_id=game_id,
                    phase=phase.phase_type.value,
                    turn_number=phase.turn_number
                )
            else:
                # Votes normaux
                result = vote_service.resolve_votes(
                    game_id=game_id,
                    phase=phase.phase_type.value,
                    turn_number=phase.turn_number
                )
            
            return result
            
        except Exception as e:
            raise PhaseError(f"Erreur lors de la résolution des votes: {str(e)}")
    
    def complete_phase(self, game_id: str) -> Dict[str, Any]:
        """Compléter une phase (résoudre actions + votes)"""
        try:
            current_phase = self.get_active_phase(game_id)
            if not current_phase:
                raise PhaseError("Aucune phase active")
            
            results = {
                "phase": current_phase,
                "actions": [],
                "votes": {},
                "next_phase": None
            }
            
            # Résoudre les actions
            try:
                results["actions"] = self.resolve_phase_actions(game_id, current_phase.id)
            except Exception as e:
                results["action_error"] = str(e)
            
            # Résoudre les votes
            try:
                results["votes"] = self.resolve_phase_votes(game_id, current_phase.id)
            except Exception as e:
                results["vote_error"] = str(e)
            
            # Passer à la phase suivante
            try:
                results["next_phase"] = self.advance_to_next_phase(game_id)
            except Exception as e:
                results["phase_error"] = str(e)
            
            return results
            
        except Exception as e:
            raise PhaseError(f"Erreur lors de la complétion de la phase: {str(e)}")
    
    # =============================================================================
    # GESTION DU TEMPS
    # =============================================================================
    
    def get_time_remaining(self, game_id: str) -> Optional[int]:
        """Obtenir le temps restant en secondes pour la phase actuelle"""
        current_phase = self.get_active_phase(game_id)
        if not current_phase:
            return None
        
        now = datetime.utcnow()
        if now >= current_phase.end_time:
            return 0
        
        remaining = (current_phase.end_time - now).total_seconds()
        return int(remaining)
    
    def is_phase_expired(self, game_id: str) -> bool:
        """Vérifier si la phase actuelle a expiré"""
        time_remaining = self.get_time_remaining(game_id)
        return time_remaining is not None and time_remaining <= 0
    
    def extend_phase(self, game_id: str, additional_minutes: int) -> Phase:
        """Prolonger la phase actuelle"""
        try:
            current_phase = self.get_active_phase(game_id)
            if not current_phase:
                raise PhaseError("Aucune phase active")
            
            current_phase.end_time += timedelta(minutes=additional_minutes)
            current_phase.duration_minutes += additional_minutes
            
            self.db.commit()
            self.db.refresh(current_phase)
            
            return current_phase
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors de la prolongation de la phase: {str(e)}")
    
    def pause_phase(self, game_id: str) -> Phase:
        """Mettre en pause la phase actuelle"""
        try:
            current_phase = self.get_active_phase(game_id)
            if not current_phase:
                raise PhaseError("Aucune phase active")
            
            current_phase.is_paused = True
            current_phase.pause_start_time = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(current_phase)
            
            return current_phase
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors de la mise en pause: {str(e)}")
    
    def resume_phase(self, game_id: str) -> Phase:
        """Reprendre la phase en pause"""
        try:
            current_phase = self.get_active_phase(game_id)
            if not current_phase:
                raise PhaseError("Aucune phase active")
            
            if not current_phase.is_paused:
                raise PhaseError("La phase n'est pas en pause")
            
            # Calculer le temps de pause
            pause_duration = (datetime.utcnow() - current_phase.pause_start_time).total_seconds() / 60
            
            # Ajuster la fin de phase
            current_phase.end_time += timedelta(minutes=pause_duration)
            current_phase.is_paused = False
            current_phase.pause_start_time = None
            
            self.db.commit()
            self.db.refresh(current_phase)
            
            return current_phase
            
        except Exception as e:
            self.db.rollback()
            raise PhaseError(f"Erreur lors de la reprise: {str(e)}")
    
    # =============================================================================
    # UTILITAIRES
    # =============================================================================
    
    def get_active_phase(self, game_id: str) -> Optional[Phase]:
        """Obtenir la phase active d'un jeu"""
        return self.db.query(Phase).filter(
            and_(
                Phase.game_id == game_id,
                Phase.is_active == True
            )
        ).first()
    
    def get_phase_history(self, game_id: str, limit: int = 10) -> List[Phase]:
        """Obtenir l'historique des phases d'un jeu"""
        return self.db.query(Phase).filter(
            Phase.game_id == game_id
        ).order_by(Phase.start_time.desc()).limit(limit).all()
    
    def get_turn_phases(self, game_id: str, turn_number: int) -> List[Phase]:
        """Obtenir toutes les phases d'un tour"""
        return self.db.query(Phase).filter(
            and_(
                Phase.game_id == game_id,
                Phase.turn_number == turn_number
            )
        ).order_by(Phase.start_time).all()
    
    def get_phase_status(self, game_id: str) -> Dict[str, Any]:
        """Obtenir le statut complet de la phase actuelle"""
        current_phase = self.get_active_phase(game_id)
        if not current_phase:
            return {"active": False}
        
        time_remaining = self.get_time_remaining(game_id)
        
        return {
            "active": True,
            "phase": current_phase.phase_type.value,
            "turn_number": current_phase.turn_number,
            "start_time": current_phase.start_time,
            "end_time": current_phase.end_time,
            "time_remaining": time_remaining,
            "is_expired": time_remaining is not None and time_remaining <= 0,
            "is_paused": current_phase.is_paused,
            "description": current_phase.description
        }
    
    # =============================================================================
    # MÉTHODES PRIVÉES
    # =============================================================================
    
    def _get_next_phase_type(self, current_phase: Optional[str]) -> PhaseType:
        """Déterminer le type de phase suivant"""
        if not current_phase:
            return PhaseType.DAY
        
        phase_sequence = [
            PhaseType.DAY,
            PhaseType.EVENING,
            PhaseType.NIGHT,
            PhaseType.REVEAL
        ]
        
        try:
            current_index = next(i for i, phase in enumerate(phase_sequence) 
                               if phase.value == current_phase)
            next_index = (current_index + 1) % len(phase_sequence)
            return phase_sequence[next_index]
        except StopIteration:
            return PhaseType.DAY
    
    def _get_phase_duration(self, phase_type: PhaseType, game: Game) -> int:
        """Obtenir la durée d'une phase"""
        if phase_type == PhaseType.DAY:
            return game.day_phase_duration
        elif phase_type == PhaseType.NIGHT:
            return game.night_phase_duration
        elif phase_type == PhaseType.EVENING:
            return game.evening_phase_duration
        elif phase_type == PhaseType.REVEAL:
            return 2  # 2 minutes pour les révélations
        else:
            return 5  # Durée par défaut
    
    def _get_default_description(self, phase_type: PhaseType) -> str:
        """Obtenir la description par défaut d'une phase"""
        descriptions = {
            PhaseType.DAY: "Phase de jour - Discussion et accusations",
            PhaseType.EVENING: "Phase du soir - Vote de condamnation",
            PhaseType.NIGHT: "Phase de nuit - Actions des rôles",
            PhaseType.REVEAL: "Phase de révélation - Résultats des actions"
        }
        return descriptions.get(phase_type, "Phase de jeu")


# Instance globale du service
def get_phase_service(db: Session) -> PhaseService:
    """Obtenir une instance du service de phase"""
    return PhaseService(db)
