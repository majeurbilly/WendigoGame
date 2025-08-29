"""
Modèle Phase pour gérer les phases de jeu
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class PhaseType(enum.Enum):
    """Types de phases possibles"""
    LOBBY = "lobby"
    DAY = "day"
    EVENING = "evening"
    NIGHT = "night"
    REVEAL = "reveal"


class Phase(Base):
    """Modèle phase pour gérer les phases de jeu"""
    __tablename__ = "phases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relations
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    
    # Informations de la phase
    phase_type = Column(Enum(PhaseType), nullable=False)
    turn_number = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    
    # Timing de la phase
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Métadonnées
    description = Column(Text, nullable=True)
    events = Column(Text, nullable=True)  # Événements de la phase
    
    # Relations
    game = relationship("Game")
    
    def __repr__(self):
        return f"<Phase(id={self.id}, type='{self.phase_type.value}', turn={self.turn_number}, active={self.is_active})>"
    
    @property
    def is_lobby(self) -> bool:
        """Vérifie si c'est la phase lobby"""
        return self.phase_type == PhaseType.LOBBY
    
    @property
    def is_day(self) -> bool:
        """Vérifie si c'est la phase jour"""
        return self.phase_type == PhaseType.DAY
    
    @property
    def is_evening(self) -> bool:
        """Vérifie si c'est la phase soir"""
        return self.phase_type == PhaseType.EVENING
    
    @property
    def is_night(self) -> bool:
        """Vérifie si c'est la phase nuit"""
        return self.phase_type == PhaseType.NIGHT
    
    @property
    def is_reveal(self) -> bool:
        """Vérifie si c'est la phase révélation"""
        return self.phase_type == PhaseType.REVEAL
    
    @property
    def is_finished(self) -> bool:
        """Vérifie si la phase est terminée"""
        return self.ended_at is not None
    
    @property
    def duration_elapsed(self) -> int:
        """Calcule le temps écoulé depuis le début de la phase"""
        if not self.started_at:
            return 0
        
        end_time = self.ended_at or func.now()
        return int((end_time - self.started_at).total_seconds())
    
    @property
    def time_remaining(self) -> int:
        """Calcule le temps restant dans la phase"""
        if self.is_finished:
            return 0
        
        elapsed = self.duration_elapsed
        remaining = self.duration_seconds - elapsed
        return max(0, remaining)
    
    @property
    def progress_percentage(self) -> float:
        """Calcule le pourcentage de progression de la phase"""
        if self.duration_seconds == 0:
            return 100.0
        
        elapsed = self.duration_elapsed
        percentage = (elapsed / self.duration_seconds) * 100
        return min(100.0, max(0.0, percentage))
    
    def end_phase(self):
        """Termine la phase"""
        if not self.is_finished:
            self.ended_at = func.now()
            self.is_active = False
    
    def get_phase_description(self) -> str:
        """Retourne la description de la phase"""
        descriptions = {
            PhaseType.LOBBY: "Phase de préparation - Les joueurs se préparent",
            PhaseType.DAY: "Phase de jour - Discussion et sélection de chaises",
            PhaseType.EVENING: "Phase de soir - Accusations et bûcher",
            PhaseType.NIGHT: "Phase de nuit - Actions des rôles",
            PhaseType.REVEAL: "Phase de révélation - Annonce des morts"
        }
        return descriptions.get(self.phase_type, "Phase inconnue")
