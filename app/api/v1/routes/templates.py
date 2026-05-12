from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.services.template_service import TemplateService

router = APIRouter()

@router.get("/{template_id}/schema")
def get_template_schema(template_id: UUID, db: Session = Depends(get_db)):
    service = TemplateService(db)
    schema = service.get_template_schema(template_id)
    if not schema:
        raise HTTPException(status_code=404, detail="Template not found")
    return schema