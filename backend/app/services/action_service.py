"""
Service de gestion des actions et pouvoirs Wendigo
Gère l'exécution des actions des rôles et la résolution des pouvoirs
"""

import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.action import Action, ActionType, ActionStatus
from app.models.player import Player
from app.models.role import Role
from app.models.phase import Phase, PhaseType
from app.models.game import Game
from app.exceptions import ActionError, PlayerError, RoleError, PhaseError


class ActionService:
    """Service pour la gestion des actions et pouvoirs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # CRÉATION D'ACTIONS
    # =============================================================================
    
    def create_action(self, 
                     game_id: str,
                     actor_id: str,
                     action_type: ActionType,
                     target_id: Optional[str] = None,
                     additional_data: Optional[Dict[str, Any]] = None) -> Action:
        """Créer une nouvelle action"""
        try:
            # Vérifier que l'acteur existe et est vivant
            actor = self.db.query(Player).filter(Player.id == actor_id).first()
            if not actor:
                raise PlayerError("Acteur non trouvé")
            
            if not actor.is_alive:
                raise ActionError("Un joueur mort ne peut pas effectuer d'action")
            
            # Vérifier que la cible existe si spécifiée
            target = None
            if target_id:
                target = self.db.query(Player).filter(Player.id == target_id).first()
                if not target:
                    raise PlayerError("Cible non trouvée")
            
            # Créer l'action
            action = Action(
                game_id=game_id,
                actor_id=actor_id,
                target_id=target_id,
                action_type=action_type,
                phase=actor.game.current_phase,
                turn_number=actor.game.current_turn,
                status=ActionStatus.PENDING,
                success=False,
                additional_data=additional_data or {}
            )
            
            self.db.add(action)
            self.db.commit()
            self.db.refresh(action)
            
            return action
            
        except Exception as e:
            self.db.rollback()
            raise ActionError(f"Erreur lors de la création de l'action: {str(e)}")
    
    # =============================================================================
    # EXÉCUTION D'ACTIONS
    # =============================================================================
    
    def execute_action(self, action_id: str) -> Action:
        """Exécuter une action"""
        try:
            action = self.db.query(Action).filter(Action.id == action_id).first()
            if not action:
                raise ActionError("Action non trouvée")
            
            if action.status != ActionStatus.PENDING:
                raise ActionError("L'action a déjà été traitée")
            
            # Récupérer l'acteur et sa cible
            actor = self.db.query(Player).filter(Player.id == action.actor_id).first()
            target = None
            if action.target_id:
                target = self.db.query(Player).filter(Player.id == action.target_id).first()
            
            # Vérifier que l'acteur est toujours vivant
            if not actor.is_alive:
                action.status = ActionStatus.CANCELLED
                action.message = "L'acteur est mort"
                self.db.commit()
                return action
            
            # Exécuter l'action selon son type
            try:
                result = self._execute_action_by_type(action, actor, target)
                action.status = ActionStatus.COMPLETED
                action.success = result.get("success", False)
                action.message = result.get("message", "Action exécutée")
                action.additional_data.update(result.get("data", {}))
                
            except Exception as e:
                action.status = ActionStatus.FAILED
                action.message = f"Erreur lors de l'exécution: {str(e)}"
            
            self.db.commit()
            self.db.refresh(action)
            
            return action
            
        except Exception as e:
            self.db.rollback()
            raise ActionError(f"Erreur lors de l'exécution de l'action: {str(e)}")
    
    def _execute_action_by_type(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action selon son type"""
        
        if action.action_type == ActionType.KILL:
            return self._execute_kill_action(action, actor, target)
        elif action.action_type == ActionType.PROTECT:
            return self._execute_protect_action(action, actor, target)
        elif action.action_type == ActionType.INVESTIGATE:
            return self._execute_investigate_action(action, actor, target)
        elif action.action_type == ActionType.HEAL:
            return self._execute_heal_action(action, actor, target)
        elif action.action_type == ActionType.CURSE:
            return self._execute_curse_action(action, actor, target)
        elif action.action_type == ActionType.CHARM:
            return self._execute_charm_action(action, actor, target)
        elif action.action_type == ActionType.DUEL:
            return self._execute_duel_action(action, actor, target)
        elif action.action_type == ActionType.SNEAK:
            return self._execute_sneak_action(action, actor, target)
        elif action.action_type == ActionType.SKIP_PHASE:
            return self._execute_skip_phase_action(action, actor)
        elif action.action_type == ActionType.CONTAMINATE:
            return self._execute_contaminate_action(action, actor, target)
        else:
            raise ActionError(f"Type d'action non supporté: {action.action_type}")
    
    # =============================================================================
    # IMPLÉMENTATION DES ACTIONS SPÉCIFIQUES
    # =============================================================================
    
    def _execute_kill_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de tuerie"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if not target.is_alive:
            return {"success": False, "message": "La cible est déjà morte"}
        
        # Vérifier si la cible est protégée
        protection_actions = self.db.query(Action).filter(
            and_(
                Action.target_id == target.id,
                Action.action_type == ActionType.PROTECT,
                Action.phase == action.phase,
                Action.status == ActionStatus.COMPLETED,
                Action.success == True
            )
        ).all()
        
        if protection_actions:
            return {
                "success": False, 
                "message": f"{target.username} était protégé(e)",
                "data": {"protected": True}
            }
        
        # Tuer la cible
        target.is_alive = False
        target.died_at = datetime.utcnow()
        
        return {
            "success": True,
            "message": f"{target.username} a été tué(e)",
            "data": {"killed_player": target.username}
        }
    
    def _execute_protect_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de protection"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if not target.is_alive:
            return {"success": False, "message": "Impossible de protéger un joueur mort"}
        
        return {
            "success": True,
            "message": f"{target.username} est protégé(e)",
            "data": {"protected_player": target.username}
        }
    
    def _execute_investigate_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action d'investigation"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        # Récupérer le rôle de la cible
        target_role = self.db.query(Role).filter(Role.id == target.role_id).first()
        if not target_role:
            return {"success": False, "message": "Rôle de la cible non trouvé"}
        
        return {
            "success": True,
            "message": f"Investigation réussie",
            "data": {
                "target_role": target_role.name,
                "target_team": target_role.team.name,
                "target_description": target_role.description
            }
        }
    
    def _execute_heal_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de soin"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if target.is_alive:
            return {"success": False, "message": "La cible n'a pas besoin de soin"}
        
        # Ressusciter la cible
        target.is_alive = True
        target.died_at = None
        
        return {
            "success": True,
            "message": f"{target.username} a été soigné(e)",
            "data": {"healed_player": target.username}
        }
    
    def _execute_curse_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de malédiction"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if not target.is_alive:
            return {"success": False, "message": "Impossible de maudire un joueur mort"}
        
        # Appliquer la malédiction (effet temporaire)
        return {
            "success": True,
            "message": f"{target.username} a été maudit(e)",
            "data": {"cursed_player": target.username}
        }
    
    def _execute_charm_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de charme"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if not target.is_alive:
            return {"success": False, "message": "Impossible de charmer un joueur mort"}
        
        return {
            "success": True,
            "message": f"{target.username} a été charmé(e)",
            "data": {"charmed_player": target.username}
        }
    
    def _execute_duel_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de duel"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if not target.is_alive:
            return {"success": False, "message": "Impossible de défier un joueur mort"}
        
        # Simuler un duel (50/50 de chance)
        import random
        actor_wins = random.choice([True, False])
        
        if actor_wins:
            target.is_alive = False
            target.died_at = datetime.utcnow()
            return {
                "success": True,
                "message": f"{actor.username} a gagné le duel contre {target.username}",
                "data": {"winner": actor.username, "loser": target.username}
            }
        else:
            actor.is_alive = False
            actor.died_at = datetime.utcnow()
            return {
                "success": True,
                "message": f"{target.username} a gagné le duel contre {actor.username}",
                "data": {"winner": target.username, "loser": actor.username}
            }
    
    def _execute_sneak_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action d'infiltration"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        # Récupérer les informations secrètes de la cible
        target_role = self.db.query(Role).filter(Role.id == target.role_id).first()
        
        return {
            "success": True,
            "message": f"Infiltration réussie",
            "data": {
                "target_role": target_role.name,
                "target_power": target_role.power_description
            }
        }
    
    def _execute_skip_phase_action(self, action: Action, actor: Player) -> Dict[str, Any]:
        """Exécuter une action de saut de phase"""
        game = self.db.query(Game).filter(Game.id == action.game_id).first()
        
        return {
            "success": True,
            "message": f"Phase sautée par {actor.username}",
            "data": {"phase_skipped": True}
        }
    
    def _execute_contaminate_action(self, action: Action, actor: Player, target: Optional[Player]) -> Dict[str, Any]:
        """Exécuter une action de contamination"""
        if not target:
            return {"success": False, "message": "Aucune cible spécifiée"}
        
        if not target.is_alive:
            return {"success": False, "message": "Impossible de contaminer un joueur mort"}
        
        return {
            "success": True,
            "message": f"{target.username} a été contaminé(e)",
            "data": {"contaminated_player": target.username}
        }
    
    # =============================================================================
    # RÉSOLUTION DES ACTIONS
    # =============================================================================
    
    def resolve_phase_actions(self, game_id: str, phase: str) -> List[Action]:
        """Résoudre toutes les actions d'une phase selon leur priorité"""
        try:
            # Récupérer toutes les actions en attente pour cette phase
            pending_actions = self.db.query(Action).filter(
                and_(
                    Action.game_id == game_id,
                    Action.phase == phase,
                    Action.status == ActionStatus.PENDING
                )
            ).all()
            
            if not pending_actions:
                return []
            
            # Trier les actions par priorité
            sorted_actions = self._sort_actions_by_priority(pending_actions)
            
            # Exécuter les actions dans l'ordre
            executed_actions = []
            for action in sorted_actions:
                try:
                    executed_action = self.execute_action(action.id)
                    executed_actions.append(executed_action)
                except Exception as e:
                    # Marquer l'action comme échouée
                    action.status = ActionStatus.FAILED
                    action.message = str(e)
                    executed_actions.append(action)
            
            self.db.commit()
            return executed_actions
            
        except Exception as e:
            self.db.rollback()
            raise ActionError(f"Erreur lors de la résolution des actions: {str(e)}")
    
    def _sort_actions_by_priority(self, actions: List[Action]) -> List[Action]:
        """Trier les actions par priorité d'exécution"""
        # Définir l'ordre de priorité des actions
        priority_order = {
            ActionType.PROTECT: 1,      # Protection en premier
            ActionType.HEAL: 2,         # Soins en second
            ActionType.INVESTIGATE: 3,  # Investigations
            ActionType.SNEAK: 4,        # Infiltrations
            ActionType.CHARM: 5,        # Charmes
            ActionType.CURSE: 6,        # Malédictions
            ActionType.CONTAMINATE: 7,  # Contaminations
            ActionType.DUEL: 8,         # Duels
            ActionType.KILL: 9,         # Tueries en dernier
            ActionType.SKIP_PHASE: 10,  # Saut de phase
        }
        
        # Trier par priorité
        return sorted(actions, key=lambda x: priority_order.get(x.action_type, 999))
    
    # =============================================================================
    # UTILITAIRES
    # =============================================================================
    
    def get_player_actions(self, player_id: str, phase: Optional[str] = None) -> List[Action]:
        """Récupérer les actions d'un joueur"""
        query = self.db.query(Action).filter(Action.actor_id == player_id)
        
        if phase:
            query = query.filter(Action.phase == phase)
        
        return query.all()
    
    def get_pending_actions(self, game_id: str) -> List[Action]:
        """Récupérer les actions en attente d'un jeu"""
        return self.db.query(Action).filter(
            and_(
                Action.game_id == game_id,
                Action.status == ActionStatus.PENDING
            )
        ).all()
    
    def cancel_action(self, action_id: str) -> Action:
        """Annuler une action"""
        action = self.db.query(Action).filter(Action.id == action_id).first()
        if not action:
            raise ActionError("Action non trouvée")
        
        if action.status != ActionStatus.PENDING:
            raise ActionError("Impossible d'annuler une action déjà traitée")
        
        action.status = ActionStatus.CANCELLED
        action.message = "Action annulée"
        
        self.db.commit()
        self.db.refresh(action)
        
        return action


# Instance globale du service
def get_action_service(db: Session) -> ActionService:
    """Obtenir une instance du service d'actions"""
    return ActionService(db)
