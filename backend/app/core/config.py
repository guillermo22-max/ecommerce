from pathlib import Path

from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Ecommerce API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "local"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    BACKEND_CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    # Hosted providers like Neon/Supabase require TLS (e.g. "require");
    # left unset for local Postgres, which usually has no SSL configured.
    POSTGRES_SSLMODE: str | None = None

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        uri = PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )
        if self.POSTGRES_SSLMODE:
            return f"{uri}?sslmode={self.POSTGRES_SSLMODE}"
        return str(uri)

    FIRST_SUPERUSER_EMAIL: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "change-me"

    UPLOAD_DIR: Path = BACKEND_ROOT / "uploads"


settings = Settings()
