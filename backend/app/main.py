from fastapi import FastAPI

app = FastAPI(
    title="CinePortal API",
    description="Backend API for the AI-powered streaming discovery platform.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "CinePortal API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
