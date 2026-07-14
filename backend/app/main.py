from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.api.billing import router as billing_router
from app.api.chatbot import router as chatbot_router
from app.api.content import router as content_router
from app.api.profiles import router as profiles_router
from app.api.ratings import router as ratings_router
from app.api.recommendations import router as recommendations_router
from app.api.search import router as search_router
from app.api.watch import router as watch_router
from app.core.config import settings
from app.db.session import engine

cors_origins = [
    origin.strip() for origin in settings.backend_cors_origins.split(",") if origin.strip()
]

app = FastAPI(
    title="CinePortal API",
    description="Backend API for the AI-powered streaming discovery platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "CinePortal API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/health/db")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as error:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "detail": str(error),
        }
    
app.include_router(auth_router, prefix="/api")
app.include_router(profiles_router, prefix="/api")
app.include_router(content_router, prefix="/api")
app.include_router(watch_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(ratings_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(chatbot_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
