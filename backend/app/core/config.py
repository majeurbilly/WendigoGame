"""
Configuration Wendigo
Paramètres de configuration de l'application
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Paramètres de configuration de l'application"""
    
    # Informations de base
    APP_NAME: str = "Wendigo Game API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "API pour le jeu Wendigo - Un jeu de loup-garou hybride"
    
    # Base de données
    DATABASE_URL: str = "sqlite:///./wendigo_game.db"
    
    # Sécurité
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Wendigo Game"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8080"]
    
    # Jeu
    MIN_PLAYERS: int = 8
    MAX_PLAYERS: int = 29
    DEFAULT_DAY_PHASE_DURATION: int = 10  # minutes
    DEFAULT_NIGHT_PHASE_DURATION: int = 5  # minutes
    DEFAULT_EVENING_PHASE_DURATION: int = 3  # minutes
    
    # WebSocket
    WEBSOCKET_URL: str = "ws://localhost:8000/ws"
    
    # Debug
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instance globale des paramètres
settings = Settings()
