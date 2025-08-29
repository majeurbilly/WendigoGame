"""
Schémas utilisateur pour Wendigo Game
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Schéma de base pour les utilisateurs"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Schéma pour créer un utilisateur"""
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schéma pour mettre à jour un utilisateur"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schéma pour la réponse utilisateur"""
    id: str
    is_active: bool
    is_admin: bool
    games_played: int
    games_won: int
    total_score: int
    win_rate: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schéma pour la connexion"""
    username: str
    password: str


class UserStats(BaseModel):
    """Schéma pour les statistiques utilisateur"""
    user_id: str
    username: str
    games_played: int
    games_won: int
    total_score: int
    win_rate: float
    favorite_role: Optional[str] = None
    most_played_role: Optional[str] = None
