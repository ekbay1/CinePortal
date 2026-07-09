from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.content import (
    ContentRead,
    GenreRead,
    HomepageResponse,
    StreamingServiceRead,
)
from app.services.content_service import (
    get_content_by_id,
    get_homepage_content,
    list_content,
    list_genres,
    list_streaming_services,
)

router = APIRouter(prefix="/content", tags=["Content"])


@router.get("/", response_model=list[ContentRead])
def browse_content(
    genre: str | None = None,
    service: str | None = None,
    content_type: str | None = Query(default=None, pattern="^(movie|show|documentary|special)$"),
    is_original: bool | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return list_content(
        db,
        genre=genre,
        service=service,
        content_type=content_type,
        is_original=is_original,
        limit=limit,
        offset=offset,
    )


@router.get("/home", response_model=HomepageResponse)
def read_homepage_content(db: Session = Depends(get_db)):
    return get_homepage_content(db)


@router.get("/genres", response_model=list[GenreRead])
def read_genres(db: Session = Depends(get_db)):
    return list_genres(db)


@router.get("/services", response_model=list[StreamingServiceRead])
def read_streaming_services(db: Session = Depends(get_db)):
    return list_streaming_services(db)


@router.get("/{content_id}", response_model=ContentRead)
def read_content_detail(
    content_id: int,
    db: Session = Depends(get_db),
):
    content = get_content_by_id(db, content_id=content_id)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return content
