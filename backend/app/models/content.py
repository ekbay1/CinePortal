from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StreamingService(Base):
    __tablename__ = "streaming_services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    availability = relationship("ContentAvailability", back_populates="service")


class Content(Base):
    __tablename__ = "content"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    release_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    maturity_rating: Mapped[str | None] = mapped_column(String(20), nullable=True)
    runtime_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    poster_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    trailer_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_original: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    genres = relationship("ContentGenre", back_populates="content", cascade="all, delete-orphan")
    availability = relationship("ContentAvailability", back_populates="content", cascade="all, delete-orphan")
    watchlist_items = relationship("WatchlistItem", back_populates="content")
    watch_history_items = relationship("WatchHistory", back_populates="content")
    ratings = relationship("Rating", back_populates="content")


class Genre(Base):
    __tablename__ = "genres"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    content_items = relationship("ContentGenre", back_populates="genre")


class ContentGenre(Base):
    __tablename__ = "content_genres"

    content_id: Mapped[int] = mapped_column(ForeignKey("content.id"), primary_key=True)
    genre_id: Mapped[int] = mapped_column(ForeignKey("genres.id"), primary_key=True)

    content = relationship("Content", back_populates="genres")
    genre = relationship("Genre", back_populates="content_items")


class ContentAvailability(Base):
    __tablename__ = "content_availability"

    id: Mapped[int] = mapped_column(primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("content.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("streaming_services.id"), nullable=False)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    requires_addon: Mapped[bool] = mapped_column(Boolean, default=False)

    content = relationship("Content", back_populates="availability")
    service = relationship("StreamingService", back_populates="availability")