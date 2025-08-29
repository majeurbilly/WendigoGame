from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RoleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    power_description: str = Field(..., min_length=1)
    team_id: str
    is_unique: bool = True
    phase_action: str = Field(..., pattern="^(DAY|NIGHT|NONE)$")
    usage_limit: Optional[int] = Field(None, ge=0)
    emoji: Optional[str] = Field(None, max_length=10)
    difficulty: Optional[str] = Field(None, pattern="^(EASY|MEDIUM|HARD)$")


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    power_description: Optional[str] = Field(None, min_length=1)
    team_id: Optional[str] = None
    is_unique: Optional[bool] = None
    phase_action: Optional[str] = Field(None, pattern="^(DAY|NIGHT|NONE)$")
    usage_limit: Optional[int] = Field(None, ge=0)
    emoji: Optional[str] = Field(None, max_length=10)
    difficulty: Optional[str] = Field(None, pattern="^(EASY|MEDIUM|HARD)$")


class RoleResponse(RoleBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Relations
    team_name: Optional[str] = None
    team_color: Optional[str] = None

    class Config:
        from_attributes = True


class RoleListResponse(BaseModel):
    roles: list[RoleResponse]
    total: int
    team_filter: Optional[str] = None
