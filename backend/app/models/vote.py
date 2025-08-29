"""
Modèle Vote pour les votes d'accusation et de condamnation
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class VoteType(enum.Enum):
    """Types de votes possibles"""
    ACCUSATION = "accusation"  # Vote d'accusation
    CONDEMNATION = "condemnation"  # Vote de condamnation (tuer/épargner)
    WOLF_VOTE = "wolf_vote"  # Vote des loups pour tuer


class VoteResult(enum.Enum):
    """Résultats possibles d'un vote"""
    KILL = "kill"
    SPARE = "spare"
    PENDING = "pending"


class Vote(Base):
    """Modèle vote pour les accusations et condamnations"""
    __tablename__ = "votes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relations
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    voter_id = Column(String, ForeignKey("players.id"), nullable=False)
    target_id = Column(String, ForeignKey("players.id"), nullable=True)  # Peut être null pour vote d'abstention
    
    # Type et contexte du vote
    vote_type = Column(Enum(VoteType), nullable=False)
    phase = Column(String(20), nullable=False)  # DAY, EVENING, NIGHT
    turn_number = Column(Integer, nullable=False)
    
    # Résultat du vote
    result = Column(Enum(VoteResult), default=VoteResult.PENDING)
    vote_count = Column(Integer, default=1)  # Pour les votes multiples
    
    # Métadonnées
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relations
    game = relationship("Game", back_populates="votes")
    voter = relationship("Player", foreign_keys=[voter_id], back_populates="votes_cast")
    target = relationship("Player", foreign_keys=[target_id], back_populates="votes_received")
    
    def __repr__(self):
        return f"<Vote(id={self.id}, type='{self.vote_type.value}', voter='{self.voter.username if self.voter else 'None'}', target='{self.target.username if self.target else 'None'}')>"
    
    @property
    def is_accusation_vote(self) -> bool:
        """Vérifie si c'est un vote d'accusation"""
        return self.vote_type == VoteType.ACCUSATION
    
    @property
    def is_condemnation_vote(self) -> bool:
        """Vérifie si c'est un vote de condamnation"""
        return self.vote_type == VoteType.CONDEMNATION
    
    @property
    def is_wolf_vote(self) -> bool:
        """Vérifie si c'est un vote de loup"""
        return self.vote_type == VoteType.WOLF_VOTE
    
    @property
    def is_resolved(self) -> bool:
        """Vérifie si le vote est résolu"""
        return self.result != VoteResult.PENDING
    
    @property
    def is_kill_vote(self) -> bool:
        """Vérifie si le vote est pour tuer"""
        return self.result == VoteResult.KILL
    
    @property
    def is_spare_vote(self) -> bool:
        """Vérifie si le vote est pour épargner"""
        return self.result == VoteResult.SPARE
