"""
Routeur API principal pour Wendigo Game
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, games, players, roles, teams
from app.api.v1.websocket import game_websocket

api_router = APIRouter()

# Inclure les routes d'authentification
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

# Inclure les routes utilisateurs
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

# Inclure les routes des parties
api_router.include_router(
    games.router,
    prefix="/games",
    tags=["games"]
)

# Inclure les routes des joueurs
api_router.include_router(
    players.router,
    prefix="/players",
    tags=["players"]
)

# Inclure les routes des rôles
api_router.include_router(
    roles.router,
    prefix="/roles",
    tags=["roles"]
)

# Inclure les routes des équipes
api_router.include_router(
    teams.router,
    prefix="/teams",
    tags=["teams"]
)

# Inclure les routes WebSocket
api_router.include_router(
    game_websocket.router,
    prefix="/ws",
    tags=["websocket"]
)
