from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.recommendation import RecommendationResponse
from app.services.profile_service import get_profile_for_user
from app.services.rating_service import get_content
from app.services.recommendation_service import (
    get_because_you_watched,
    get_profile_recommendations,
    get_similar_titles,
)

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get(
    "/profiles/{profile_id}",
    response_model=RecommendationResponse,
)
def read_profile_recommendations(
    profile_id: int,
    limit: int = Query(default=10, ge=1, le=50),
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

    return get_profile_recommendations(
        db,
        profile_id=profile_id,
        limit=limit,
    )


@router.get(
    "/content/{content_id}/similar",
    response_model=RecommendationResponse,
)
def read_similar_titles(
    content_id: int,
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    content = get_content(db, content_id=content_id)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return get_similar_titles(
        db,
        content_id=content_id,
        limit=limit,
    )


@router.get(
    "/profiles/{profile_id}/because-you-watched/{content_id}",
    response_model=RecommendationResponse,
)
def read_because_you_watched(
    profile_id: int,
    content_id: int,
    limit: int = Query(default=10, ge=1, le=50),
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

    content = get_content(db, content_id=content_id)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return get_because_you_watched(
        db,
        profile_id=profile_id,
        content_id=content_id,
        limit=limit,
    )