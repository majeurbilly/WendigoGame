"""
Endpoints API pour la gestion des jeux Wendigo
Intègre tous les services de jeu
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.game import GameCreate, GameUpdate, GameResponse
from app.schemas.player import PlayerResponse
from app.services import get_game_manager, get_game_service
from app.exceptions import GameError, PlayerError, ValidationError


router = APIRouter()


# =============================================================================
# GESTION DES LOBBYS
# =============================================================================

@router.post("/", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    game_data: GameCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Créer un nouveau lobby de jeu"""
    try:
        game_manager = get_game_manager(db)
        
        game = game_manager.create_game_lobby(
            creator_id=current_user.id,
            game_data=game_data.dict()
        )
        
        return GameResponse.from_orm(game)
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.get("/", response_model=List[GameResponse])
async def get_games(
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer la liste des jeux disponibles"""
    try:
        game_service = get_game_service(db)
        
        games = game_service.get_games(
            status_filter=status_filter,
            limit=limit,
            offset=offset
        )
        
        return [GameResponse.from_orm(game) for game in games]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.get("/{game_id}", response_model=GameResponse)
async def get_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer les détails d'un jeu"""
    try:
        game_service = get_game_service(db)
        
        game = game_service.get_game(game_id)
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jeu non trouvé"
            )
        
        return GameResponse.from_orm(game)
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.post("/{game_id}/join", response_model=PlayerResponse)
async def join_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rejoindre un lobby de jeu"""
    try:
        game_manager = get_game_manager(db)
        
        player = game_manager.join_game_lobby(game_id, current_user.id)
        
        return PlayerResponse.from_orm(player)
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.post("/{game_id}/leave")
async def leave_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Quitter un lobby de jeu"""
    try:
        game_manager = get_game_manager(db)
        
        success = game_manager.leave_game_lobby(game_id, current_user.id)
        
        return {"success": success, "message": "Joueur retiré du jeu"}
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.post("/{game_id}/ready")
async def set_player_ready(
    game_id: str,
    is_ready: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marquer un joueur comme prêt"""
    try:
        game_manager = get_game_manager(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        updated_player = game_manager.set_player_ready(game_id, player.id, is_ready)
        
        return {
            "success": True,
            "player": PlayerResponse.from_orm(updated_player),
            "message": f"Joueur marqué comme {'prêt' if is_ready else 'non prêt'}"
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.post("/{game_id}/chair")
async def select_chair(
    game_id: str,
    chair_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sélectionner une chaise"""
    try:
        game_manager = get_game_manager(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        updated_player = game_manager.select_chair(game_id, player.id, chair_number)
        
        return {
            "success": True,
            "player": PlayerResponse.from_orm(updated_player),
            "message": f"Chaise {chair_number} sélectionnée"
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


# =============================================================================
# DÉMARRAGE DU JEU
# =============================================================================

@router.post("/{game_id}/start")
async def start_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Démarrer une partie"""
    try:
        game_manager = get_game_manager(db)
        
        # Vérifier que l'utilisateur est le créateur du jeu
        game_service = get_game_service(db)
        game = game_service.get_game(game_id)
        if not game or game.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul le créateur peut démarrer le jeu"
            )
        
        result = game_manager.start_game(game_id)
        
        return {
            "success": True,
            "game": GameResponse.from_orm(result["game"]),
            "phase": result["phase"],
            "role_assignments": result["role_assignments"],
            "message": result["message"]
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


# =============================================================================
# ÉTAT DU JEU
# =============================================================================

@router.get("/{game_id}/state")
async def get_game_state(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtenir l'état complet du jeu pour un joueur"""
    try:
        game_manager = get_game_manager(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        state = game_manager.get_game_state(game_id, player.id)
        
        return state
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.get("/{game_id}/players", response_model=List[PlayerResponse])
async def get_game_players(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer la liste des joueurs d'un jeu"""
    try:
        game_service = get_game_service(db)
        
        players = game_service.get_game_players(game_id)
        
        return [PlayerResponse.from_orm(player) for player in players]
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


# =============================================================================
# GESTION DES PHASES
# =============================================================================

@router.post("/{game_id}/phase/advance")
async def advance_phase(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Passer à la phase suivante (admin seulement)"""
    try:
        game_manager = get_game_manager(db)
        
        # Vérifier que l'utilisateur est le créateur du jeu
        game_service = get_game_service(db)
        game = game_service.get_game(game_id)
        if not game or game.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul le créateur peut avancer les phases"
            )
        
        result = game_manager.advance_phase(game_id)
        
        return {
            "success": True,
            "previous_phase": result["previous_phase"],
            "next_phase": result["next_phase"],
            "resolved_actions": result["resolved_actions"],
            "vote_result": result["vote_result"],
            "game_over": result["game_over"]
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.post("/{game_id}/turn/advance")
async def advance_turn(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Passer au tour suivant (admin seulement)"""
    try:
        game_manager = get_game_manager(db)
        
        # Vérifier que l'utilisateur est le créateur du jeu
        game_service = get_game_service(db)
        game = game_service.get_game(game_id)
        if not game or game.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul le créateur peut avancer les tours"
            )
        
        result = game_manager.advance_turn(game_id)
        
        return {
            "success": True,
            "new_phase": result["new_phase"],
            "new_turn": result["new_turn"],
            "message": result["message"]
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


# =============================================================================
# GESTION DES ACTIONS
# =============================================================================

@router.post("/{game_id}/actions")
async def execute_action(
    game_id: str,
    action_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exécuter une action de joueur"""
    try:
        game_manager = get_game_manager(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        action = game_manager.execute_player_action(
            game_id=game_id,
            player_id=player.id,
            action_type=action_data["action_type"],
            target_id=action_data.get("target_id"),
            additional_data=action_data.get("additional_data")
        )
        
        return {
            "success": True,
            "action": {
                "id": action.id,
                "action_type": action.action_type,
                "target_id": action.target_id,
                "status": action.status.value,
                "created_at": action.created_at
            },
            "message": "Action exécutée avec succès"
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


# =============================================================================
# GESTION DES VOTES
# =============================================================================

@router.post("/{game_id}/votes")
async def submit_vote(
    game_id: str,
    vote_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soumettre un vote"""
    try:
        game_manager = get_game_manager(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        vote = game_manager.submit_vote(
            game_id=game_id,
            voter_id=player.id,
            vote_type=vote_data["vote_type"],
            target_id=vote_data.get("target_id")
        )
        
        return {
            "success": True,
            "vote": {
                "id": vote.id,
                "vote_type": vote.vote_type.value,
                "target_id": vote.target_id,
                "result": vote.result.value,
                "created_at": vote.created_at
            },
            "message": "Vote soumis avec succès"
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


# =============================================================================
# GESTION DES CHATS
# =============================================================================

@router.post("/{game_id}/chat")
async def send_chat_message(
    game_id: str,
    message_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envoyer un message de chat"""
    try:
        game_manager = get_game_manager(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        chat_message = game_manager.send_chat_message(
            game_id=game_id,
            sender_id=player.id,
            message=message_data["message"],
            chat_type=message_data["chat_type"],
            target_id=message_data.get("target_id")
        )
        
        return {
            "success": True,
            "message": {
                "id": chat_message.id,
                "sender": chat_message.sender.user.username,
                "message": chat_message.message,
                "chat_type": chat_message.chat_type.value,
                "timestamp": chat_message.timestamp
            },
            "message": "Message envoyé avec succès"
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )


@router.get("/{game_id}/chat/{chat_type}")
async def get_chat_messages(
    game_id: str,
    chat_type: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer les messages d'un chat"""
    try:
        from app.services.chat_service import get_chat_service
        
        chat_service = get_chat_service(db)
        
        # Récupérer le joueur
        game_service = get_game_service(db)
        player = game_service.get_player_by_user_id(game_id, current_user.id)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Joueur non trouvé dans ce jeu"
            )
        
        messages = chat_service.get_messages(
            game_id=game_id,
            player_id=player.id,
            chat_type=chat_type,
            limit=limit,
            offset=offset
        )
        
        return {
            "messages": [
                {
                    "id": msg.id,
                    "sender": msg.sender.user.username,
                    "message": msg.message,
                    "chat_type": msg.chat_type.value,
                    "timestamp": msg.timestamp
                }
                for msg in messages
            ],
            "total": len(messages)
        }
        
    except GameError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne: {str(e)}"
        )
