"""
Modèle User pour les utilisateurs du jeu
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class User(Base):
    """Modèle utilisateur"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Statistiques du joueur
    games_played = Column(Integer, default=0)
    games_won = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    
    # Relations
    players = relationship("Player", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"
    
    @property
    def win_rate(self) -> float:
        """Calcule le taux de victoire"""
        if self.games_played == 0:
            return 0.0
        return round(self.games_won / self.games_played * 100, 2)
