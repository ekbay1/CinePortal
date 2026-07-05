from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profiles import router as profiles_router

app = FastAPI(
    title="CinePortal API",
    description="Backend API for the AI-powered streaming discovery platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
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

app.include_router(auth_router, prefix="/api")
app.include_router(profiles_router, prefix="/api")