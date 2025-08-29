"""
Schémas d'authentification Wendigo
Définit les modèles Pydantic pour l'authentification
"""

from pydantic import BaseModel, Field
from typing import Optional


class LoginRequest(BaseModel):
    """Schéma pour la demande de connexion"""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=6)


class Token(BaseModel):
    """Schéma pour le token d'authentification"""
    access_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None


class TokenData(BaseModel):
    """Schéma pour les données du token"""
    user_id: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """Schéma pour le changement de mot de passe"""
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
