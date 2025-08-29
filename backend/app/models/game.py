"""
Modèle Game pour les parties de Wendigo Game
"""
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class GameStatus(enum.Enum):
    """Statuts possibles d'une partie"""
    LOBBY = "lobby"
    STARTING = "starting"
    DAY = "day"
    EVENING = "evening"
    NIGHT = "night"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class Game(Base):
    """Modèle partie de Wendigo Game"""
    __tablename__ = "games"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Configuration de la partie
    min_players = Column(Integer, default=8)
    max_players = Column(Integer, default=29)
    current_players = Column(Integer, default=0)
    
    # État de la partie
    status = Column(Enum(GameStatus), default=GameStatus.LOBBY)
    current_phase = Column(String(20), nullable=True)  # DAY, EVENING, NIGHT
    current_turn = Column(Integer, default=0)
    current_phase_start = Column(DateTime(timezone=True), nullable=True)
    current_phase_end = Column(DateTime(timezone=True), nullable=True)
    
    # Résultat de la partie
    winner_team_id = Column(String, nullable=True)  # ID de l'équipe gagnante
    winner_team_name = Column(String(50), nullable=True)
    game_duration = Column(Integer, nullable=True)  # Durée en secondes
    
    # Métadonnées
    created_by = Column(String, nullable=True)  # ID de l'utilisateur créateur
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relations
    players = relationship("Player", back_populates="game")
    votes = relationship("Vote", back_populates="game")
    actions = relationship("Action", back_populates="game")
    chat_messages = relationship("ChatMessage", back_populates="game")
    
    def __repr__(self):
        return f"<Game(id={self.id}, name='{self.name}', status='{self.status.value}')>"
    
    @property
    def is_active(self) -> bool:
        """Vérifie si la partie est active"""
        return self.status in [GameStatus.STARTING, GameStatus.DAY, GameStatus.EVENING, GameStatus.NIGHT]
    
    @property
    def is_finished(self) -> bool:
        """Vérifie si la partie est terminée"""
        return self.status in [GameStatus.FINISHED, GameStatus.CANCELLED]
    
    @property
    def can_start(self) -> bool:
        """Vérifie si la partie peut démarrer"""
        return (
            self.status == GameStatus.LOBBY and
            self.current_players >= self.min_players and
            self.current_players <= self.max_players
        )
    
    @property
    def is_full(self) -> bool:
        """Vérifie si la partie est pleine"""
        return self.current_players >= self.max_players
    
    @property
    def duration_seconds(self) -> int:
        """Calcule la durée de la partie en secondes"""
        if not self.started_at:
            return 0
        
        end_time = self.finished_at or func.now()
        return int((end_time - self.started_at).total_seconds())
    
    def get_alive_players(self):
        """Retourne les joueurs vivants"""
        return [player for player in self.players if player.is_alive]
    
    def get_dead_players(self):
        """Retourne les joueurs morts"""
        return [player for player in self.players if not player.is_alive]
    
    def get_players_by_team(self, team_name: str):
        """Retourne les joueurs d'une équipe spécifique"""
        return [player for player in self.players if player.team.name.lower() == team_name.lower()]
