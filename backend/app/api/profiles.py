from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileRead, ProfileUpdate
from app.services.profile_service import (
    MAX_PROFILES_PER_USER,
    count_profiles_for_user,
    create_profile,
    delete_profile,
    get_profile_for_user,
    get_profiles_for_user,
    update_profile,
)

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/", response_model=list[ProfileRead])
def list_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_profiles_for_user(db, user_id=current_user.id)


@router.post("/", response_model=ProfileRead, status_code=status.HTTP_201_CREATED)
def create_user_profile(
    profile_in: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile_count = count_profiles_for_user(db, user_id=current_user.id)

    if profile_count >= MAX_PROFILES_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Users can have a maximum of {MAX_PROFILES_PER_USER} profiles.",
        )

    return create_profile(
        db,
        user_id=current_user.id,
        profile_in=profile_in,
    )


@router.get("/{profile_id}", response_model=ProfileRead)
def read_profile(
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

    return profile


@router.patch("/{profile_id}", response_model=ProfileRead)
def update_user_profile(
    profile_id: int,
    profile_in: ProfileUpdate,
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

    return update_profile(
        db,
        profile=profile,
        profile_in=profile_in,
    )


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_profile(
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

    delete_profile(db, profile=profile)

    return None