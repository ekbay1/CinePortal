from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    content_id: Mapped[int] = mapped_column(ForeignKey("content.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="watchlist_items")
    content = relationship("Content", back_populates="watchlist_items")

    __table_args__ = (
        UniqueConstraint("profile_id", "content_id", name="uq_profile_content_watchlist"),
    )
