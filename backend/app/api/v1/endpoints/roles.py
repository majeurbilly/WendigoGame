"""
Endpoints pour les 29 rôles uniques du jeu
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.models.role import Role
from app.models.team import Team

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_roles(
    team_id: str = None,
    db: Session = Depends(get_db)
):
    """Récupérer tous les rôles ou filtrer par équipe"""
    query = db.query(Role)
    
    if team_id:
        query = query.filter(Role.team_id == team_id)
    
    roles = query.all()
    return [
        {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "power_description": role.power_description,
            "team": {
                "id": role.team.id,
                "name": role.team.name,
                "color": role.team.color
            } if role.team else None,
            "is_unique": role.is_unique,
            "phase_action": role.phase_action,
            "usage_limit": role.usage_limit,
            "emoji": role.emoji,
            "difficulty": role.difficulty,
            "is_villager_role": role.is_villager_role,
            "is_wolf_role": role.is_wolf_role,
            "can_act_day": role.can_act_day,
            "can_act_night": role.can_act_night,
            "has_power": role.has_power
        }
        for role in roles
    ]


@router.get("/{role_id}", response_model=dict)
async def get_role(role_id: str, db: Session = Depends(get_db)):
    """Récupérer un rôle par ID"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rôle non trouvé"
        )
    
    return {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "power_description": role.power_description,
        "team": {
            "id": role.team.id,
            "name": role.team.name,
            "color": role.team.color
        } if role.team else None,
        "is_unique": role.is_unique,
        "phase_action": role.phase_action,
        "usage_limit": role.usage_limit,
        "emoji": role.emoji,
        "difficulty": role.difficulty,
        "is_villager_role": role.is_villager_role,
        "is_wolf_role": role.is_wolf_role,
        "can_act_day": role.can_act_day,
        "can_act_night": role.can_act_night,
        "has_power": role.has_power
    }


@router.get("/team/{team_name}", response_model=List[dict])
async def get_roles_by_team(team_name: str, db: Session = Depends(get_db)):
    """Récupérer tous les rôles d'une équipe par nom"""
    team = db.query(Team).filter(Team.name.ilike(f"%{team_name}%")).first()
    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Équipe non trouvée"
        )
    
    roles = db.query(Role).filter(Role.team_id == team.id).all()
    return [
        {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "power_description": role.power_description,
            "is_unique": role.is_unique,
            "phase_action": role.phase_action,
            "usage_limit": role.usage_limit,
            "emoji": role.emoji,
            "difficulty": role.difficulty
        }
        for role in roles
    ]
