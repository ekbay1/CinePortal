from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GenreRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class StreamingServiceRead(BaseModel):
    id: int
    name: str
    logo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ContentAvailabilityRead(BaseModel):
    id: int
    service: StreamingServiceRead
    url: str | None = None
    requires_addon: bool

    model_config = ConfigDict(from_attributes=True)


class ContentRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    content_type: str
    release_year: int | None = None
    maturity_rating: str | None = None
    runtime_minutes: int | None = None
    poster_url: str | None = None
    trailer_url: str | None = None
    is_original: bool
    created_at: datetime
    genres: list[GenreRead] = Field(default_factory=list)
    availability: list[ContentAvailabilityRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class HomepageRow(BaseModel):
    title: str
    items: list[ContentRead]


class HomepageResponse(BaseModel):
    rows: list[HomepageRow]
