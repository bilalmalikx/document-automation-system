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