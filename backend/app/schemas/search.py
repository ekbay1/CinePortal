from pydantic import BaseModel

from app.schemas.content import ContentRead

class SearchResponse(BaseModel):
    query: str | None = None
    total: int
    results: list[ContentRead]