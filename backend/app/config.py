from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = ""

    # JWT
    JWT_SECRET_KEY: str = "demo-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # External APIs
    GEMINI_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"

    # App
    APP_NAME: str = "NER SmartLogix"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://smart-ai-gamma-red.vercel.app",
        "https://z-lovat-phi.vercel.app"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def is_demo_mode(self) -> bool:
        """Returns True if any critical API key is missing."""
        return not self.DATABASE_URL or not self.GEMINI_API_KEY or not self.OPENWEATHER_API_KEY

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip())

    @property
    def has_openweather(self) -> bool:
        return bool(self.OPENWEATHER_API_KEY and self.OPENWEATHER_API_KEY.strip())

    @property
    def has_database(self) -> bool:
        return bool(self.DATABASE_URL and self.DATABASE_URL.strip())


settings = Settings()
