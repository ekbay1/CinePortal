from sqlalchemy.orm import Session, joinedload

from app.models.content import (
    Content,
    ContentAvailability,
    ContentGenre,
    Genre,
    StreamingService,
)
from app.schemas.content import (
    ContentAvailabilityRead,
    ContentRead,
    GenreRead,
    HomepageResponse,
    HomepageRow,
    StreamingServiceRead,
)


def serialize_content(content: Content) -> ContentRead:
    return ContentRead(
        id=content.id,
        title=content.title,
        description=content.description,
        content_type=content.content_type,
        release_year=content.release_year,
        maturity_rating=content.maturity_rating,
        runtime_minutes=content.runtime_minutes,
        poster_url=content.poster_url,
        trailer_url=content.trailer_url,
        is_original=content.is_original,
        created_at=content.created_at,
        genres=[
            GenreRead(
                id=item.genre.id,
                name=item.genre.name,
            )
            for item in content.genres
        ],
        availability=[
            ContentAvailabilityRead(
                id=item.id,
                service=StreamingServiceRead(
                    id=item.service.id,
                    name=item.service.name,
                    logo_url=item.service.logo_url,
                ),
                url=item.url,
                requires_addon=item.requires_addon,
            )
            for item in content.availability
        ],
    )


def get_content_query(db: Session):
    return db.query(Content).options(
        joinedload(Content.genres).joinedload(ContentGenre.genre),
        joinedload(Content.availability).joinedload(ContentAvailability.service),
    )


def list_content(
    db: Session,
    genre: str | None = None,
    service: str | None = None,
    content_type: str | None = None,
    is_original: bool | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[ContentRead]:
    query = get_content_query(db)

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
        query = query.filter(Content.content_type == content_type)

    if is_original is not None:
        query = query.filter(Content.is_original == is_original)

    content_items = (
        query.distinct()
        .order_by(Content.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [serialize_content(item) for item in content_items]


def get_content_by_id(db: Session, content_id: int) -> ContentRead | None:
    content = (
        get_content_query(db)
        .filter(Content.id == content_id)
        .first()
    )

    if not content:
        return None

    return serialize_content(content)


def list_genres(db: Session) -> list[Genre]:
    return db.query(Genre).order_by(Genre.name.asc()).all()


def list_streaming_services(db: Session) -> list[StreamingService]:
    return db.query(StreamingService).order_by(StreamingService.name.asc()).all()


def get_homepage_content(db: Session) -> HomepageResponse:
    trending = (
        get_content_query(db)
        .order_by(Content.created_at.desc())
        .limit(10)
        .all()
    )

    originals = (
        get_content_query(db)
        .filter(Content.is_original.is_(True))
        .order_by(Content.created_at.desc())
        .limit(10)
        .all()
    )

    movies = (
        get_content_query(db)
        .filter(Content.content_type == "movie")
        .order_by(Content.release_year.desc())
        .limit(10)
        .all()
    )

    shows = (
        get_content_query(db)
        .filter(Content.content_type == "show")
        .order_by(Content.release_year.desc())
        .limit(10)
        .all()
    )

    return HomepageResponse(
        rows=[
            HomepageRow(
                title="Trending Now",
                items=[serialize_content(item) for item in trending],
            ),
            HomepageRow(
                title="CinePortal Originals",
                items=[serialize_content(item) for item in originals],
            ),
            HomepageRow(
                title="Movies",
                items=[serialize_content(item) for item in movies],
            ),
            HomepageRow(
                title="Shows",
                items=[serialize_content(item) for item in shows],
            ),
        ]
    )