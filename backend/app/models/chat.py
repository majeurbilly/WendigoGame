"""
Modèle Chat Wendigo
Gère les messages de chat et les communications entre joueurs
"""

from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class ChatType(str, Enum):
    """Types de chat disponibles"""
    PUBLIC = "public"
    PRIVATE = "private"
    TEAM = "team"
    WOLF = "wolf"
    GHOST = "ghost"
    MEDIUM = "medium"
    TWINS = "twins"
    POLTERGEIST = "poltergeist"


class ChatMessage(Base):
    """Modèle pour les messages de chat"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    sender_id = Column(String, ForeignKey("players.id"), nullable=True)  # Null pour les messages système
    target_id = Column(String, ForeignKey("players.id"), nullable=True)  # Pour les messages privés
    message = Column(Text, nullable=False)
    chat_type = Column(String, nullable=False, default=ChatType.PUBLIC)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_system_message = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Relations
    game = relationship("Game", back_populates="chat_messages")
    sender = relationship("Player", foreign_keys=[sender_id], back_populates="sent_messages")
    target = relationship("Player", foreign_keys=[target_id], back_populates="received_messages")
    
    def __repr__(self):
        return f"<ChatMessage(id={self.id}, sender={self.sender_id}, type={self.chat_type})>"
