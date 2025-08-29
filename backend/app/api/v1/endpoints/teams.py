"""
Endpoints pour les équipes (Villageois vs Loups)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.models.team import Team

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_teams(db: Session = Depends(get_db)):
    """Récupérer toutes les équipes"""
    teams = db.query(Team).all()
    return [
        {
            "id": team.id,
            "name": team.name,
            "description": team.description,
            "color": team.color,
            "is_villager_team": team.is_villager_team,
            "is_wolf_team": team.is_wolf_team
        }
        for team in teams
    ]


@router.get("/{team_id}", response_model=dict)
async def get_team(team_id: str, db: Session = Depends(get_db)):
    """Récupérer une équipe par ID"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Équipe non trouvée"
        )
    
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "color": team.color,
        "is_villager_team": team.is_villager_team,
        "is_wolf_team": team.is_wolf_team
    }
