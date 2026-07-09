from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.content import ContentRead


class RatingCreate(BaseModel):
    profile_id: int
    content_id: int
    score: int = Field(ge=1, le=5)


class RatingUpdate(BaseModel):
    score: int = Field(ge=1, le=5)


class RatingRead(BaseModel):
    id: int
    profile_id: int
    content_id: int
    score: int
    created_at: datetime
    content: ContentRead | None = None

    model_config = ConfigDict(from_attributes=True)
