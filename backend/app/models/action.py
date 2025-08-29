"""
Modèle Action pour les actions des rôles (pouvoirs)
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class ActionType(enum.Enum):
    """Types d'actions possibles"""
    # Actions de contrôle
    SLEEP = "sleep"  # Marchand de Sable
    HAUNT = "haunt"  # Ensorceleuse
    IMPRISON = "imprison"  # Shérif
    
    # Actions de protection
    PROTECT_NEIGHBORS = "protect_neighbors"  # Épouvantail
    PROTECT_TOTAL = "protect_total"  # Garde du Corps
    PROTECT_WOLF = "protect_wolf"  # Warlord, Sbire
    
    # Actions d'attaque
    DUEL = "duel"  # Guerrier
    SLEEP_NEIGHBOR = "sleep_neighbor"  # Courtisane
    
    # Actions des loups
    WOLF_KILL = "wolf_kill"  # Vote unanime des loups
    CONTAMINATE = "contaminate"  # Pestiféré
    
    # Actions d'information
    REVEAL_IDENTITY = "reveal_identity"  # Voyante
    SNIFF_WOLVES = "sniff_wolves"  # Renard
    SEE_WOLF_TARGET = "see_wolf_target"  # Rêveur
    SPY_ACTIVITY = "spy_activity"  # Insomniaque
    REVEAL_EXACT_ROLE = "reveal_exact_role"  # Curieux
    
    # Actions de support
    ADD_VOTE = "add_vote"  # Corbeau
    COPY_POWER = "copy_power"  # Psychopompe
    
    # Actions de résurrection
    RESURRECT = "resurrect"  # Salvateur
    
    # Actions post-mortem
    ANALYZE_DEATH = "analyze_death"  # Coroner
    GHOST_CHAT = "ghost_chat"  # Poltergeist, Médium
    
    # Actions spéciales
    TEAM_CHANGE = "team_change"  # Sorcière, Pestiféré
    IMMUNITY = "immunity"  # Chaperon
    REVENGE_KILL = "revenge_kill"  # Chasseur


class ActionStatus(enum.Enum):
    """Statuts possibles d'une action"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class Action(Base):
    """Modèle action pour les pouvoirs des rôles"""
    __tablename__ = "actions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relations
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    actor_id = Column(String, ForeignKey("players.id"), nullable=False)
    target_id = Column(String, ForeignKey("players.id"), nullable=True)  # Peut être null pour actions sans cible
    
    # Type et contexte de l'action
    action_type = Column(Enum(ActionType), nullable=False)
    phase = Column(String(20), nullable=False)  # DAY, NIGHT
    turn_number = Column(Integer, nullable=False)
    
    # Résultat de l'action
    status = Column(Enum(ActionStatus), default=ActionStatus.PENDING)
    success = Column(Boolean, nullable=True)
    message = Column(Text, nullable=True)
    
    # Données supplémentaires (JSON)
    additional_data = Column(JSON, nullable=True)  # Pour stocker des données spécifiques au rôle
    
    # Métadonnées
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    executed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relations
    game = relationship("Game", back_populates="actions")
    actor = relationship("Player", foreign_keys=[actor_id], back_populates="actions_performed")
    target = relationship("Player", foreign_keys=[target_id], back_populates="actions_received")
    
    def __repr__(self):
        return f"<Action(id={self.id}, type='{self.action_type.value}', actor='{self.actor.username if self.actor else 'None'}', target='{self.target.username if self.target else 'None'}', status='{self.status.value}')>"
    
    @property
    def is_pending(self) -> bool:
        """Vérifie si l'action est en attente"""
        return self.status == ActionStatus.PENDING
    
    @property
    def is_successful(self) -> bool:
        """Vérifie si l'action a réussi"""
        return self.status == ActionStatus.SUCCESS
    
    @property
    def is_failed(self) -> bool:
        """Vérifie si l'action a échoué"""
        return self.status == ActionStatus.FAILED
    
    @property
    def is_blocked(self) -> bool:
        """Vérifie si l'action a été bloquée"""
        return self.status == ActionStatus.BLOCKED
    
    @property
    def is_control_action(self) -> bool:
        """Vérifie si c'est une action de contrôle"""
        return self.action_type in [
            ActionType.SLEEP, ActionType.HAUNT, ActionType.IMPRISON
        ]
    
    @property
    def is_protection_action(self) -> bool:
        """Vérifie si c'est une action de protection"""
        return self.action_type in [
            ActionType.PROTECT_NEIGHBORS, ActionType.PROTECT_TOTAL, ActionType.PROTECT_WOLF
        ]
    
    @property
    def is_attack_action(self) -> bool:
        """Vérifie si c'est une action d'attaque"""
        return self.action_type in [
            ActionType.DUEL, ActionType.SLEEP_NEIGHBOR, ActionType.WOLF_KILL
        ]
    
    @property
    def is_information_action(self) -> bool:
        """Vérifie si c'est une action d'information"""
        return self.action_type in [
            ActionType.REVEAL_IDENTITY, ActionType.SNIFF_WOLVES, 
            ActionType.SEE_WOLF_TARGET, ActionType.SPY_ACTIVITY, ActionType.REVEAL_EXACT_ROLE
        ]
    
    def execute(self, success: bool = True, message: str = None):
        """Marque l'action comme exécutée"""
        self.status = ActionStatus.SUCCESS if success else ActionStatus.FAILED
        self.success = success
        self.message = message
        self.executed_at = func.now()
    
    def block(self, reason: str = "Action blocked"):
        """Marque l'action comme bloquée"""
        self.status = ActionStatus.BLOCKED
        self.success = False
        self.message = reason
        self.executed_at = func.now()
    
    def cancel(self, reason: str = "Action cancelled"):
        """Marque l'action comme annulée"""
        self.status = ActionStatus.CANCELLED
        self.success = False
        self.message = reason
        self.executed_at = func.now()
