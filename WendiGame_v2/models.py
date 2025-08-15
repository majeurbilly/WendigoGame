from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enum pour le statut de partie (équivalent à PartieStatus.java)
class PartieStatus(str, Enum):
    EN_ATTENTE = "EN_ATTENTE"
    EN_COURS = "EN_COURS"
    TERMINEE = "TERMINEE"
    ANNULEE = "ANNULEE"

# Modèle ChatMessage (équivalent à ChatMessage.java)
class ChatMessage(BaseModel):
    sender: str = Field(..., description="Nom de l'expéditeur du message")
    content: str = Field(..., description="Contenu du message")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now, description="Horodatage du message")
    lobby_id: str = Field(default="default", description="ID du lobby où le message est envoyé")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Modèle LobbyMessage (équivalent à LobbyMessage.java)
class LobbyMessage(BaseModel):
    type: str = Field(..., description="Type de message (chat, system, game)")
    content: str = Field(..., description="Contenu du message")
    sender: str = Field(..., description="Expéditeur du message")
    lobby_id: str = Field(default="default", description="ID du lobby")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now, description="Horodatage")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Modèle Joueur (équivalent à Joueur.java)
class Joueur(BaseModel):
    id: Optional[int] = Field(None, description="ID unique du joueur")
    username: str = Field(..., description="Nom d'utilisateur du joueur")
    email: str = Field(..., description="Email du joueur")
    is_online: bool = Field(default=False, description="Statut de connexion du joueur")
    last_seen: Optional[datetime] = Field(None, description="Dernière connexion")
    created_at: Optional[datetime] = Field(default_factory=datetime.now, description="Date de création du compte")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Modèle pour les commandes (équivalent à CommandeDTO.java)
class CommandeDTO(BaseModel):
    type: str = Field(..., description="Type de commande")
    data: dict = Field(default_factory=dict, description="Données de la commande")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now, description="Horodatage de la commande")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Modèle pour les réponses d'API
class APIResponse(BaseModel):
    success: bool = Field(..., description="Statut de la requête")
    message: str = Field(..., description="Message de réponse")
    data: Optional[dict] = Field(None, description="Données de réponse")
    timestamp: datetime = Field(default_factory=datetime.now, description="Horodatage de la réponse")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Modèle pour la gestion des lobbies
class Lobby(BaseModel):
    id: str = Field(..., description="ID unique du lobby")
    name: str = Field(..., description="Nom du lobby")
    max_players: int = Field(default=10, description="Nombre maximum de joueurs")
    current_players: int = Field(default=0, description="Nombre actuel de joueurs")
    status: PartieStatus = Field(default=PartieStatus.EN_ATTENTE, description="Statut du lobby")
    created_by: str = Field(..., description="Créateur du lobby")
    created_at: datetime = Field(default_factory=datetime.now, description="Date de création")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Modèle pour les messages de jeu
class GameMessage(BaseModel):
    type: str = Field(..., description="Type de message de jeu")
    player_id: str = Field(..., description="ID du joueur")
    action: str = Field(..., description="Action effectuée")
    data: Optional[dict] = Field(None, description="Données supplémentaires")
    timestamp: datetime = Field(default_factory=datetime.now, description="Horodatage")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
