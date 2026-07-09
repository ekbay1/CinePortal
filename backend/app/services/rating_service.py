from sqlalchemy.orm import Session, joinedload

from app.models.content import Content, ContentAvailability, ContentGenre
from app.models.rating import Rating
from app.schemas.rating import RatingCreate, RatingRead, RatingUpdate
from app.services.content_service import serialize_content


def get_content(db: Session, content_id: int) -> Content | None:
    return db.query(Content).filter(Content.id == content_id).first()


def get_rating(
    db: Session,
    profile_id: int,
    content_id: int,
) -> Rating | None:
    return (
        db.query(Rating)
        .filter(
            Rating.profile_id == profile_id,
            Rating.content_id == content_id,
        )
        .first()
    )


def serialize_rating(rating: Rating) -> RatingRead:
    content = None

    if rating.content:
        content = serialize_content(rating.content)

    return RatingRead(
        id=rating.id,
        profile_id=rating.profile_id,
        content_id=rating.content_id,
        score=rating.score,
        created_at=rating.created_at,
        content=content,
    )


def list_ratings_for_profile(
    db: Session,
    profile_id: int,
) -> list[RatingRead]:
    ratings = (
        db.query(Rating)
        .options(
            joinedload(Rating.content).joinedload(Content.genres).joinedload(ContentGenre.genre),
            joinedload(Rating.content)
            .joinedload(Content.availability)
            .joinedload(ContentAvailability.service),
        )
        .filter(Rating.profile_id == profile_id)
        .order_by(Rating.created_at.desc())
        .all()
    )

    return [serialize_rating(rating) for rating in ratings]


def upsert_rating(
    db: Session,
    rating_in: RatingCreate,
) -> RatingRead:
    rating = get_rating(
        db,
        profile_id=rating_in.profile_id,
        content_id=rating_in.content_id,
    )

    if rating:
        rating.score = rating_in.score
    else:
        rating = Rating(
            profile_id=rating_in.profile_id,
            content_id=rating_in.content_id,
            score=rating_in.score,
        )
        db.add(rating)

    db.commit()
    db.refresh(rating)

    rating = (
        db.query(Rating)
        .options(
            joinedload(Rating.content).joinedload(Content.genres).joinedload(ContentGenre.genre),
            joinedload(Rating.content)
            .joinedload(Content.availability)
            .joinedload(ContentAvailability.service),
        )
        .filter(Rating.id == rating.id)
        .first()
    )

    return serialize_rating(rating)


def update_rating(
    db: Session,
    rating: Rating,
    rating_in: RatingUpdate,
) -> RatingRead:
    rating.score = rating_in.score

    db.add(rating)
    db.commit()
    db.refresh(rating)

    rating = (
        db.query(Rating)
        .options(
            joinedload(Rating.content).joinedload(Content.genres).joinedload(ContentGenre.genre),
            joinedload(Rating.content)
            .joinedload(Content.availability)
            .joinedload(ContentAvailability.service),
        )
        .filter(Rating.id == rating.id)
        .first()
    )

    return serialize_rating(rating)


def delete_rating(db: Session, rating: Rating) -> None:
    db.delete(rating)
    db.commit()
