from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.content import Content
from app.models.profile import Profile
from app.models.watch_history import WatchHistory
from app.models.watchlist import WatchlistItem
from app.schemas.watch import WatchHistoryCreate, WatchHistoryUpdate


def get_profile_for_user(
    db: Session,
    profile_id: int,
    user_id: int,
) -> Profile | None:
    return db.query(Profile).filter(Profile.id == profile_id, Profile.user_id == user_id).first()


def get_content(db: Session, content_id: int) -> Content | None:
    return db.query(Content).filter(Content.id == content_id).first()


def get_watchlist_item(
    db: Session,
    profile_id: int,
    content_id: int,
) -> WatchlistItem | None:
    return (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.profile_id == profile_id,
            WatchlistItem.content_id == content_id,
        )
        .first()
    )


def add_to_watchlist(
    db: Session,
    profile_id: int,
    content_id: int,
) -> WatchlistItem:
    existing_item = get_watchlist_item(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if existing_item:
        return existing_item

    item = WatchlistItem(
        profile_id=profile_id,
        content_id=content_id,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def list_watchlist(
    db: Session,
    profile_id: int,
) -> list[WatchlistItem]:
    return (
        db.query(WatchlistItem)
        .options(joinedload(WatchlistItem.content))
        .filter(WatchlistItem.profile_id == profile_id)
        .order_by(WatchlistItem.created_at.desc())
        .all()
    )


def remove_from_watchlist(
    db: Session,
    profile_id: int,
    content_id: int,
) -> bool:
    item = get_watchlist_item(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not item:
        return False

    db.delete(item)
    db.commit()

    return True


def get_watch_history_item(
    db: Session,
    profile_id: int,
    content_id: int,
) -> WatchHistory | None:
    return (
        db.query(WatchHistory)
        .filter(
            WatchHistory.profile_id == profile_id,
            WatchHistory.content_id == content_id,
        )
        .first()
    )


def upsert_watch_history(
    db: Session,
    history_in: WatchHistoryCreate,
) -> WatchHistory:
    history = get_watch_history_item(
        db,
        profile_id=history_in.profile_id,
        content_id=history_in.content_id,
    )

    if history:
        history.progress_seconds = history_in.progress_seconds
        history.completed = history_in.completed
        history.watched_at = datetime.utcnow()
    else:
        history = WatchHistory(
            profile_id=history_in.profile_id,
            content_id=history_in.content_id,
            progress_seconds=history_in.progress_seconds,
            completed=history_in.completed,
            watched_at=datetime.utcnow(),
        )
        db.add(history)

    db.commit()
    db.refresh(history)

    return history


def update_watch_history(
    db: Session,
    history: WatchHistory,
    history_in: WatchHistoryUpdate,
) -> WatchHistory:
    update_data = history_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(history, field, value)

    history.watched_at = datetime.utcnow()

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


def list_watch_history(
    db: Session,
    profile_id: int,
) -> list[WatchHistory]:
    return (
        db.query(WatchHistory)
        .options(joinedload(WatchHistory.content))
        .filter(WatchHistory.profile_id == profile_id)
        .order_by(WatchHistory.watched_at.desc())
        .all()
    )


def list_continue_watching(
    db: Session,
    profile_id: int,
) -> list[WatchHistory]:
    return (
        db.query(WatchHistory)
        .options(joinedload(WatchHistory.content))
        .filter(
            WatchHistory.profile_id == profile_id,
            WatchHistory.completed.is_(False),
            WatchHistory.progress_seconds > 0,
        )
        .order_by(WatchHistory.watched_at.desc())
        .limit(10)
        .all()
    )


def delete_watch_history_item(
    db: Session,
    profile_id: int,
    content_id: int,
) -> bool:
    history = get_watch_history_item(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not history:
        return False

    db.delete(history)
    db.commit()

    return True
