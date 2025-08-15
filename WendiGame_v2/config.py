import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuration de l'application WendiGame"""
    
    # Configuration du serveur
    APP_NAME: str = "WendiGame API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    
    # Configuration du serveur HTTP
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Configuration CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Configuration des limites
    MAX_MESSAGE_LENGTH: int = 1000
    MAX_LOBBY_PLAYERS: int = 20
    MAX_CHAT_HISTORY: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Instance globale des paramètres
settings = Settings()

# Fonction pour obtenir les paramètres
def get_settings() -> Settings:
    return settings
