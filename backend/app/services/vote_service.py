"""
Service de gestion des votes Wendigo
Gère le système de vote, les accusations et les condamnations
"""

import asyncio
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.vote import Vote, VoteType, VoteResult
from app.models.player import Player
from app.models.game import Game
from app.models.phase import Phase, PhaseType
from app.exceptions import VoteError, PlayerError, GameError
from app.models.team import Team


class VoteService:
    """Service pour la gestion des votes"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # CRÉATION DE VOTES
    # =============================================================================
    
    def create_vote(self, 
                   game_id: str,
                   voter_id: str,
                   vote_type: VoteType,
                   target_id: Optional[str] = None,
                   additional_data: Optional[Dict] = None) -> Vote:
        """Créer un nouveau vote"""
        try:
            # Vérifier que le votant existe et est vivant
            voter = self.db.query(Player).filter(Player.id == voter_id).first()
            if not voter:
                raise PlayerError("Votant non trouvé")
            
            if not voter.is_alive:
                raise VoteError("Un joueur mort ne peut pas voter")
            
            # Vérifier que la cible existe si spécifiée
            target = None
            if target_id:
                target = self.db.query(Player).filter(Player.id == target_id).first()
                if not target:
                    raise PlayerError("Cible non trouvée")
            
            # Vérifier qu'il n'y a pas déjà un vote de ce joueur pour ce type
            existing_vote = self.db.query(Vote).filter(
                and_(
                    Vote.game_id == game_id,
                    Vote.voter_id == voter_id,
                    Vote.vote_type == vote_type,
                    Vote.phase == voter.game.current_phase,
                    Vote.turn_number == voter.game.current_turn
                )
            ).first()
            
            if existing_vote:
                # Mettre à jour le vote existant
                existing_vote.target_id = target_id
                existing_vote.additional_data = additional_data or {}
                existing_vote.updated_at = datetime.utcnow()
                
                self.db.commit()
                self.db.refresh(existing_vote)
                
                return existing_vote
            
            # Créer le vote
            vote = Vote(
                game_id=game_id,
                voter_id=voter_id,
                target_id=target_id,
                vote_type=vote_type,
                phase=voter.game.current_phase,
                turn_number=voter.game.current_turn,
                result=VoteResult.PENDING,
                vote_count=1,
                additional_data=additional_data or {}
            )
            
            self.db.add(vote)
            self.db.commit()
            self.db.refresh(vote)
            
            return vote
            
        except Exception as e:
            self.db.rollback()
            raise VoteError(f"Erreur lors de la création du vote: {str(e)}")
    
    # =============================================================================
    # RÉSOLUTION DES VOTES
    # =============================================================================
    
    def resolve_votes(self, game_id: str, phase: str, turn_number: int) -> Dict[str, Any]:
        """Résoudre tous les votes d'une phase"""
        try:
            # Récupérer tous les votes de la phase
            votes = self.db.query(Vote).filter(
                and_(
                    Vote.game_id == game_id,
                    Vote.phase == phase,
                    Vote.turn_number == turn_number,
                    Vote.result == VoteResult.PENDING
                )
            ).all()
            
            if not votes:
                return {"winners": [], "tied": False, "total_votes": 0}
            
            # Compter les votes par cible
            vote_counts = {}
            for vote in votes:
                if vote.target_id:
                    if vote.target_id not in vote_counts:
                        vote_counts[vote.target_id] = 0
                    vote_counts[vote.target_id] += vote.vote_count
            
            if not vote_counts:
                return {"winners": [], "tied": False, "total_votes": 0}
            
            # Trouver le(s) gagnant(s)
            max_votes = max(vote_counts.values())
            winners = [target_id for target_id, count in vote_counts.items() if count == max_votes]
            
            # Marquer les votes comme résolus
            for vote in votes:
                if vote.target_id in winners:
                    vote.result = VoteResult.SUCCESS
                else:
                    vote.result = VoteResult.FAILED
                vote.resolved_at = datetime.utcnow()
            
            self.db.commit()
            
            # Vérifier s'il y a égalité
            tied = len(winners) > 1
            
            return {
                "winners": winners,
                "tied": tied,
                "total_votes": sum(vote_counts.values()),
                "vote_counts": vote_counts
            }
            
        except Exception as e:
            self.db.rollback()
            raise VoteError(f"Erreur lors de la résolution des votes: {str(e)}")
    
    def resolve_wolf_vote(self, game_id: str, phase: str, turn_number: int) -> Dict[str, Any]:
        """Résoudre le vote des loups (doit être unanime)"""
        try:
            # Récupérer tous les loups vivants
            wolf_team = self.db.query(Team).filter(Team.name == "Loups").first()
            if not wolf_team:
                raise VoteError("Équipe des loups non trouvée")
            
            alive_wolves = self.db.query(Player).filter(
                and_(
                    Player.game_id == game_id,
                    Player.team_id == wolf_team.id,
                    Player.is_alive == True
                )
            ).all()
            
            if not alive_wolves:
                return {"success": False, "message": "Aucun loup vivant"}
            
            # Récupérer les votes des loups
            wolf_votes = self.db.query(Vote).filter(
                and_(
                    Vote.game_id == game_id,
                    Vote.phase == phase,
                    Vote.turn_number == turn_number,
                    Vote.vote_type == VoteType.WOLF_KILL,
                    Vote.result == VoteResult.PENDING
                )
            ).all()
            
            if not wolf_votes:
                return {"success": False, "message": "Aucun vote de loup"}
            
            # Vérifier que tous les loups ont voté
            voting_wolves = [vote.voter_id for vote in wolf_votes]
            missing_wolves = [wolf.id for wolf in alive_wolves if wolf.id not in voting_wolves]
            
            if missing_wolves:
                return {
                    "success": False, 
                    "message": f"Tous les loups doivent voter. Manquant: {len(missing_wolves)}"
                }
            
            # Compter les votes
            vote_counts = {}
            for vote in wolf_votes:
                if vote.target_id:
                    if vote.target_id not in vote_counts:
                        vote_counts[vote.target_id] = 0
                    vote_counts[vote.target_id] += vote.vote_count
            
            if not vote_counts:
                return {"success": False, "message": "Aucune cible votée"}
            
            # Vérifier l'unanimité
            max_votes = max(vote_counts.values())
            unanimous_targets = [target_id for target_id, count in vote_counts.items() if count == max_votes]
            
            if len(unanimous_targets) > 1:
                # Égalité - pas de tuerie
                for vote in wolf_votes:
                    vote.result = VoteResult.FAILED
                    vote.resolved_at = datetime.utcnow()
                
                self.db.commit()
                
                return {
                    "success": False,
                    "message": "Les loups n'ont pas pu se mettre d'accord",
                    "tied": True
                }
            
            # Vote unanime réussi
            target_id = unanimous_targets[0]
            
            # Marquer les votes
            for vote in wolf_votes:
                if vote.target_id == target_id:
                    vote.result = VoteResult.SUCCESS
                else:
                    vote.result = VoteResult.FAILED
                vote.resolved_at = datetime.utcnow()
            
            self.db.commit()
            
            return {
                "success": True,
                "target_id": target_id,
                "message": "Vote unanime des loups réussi"
            }
            
        except Exception as e:
            self.db.rollback()
            raise VoteError(f"Erreur lors de la résolution du vote des loups: {str(e)}")
    
    # =============================================================================
    # VOTES SPÉCIAUX
    # =============================================================================
    
    def create_accusation_vote(self, game_id: str, accuser_id: str, accused_id: str) -> Vote:
        """Créer un vote d'accusation"""
        return self.create_vote(
            game_id=game_id,
            voter_id=accuser_id,
            vote_type=VoteType.ACCUSATION,
            target_id=accused_id,
            additional_data={"vote_type": "accusation"}
        )
    
    def create_condemnation_vote(self, game_id: str, voter_id: str, target_id: str) -> Vote:
        """Créer un vote de condamnation"""
        return self.create_vote(
            game_id=game_id,
            voter_id=voter_id,
            vote_type=VoteType.CONDEMNATION,
            target_id=target_id,
            additional_data={"vote_type": "condemnation"}
        )
    
    def create_wolf_kill_vote(self, game_id: str, wolf_id: str, target_id: str) -> Vote:
        """Créer un vote de tuerie des loups"""
        return self.create_vote(
            game_id=game_id,
            voter_id=wolf_id,
            vote_type=VoteType.WOLF_KILL,
            target_id=target_id,
            additional_data={"vote_type": "wolf_kill"}
        )
    
    def create_lynch_vote(self, game_id: str, voter_id: str, target_id: str) -> Vote:
        """Créer un vote de lynchage"""
        return self.create_vote(
            game_id=game_id,
            voter_id=voter_id,
            vote_type=VoteType.LYNCH,
            target_id=target_id,
            additional_data={"vote_type": "lynch"}
        )
    
    # =============================================================================
    # UTILITAIRES
    # =============================================================================
    
    def get_player_votes(self, player_id: str, phase: Optional[str] = None) -> List[Vote]:
        """Récupérer les votes d'un joueur"""
        query = self.db.query(Vote).filter(Vote.voter_id == player_id)
        
        if phase:
            query = query.filter(Vote.phase == phase)
        
        return query.all()
    
    def get_target_votes(self, target_id: str, phase: Optional[str] = None) -> List[Vote]:
        """Récupérer les votes contre une cible"""
        query = self.db.query(Vote).filter(Vote.target_id == target_id)
        
        if phase:
            query = query.filter(Vote.phase == phase)
        
        return query.all()
    
    def get_phase_votes(self, game_id: str, phase: str, turn_number: int) -> List[Vote]:
        """Récupérer tous les votes d'une phase"""
        return self.db.query(Vote).filter(
            and_(
                Vote.game_id == game_id,
                Vote.phase == phase,
                Vote.turn_number == turn_number
            )
        ).all()
    
    def get_vote_summary(self, game_id: str, phase: str, turn_number: int) -> Dict[str, Any]:
        """Obtenir un résumé des votes d'une phase"""
        votes = self.get_phase_votes(game_id, phase, turn_number)
        
        summary = {
            "total_votes": len(votes),
            "pending_votes": len([v for v in votes if v.result == VoteResult.PENDING]),
            "resolved_votes": len([v for v in votes if v.result != VoteResult.PENDING]),
            "vote_types": {},
            "targets": {}
        }
        
        # Compter par type de vote
        for vote in votes:
            vote_type = vote.vote_type.value
            if vote_type not in summary["vote_types"]:
                summary["vote_types"][vote_type] = 0
            summary["vote_types"][vote_type] += 1
        
        # Compter par cible
        for vote in votes:
            if vote.target_id:
                if vote.target_id not in summary["targets"]:
                    summary["targets"][vote.target_id] = 0
                summary["targets"][vote.target_id] += vote.vote_count
        
        return summary
    
    def cancel_vote(self, vote_id: str) -> Vote:
        """Annuler un vote"""
        vote = self.db.query(Vote).filter(Vote.id == vote_id).first()
        if not vote:
            raise VoteError("Vote non trouvé")
        
        if vote.result != VoteResult.PENDING:
            raise VoteError("Impossible d'annuler un vote déjà résolu")
        
        vote.result = VoteResult.CANCELLED
        vote.resolved_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(vote)
        
        return vote
    
    def get_voting_status(self, game_id: str, phase: str, turn_number: int) -> Dict[str, Any]:
        """Obtenir le statut de vote d'une phase"""
        # Récupérer tous les joueurs vivants
        alive_players = self.db.query(Player).filter(
            and_(
                Player.game_id == game_id,
                Player.is_alive == True
            )
        ).all()
        
        # Récupérer les votes
        votes = self.get_phase_votes(game_id, phase, turn_number)
        voting_players = [vote.voter_id for vote in votes]
        
        # Calculer les statistiques
        total_alive = len(alive_players)
        total_voted = len(set(voting_players))
        remaining_votes = total_alive - total_voted
        
        return {
            "total_alive": total_alive,
            "total_voted": total_voted,
            "remaining_votes": remaining_votes,
            "voting_percentage": (total_voted / total_alive * 100) if total_alive > 0 else 0,
            "can_resolve": total_voted == total_alive
        }


# Instance globale du service
def get_vote_service(db: Session) -> VoteService:
    """Obtenir une instance du service de vote"""
    return VoteService(db)
