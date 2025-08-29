"""
Modèle Role pour les 29 rôles uniques du jeu
"""
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Role(Base):
    """Modèle rôle pour les 29 rôles uniques du jeu"""
    __tablename__ = "roles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    power_description = Column(Text, nullable=True)
    
    # Équipe du rôle
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    
    # Caractéristiques du rôle
    is_unique = Column(Boolean, default=True)  # Un seul par partie
    phase_action = Column(String(20), nullable=True)  # DAY, NIGHT, BOTH, NONE
    usage_limit = Column(Integer, default=1)  # Nombre d'utilisations par partie
    
    # Métadonnées
    emoji = Column(String(10), nullable=True)  # Émoji du rôle
    difficulty = Column(String(20), default="MEDIUM")  # EASY, MEDIUM, HARD
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    team = relationship("Team", back_populates="roles")
    players = relationship("Player", back_populates="role")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}', team='{self.team.name if self.team else 'None'}')>"
    
    @property
    def is_villager_role(self) -> bool:
        """Vérifie si c'est un rôle de villageois"""
        return self.team and self.team.is_villager_team
    
    @property
    def is_wolf_role(self) -> bool:
        """Vérifie si c'est un rôle de loup"""
        return self.team and self.team.is_wolf_team
    
    @property
    def can_act_day(self) -> bool:
        """Vérifie si le rôle peut agir le jour"""
        return self.phase_action in ["DAY", "BOTH"]
    
    @property
    def can_act_night(self) -> bool:
        """Vérifie si le rôle peut agir la nuit"""
        return self.phase_action in ["NIGHT", "BOTH"]
    
    @property
    def has_power(self) -> bool:
        """Vérifie si le rôle a un pouvoir"""
        return self.phase_action != "NONE"
