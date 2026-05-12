from pydantic import BaseModel
from typing import Dict, Any
from uuid import UUID

class DocumentGenerateRequest(BaseModel):
    template_id: UUID
    data: Dict[str, Any]

class DocumentGenerateResponse(BaseModel):
    document_id: UUID
    docx_url: str