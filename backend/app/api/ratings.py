from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.rating import RatingCreate, RatingRead, RatingUpdate
from app.services.profile_service import get_profile_for_user
from app.services.rating_service import (
    delete_rating,
    get_content,
    get_rating,
    list_ratings_for_profile,
    update_rating,
    upsert_rating,
)

router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.post("/", response_model=RatingRead, status_code=status.HTTP_201_CREATED)
def create_or_update_rating(
    rating_in: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(
        db,
        profile_id=rating_in.profile_id,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    content = get_content(db, content_id=rating_in.content_id)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return upsert_rating(db, rating_in=rating_in)


@router.get("/profiles/{profile_id}", response_model=list[RatingRead])
def read_profile_ratings(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(
        db,
        profile_id=profile_id,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    return list_ratings_for_profile(db, profile_id=profile_id)


@router.patch(
    "/profiles/{profile_id}/content/{content_id}",
    response_model=RatingRead,
)
def patch_rating(
    profile_id: int,
    content_id: int,
    rating_in: RatingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(
        db,
        profile_id=profile_id,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    rating = get_rating(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found.",
        )

    return update_rating(
        db,
        rating=rating,
        rating_in=rating_in,
    )


@router.delete(
    "/profiles/{profile_id}/content/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_profile_rating(
    profile_id: int,
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(
        db,
        profile_id=profile_id,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    rating = get_rating(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found.",
        )

    delete_rating(db, rating=rating)

    return None