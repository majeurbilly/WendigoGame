"""
Modèle Player pour les joueurs dans une partie
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Player(Base):
    """Modèle joueur dans une partie"""
    __tablename__ = "players"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relations avec User, Game, Role et Team
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    
    # État du joueur
    is_alive = Column(Boolean, default=True)
    is_ready = Column(Boolean, default=False)
    is_connected = Column(Boolean, default=True)
    
    # Position dans le jeu
    chair_position = Column(Integer, nullable=True)  # Position de la chaise (0-28)
    has_selected_chair = Column(Boolean, default=False)
    
    # Utilisation des pouvoirs
    power_usage_count = Column(Integer, default=0)
    last_power_usage = Column(DateTime(timezone=True), nullable=True)
    
    # Notes personnelles
    personal_notes = Column(Text, nullable=True)
    
    # Métadonnées
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    died_at = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    user = relationship("User", back_populates="players")
    game = relationship("Game", back_populates="players")
    role = relationship("Role", back_populates="players")
    team = relationship("Team", back_populates="players")
    
    # Votes et actions du joueur
    votes_cast = relationship("Vote", foreign_keys="Vote.voter_id", back_populates="voter")
    votes_received = relationship("Vote", foreign_keys="Vote.target_id", back_populates="target")
    actions_performed = relationship("Action", foreign_keys="Action.actor_id", back_populates="actor")
    actions_received = relationship("Action", foreign_keys="Action.target_id", back_populates="target")
    
    # Messages de chat
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="ChatMessage.target_id", back_populates="target")
    
    def __repr__(self):
        return f"<Player(id={self.id}, user='{self.user.username if self.user else 'None'}', role='{self.role.name if self.role else 'None'}', alive={self.is_alive})>"
    
    @property
    def username(self) -> str:
        """Retourne le nom d'utilisateur"""
        return self.user.username if self.user else "Unknown"
    
    @property
    def role_name(self) -> str:
        """Retourne le nom du rôle"""
        return self.role.name if self.role else "Unknown"
    
    @property
    def team_name(self) -> str:
        """Retourne le nom de l'équipe"""
        return self.team.name if self.team else "Unknown"
    
    @property
    def is_villager(self) -> bool:
        """Vérifie si le joueur est un villageois"""
        return self.team and self.team.is_villager_team
    
    @property
    def is_wolf(self) -> bool:
        """Vérifie si le joueur est un loup"""
        return self.team and self.team.is_wolf_team
    
    @property
    def can_use_power(self) -> bool:
        """Vérifie si le joueur peut utiliser son pouvoir"""
        if not self.is_alive or not self.role:
            return False
        
        return self.power_usage_count < self.role.usage_limit
    
    @property
    def is_ghost(self) -> bool:
        """Vérifie si le joueur est un fantôme (mort)"""
        return not self.is_alive
    
    def die(self, reason: str = "Unknown"):
        """Marque le joueur comme mort"""
        if self.is_alive:
            self.is_alive = False
            self.died_at = func.now()
            # Le joueur devient automatiquement un fantôme
            # (géré par la logique de jeu)
    
    def select_chair(self, position: int):
        """Sélectionne une position de chaise"""
        self.chair_position = position
        self.has_selected_chair = True
    
    def use_power(self):
        """Marque l'utilisation d'un pouvoir"""
        if self.can_use_power:
            self.power_usage_count += 1
            self.last_power_usage = func.now()
    
    def get_neighbors(self, all_players):
        """Retourne les voisins gauche et droite basés sur la position de chaise"""
        if self.chair_position is None:
            return [], []
        
        alive_players = [p for p in all_players if p.is_alive and p.chair_position is not None]
        alive_players.sort(key=lambda p: p.chair_position)
        
        if len(alive_players) <= 1:
            return [], []
        
        # Trouver l'index du joueur actuel
        try:
            current_index = next(i for i, p in enumerate(alive_players) if p.id == self.id)
        except StopIteration:
            return [], []
        
        # Calculer les positions des voisins
        left_index = (current_index - 1) % len(alive_players)
        right_index = (current_index + 1) % len(alive_players)
        
        left_neighbor = alive_players[left_index] if left_index != current_index else None
        right_neighbor = alive_players[right_index] if right_index != current_index else None
        
        return left_neighbor, right_neighbor
    
    def get_left_neighbors(self, all_players, count: int = 3):
        """Retourne les N joueurs à gauche"""
        if self.chair_position is None:
            return []
        
        alive_players = [p for p in all_players if p.is_alive and p.chair_position is not None]
        alive_players.sort(key=lambda p: p.chair_position)
        
        if len(alive_players) <= 1:
            return []
        
        try:
            current_index = next(i for i, p in enumerate(alive_players) if p.id == self.id)
        except StopIteration:
            return []
        
        neighbors = []
        for i in range(1, count + 1):
            neighbor_index = (current_index - i) % len(alive_players)
            if neighbor_index != current_index:
                neighbors.append(alive_players[neighbor_index])
        
        return neighbors
