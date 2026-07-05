from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.watch import (
    WatchHistoryCreate,
    WatchHistoryRead,
    WatchHistoryUpdate,
    WatchlistItemCreate,
    WatchlistItemRead,
)
from app.services.watch_service import (
    add_to_watchlist,
    delete_watch_history_item,
    get_content,
    get_profile_for_user,
    get_watch_history_item,
    list_continue_watching,
    list_watch_history,
    list_watchlist,
    remove_from_watchlist,
    update_watch_history,
    upsert_watch_history,
)

router = APIRouter(prefix="/watch", tags=["Watchlist and History"])


@router.get("/profiles/{profile_id}/watchlist", response_model=list[WatchlistItemRead])
def read_watchlist(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(db, profile_id, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    return list_watchlist(db, profile_id=profile_id)


@router.post("/watchlist", response_model=WatchlistItemRead, status_code=status.HTTP_201_CREATED)
def create_watchlist_item(
    watchlist_in: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(
        db,
        profile_id=watchlist_in.profile_id,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    content = get_content(db, content_id=watchlist_in.content_id)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return add_to_watchlist(
        db,
        profile_id=watchlist_in.profile_id,
        content_id=watchlist_in.content_id,
    )


@router.delete(
    "/profiles/{profile_id}/watchlist/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_watchlist_item(
    profile_id: int,
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(db, profile_id, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    removed = remove_from_watchlist(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found.",
        )

    return None


@router.get("/profiles/{profile_id}/history", response_model=list[WatchHistoryRead])
def read_watch_history(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(db, profile_id, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    return list_watch_history(db, profile_id=profile_id)


@router.post("/history", response_model=WatchHistoryRead, status_code=status.HTTP_201_CREATED)
def create_or_update_watch_history(
    history_in: WatchHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(
        db,
        profile_id=history_in.profile_id,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    content = get_content(db, content_id=history_in.content_id)

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found.",
        )

    return upsert_watch_history(db, history_in=history_in)


@router.patch(
    "/profiles/{profile_id}/history/{content_id}",
    response_model=WatchHistoryRead,
)
def patch_watch_history(
    profile_id: int,
    content_id: int,
    history_in: WatchHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(db, profile_id, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    history = get_watch_history_item(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watch history item not found.",
        )

    return update_watch_history(
        db,
        history=history,
        history_in=history_in,
    )


@router.get(
    "/profiles/{profile_id}/continue-watching",
    response_model=list[WatchHistoryRead],
)
def read_continue_watching(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(db, profile_id, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    return list_continue_watching(db, profile_id=profile_id)


@router.delete(
    "/profiles/{profile_id}/history/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_history_item(
    profile_id: int,
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile_for_user(db, profile_id, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    removed = delete_watch_history_item(
        db,
        profile_id=profile_id,
        content_id=content_id,
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watch history item not found.",
        )

    return None