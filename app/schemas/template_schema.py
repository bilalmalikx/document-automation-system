from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class FieldSchema(BaseModel):
    name: str
    label: str
    type: str
    required: bool = True

class TemplateSchemaResponse(BaseModel):
    template_id: UUID
    template_name: str
    fields: List[FieldSchema]

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TemplateResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

# New: Upload response
class TemplateUploadResponse(BaseModel):
    template_id: UUID
    name: str
    fields_found: List[str]
    message: str