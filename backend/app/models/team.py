"""
Modèle Team pour les équipes du jeu
"""
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Team(Base):
    """Modèle équipe (Villageois vs Loups)"""
    __tablename__ = "teams"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Code couleur hex (#FFFFFF)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    roles = relationship("Role", back_populates="team")
    players = relationship("Player", back_populates="team")
    
    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"
    
    @property
    def is_villager_team(self) -> bool:
        """Vérifie si c'est l'équipe des villageois"""
        return self.name.lower() in ["villageois", "villagers", "defenseurs"]
    
    @property
    def is_wolf_team(self) -> bool:
        """Vérifie si c'est l'équipe des loups"""
        return self.name.lower() in ["loups", "wolves", "méchants"]
