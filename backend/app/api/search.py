from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import search_content

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=SearchResponse)
def search(
    q: str | None = Query(default=None, min_length=1, max_length=100),
    genre: str | None = Query(default=None, max_length=100),
    service: str | None = Query(default=None, max_length=100),
    content_type: str | None = Query(
        default=None,
        pattern="^(movie|show|documentary|special)$",
    ),
    maturity_rating: str | None = Query(default=None, max_length=20),
    max_runtime: int | None = Query(default=None, ge=1, le=500),
    min_year: int | None = Query(default=None, ge=1900, le=2100),
    max_year: int | None = Query(default=None, ge=1900, le=2100),
    is_original: bool | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return search_content(
        db,
        q=q,
        genre=genre,
        service=service,
        content_type=content_type,
        maturity_rating=maturity_rating,
        max_runtime=max_runtime,
        min_year=min_year,
        max_year=max_year,
        is_original=is_original,
        limit=limit,
        offset=offset,
    )
