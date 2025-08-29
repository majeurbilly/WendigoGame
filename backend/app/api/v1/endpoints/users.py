"""
Endpoints API pour la gestion des utilisateurs Wendigo
Gère l'authentification et les profils utilisateurs
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db
from app.core.auth import get_current_user, create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserStats
from app.schemas.auth import Token, LoginRequest
from app.exceptions import UserError, AuthenticationError


router = APIRouter()


# =============================================================================
# AUTHENTIFICATION
# =============================================================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Créer un nouveau compte utilisateur"""
    try:
        # Vérifier si l'utilisateur existe déjà
        existing_user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà"
            )
        
        # Créer le nouvel utilisateur
        hashed_password = get_password_hash(user_data.password)
        
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserResponse.from_orm(new_user)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du compte: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Se connecter avec un compte utilisateur"""
    try:
        # Rechercher l'utilisateur
        user = db.query(User).filter(User.username == login_data.username).first()
        
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nom d'utilisateur ou mot de passe incorrect"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte désactivé"
            )
        
        # Créer le token d'accès
        access_token = create_access_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la connexion: {str(e)}"
        )


@router.post("/login/form", response_model=Token)
async def login_user_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Se connecter avec un formulaire OAuth2 standard"""
    try:
        # Rechercher l'utilisateur
        user = db.query(User).filter(User.username == form_data.username).first()
        
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nom d'utilisateur ou mot de passe incorrect"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte désactivé"
            )
        
        # Créer le token d'accès
        access_token = create_access_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la connexion: {str(e)}"
        )


# =============================================================================
# PROFIL UTILISATEUR
# =============================================================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Récupérer le profil de l'utilisateur connecté"""
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour le profil de l'utilisateur connecté"""
    try:
        # Vérifier si le nouveau nom d'utilisateur ou email existe déjà
        if user_data.username and user_data.username != current_user.username:
            existing_user = db.query(User).filter(User.username == user_data.username).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ce nom d'utilisateur est déjà pris"
                )
        
        if user_data.email and user_data.email != current_user.email:
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cet email est déjà utilisé"
                )
        
        # Mettre à jour les champs
        if user_data.username:
            current_user.username = user_data.username
        if user_data.email:
            current_user.email = user_data.email
        if user_data.bio:
            current_user.bio = user_data.bio
        
        db.commit()
        db.refresh(current_user)
        
        return UserResponse.from_orm(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )


@router.post("/me/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Changer le mot de passe de l'utilisateur connecté"""
    try:
        # Vérifier l'ancien mot de passe
        if not verify_password(current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mot de passe actuel incorrect"
            )
        
        # Mettre à jour le mot de passe
        current_user.hashed_password = get_password_hash(new_password)
        
        db.commit()
        
        return {"success": True, "message": "Mot de passe modifié avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du changement de mot de passe: {str(e)}"
        )


# =============================================================================
# STATISTIQUES UTILISATEUR
# =============================================================================

@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques de l'utilisateur connecté"""
    try:
        from app.models.game import Game, GameStatus
        from app.models.player import Player
        
        # Compter les parties jouées
        total_games = db.query(Player).filter(Player.user_id == current_user.id).count()
        
        # Compter les parties gagnées
        won_games = db.query(Player).join(Game).filter(
            and_(
                Player.user_id == current_user.id,
                Game.status == GameStatus.FINISHED,
                Game.winner_team_id == Player.team_id
            )
        ).count()
        
        # Compter les parties en tant que loup
        wolf_games = db.query(Player).join(Game).filter(
            and_(
                Player.user_id == current_user.id,
                Player.team.has(name="Loups")
            )
        ).count()
        
        # Compter les parties en tant que villageois
        villager_games = db.query(Player).join(Game).filter(
            and_(
                Player.user_id == current_user.id,
                Player.team.has(name="Villageois")
            )
        ).count()
        
        # Rôles les plus joués
        from app.models.role import Role
        from sqlalchemy import func
        
        favorite_roles = db.query(
            Role.name,
            func.count(Player.id).label('count')
        ).join(Player).filter(
            Player.user_id == current_user.id
        ).group_by(Role.name).order_by(
            func.count(Player.id).desc()
        ).limit(5).all()
        
        stats = UserStats(
            total_games=total_games,
            won_games=won_games,
            win_rate=(won_games / total_games * 100) if total_games > 0 else 0,
            wolf_games=wolf_games,
            villager_games=villager_games,
            favorite_roles=[{"role": role.name, "count": role.count} for role in favorite_roles]
        )
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statistiques: {str(e)}"
        )


# =============================================================================
# GESTION DES UTILISATEURS (ADMIN)
# =============================================================================

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer la liste des utilisateurs (admin seulement)"""
    try:
        # Vérifier les permissions admin (à implémenter selon vos besoins)
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé"
            )
        
        users = db.query(User).offset(skip).limit(limit).all()
        
        return [UserResponse.from_orm(user) for user in users]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des utilisateurs: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Récupérer un utilisateur par ID (admin seulement)"""
    try:
        # Vérifier les permissions admin
        if not current_user.is_admin and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de l'utilisateur: {str(e)}"
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour un utilisateur (admin seulement)"""
    try:
        # Vérifier les permissions admin
        if not current_user.is_admin and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Mettre à jour les champs
        if user_data.username:
            user.username = user_data.username
        if user_data.email:
            user.email = user_data.email
        if user_data.bio:
            user.bio = user_data.bio
        if user_data.is_active is not None and current_user.is_admin:
            user.is_active = user_data.is_active
        
        db.commit()
        db.refresh(user)
        
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer un utilisateur (admin seulement)"""
    try:
        # Vérifier les permissions admin
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé"
            )
        
        # Empêcher la suppression de son propre compte
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer son propre compte"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        db.delete(user)
        db.commit()
        
        return {"success": True, "message": "Utilisateur supprimé avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )
