from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from pathlib import Path
import shutil
from datetime import datetime

from app.database.session import get_db
from app.services.template_service import TemplateService
from app.services.placeholder_extractor import PlaceholderExtractor
from app.schemas.template_schema import TemplateSchemaResponse, TemplateUploadResponse
from app.models.template import Template
from app.models.template_field import TemplateField
from app.config import settings

router = APIRouter()

# Existing GET endpoint
@router.get("/{template_id}/schema")
def get_template_schema(template_id: UUID, db: Session = Depends(get_db)):
    service = TemplateService(db)
    schema = service.get_template_schema(template_id)
    if not schema:
        raise HTTPException(status_code=404, detail="Template not found")
    return schema

# ========== NEW: Upload Template API ==========
@router.post("/upload", response_model=TemplateUploadResponse)
async def upload_template(
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a DOCX template file.
    System will:
    1. Save the file
    2. Extract all {{placeholders}}
    3. Create template record in database
    4. Create field records for each placeholder
    """
    
    # 1. Validate file type
    if not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only .docx files are allowed")
    
    # 2. Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{file.filename}"
    template_path = Path(settings.TEMPLATE_DOCX_DIR) / unique_filename
    
    # 3. Save uploaded file
    try:
        with open(template_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # 4. Extract placeholders from DOCX
    try:
        placeholders = PlaceholderExtractor.extract_placeholders(str(template_path))
    except Exception as e:
        # Clean up file if extraction fails
        template_path.unlink()
        raise HTTPException(status_code=400, detail=f"Failed to extract placeholders: {str(e)}")
    
    # 5. Generate field schema
    fields_schema = PlaceholderExtractor.generate_field_schema(placeholders)
    
    # 6. Create template record in database
    template = Template(
        id=uuid4(),
        name=name,
        description=description,
        docx_template_path=f"app/templates/docx/{unique_filename}",
        is_active=True
    )
    db.add(template)
    db.flush()  # Get template.id
    
    # 7. Create field records
    for field in fields_schema:
        template_field = TemplateField(
            id=uuid4(),
            template_id=template.id,
            placeholder_name=field["placeholder_name"],
            field_label=field["field_label"],
            field_type=field["field_type"],
            is_required=field["is_required"],
            display_order=field["display_order"]
        )
        db.add(template_field)
    
    db.commit()
    
    return TemplateUploadResponse(
        template_id=template.id,
        name=name,
        fields_found=placeholders,
        message=f"Template uploaded successfully. Found {len(placeholders)} placeholders."
    )


# Get all templates (for dropdown)
@router.get("/")
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).filter(Template.is_active == True).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description
        }
        for t in templates
    ]