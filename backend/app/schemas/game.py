from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID

from app.models.game import GameStatus


class GameBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    min_players: int = Field(..., ge=8, le=29)
    max_players: int = Field(..., ge=8, le=29)


class GameCreate(GameBase):
    pass


class GameUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    min_players: Optional[int] = Field(None, ge=8, le=29)
    max_players: Optional[int] = Field(None, ge=8, le=29)


class GameResponse(GameBase):
    id: str
    current_players: int
    status: GameStatus
    current_phase: Optional[str] = None
    current_turn: Optional[int] = None
    current_phase_start: Optional[datetime] = None
    current_phase_end: Optional[datetime] = None
    winner_team_id: Optional[str] = None
    winner_team_name: Optional[str] = None
    game_duration: Optional[int] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GameStatusResponse(BaseModel):
    id: str
    name: str
    status: GameStatus
    current_phase: Optional[str] = None
    current_turn: Optional[int] = None
    current_players: int
    max_players: int
    time_remaining: Optional[int] = None
    winner_team_name: Optional[str] = None

    class Config:
        from_attributes = True


class GameListResponse(BaseModel):
    games: List[GameResponse]
    total: int
    page: int
    size: int
