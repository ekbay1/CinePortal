from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate

MAX_PROFILES_PER_USER = 5


def get_profiles_for_user(db: Session, user_id: int) -> list[Profile]:
    return (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .order_by(Profile.created_at.asc())
        .all()
    )


def get_profile_for_user(
    db: Session,
    profile_id: int,
    user_id: int,
) -> Profile | None:
    return db.query(Profile).filter(Profile.id == profile_id, Profile.user_id == user_id).first()


def create_profile(
    db: Session,
    user_id: int,
    profile_in: ProfileCreate,
) -> Profile:
    profile = Profile(
        user_id=user_id,
        name=profile_in.name,
        avatar_url=profile_in.avatar_url,
        maturity_rating=profile_in.maturity_rating,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def update_profile(
    db: Session,
    profile: Profile,
    profile_in: ProfileUpdate,
) -> Profile:
    update_data = profile_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def delete_profile(db: Session, profile: Profile) -> None:
    db.delete(profile)
    db.commit()


def count_profiles_for_user(db: Session, user_id: int) -> int:
    return db.query(Profile).filter(Profile.user_id == user_id).count()
