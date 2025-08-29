"""
Service de gestion des rôles Wendigo
Gère les pouvoirs spécifiques de chaque rôle et leurs interactions
"""

import random
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.role import Role
from app.models.player import Player
from app.models.team import Team
from app.models.action import Action, ActionType, ActionStatus
from app.models.vote import Vote, VoteType
from app.exceptions import RoleError, PlayerError, ActionError


class RoleService:
    """Service pour la gestion des rôles et leurs pouvoirs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =============================================================================
    # POUVOIRS DES LOUPS
    # =============================================================================
    
    def execute_wolf_kill(self, wolf_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de tuerie des loups"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le loup est vivant
            wolf = self.db.query(Player).filter(Player.id == wolf_id).first()
            if not wolf or not wolf.is_alive:
                raise PlayerError("Loup non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de tuerie
            action = action_service.create_action(
                game_id=game_id,
                actor_id=wolf_id,
                target_id=target_id,
                action_type=ActionType.KILL,
                phase="NIGHT",
                additional_data={"role": "Loup", "power": "Tuerie nocturne"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de l'exécution du pouvoir de loup: {str(e)}")
    
    # =============================================================================
    # POUVOIRS DES VILLAGEOIS
    # =============================================================================
    
    def execute_voyante_investigation(self, voyante_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir d'investigation de la Voyante"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que la voyante est vivante
            voyante = self.db.query(Player).filter(Player.id == voyante_id).first()
            if not voyante or not voyante.is_alive:
                raise PlayerError("Voyante non trouvée ou morte")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action d'investigation
            action = action_service.create_action(
                game_id=game_id,
                actor_id=voyante_id,
                target_id=target_id,
                action_type=ActionType.INVESTIGATE,
                phase="NIGHT",
                additional_data={"role": "Voyante", "power": "Investigation"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de l'investigation: {str(e)}")
    
    def execute_sorciere_heal(self, sorciere_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de soin de la Sorcière"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que la sorcière est vivante
            sorciere = self.db.query(Player).filter(Player.id == sorciere_id).first()
            if not sorciere or not sorciere.is_alive:
                raise PlayerError("Sorcière non trouvée ou morte")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de soin
            action = action_service.create_action(
                game_id=game_id,
                actor_id=sorciere_id,
                target_id=target_id,
                action_type=ActionType.HEAL,
                phase="NIGHT",
                additional_data={"role": "Sorcière", "power": "Soin"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors du soin: {str(e)}")
    
    def execute_sorciere_kill(self, sorciere_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de tuerie de la Sorcière"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que la sorcière est vivante
            sorciere = self.db.query(Player).filter(Player.id == sorciere_id).first()
            if not sorciere or not sorciere.is_alive:
                raise PlayerError("Sorcière non trouvée ou morte")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de tuerie
            action = action_service.create_action(
                game_id=game_id,
                actor_id=sorciere_id,
                target_id=target_id,
                action_type=ActionType.KILL,
                phase="NIGHT",
                additional_data={"role": "Sorcière", "power": "Tuerie"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de la tuerie de la sorcière: {str(e)}")
    
    # =============================================================================
    # POUVOIRS SPÉCIAUX
    # =============================================================================
    
    def execute_epouvantail_protection(self, epouvantail_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de protection de l'Épouvantail"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que l'épouvantail est vivant
            epouvantail = self.db.query(Player).filter(Player.id == epouvantail_id).first()
            if not epouvantail or not epouvantail.is_alive:
                raise PlayerError("Épouvantail non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de protection
            action = action_service.create_action(
                game_id=game_id,
                actor_id=epouvantail_id,
                target_id=target_id,
                action_type=ActionType.PROTECT,
                phase="NIGHT",
                additional_data={"role": "Épouvantail", "power": "Protection"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de la protection: {str(e)}")
    
    def execute_renard_sniff(self, renard_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de reniflement du Renard"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le renard est vivant
            renard = self.db.query(Player).filter(Player.id == renard_id).first()
            if not renard or not renard.is_alive:
                raise PlayerError("Renard non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de reniflement
            action = action_service.create_action(
                game_id=game_id,
                actor_id=renard_id,
                target_id=target_id,
                action_type=ActionType.INVESTIGATE,
                phase="NIGHT",
                additional_data={"role": "Renard", "power": "Reniflement"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors du reniflement: {str(e)}")
    
    def execute_guerrier_duel(self, guerrier_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de duel du Guerrier"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le guerrier est vivant
            guerrier = self.db.query(Player).filter(Player.id == guerrier_id).first()
            if not guerrier or not guerrier.is_alive:
                raise PlayerError("Guerrier non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de duel
            action = action_service.create_action(
                game_id=game_id,
                actor_id=guerrier_id,
                target_id=target_id,
                action_type=ActionType.DUEL,
                phase="NIGHT",
                additional_data={"role": "Guerrier", "power": "Duel"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors du duel: {str(e)}")
    
    def execute_avocat_protection(self, avocat_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de protection de l'Avocat du Diable"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que l'avocat est vivant
            avocat = self.db.query(Player).filter(Player.id == avocat_id).first()
            if not avocat or not avocat.is_alive:
                raise PlayerError("Avocat non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de protection
            action = action_service.create_action(
                game_id=game_id,
                actor_id=avocat_id,
                target_id=target_id,
                action_type=ActionType.PROTECT,
                phase="NIGHT",
                additional_data={"role": "Avocat du Diable", "power": "Protection risquée"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de la protection de l'avocat: {str(e)}")
    
    def execute_pestifere_contamination(self, pestifere_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de contamination du Pestiféré"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le pestiféré est vivant
            pestifere = self.db.query(Player).filter(Player.id == pestifere_id).first()
            if not pestifere or not pestifere.is_alive:
                raise PlayerError("Pestiféré non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de contamination
            action = action_service.create_action(
                game_id=game_id,
                actor_id=pestifere_id,
                target_id=target_id,
                action_type=ActionType.CONTAMINATE,
                phase="NIGHT",
                additional_data={"role": "Pestiféré", "power": "Contamination"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de la contamination: {str(e)}")
    
    def execute_marchand_skip_phase(self, marchand_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de saut de phase du Marchand de Sable"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le marchand est vivant
            marchand = self.db.query(Player).filter(Player.id == marchand_id).first()
            if not marchand or not marchand.is_alive:
                raise PlayerError("Marchand non trouvé ou mort")
            
            # Créer l'action de saut de phase
            action = action_service.create_action(
                game_id=game_id,
                actor_id=marchand_id,
                target_id=None,
                action_type=ActionType.SKIP_PHASE,
                phase="NIGHT",
                additional_data={"role": "Marchand de Sable", "power": "Saut de phase"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors du saut de phase: {str(e)}")
    
    def execute_chaperon_immunity(self, chaperon_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir d'immunité du Chaperon Rouge"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le chaperon est vivant
            chaperon = self.db.query(Player).filter(Player.id == chaperon_id).first()
            if not chaperon or not chaperon.is_alive:
                raise PlayerError("Chaperon non trouvé ou mort")
            
            # Créer l'action d'immunité
            action = action_service.create_action(
                game_id=game_id,
                actor_id=chaperon_id,
                target_id=chaperon_id,  # Immunité sur soi-même
                action_type=ActionType.PROTECT,
                phase="NIGHT",
                additional_data={"role": "Chaperon Rouge", "power": "Immunité permanente"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de l'immunité: {str(e)}")
    
    def execute_chasseur_post_mortem(self, chasseur_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir post-mortem du Chasseur"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le chasseur est mort (pouvoir post-mortem)
            chasseur = self.db.query(Player).filter(Player.id == chasseur_id).first()
            if not chasseur or chasseur.is_alive:
                raise PlayerError("Le chasseur doit être mort pour utiliser ce pouvoir")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action post-mortem
            action = action_service.create_action(
                game_id=game_id,
                actor_id=chasseur_id,
                target_id=target_id,
                action_type=ActionType.KILL,
                phase="NIGHT",
                additional_data={"role": "Chasseur", "power": "Tuerie post-mortem"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de l'action post-mortem: {str(e)}")
    
    # =============================================================================
    # POUVOIRS DE CHARME ET MALÉDICTION
    # =============================================================================
    
    def execute_sirene_charm(self, sirene_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de charme de la Sirène"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que la sirène est vivante
            sirene = self.db.query(Player).filter(Player.id == sirene_id).first()
            if not sirene or not sirene.is_alive:
                raise PlayerError("Sirène non trouvée ou morte")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de charme
            action = action_service.create_action(
                game_id=game_id,
                actor_id=sirene_id,
                target_id=target_id,
                action_type=ActionType.CHARM,
                phase="NIGHT",
                additional_data={"role": "Sirène", "power": "Charme"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors du charme: {str(e)}")
    
    def execute_sorciere_curse(self, sorciere_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de malédiction de la Sorcière"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que la sorcière est vivante
            sorciere = self.db.query(Player).filter(Player.id == sorciere_id).first()
            if not sorciere or not sorciere.is_alive:
                raise PlayerError("Sorcière non trouvée ou morte")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de malédiction
            action = action_service.create_action(
                game_id=game_id,
                actor_id=sorciere_id,
                target_id=target_id,
                action_type=ActionType.CURSE,
                phase="NIGHT",
                additional_data={"role": "Sorcière", "power": "Malédiction"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de la malédiction: {str(e)}")
    
    # =============================================================================
    # POUVOIRS DE DISCRÉTION
    # =============================================================================
    
    def execute_voleur_sneak(self, voleur_id: str, target_id: str, game_id: str) -> Action:
        """Exécuter le pouvoir de discrétion du Voleur"""
        try:
            from app.services.action_service import get_action_service
            action_service = get_action_service(self.db)
            
            # Vérifier que le voleur est vivant
            voleur = self.db.query(Player).filter(Player.id == voleur_id).first()
            if not voleur or not voleur.is_alive:
                raise PlayerError("Voleur non trouvé ou mort")
            
            # Vérifier que la cible est vivante
            target = self.db.query(Player).filter(Player.id == target_id).first()
            if not target or not target.is_alive:
                raise PlayerError("Cible non trouvée ou morte")
            
            # Créer l'action de discrétion
            action = action_service.create_action(
                game_id=game_id,
                actor_id=voleur_id,
                target_id=target_id,
                action_type=ActionType.SNEAK,
                phase="NIGHT",
                additional_data={"role": "Voleur", "power": "Discrétion"}
            )
            
            return action
            
        except Exception as e:
            raise RoleError(f"Erreur lors de la discrétion: {str(e)}")
    
    # =============================================================================
    # UTILITAIRES
    # =============================================================================
    
    def get_role_powers(self, role_name: str) -> Dict[str, Any]:
        """Obtenir les pouvoirs d'un rôle"""
        role = self.db.query(Role).filter(Role.name == role_name).first()
        if not role:
            raise RoleError("Rôle non trouvé")
        
        powers = {
            "name": role.name,
            "description": role.description,
            "team": role.team.name,
            "powers": []
        }
        
        # Ajouter les pouvoirs selon le rôle
        if role.name == "Loup":
            powers["powers"].extend([
                {"name": "Tuerie nocturne", "description": "Tuer un joueur la nuit"},
                {"name": "Vote unanime", "description": "Doit voter à l'unanimité"}
            ])
        elif role.name == "Voyante":
            powers["powers"].append({
                "name": "Investigation", 
                "description": "Découvrir le rôle d'un joueur"
            })
        elif role.name == "Sorcière":
            powers["powers"].extend([
                {"name": "Soin", "description": "Sauver un joueur de la mort"},
                {"name": "Tuerie", "description": "Tuer un joueur"},
                {"name": "Malédiction", "description": "Maudire un joueur"}
            ])
        elif role.name == "Épouvantail":
            powers["powers"].append({
                "name": "Protection", 
                "description": "Protéger un joueur des attaques"
            })
        elif role.name == "Renard":
            powers["powers"].append({
                "name": "Reniflement", 
                "description": "Détecter les loups à proximité"
            })
        elif role.name == "Guerrier":
            powers["powers"].append({
                "name": "Duel", 
                "description": "Affronter un joueur en duel"
            })
        elif role.name == "Avocat du Diable":
            powers["powers"].append({
                "name": "Protection risquée", 
                "description": "Protéger avec risque de mort"
            })
        elif role.name == "Pestiféré":
            powers["powers"].append({
                "name": "Contamination", 
                "description": "Contaminer un joueur"
            })
        elif role.name == "Marchand de Sable":
            powers["powers"].append({
                "name": "Saut de phase", 
                "description": "Passer une phase"
            })
        elif role.name == "Chaperon Rouge":
            powers["powers"].append({
                "name": "Immunité permanente", 
                "description": "Immunité contre les attaques"
            })
        elif role.name == "Chasseur":
            powers["powers"].append({
                "name": "Tuerie post-mortem", 
                "description": "Tuer après sa mort"
            })
        elif role.name == "Sirène":
            powers["powers"].append({
                "name": "Charme", 
                "description": "Charmer un joueur"
            })
        elif role.name == "Voleur":
            powers["powers"].append({
                "name": "Discrétion", 
                "description": "Agir sans être détecté"
            })
        
        return powers
    
    def can_use_power(self, player_id: str, power_name: str) -> bool:
        """Vérifier si un joueur peut utiliser un pouvoir"""
        try:
            player = self.db.query(Player).filter(Player.id == player_id).first()
            if not player:
                return False
            
            # Vérifier si le joueur est vivant (sauf pour les pouvoirs post-mortem)
            if player.is_alive and power_name != "Tuerie post-mortem":
                return True
            
            # Vérifier les pouvoirs post-mortem
            if not player.is_alive and power_name == "Tuerie post-mortem":
                return player.role.name == "Chasseur"
            
            return False
            
        except Exception:
            return False
    
    def get_available_targets(self, player_id: str, power_name: str) -> List[Player]:
        """Obtenir les cibles disponibles pour un pouvoir"""
        try:
            player = self.db.query(Player).filter(Player.id == player_id).first()
            if not player:
                return []
            
            # Récupérer tous les joueurs vivants du jeu
            targets = self.db.query(Player).filter(
                and_(
                    Player.game_id == player.game_id,
                    Player.is_alive == True,
                    Player.id != player_id  # Pas soi-même
                )
            ).all()
            
            # Filtrer selon le pouvoir
            if power_name == "Tuerie nocturne":
                # Les loups ne peuvent pas tuer d'autres loups
                wolf_team = self.db.query(Team).filter(Team.name == "Loups").first()
                if wolf_team:
                    targets = [t for t in targets if t.team_id != wolf_team.id]
            
            elif power_name == "Investigation":
                # Pas de restriction pour l'investigation
                pass
            
            elif power_name == "Protection":
                # Pas de restriction pour la protection
                pass
            
            elif power_name == "Reniflement":
                # Le renard peut renifler n'importe qui
                pass
            
            elif power_name == "Duel":
                # Le guerrier peut défier n'importe qui
                pass
            
            elif power_name == "Contamination":
                # Le pestiféré peut contaminer n'importe qui
                pass
            
            elif power_name == "Charme":
                # La sirène peut charmer n'importe qui
                pass
            
            elif power_name == "Malédiction":
                # La sorcière peut maudire n'importe qui
                pass
            
            elif power_name == "Discrétion":
                # Le voleur peut se cacher près de n'importe qui
                pass
            
            return targets
            
        except Exception:
            return []


# Instance globale du service
def get_role_service(db: Session) -> RoleService:
    """Obtenir une instance du service de rôle"""
    return RoleService(db)
