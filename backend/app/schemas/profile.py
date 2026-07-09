from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=500)
    maturity_rating: str = Field(default="PG-13", max_length=20)


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=500)
    maturity_rating: str | None = Field(default=None, max_length=20)


class ProfileRead(BaseModel):
    id: int
    user_id: int
    name: str
    avatar_url: str | None = None
    maturity_rating: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
