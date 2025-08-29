"""
Endpoints pour les joueurs dans les parties
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.core.database import get_db
from app.core.security import verify_token
from app.models.player import Player
from app.models.game import Game
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Récupérer l'ID de l'utilisateur connecté"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    return user_id


@router.get("/game/{game_id}", response_model=List[dict])
async def get_game_players(
    game_id: str,
    alive_only: bool = False,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Récupérer les joueurs d'une partie"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partie non trouvée"
        )
    
    # Vérifier que l'utilisateur est dans la partie
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if not player:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas dans cette partie"
        )
    
    players_query = db.query(Player).filter(Player.game_id == game_id)
    
    if alive_only:
        players_query = players_query.filter(Player.is_alive == True)
    
    players = players_query.all()
    
    return [
        {
            "id": player.id,
            "username": player.username,
            "is_alive": player.is_alive,
            "is_ready": player.is_ready,
            "is_connected": player.is_connected,
            "chair_position": player.chair_position,
            "has_selected_chair": player.has_selected_chair,
            "role_name": player.role_name,
            "team_name": player.team_name,
            "can_use_power": player.can_use_power,
            "power_usage_count": player.power_usage_count,
            "joined_at": player.joined_at,
            "died_at": player.died_at
        }
        for player in players
    ]


@router.get("/game/{game_id}/me", response_model=dict)
async def get_my_player_info(
    game_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Récupérer les informations du joueur connecté dans une partie"""
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Joueur non trouvé dans cette partie"
        )
    
    return {
        "id": player.id,
        "username": player.username,
        "is_alive": player.is_alive,
        "is_ready": player.is_ready,
        "is_connected": player.is_connected,
        "chair_position": player.chair_position,
        "has_selected_chair": player.has_selected_chair,
        "role_name": player.role_name,
        "team_name": player.team_name,
        "can_use_power": player.can_use_power,
        "power_usage_count": player.power_usage_count,
        "personal_notes": player.personal_notes,
        "joined_at": player.joined_at,
        "died_at": player.died_at
    }


@router.put("/game/{game_id}/ready")
async def set_player_ready(
    game_id: str,
    ready: bool = True,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Marquer le joueur comme prêt"""
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Joueur non trouvé dans cette partie"
        )
    
    player.is_ready = ready
    
    try:
        db.commit()
        logger.info(f"Player {player.username} set ready: {ready}")
        return {"message": f"Statut prêt mis à jour: {ready}"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating player ready status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du statut"
        )


@router.put("/game/{game_id}/chair")
async def select_chair(
    game_id: str,
    chair_position: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Sélectionner une position de chaise"""
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Joueur non trouvé dans cette partie"
        )
    
    # Vérifier que la chaise est disponible
    existing_player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.chair_position == chair_position
    ).first()
    
    if existing_player and existing_player.id != player.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette chaise est déjà occupée"
        )
    
    player.select_chair(chair_position)
    
    try:
        db.commit()
        logger.info(f"Player {player.username} selected chair {chair_position}")
        return {"message": f"Chaise {chair_position} sélectionnée"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error selecting chair: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la sélection de la chaise"
        )


@router.put("/game/{game_id}/notes")
async def update_personal_notes(
    game_id: str,
    notes: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Mettre à jour les notes personnelles"""
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Joueur non trouvé dans cette partie"
        )
    
    player.personal_notes = notes
    
    try:
        db.commit()
        logger.info(f"Player {player.username} updated personal notes")
        return {"message": "Notes personnelles mises à jour"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating personal notes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour des notes"
        )


@router.get("/game/{game_id}/neighbors")
async def get_neighbors(
    game_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Récupérer les voisins du joueur"""
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Joueur non trouvé dans cette partie"
        )
    
    # Récupérer tous les joueurs vivants de la partie
    all_players = db.query(Player).filter(
        Player.game_id == game_id,
        Player.is_alive == True
    ).all()
    
    left_neighbor, right_neighbor = player.get_neighbors(all_players)
    
    return {
        "left_neighbor": {
            "id": left_neighbor.id,
            "username": left_neighbor.username,
            "chair_position": left_neighbor.chair_position
        } if left_neighbor else None,
        "right_neighbor": {
            "id": right_neighbor.id,
            "username": right_neighbor.username,
            "chair_position": right_neighbor.chair_position
        } if right_neighbor else None
    }


@router.get("/game/{game_id}/left-neighbors")
async def get_left_neighbors(
    game_id: str,
    count: int = 3,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Récupérer les N joueurs à gauche"""
    player = db.query(Player).filter(
        Player.game_id == game_id,
        Player.user_id == current_user_id
    ).first()
    
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Joueur non trouvé dans cette partie"
        )
    
    # Récupérer tous les joueurs vivants de la partie
    all_players = db.query(Player).filter(
        Player.game_id == game_id,
        Player.is_alive == True
    ).all()
    
    neighbors = player.get_left_neighbors(all_players, count)
    
    return {
        "neighbors": [
            {
                "id": neighbor.id,
                "username": neighbor.username,
                "chair_position": neighbor.chair_position
            }
            for neighbor in neighbors
        ]
    }
