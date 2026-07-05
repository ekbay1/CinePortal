from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.content import ContentRead


class WatchlistItemCreate(BaseModel):
    profile_id: int
    content_id: int


class WatchlistItemRead(BaseModel):
    id: int
    profile_id: int
    content_id: int
    created_at: datetime
    content: ContentRead

    model_config = ConfigDict(from_attributes=True)


class WatchHistoryCreate(BaseModel):
    profile_id: int
    content_id: int
    progress_seconds: int = Field(default=0, ge=0)
    completed: bool = False


class WatchHistoryUpdate(BaseModel):
    progress_seconds: int | None = Field(default=None, ge=0)
    completed: bool | None = None


class WatchHistoryRead(BaseModel):
    id: int
    profile_id: int
    content_id: int
    progress_seconds: int
    completed: bool
    watched_at: datetime
    content: ContentRead

    model_config = ConfigDict(from_attributes=True)