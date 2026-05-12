from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/docgen_db"
    
    # File paths - DOCX
    TEMPLATE_DOCX_DIR: str = "app/templates/docx"
    OUTPUT_DOCX_DIR: str = "output/docx"
    
    # File paths - HTML/PDF
    TEMPLATE_HTML_DIR: str = "app/templates/html"
    OUTPUT_PDF_DIR: str = "output/pdf"
    
    # Temp directory
    TEMP_DIR: str = "temp"
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Security (optional for now)
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()