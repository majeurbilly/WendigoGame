"""
Schémas Wendigo
Initialisation des schémas Pydantic
"""

from .user import UserCreate, UserUpdate, UserResponse, UserStats
from .game import GameCreate, GameUpdate, GameResponse
from .player import PlayerCreate, PlayerUpdate, PlayerResponse
from .role import RoleCreate, RoleUpdate, RoleResponse
from .team import TeamCreate, TeamUpdate, TeamResponse, TeamListResponse
from .auth import Token, LoginRequest, TokenData, PasswordChangeRequest

__all__ = [
    "UserCreate",
    "UserUpdate", 
    "UserResponse",
    "UserStats",
    "GameCreate",
    "GameUpdate",
    "GameResponse",
    "PlayerCreate",
    "PlayerUpdate",
    "PlayerResponse",
    "RoleCreate",
    "RoleUpdate",
    "RoleResponse",
    "TeamCreate",
    "TeamUpdate",
    "TeamResponse",
    "TeamListResponse",
    "Token",
    "LoginRequest",
    "TokenData",
    "PasswordChangeRequest"
]
