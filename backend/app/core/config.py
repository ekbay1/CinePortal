from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    stripe_secret_key: str
    stripe_webhook_secret: str
    frontend_url: str = "http://localhost:3000"

    stripe_price_base: str
    stripe_price_disney: str
    stripe_price_max: str
    stripe_price_peacock: str
    stripe_price_prime: str

    backend_cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()