from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    maturity_rating: Mapped[str] = mapped_column(String(20), default="PG-13")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profiles")
    watchlist_items = relationship(
        "WatchlistItem", back_populates="profile", cascade="all, delete-orphan"
    )
    watch_history_items = relationship(
        "WatchHistory", back_populates="profile", cascade="all, delete-orphan"
    )
    ratings = relationship("Rating", back_populates="profile", cascade="all, delete-orphan")
