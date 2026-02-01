from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ConversionRequest(BaseModel):
    format: str

class ConversionResponse(BaseModel):
    id: UUID
    status: str
    download_url: Optional[str] = None
    message: Optional[str] = None

class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ConversionHistory(BaseModel):
    id: UUID
    original_filename: str
    original_format: str
    converted_format: str
    status: str
    created_at: datetime
