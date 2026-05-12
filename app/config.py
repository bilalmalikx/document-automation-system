from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/docgen_db"
    TEMPLATE_DOCX_DIR: str = "app/templates/docx"
    OUTPUT_DOCX_DIR: str = "output/docx"
    API_V1_PREFIX: str = "/api/v1"
    
    class Config:
        env_file = ".env"

settings = Settings()