from sqlalchemy import String, cast, func
from sqlalchemy.orm import Session, joinedload

from app.models.content import (
    Content,
    ContentAvailability,
    ContentGenre,
    Genre,
    StreamingService,
)
from app.schemas.search import SearchResponse
from app.services.content_service import serialize_content


def search_content(
    db: Session,
    q: str | None = None,
    genre: str | None = None,
    service: str | None = None,
    content_type: str | None = None,
    maturity_rating: str | None = None,
    max_runtime: int | None = None,
    min_year: int | None = None,
    max_year: int | None = None,
    is_original: bool | None = None,
    limit: int = 20,
    offset: int = 0,
) -> SearchResponse:
    query = db.query(Content).options(
        joinedload(Content.genres).joinedload(ContentGenre.genre),
        joinedload(Content.availability).joinedload(
            ContentAvailability.service
        ),
    )

    rank = None

    if q:
        search_vector = func.to_tsvector(
            "english",
            func.concat_ws(
                " ",
                Content.title,
                Content.description,
                cast(Content.release_year, String),
                Content.content_type,
                Content.maturity_rating,
            ),
        )

        search_query = func.websearch_to_tsquery("english", q)

        query = query.filter(
            search_vector.op("@@")(search_query)
        )

        rank = func.ts_rank(search_vector, search_query)

    if genre:
        query = (
            query.join(Content.genres)
            .join(ContentGenre.genre)
            .filter(Genre.name.ilike(f"%{genre}%"))
        )

    if service:
        query = (
            query.join(Content.availability)
            .join(ContentAvailability.service)
            .filter(StreamingService.name.ilike(f"%{service}%"))
        )

    if content_type:
        query = query.filter(
            Content.content_type == content_type
        )

    if maturity_rating:
        query = query.filter(
            Content.maturity_rating == maturity_rating
        )

    if max_runtime is not None:
        query = query.filter(
            Content.runtime_minutes <= max_runtime
        )

    if min_year is not None:
        query = query.filter(
            Content.release_year >= min_year
        )

    if max_year is not None:
        query = query.filter(
            Content.release_year <= max_year
        )

    if is_original is not None:
        query = query.filter(
            Content.is_original == is_original
        )

    total = query.order_by(None).distinct().count()

    if rank is not None:
        query = query.order_by(
            rank.desc(),
            Content.release_year.desc().nullslast(),
        )
    else:
        query = query.order_by(
            Content.created_at.desc()
        )

    content_items = (
        query.distinct()
        .offset(offset)
        .limit(limit)
        .all()
    )

    return SearchResponse(
        query=q,
        total=total,
        results=[
            serialize_content(item)
            for item in content_items
        ],
    )