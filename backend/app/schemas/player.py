from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PlayerBase(BaseModel):
    is_ready: bool = False
    chair_position: Optional[int] = Field(None, ge=1, le=29)
    personal_notes: Optional[str] = None


class PlayerCreate(PlayerBase):
    user_id: str
    game_id: str
    role_id: str
    team_id: str


class PlayerUpdate(BaseModel):
    is_ready: Optional[bool] = None
    chair_position: Optional[int] = Field(None, ge=1, le=29)
    personal_notes: Optional[str] = None
    is_connected: Optional[bool] = None


class PlayerResponse(PlayerBase):
    id: str
    user_id: str
    game_id: str
    role_id: str
    team_id: str
    is_alive: bool
    is_connected: bool
    has_selected_chair: bool
    power_usage_count: int
    last_power_usage: Optional[datetime] = None
    joined_at: datetime
    died_at: Optional[datetime] = None
    last_activity: datetime
    # Relations
    username: Optional[str] = None
    role_name: Optional[str] = None
    team_name: Optional[str] = None

    class Config:
        from_attributes = True


class PlayerNeighborResponse(BaseModel):
    id: str
    username: str
    chair_position: int
    is_alive: bool
    role_name: Optional[str] = None
    team_name: Optional[str] = None

    class Config:
        from_attributes = True
