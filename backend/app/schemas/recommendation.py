from pydantic import BaseModel

from app.schemas.content import ContentRead


class RecommendationItem(BaseModel):
    content: ContentRead
    score: float
    reason: str


class RecommendationResponse(BaseModel):
    profile_id: int | None = None
    items: list[RecommendationItem]