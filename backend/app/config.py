import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BACKEND_DIR.parent
DEFAULT_UPLOAD_DIR = BACKEND_DIR / "uploads"
DEFAULT_DB_PATH = BACKEND_DIR / "lost_and_found.db"


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Smart AI Lost & Found Backend"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = False

    # Storage & Uploads
    UPLOAD_DIR: Path = DEFAULT_UPLOAD_DIR
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ]

    # Database
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # CLIP
    CLIP_MODEL: str = "ViT-B/32"

    # Search & Matching
    TOP_K_MATCHES: int = 5
    MIN_SIMILARITY_THRESHOLD: float = 0.35
    HIGH_SIMILARITY_THRESHOLD: float = 0.75

    # LLM Providers (ordered fallback)
    GROQ_API_KEY: str = ""
    COHERE_API_KEY: str = ""
    SAMBANOVA_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Mock mode for testing without calling external APIs
    MOCK_AI_SERVICES: bool = False

    class Config:
        env_file = BACKEND_DIR / ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
