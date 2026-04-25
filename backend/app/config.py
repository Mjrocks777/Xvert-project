import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GOOGLE_VISION_ENABLED = os.getenv("GOOGLE_VISION_ENABLED", "false").lower() == "true"

# Set the env var so Google SDK auto-detects it
if GOOGLE_APPLICATION_CREDENTIALS:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

class Settings:
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")

    
    
    
    # File upload settings
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_IMAGE_TYPES: list = ["png", "jpg", "jpeg", "gif"]  # WebP, BMP excluded
    ALLOWED_DOC_TYPES: list = ["pdf", "docx", "md", "html", "txt"]
    ALLOWED_DATA_TYPES: list = ["json", "csv", "xlsx", "xml"]

settings = Settings()
